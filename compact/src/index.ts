import { getCompactConfigForm, normalizeCompactConfig } from './config';
import { calculateEnergyFlows } from '../../shared/src/flow-calculator';
import { getIcon, handleAction } from '../../shared/src/utils/helpers';
import type { EnergyFlowCardConfig } from '../../shared/src/types/Config.d.ts';
import type { HomeAssistant } from '../../shared/src/types/HASS.d.ts';
import { CompactRenderer } from './renderer';
import type { CompactViewMode } from './renderer';

// Main compact card class
class CompactHomeEnergyFlowCard extends HTMLElement {
  private _resizeObserver: ResizeObserver | null;
  private _config?: EnergyFlowCardConfig;
  private _hass?: HomeAssistant;
  private _compactRenderer?: CompactRenderer;

  constructor() {
    super();
    this._resizeObserver = null;
  }

  static getStubConfig() {
    return {};
  }

  static getConfigForm() {
    return getCompactConfigForm();
  }

  connectedCallback() {
    this._resizeObserver = new ResizeObserver(() => {});
    
    if (this.parentElement) {
      this._resizeObserver.observe(this.parentElement);
    }
    this._resizeObserver.observe(this);
  }

  disconnectedCallback() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }

  setConfig(config: any): void {
    this._config = normalizeCompactConfig(config);
    this._renderSafely('setConfig');
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this._renderSafely('hass update');
  }

  private _renderSafely(context: string) {
    try {
      this._render();
    } catch (error) {
      console.error('[CompactHomeEnergyFlowCard] render failed during', context, error);
      this.innerHTML = `
        <ha-card>
          <div style="padding:16px;">
            Compact Home Energy Flow Card failed to render. Check browser console for details.
          </div>
        </ha-card>
      `;
    }
  }

  _render() {
    if (!this._config || !this._hass) return;
    if (!this._config.load) return;

    const gridState = this._getEntityState(this._config.grid?.entity);
    const loadState = this._getEntityState(this._config.load.entity);
    const productionState = this._getEntityState(this._config.production?.entity);
    const batteryState = this._getEntityState(this._config.battery?.entity);

    const grid = parseFloat(gridState?.state ?? '0') || 0;
    const load = parseFloat(loadState?.state ?? '0') || 0;
    const production = parseFloat(productionState?.state ?? '0') || 0;
    let battery = parseFloat(batteryState?.state ?? '0') || 0;
    
    // Invert battery data if configured
    if (this._config.battery?.invert?.data) {
      battery = -battery;
    }

    // Auto-detect view mode based on SOC entity presence
    const hasSoc = !!this._config.battery?.soc_entity;
    const viewMode: CompactViewMode = hasSoc ? 'compact-battery' : 'compact';

    // Initialize CompactRenderer if needed
    if (!this._compactRenderer) {
      this._compactRenderer = new CompactRenderer(
        this,
        this._config,
        this._hass,
        viewMode,
        (type, fallback) => getIcon(this._config!, this._hass, type, fallback),
        (action, entity) => handleAction(this._hass as HomeAssistant, this._fireEvent.bind(this), action, entity)
      );
    } else {
      this._compactRenderer.setConfig(this._config);
      this._compactRenderer.setViewMode(viewMode);
    }

    // Calculate flows
    const flows = calculateEnergyFlows({ grid, production, load, battery });

    // Get battery SOC if available
    let batterySoc: number | null = null;
    if (this._config.battery?.soc_entity) {
      const socState = this._getEntityState(this._config.battery.soc_entity);
      batterySoc = parseFloat(socState?.state ?? '0') || 0;
    }

    // Render
    this._compactRenderer.render({
      grid,
      load,
      production,
      battery,
      flows,
      batterySoc
    });
  }

  private _getEntityState(entityId: string | undefined) {
    if (!entityId) return undefined;
    return this._hass?.states?.[entityId];
  }

  private _fireEvent(type: string, detail: any = {}): void {
    if (type === 'call-service' && this._hass) {
      this._hass.callService(detail.domain, detail.service, detail.service_data || {}, detail.target);
      return;
    }
    
    const event = new CustomEvent(type, {
      detail,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
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

// Dispatch event to notify Home Assistant
window.dispatchEvent(new Event('ll-rebuild'));
