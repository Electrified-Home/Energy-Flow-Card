import { calculateEnergyFlows } from './flow-calculator';
import { getConfigForm, normalizeConfig } from './Config';
import { getDisplayName, getIcon, handleAction } from './utils/helpers';
import type { EnergyFlowCardConfig } from './types/Config.d.ts';
import type { HomeAssistant } from './types/HASS.d.ts';
import { CompactRenderer } from './renderers/CompactRenderer';
import type { CompactViewMode } from './renderers/CompactRenderer';
import { DefaultRenderer } from './renderers/DefaultRenderer';
import { ChartRenderer } from './renderers/ChartRenderer';

// Main card class
class EnergyFlowCard extends HTMLElement {
  private _resizeObserver: ResizeObserver | null;
  private _config?: EnergyFlowCardConfig;
  private _hass?: HomeAssistant;
  private _lastViewMode?: string;
  private _compactRenderer?: CompactRenderer;
  private _defaultRenderer?: DefaultRenderer;
  private _chartRenderer?: ChartRenderer;

  constructor() {
    super();
    this._resizeObserver = null;
  }

  static getStubConfig() {
    return {};
  }

  static getConfigForm() {
    return getConfigForm();
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
    
    // Animation loop will be started on first render to avoid race conditions
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
    if (this._chartRenderer) {
      this._chartRenderer.cleanup();
    }
  }

  setConfig(config: EnergyFlowCardConfig): void {
    this._config = normalizeConfig(config);
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
      console.error('[EnergyFlowCard] render failed during', context, error);
      this.innerHTML = `
        <ha-card>
          <div style="padding:16px;">
            Energy Flow Card failed to render. Check browser console for details.
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

    // Check view mode
    const viewMode = this._config.mode || 'default';
    
    // Clean up chart cache if switching away from chart view
    if (this._lastViewMode === 'chart' && viewMode !== 'chart' && this._chartRenderer) {
      this._chartRenderer.cleanup();
    }
    
    if (viewMode === 'compact' || viewMode === 'compact-battery') {
      this._renderCompactView(grid, load, production, battery, viewMode as CompactViewMode);
      this._lastViewMode = viewMode;
      return;
    }
    if (viewMode === 'chart') {
      if (!this._chartRenderer) {
        this._chartRenderer = new ChartRenderer(this._hass, this._config, this._fireEvent.bind(this));
      } else {
        this._chartRenderer.setConfig(this._config);
      }
      
      this._chartRenderer.updateLiveValues({ grid, load, production, battery });
      this._chartRenderer.render(this);
      this._lastViewMode = viewMode;
      return;
    }

    // Initialize DefaultRenderer if needed
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
    const flows = this._calculateFlows(grid, production, load, battery);
    this._defaultRenderer.render({ grid, load, production, battery, flows });

    this._lastViewMode = viewMode;
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

  /**
   * Calculate energy flows between meters based on sensor readings.
   * Uses the tested calculateEnergyFlows function.
   */
  private _calculateFlows(grid: number, production: number, load: number, battery: number) {
    return calculateEnergyFlows({ grid, production, load, battery });
  }

  private _renderCompactView(grid: number, load: number, production: number, battery: number, viewMode: CompactViewMode): void {
    if (!this._config || !this._hass) return;

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

    // Use the same flow calculator to get accurate contributions to load
    const flows = this._calculateFlows(grid, production, load, battery);

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

}

// Register custom element (guard against double registration)
const CARD_TAG = 'energy-flow-card';
if (!customElements.get(CARD_TAG)) {
  customElements.define(CARD_TAG, EnergyFlowCard);
  console.info('[EnergyFlowCard] defined custom element');
} else {
  console.info('[EnergyFlowCard] custom element already defined');
}

// Register in card picker
declare global {
  interface Window {
    customCards: Array<{ type: string; name: string; description: string }>;
  }
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: "custom:energy-flow-card",
  name: "Energy Flow Card",
  description: "A test energy-flow card."
});
