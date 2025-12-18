import { html, css } from 'lit';
import { state } from 'lit/decorators.js';
import { HassCardBase } from '../../shared/src/base/HassCardBase';
import { normalizeConfig, getChartedConfigForm } from './config';
import { ChartedRenderer } from './renderer';
import type { ChartedCardConfig } from './types';

/**
 * ChartedCard - An energy flow visualization card using ECharts
 * Uses HassCardBase for automatic entity subscription management
 */
export class ChartedCard extends HassCardBase {
  @state() private config?: ChartedCardConfig;
  private renderer?: ChartedRenderer;
  private refreshInterval?: number;
  private intersectionObserver?: IntersectionObserver;
  private lastHistoryFetch: number = 0;

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
    this.config = normalizeConfig(config);
    
    // Reset subscriptions if already connected
    if (this.isConnected) {
      this.resetSubscriptions();
      this.restartRefreshTimer();
    }
  }

  getCardSize() {
    return 4;
  }

  /**
   * Set up entity subscriptions for live value updates
   */
  protected setupSubscriptions(): void {
    // Renderer manages its own subscriptions via HassObservable
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

    if (!this.renderer) {
      this.renderer = new ChartedRenderer(container, this.hass, this.config, this._hassObservable);
    }

    await this.renderer.update(this.hass, this.config);
    this.lastHistoryFetch = Date.now();
  }

  private async fetchHistoryData() {
    if (!this.renderer || !this.hass || !this.config) return;
    await this.renderer.update(this.hass, this.config);
    this.lastHistoryFetch = Date.now();
  }

  private restartRefreshTimer() {
    this.clearRefreshTimer();
    
    // Refresh history data at the same interval as data points
    // Default: 12 points per hour = 5 minute intervals
    const pointsPerHour = this.config?.points_per_hour || 12;
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
    }
    #chart-container {
      width: 100%;
      height: 350px;
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
