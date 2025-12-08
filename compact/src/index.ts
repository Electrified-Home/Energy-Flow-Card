import { calculateEnergyFlows } from '../../shared/src/flow-calculator';
import { getIcon, handleAction } from '../../shared/src/utils/helpers';
import type { EnergyFlowCardConfig } from '../../shared/src/types/Config.d.ts';
import type { HomeAssistant } from '../../shared/src/types/HASS.d.ts';
import { CompactRenderer } from './renderer';
import type { CompactViewMode } from './renderer';

// Compact card-specific config form (simplified, no names, no min/max, auto-detect 2nd bar)
function getCompactConfigForm() {
  return {
    schema: [
      { name: 'grid_entity', label: 'Grid', required: true, selector: { entity: { domain: 'sensor', device_class: 'power' } } },
      { name: 'grid_icon', selector: { icon: {} }, context: { icon_entity: 'grid_entity' } },
      { name: 'grid_tap_action', label: 'Grid Tap Action', selector: { 'ui-action': {} } },
      { name: 'grid_hold_action', label: 'Grid Hold Action', selector: { 'ui-action': {} } },
      
      { name: 'load_entity', label: 'Load', required: true, selector: { entity: { domain: 'sensor', device_class: 'power' } } },
      { name: 'load_icon', selector: { icon: {} }, context: { icon_entity: 'load_entity' } },
      { name: 'load_tap_action', label: 'Load Tap Action', selector: { 'ui-action': {} } },
      { name: 'load_hold_action', label: 'Load Hold Action', selector: { 'ui-action': {} } },
      
      { name: 'production_entity', label: 'Production', required: true, selector: { entity: { domain: 'sensor', device_class: 'power' } } },
      { name: 'production_icon', selector: { icon: {} }, context: { icon_entity: 'production_entity' } },
      { name: 'production_tap_action', label: 'Production Tap Action', selector: { 'ui-action': {} } },
      { name: 'production_hold_action', label: 'Production Hold Action', selector: { 'ui-action': {} } },
      
      { name: 'battery_entity', label: 'Battery', required: true, selector: { entity: { domain: 'sensor', device_class: 'power' } } },
      { name: 'battery_icon', selector: { icon: {} }, context: { icon_entity: 'battery_entity' } },
      { name: 'battery_tap_action', label: 'Battery Tap Action', selector: { 'ui-action': {} } },
      { name: 'battery_hold_action', label: 'Battery Hold Action', selector: { 'ui-action': {} } },
      { name: 'battery_soc_entity', label: 'Battery SOC (%) Entity', selector: { entity: { domain: 'sensor' } } },
      { name: 'invert_battery_data', label: 'Invert Battery Data', selector: { boolean: {} } },
    ],
  };
}

// Normalize flat config to nested structure (no names)
function normalizeCompactConfig(config: any): EnergyFlowCardConfig {
  if (config.load) {
    return config as EnergyFlowCardConfig;
  }

  const normalizeEntity = (prefix: string): any => {
    const entityId = config[`${prefix}_entity`];
    if (!entityId) return undefined;

    const normalized: any = { entity: entityId };
    const icon = config[`${prefix}_icon`];
    const tap = config[`${prefix}_tap_action`];
    const hold = config[`${prefix}_hold_action`];

    if (icon !== undefined) normalized.icon = icon;
    if (tap !== undefined) normalized.tap = tap;
    if (hold !== undefined) normalized.hold = hold;

    return normalized;
  };

  const load = normalizeEntity('load');
  const grid = normalizeEntity('grid');
  const production = normalizeEntity('production');
  const battery = normalizeEntity('battery');

  if (battery) {
    const soc = config['battery_soc_entity'];
    const invertData = config['invert_battery_data'];

    if (soc !== undefined) battery.soc_entity = soc;
    if (invertData !== undefined) {
      battery.invert = { data: invertData };
    }
  }

  if (!load) {
    return config as EnergyFlowCardConfig;
  }

  return {
    load,
    grid,
    production,
    battery,
  };
}

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
