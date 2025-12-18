/**
 * Compact Home Energy Flow Card
 * 
 * Displays energy flows as animated horizontal bars.
 * Supports two modes:
 * - 'compact': Load bar showing sources (grid, battery, production)
 * - 'compact-battery': Load bar + battery bar showing charge/discharge flows
 */

import { html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { HassCardBase } from '../../shared/src/base/HassCardBase';
import { getCompactConfigForm, normalizeCompactConfig } from './config';
import { calculateEnergyFlows } from '../../shared/src/flow-calculator';
import { getIcon, handleAction, updateSegmentVisibility } from '../../shared/src/utils/helpers';
import type { EnergyFlowCardConfig } from '../../shared/src/types/Config';
import type { CompactViewMode, CompactRenderData, EntityType } from './types';
import { AnimationController } from './animation';
import { calculateLoadBarPercentages, calculateBatteryBarData } from './calculations';
import { compactCardStyles } from './styles';

class CompactHomeEnergyFlowCard extends HassCardBase {
  @property({ attribute: false }) config?: EnergyFlowCardConfig;
  @state() private viewMode: CompactViewMode = 'compact';
  @state() private renderData?: CompactRenderData;
  
  // Colors (darker hues - 50% brightness)
  private readonly productionColor = '#256028'; // Dark green
  private readonly batteryColor = '#104b79'; // Dark blue
  private readonly gridColor = '#7a211b'; // Dark red (import)
  private readonly returnColor = '#7a6b1b'; // Dark yellow (export)

  // Animation controller
  private animation = new AnimationController();

  static getStubConfig() {
    return {};
  }

  static getConfigForm() {
    return getCompactConfigForm();
  }

  static styles = compactCardStyles;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.animation.stop();
  }

  setConfig(config: any): void {
    this.config = normalizeCompactConfig(config);
    // If already connected, reset subscriptions for new config
    // (On first load, connectedCallback will handle setup)
    if (this.isConnected) {
      this.resetSubscriptions();
    }
  }

  protected setupSubscriptions(): void {
    if (!this.config) return;

    // Subscribe to all energy entities
    if (this.config.grid?.entity) {
      this.subscribe(this.config.grid.entity, () => this.updateRenderData());
    }
    if (this.config.load?.entity) {
      this.subscribe(this.config.load.entity, () => this.updateRenderData());
    }
    if (this.config.production?.entity) {
      this.subscribe(this.config.production.entity, () => this.updateRenderData());
    }
    if (this.config.battery?.entity) {
      this.subscribe(this.config.battery.entity, () => this.updateRenderData());
    }
    if (this.config.battery?.soc_entity) {
      this.subscribe(this.config.battery.soc_entity, () => this.updateRenderData());
    }
  }

  private updateRenderData(): void {
    if (!this.config || !this.hass) return;

    const gridState = this.hass.states[this.config.grid?.entity || ''];
    const loadState = this.hass.states[this.config.load?.entity || ''];
    const productionState = this.hass.states[this.config.production?.entity || ''];
    const batteryState = this.hass.states[this.config.battery?.entity || ''];

    const grid = parseFloat(gridState?.state ?? '0') || 0;
    const load = parseFloat(loadState?.state ?? '0') || 0;
    const production = parseFloat(productionState?.state ?? '0') || 0;
    let battery = parseFloat(batteryState?.state ?? '0') || 0;

    // Invert battery data if configured
    if (this.config.battery?.invert?.data) {
      battery = -battery;
    }

    // Calculate flows
    const flows = calculateEnergyFlows({ grid, production, load, battery });

    // Get battery SOC if available
    let batterySoc: number | null = null;
    if (this.config.battery?.soc_entity) {
      const socState = this.hass.states[this.config.battery.soc_entity];
      batterySoc = parseFloat(socState?.state ?? '0') || 0;
    }

    // Determine view mode
    this.viewMode = batterySoc !== null ? 'compact-battery' : 'compact';

    // Update render data (triggers Lit re-render)
    this.renderData = { grid, load, production, battery, flows, batterySoc };
  }

  render() {
    if (!this.config || !this.renderData) {
      return html`<ha-card class="compact-card"><div style="padding:16px;">Waiting for configuration...</div></ha-card>`;
    }

    const { load, flows, battery, batterySoc } = this.renderData;

    // Calculate load bar percentages
    const loadBarPercentages = calculateLoadBarPercentages(load, flows);

    // Update animation speed
    this.animation.setLoadSpeed(load);

    return html`
      <ha-card class="compact-card">
        <div class="compact-view ${this.viewMode === 'compact-battery' ? 'has-battery' : ''}">
          ${this.viewMode === 'compact-battery' ? this.renderBatteryRow(battery, flows, batterySoc) : ''}
          ${this.renderLoadRow(
            loadBarPercentages.visual,
            loadBarPercentages.true,
            flows.productionToLoad,
            flows.batteryToLoad,
            flows.gridToLoad,
            load
          )}
        </div>
      </ha-card>
    `;
  }

  private renderLoadRow(
    visual: { production: number; battery: number; grid: number },
    actual: { production: number; battery: number; grid: number },
    productionValue: number,
    batteryToLoad: number,
    gridToLoad: number,
    load: number
  ) {
    return html`
      <div class="compact-row">
        <div class="bar-container ${this.animation.getAnimationSpeed(load) > 0 ? '' : 'no-flow'}">
          <div
            id="grid-segment"
            class="bar-segment"
            style="background: ${this.gridColor}; width: ${visual.grid}%;"
            @click=${() => this.handleClick(this.config?.grid?.tap, this.config?.grid?.entity)}
          >
            <div class="bar-segment-content">
              <ha-icon class="bar-segment-icon" icon="${this.getIconFor('grid')}"></ha-icon>
              <span class="bar-segment-label">${gridToLoad > 0 ? `${Math.round(actual.grid)}%` : ''}</span>
            </div>
          </div>
          <div
            id="battery-segment"
            class="bar-segment"
            style="background: ${this.batteryColor}; width: ${visual.battery}%;"
            @click=${() => this.handleClick(this.config?.battery?.tap, this.config?.battery?.entity)}
          >
            <div class="bar-segment-content">
              <ha-icon class="bar-segment-icon" icon="${this.getIconFor('battery')}"></ha-icon>
              <span class="bar-segment-label">${batteryToLoad > 0 ? `${Math.round(actual.battery)}%` : ''}</span>
            </div>
          </div>
          <div
            id="production-segment"
            class="bar-segment"
            style="background: ${this.productionColor}; width: ${visual.production}%;"
            @click=${() => this.handleClick(this.config?.production?.tap, this.config?.production?.entity)}
          >
            <div class="bar-segment-content">
              <ha-icon class="bar-segment-icon" icon="${this.getIconFor('production')}"></ha-icon>
              <span class="bar-segment-label">${productionValue > 0 ? `${Math.round(actual.production)}%` : ''}</span>
            </div>
          </div>
        </div>
        <div class="row-value" @click=${() => this.handleClick(this.config?.load?.tap, this.config?.load?.entity)}>
          <ha-icon class="row-icon" icon="${this.getIconFor('load')}"></ha-icon>
          <div class="row-text">
            <span>${Math.round(load)}</span><span class="row-unit">W</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderBatteryRow(battery: number, flows: any, batterySoc: number | null) {
    const batteryData = calculateBatteryBarData(battery, flows);

    // Update animation
    this.animation.setBatteryAnimation(battery, batteryData.direction);

    const gridColorToUse = batteryData.gridIsImport ? this.gridColor : this.returnColor;
    const socDisplay = batterySoc !== null ? batterySoc.toFixed(1) : '--';
    const showSocLeft = battery > 0;

    return html`
      <div class="compact-row" id="battery-row">
        <div
          class="row-value"
          style="display: ${showSocLeft ? 'flex' : 'none'};"
          @click=${() => this.handleClick(this.config?.battery?.tap, this.config?.battery?.entity)}
        >
          <ha-icon class="row-icon" icon="${this.getIconFor('battery')}"></ha-icon>
          <div class="row-text">
            <span>${socDisplay}</span><span class="row-unit">%</span>
          </div>
        </div>
        <div class="bar-container ${this.animation.getAnimationSpeed(Math.abs(battery)) > 0 ? '' : 'no-flow'}">
          <div
            class="bar-segment"
            style="background: ${gridColorToUse}; width: ${batteryData.gridPercent}%;"
            @click=${() => this.handleClick(this.config?.grid?.tap, this.config?.grid?.entity)}
          >
            <div class="bar-segment-content">
              <ha-icon class="bar-segment-icon" icon="${this.getIconFor('grid')}"></ha-icon>
              <span class="bar-segment-label">${batteryData.gridWatts > 0 ? `${Math.round(batteryData.gridWatts)}W` : ''}</span>
            </div>
          </div>
          <div
            class="bar-segment"
            style="background: ${this.batteryColor}; width: ${batteryData.loadPercent}%;"
            @click=${() => this.handleClick(this.config?.load?.tap, this.config?.load?.entity)}
          >
            <div class="bar-segment-content">
              <ha-icon class="bar-segment-icon" icon="${this.getIconFor('load')}"></ha-icon>
              <span class="bar-segment-label">${batteryData.loadWatts > 0 ? `${Math.round(batteryData.loadWatts)}W` : ''}</span>
            </div>
          </div>
          <div
            class="bar-segment"
            style="background: ${this.productionColor}; width: ${batteryData.productionPercent}%;"
            @click=${() => this.handleClick(this.config?.production?.tap, this.config?.production?.entity)}
          >
            <div class="bar-segment-content">
              <ha-icon class="bar-segment-icon" icon="${this.getIconFor('production')}"></ha-icon>
              <span class="bar-segment-label">${batteryData.productionWatts > 0 ? `${Math.round(batteryData.productionWatts)}W` : ''}</span>
            </div>
          </div>
        </div>
        <div
          class="row-value"
          style="display: ${showSocLeft ? 'none' : 'flex'};"
          @click=${() => this.handleClick(this.config?.battery?.tap, this.config?.battery?.entity)}
        >
          <ha-icon class="row-icon" icon="${this.getIconFor('battery')}"></ha-icon>
          <div class="row-text">
            <span>${socDisplay}</span><span class="row-unit">%</span>
          </div>
        </div>
      </div>
    `;
  }

  private getIconFor(type: EntityType): string {
    const fallbacks: Record<EntityType, string> = {
      grid: 'mdi:transmission-tower',
      load: 'mdi:home-lightning-bolt',
      production: 'mdi:solar-power',
      battery: 'mdi:battery'
    };
    return getIcon(this.config!, this.hass, type, fallbacks[type]);
  }

  private handleClick(action: unknown, entity?: string): void {
    if (!this.hass) return;
    handleAction(this.hass, this.fireEvent.bind(this), action, entity);
  }

  private fireEvent(type: string, detail: any = {}): void {
    if (type === 'call-service' && this.hass) {
      this.hass.callService(detail.domain, detail.service, detail.service_data || {}, detail.target);
      return;
    }

    const event = new CustomEvent(type, {
      detail,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  updated(changedProperties: Map<string, any>): void {
    super.updated(changedProperties);

    // Start animation if not running (after DOM is rendered)
    if (!this.animation.isRunning() && this.shadowRoot) {
      this.animation.start(this.shadowRoot);
    }

    // Update segment visibility after render
    if (changedProperties.has('renderData') && this.renderData) {
      requestAnimationFrame(() => {
        this.updateSegmentVisibility();
      });
    }
  }

  private updateSegmentVisibility(): void {
    if (!this.shadowRoot || !this.renderData) return;

    const { flows } = this.renderData;
    const loadBar = this.shadowRoot.querySelector('.compact-row:not(#battery-row) .bar-container') as HTMLElement;

    if (loadBar) {
      const productionSeg = this.shadowRoot.querySelector('#production-segment') as HTMLElement;
      const batterySeg = this.shadowRoot.querySelector('#battery-segment') as HTMLElement;
      const gridSeg = this.shadowRoot.querySelector('#grid-segment') as HTMLElement;

      if (productionSeg) {
        const widthPx = (parseFloat(productionSeg.style.width) / 100) * loadBar.clientWidth;
        updateSegmentVisibility(productionSeg, widthPx, flows.productionToLoad > 0);
      }
      if (batterySeg) {
        const widthPx = (parseFloat(batterySeg.style.width) / 100) * loadBar.clientWidth;
        updateSegmentVisibility(batterySeg, widthPx, flows.batteryToLoad > 0);
      }
      if (gridSeg) {
        const widthPx = (parseFloat(gridSeg.style.width) / 100) * loadBar.clientWidth;
        updateSegmentVisibility(gridSeg, widthPx, flows.gridToLoad > 0);
      }
    }

    // Battery row segments
    if (this.viewMode === 'compact-battery') {
      const batteryBar = this.shadowRoot.querySelector('#battery-row .bar-container') as HTMLElement;
      if (batteryBar) {
        const segments = batteryBar.querySelectorAll('.bar-segment');
        segments.forEach((seg) => {
          const widthPx = (parseFloat((seg as HTMLElement).style.width) / 100) * batteryBar.clientWidth;
          const label = seg.querySelector('.bar-segment-label');
          const hasValue = !!(label?.textContent && label.textContent.trim() !== '');
          updateSegmentVisibility(seg as HTMLElement, widthPx, hasValue);
        });
      }
    }
  }
}

// Register custom element
const CARD_TAG = 'compact-home-energy-flow-card';
if (!customElements.get(CARD_TAG)) {
  customElements.define(CARD_TAG, CompactHomeEnergyFlowCard);
  console.info('[CompactHomeEnergyFlowCard] defined custom element');
} else {
  console.info('[CompactHomeEnergyFlowCard] custom element already defined');
}

// Register in card picker
declare global {
  interface Window {
    customCards: Array<{ type: string; name: string; description: string }>;
  }
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: "compact-home-energy-flow-card",
  name: "Compact Home Energy Flow Card",
  description: "Compact bar visualization of home energy flows"
});
