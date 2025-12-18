import { html, css } from 'lit';
import { state } from 'lit/decorators.js';
import { HassCardBase } from '../../shared/src/base/HassCardBase';
import { normalizeConfig, getChartedConfigForm } from './config';
import { ChartedRenderer } from './renderer';
import type { ChartedCardConfig, LiveDebugPayload } from './types';

/**
 * ChartedCard - An energy flow visualization card using ECharts
 * Uses HassCardBase for automatic entity subscription management
 */
function configsEqual(a?: ChartedCardConfig, b?: ChartedCardConfig): boolean {
  if (!a || !b) return false;
  if (a.hours_to_show !== b.hours_to_show) return false;
  if (a.points_per_hour !== b.points_per_hour) return false;
  if (a.debug_overlay !== b.debug_overlay) return false;
  if (a.hours_entity !== b.hours_entity) return false;
  if (a.points_per_hour_entity !== b.points_per_hour_entity) return false;

  const keys = ['solar', 'grid', 'battery', 'load'] as const;
  for (const k of keys) {
    if ((a.entities as any)[k] !== (b.entities as any)[k]) return false;
  }

  const aBands = a.time_bands || [];
  const bBands = b.time_bands || [];
  if (aBands.length !== bBands.length) return false;
  for (let i = 0; i < aBands.length; i++) {
    const aa = aBands[i];
    const bb = bBands[i];
    if (!aa || !bb) return false;
    if (aa.start !== bb.start || aa.end !== bb.end || aa.color !== bb.color || (aa.label || '') !== (bb.label || '')) {
      return false;
    }
  }

  return true;
}

function configDiff(a?: ChartedCardConfig, b?: ChartedCardConfig): string[] {
  if (!a || !b) return ['missing config'];
  const diffs: string[] = [];
  const cmp = (label: string, v1: any, v2: any) => {
    if (v1 !== v2) diffs.push(`${label}: ${String(v1)} → ${String(v2)}`);
  };

  cmp('hours_to_show', a.hours_to_show, b.hours_to_show);
  cmp('points_per_hour', a.points_per_hour, b.points_per_hour);
  cmp('debug_overlay', a.debug_overlay, b.debug_overlay);
  cmp('hours_entity', a.hours_entity, b.hours_entity);
  cmp('points_per_hour_entity', a.points_per_hour_entity, b.points_per_hour_entity);

  (['solar','grid','battery','load'] as const).forEach(k => {
    cmp(`entities.${k}`, (a.entities as any)[k], (b.entities as any)[k]);
  });

  const aBands = a.time_bands || [];
  const bBands = b.time_bands || [];
  if (aBands.length !== bBands.length) {
    diffs.push(`time_bands.length: ${aBands.length} → ${bBands.length}`);
  }
  const len = Math.max(aBands.length, bBands.length);
  for (let i = 0; i < len; i++) {
    const aa = aBands[i];
    const bb = bBands[i];
    cmp(`time_bands[${i}].start`, aa?.start, bb?.start);
    cmp(`time_bands[${i}].end`, aa?.end, bb?.end);
    cmp(`time_bands[${i}].color`, aa?.color, bb?.color);
    cmp(`time_bands[${i}].label`, aa?.label ?? '', bb?.label ?? '');
  }

  return diffs;
}

export class ChartedCard extends HassCardBase {
  @state() private config?: ChartedCardConfig;
  private renderer?: ChartedRenderer;
  private refreshInterval?: number;
  private intersectionObserver?: IntersectionObserver;
  private lastHistoryFetch: number = 0;
  @state() private liveDebug?: LiveDebugPayload;
  @state() private configDiffs: string[] = [];
  @state() private derivedHours?: number;
  @state() private derivedPoints?: number;

  static getConfigElement() {
    // Use schema-based config form (getConfigForm) instead of custom element
    return undefined;
  }

  static getStubConfig() {
    return {
      type: 'custom:energy-flow-charted-card',
      hours_to_show: 24,
      points_per_hour: 12,
      entities: {
        solar: '',
        grid: '',
        battery: '',
        load: '',
      },
    };
  }

  static getConfigForm() {
    return getChartedConfigForm();
  }

