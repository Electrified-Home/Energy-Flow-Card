import { getMeteredConfigForm, normalizeMeteredConfig } from './config';
import { calculateEnergyFlows } from '../../shared/src/flow-calculator';
import { getDisplayName, getIcon } from '../../shared/src/utils/helpers';
import type { EnergyFlowCardConfig } from '../../shared/src/types/Config.d.ts';
import type { HomeAssistant } from '../../shared/src/types/HASS.d.ts';
import { DefaultRenderer } from './renderer';

// Main card class
class MeteredHomeEnergyFlowCard extends HTMLElement {
  private _resizeObserver: ResizeObserver | null;
  private _config?: EnergyFlowCardConfig;
  private _hass?: HomeAssistant;
  private _defaultRenderer?: DefaultRenderer;

  constructor() {
    super();
    this._resizeObserver = null;
  }

  static getStubConfig() {
    return {};
  }

  static getConfigForm() {
    return getMeteredConfigForm();
  }

  connectedCallback() {
    // Set up resize observer to redraw flows when card is resized
    this._resizeObserver = new ResizeObserver(() => {
      // Renderers handle their own resize logic
    });
    
    // Observe the container, not the card itself
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
    
    // Stop renderers
    if (this._defaultRenderer) {
      this._defaultRenderer.stop();
    }
  }

  setConfig(config: EnergyFlowCardConfig): void {
    this._config = normalizeMeteredConfig(config);
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
      console.error('[MeteredHomeEnergyFlowCard] render failed during', context, error);
      this.innerHTML = `
        <ha-card>
          <div style="padding:16px;">
            Metered Home Energy Flow Card failed to render. Check browser console for details.
          </div>
        </ha-card>
      `;
    }
  }

  _render() {
    if (!this._config || !this._hass) return;
    if (!this._config.load) return; // Load entity is required

    const gridState = this._getEntityState(this._config.grid?.entity);
    const loadState = this._getEntityState(this._config.load.entity);
    const productionState = this._getEntityState(this._config.production?.entity);
    const batteryState = this._getEntityState(this._config.battery?.entity);

    // Calculate flow directions and magnitudes
    const grid = parseFloat(gridState?.state ?? '0') || 0;
    const load = parseFloat(loadState?.state ?? '0') || 0;
    const production = parseFloat(productionState?.state ?? '0') || 0;
    let battery = parseFloat(batteryState?.state ?? '0') || 0;
    
    // Invert battery data if configured (affects interpretation)
    if (this._config.battery?.invert?.data) {
      battery = -battery;
    }

    // Initialize DefaultRenderer if needed (flow diagram mode)
    if (!this._defaultRenderer) {
      this._defaultRenderer = new DefaultRenderer(
        this,
        this._config,
        this._hass,
        (type, fallback) => getDisplayName(this._config!, this._hass, type, fallback),
        (type, fallback) => getIcon(this._config!, this._hass, type, fallback),
        this._fireEvent.bind(this)
      );
    } else {
      this._defaultRenderer.setConfig(this._config);
    }
    
    // Calculate flows and render
    const flows = calculateEnergyFlows({ grid, production, load, battery });
    this._defaultRenderer.render({ grid, load, production, battery, flows });
  }

  private _getEntityState(entityId: string | undefined) {
    if (!entityId) return undefined;
    return this._hass?.states?.[entityId];
  }

  private _fireEvent(type: string, detail: any = {}): void {
    // Handle call-service events specially
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

// Register custom element (guard against double registration)
const CARD_TAG = 'metered-home-energy-flow-card';
if (!customElements.get(CARD_TAG)) {
  customElements.define(CARD_TAG, MeteredHomeEnergyFlowCard);
  console.info('[MeteredHomeEnergyFlowCard] defined custom element');
} else {
  console.info('[MeteredHomeEnergyFlowCard] custom element already defined');
}

// Register in card picker
declare global {
  interface Window {
    customCards: Array<{ type: string; name: string; description: string }>;
  }
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: "metered-home-energy-flow-card",
  name: "Metered Home Energy Flow Card",
  description: "Flow diagram visualization of home energy flows with animated meters"
});

// Dispatch event to notify Home Assistant
window.dispatchEvent(new Event('ll-rebuild'));