  setConfig(config: ChartedCardConfig) {
    const next = normalizeConfig(config);
    if (this.config && configsEqual(this.config, next)) {
      return;
    }
    if (this.config) {
      this.configDiffs = configDiff(this.config, next);
      if (this.config.debug_overlay) {
        console.info('[charted] config changed', this.configDiffs);
      }
    }
    this.config = next;
    
    // Reset subscriptions if already connected
    if (this.isConnected) {
      this.resetSubscriptions();
      this.restartRefreshTimer();
    }
  }

  private resolveDerivedConfig(hass: any): { hours: number; pointsPerHour: number } {
    const hoursFromEntity = this.config?.hours_entity
      ? Number(hass?.states?.[this.config.hours_entity]?.state)
      : NaN;
    const hours = Number.isFinite(hoursFromEntity)
      ? hoursFromEntity
      : (this.config?.hours_to_show ?? 24);

    const pointsFromEntity = this.config?.points_per_hour_entity
      ? Number(hass?.states?.[this.config.points_per_hour_entity]?.state)
      : NaN;

    let points: number;

    if (Number.isFinite(pointsFromEntity)) {
      points = pointsFromEntity;
    } else if (Number.isFinite(this.config?.points_per_hour)) {
      points = this.config!.points_per_hour as number;
    } else if (Number.isFinite(hours) && hours > 0) {
      // If points_per_hour is omitted, default to auto based on hours
      points = Math.max(1, Math.round(120 / hours));
    } else {
      points = 12;
    }

    if (!Number.isFinite(points) || points <= 0) {
      points = 12;
    }

    return { hours, pointsPerHour: points };
  }

  getCardSize() {
    return 4;
  }

  /**
   * Set up entity subscriptions for live value updates
   */
  protected setupSubscriptions(): void {
    // ChipManager manages subscriptions, but we need to ensure renderer exists
    // and re-initialize subscriptions if config changed after connection
    if (!this.config) return;

    // Watch dynamic config entities so hours/points changes refetch and rerender
    if (this.config.hours_entity) {
      this.subscribe(this.config.hours_entity, () => {
        this.restartRefreshTimer();
        this.updateChart();
      });
    }
    if (this.config.points_per_hour_entity) {
      this.subscribe(this.config.points_per_hour_entity, () => {
        this.restartRefreshTimer();
        this.updateChart();
      });
    }

    if (this.renderer) {
      // Renderer already exists, need to recreate ChipManager with new subscriptions
      // This happens when setConfig() is called after connectedCallback()
      this.updateChart();
    }
  }

  /**
   * Called by HassCardBase when hass updates
   * Renderer manages its own live updates via HassObservable
   */
  protected onHassUpdate(): void {
    // No-op: renderer handles live updates directly
  }

  connectedCallback() {
    super.connectedCallback();
    
    this.restartRefreshTimer();
    
    // Watch for visibility changes (e.g., tab switching, dashboard navigation)
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (this.renderer) {
            // Card became visible, resize and fetch if stale
            this.renderer.resize();
            const pointsPerHour = this.config?.points_per_hour || 12;
            const staleDuration = (60 * 60 * 1000) / pointsPerHour;
            if (Date.now() - this.lastHistoryFetch > staleDuration) {
              this.fetchHistoryData();
            }
          } else {
            // Card became visible but renderer not created yet (hidden tab on load)
            this.updateChart();
          }
        }
      });
    });
    this.intersectionObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = undefined;
    }
    this.clearRefreshTimer();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = undefined;
    }
  }

  protected updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);
    
    // Chart initialization happens after DOM is ready
    if (changedProps.has('config') && this.shadowRoot) {
      const container = this.shadowRoot.querySelector('#chart-container') as HTMLElement;
      if (container) {
        this.updateChart();
      }
    }
  }

  private async updateChart() {
    if (!this.hass || !this.config) return;

    const container = this.shadowRoot?.querySelector('#chart-container') as HTMLElement;
    if (!container) return;

    const derived = this.resolveDerivedConfig(this.hass);
    this.derivedHours = derived.hours;
    this.derivedPoints = derived.pointsPerHour;
    const resolvedConfig: ChartedCardConfig = {
      ...this.config,
      hours_to_show: derived.hours,
      points_per_hour: derived.pointsPerHour,
    };

    if (!this.renderer) {
      this.renderer = new ChartedRenderer(
        container,
        this.hass,
        resolvedConfig,
        this._hassObservable,
        (payload: LiveDebugPayload) => {
          this.liveDebug = payload;
        }
      );
    }

    await this.renderer.update(this.hass, resolvedConfig);
    this.lastHistoryFetch = Date.now();
  }

  private async fetchHistoryData() {
    if (!this.renderer || !this.hass || !this.config) return;
    const derived = this.resolveDerivedConfig(this.hass);
    this.derivedHours = derived.hours;
    this.derivedPoints = derived.pointsPerHour;
    const resolvedConfig: ChartedCardConfig = {
      ...this.config,
      hours_to_show: derived.hours,
      points_per_hour: derived.pointsPerHour,
    };
    await this.renderer.update(this.hass, resolvedConfig);
    this.lastHistoryFetch = Date.now();
  }

  private restartRefreshTimer() {
    this.clearRefreshTimer();
    
    // Refresh history data at the same interval as data points
    // Default: 12 points per hour = 5 minute intervals
    const resolved = this.resolveDerivedConfig(this.hass);
    this.derivedHours = resolved.hours;
    this.derivedPoints = resolved.pointsPerHour;
    const pointsPerHour = resolved.pointsPerHour || 12;
    const refreshMs = (60 * 60 * 1000) / pointsPerHour;
    this.refreshInterval = window.setInterval(() => {
      this.fetchHistoryData();
    }, refreshMs);
  }

  private clearRefreshTimer() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }

  protected render() {
    if (!this.config) {
      return html`<div class="card">No configuration</div>`;
    }

    return html`
      <div class="card">
        <div id="chart-container"></div>
        ${this.config.debug_overlay && this.liveDebug ? html`
          <div class="debug-overlay">
            <div class="debug-title">Live values (no ECharts)</div>
            <div class="debug-grid">
              <div>Time</div><div>${new Date(this.liveDebug.timestamp).toLocaleTimeString()}</div>
              <div>Solar</div><div>${Math.round(this.liveDebug.liveValues.solar)} W</div>
              <div>Grid</div><div>${Math.round(this.liveDebug.liveValues.grid)} W</div>
              <div>Battery</div><div>${Math.round(this.liveDebug.liveValues.battery)} W</div>
              <div>Load</div><div>${Math.round(this.liveDebug.liveValues.load)} W</div>
              <div>Hours</div><div>${this.derivedHours ?? this.config.hours_to_show ?? 'n/a'}</div>
              <div>Points/hr</div><div>${this.derivedPoints ?? this.config.points_per_hour ?? 'n/a'}</div>
            </div>
            ${this.configDiffs.length ? html`
              <div class="debug-diff-title">Config diffs</div>
              <ul class="debug-diffs">
                ${this.configDiffs.map(item => html`<li>${item}</li>`)}
              </ul>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    .card {
      background: var(--ha-card-background, #1c1c1c);
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative;
    }
    #chart-container {
      width: 100%;
      height: 350px;
    }
    .debug-overlay {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(0,0,0,0.65);
      color: #fff;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 12px;
      line-height: 1.4;
      min-width: 180px;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .debug-title {
      font-weight: 700;
      margin-bottom: 6px;
      font-size: 12px;
    }
    .debug-diff-title {
      font-weight: 700;
      margin-top: 10px;
      margin-bottom: 4px;
      font-size: 12px;
    }
    .debug-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 8px;
    }
    .debug-diffs {
      margin: 0;
      padding-left: 16px;
      font-size: 12px;
      line-height: 1.4;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'energy-flow-charted-card': ChartedCard;
  }
}

// Register the card
if (!customElements.get('energy-flow-charted-card')) {
  customElements.define('energy-flow-charted-card', ChartedCard);
  console.info(
    '%c ENERGY-FLOW-CHARTED-CARD %c 1.0.0 ',
    'color: white; background: green; font-weight: 700;',
    'color: green; background: white; font-weight: 700;'
  );
}
