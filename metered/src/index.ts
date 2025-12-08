import { calculateEnergyFlows } from '../../shared/src/flow-calculator';
import { getDisplayName, getIcon } from '../../shared/src/utils/helpers';
import type { EnergyFlowCardConfig, BatteryEntityConfig, EntityConfig } from '../../shared/src/types/Config.d.ts';
import type { HomeAssistant } from '../../shared/src/types/HASS.d.ts';
import { DefaultRenderer } from './renderer';

// Simplified config form for metered card (no view mode selector, includes names)
function getMeteredConfigForm() {
  return {
    schema: [
      { name: 'grid_entity', label: 'Grid', required: true, selector: { entity: { domain: 'sensor', device_class: 'power' } } },
      { name: 'grid_name', selector: { entity_name: {} }, context: { entity: 'grid_entity' } },
      { name: 'grid_icon', selector: { icon: {} }, context: { icon_entity: 'grid_entity' } },
      { name: 'grid_min', label: 'Grid Min (W)', selector: { number: { mode: 'box' } } },
      { name: 'grid_max', label: 'Grid Max (W)', selector: { number: { mode: 'box' } } },
      { name: 'grid_tap_action', label: 'Grid Tap Action', selector: { 'ui-action': {} } },
      { name: 'grid_hold_action', label: 'Grid Hold Action', selector: { 'ui-action': {} } },
      { name: 'load_entity', label: 'Load', required: true, selector: { entity: { domain: 'sensor', device_class: 'power' } } },
      { name: 'load_name', selector: { entity_name: {} }, context: { entity: 'load_entity' } },
      { name: 'load_icon', selector: { icon: {} }, context: { icon_entity: 'load_entity' } },
      { name: 'load_max', label: 'Load Max (W)', selector: { number: { mode: 'box' } } },
      { name: 'load_tap_action', label: 'Load Tap Action', selector: { 'ui-action': {} } },
      { name: 'load_hold_action', label: 'Load Hold Action', selector: { 'ui-action': {} } },
      { name: 'production_entity', label: 'Production', required: true, selector: { entity: { domain: 'sensor', device_class: 'power' } } },
      { name: 'production_name', selector: { entity_name: {} }, context: { entity: 'production_entity' } },
      { name: 'production_icon', selector: { icon: {} }, context: { icon_entity: 'production_entity' } },
      { name: 'production_max', label: 'Production Max (W)', selector: { number: { mode: 'box' } } },
      { name: 'production_tap_action', label: 'Production Tap Action', selector: { 'ui-action': {} } },
      { name: 'production_hold_action', label: 'Production Hold Action', selector: { 'ui-action': {} } },
      { name: 'battery_entity', label: 'Battery', required: true, selector: { entity: { domain: 'sensor', device_class: 'power' } } },
      { name: 'battery_name', selector: { entity_name: {} }, context: { entity: 'battery_entity' } },
      { name: 'battery_icon', selector: { icon: {} }, context: { icon_entity: 'battery_entity' } },
      { name: 'battery_min', label: 'Battery Min (W)', selector: { number: { mode: 'box' } } },
      { name: 'battery_max', label: 'Battery Max (W)', selector: { number: { mode: 'box' } } },
      { name: 'battery_tap_action', label: 'Battery Tap Action', selector: { 'ui-action': {} } },
      { name: 'battery_hold_action', label: 'Battery Hold Action', selector: { 'ui-action': {} } },
      { name: 'battery_soc_entity', label: 'Battery SOC (%) Entity', selector: { entity: { domain: 'sensor' } } },
      { name: 'invert_battery_data', label: 'Invert Battery Data', selector: { boolean: {} } },
      { name: 'invert_battery_view', label: 'Invert Battery View', selector: { boolean: {} } },
      { name: 'show_plus', label: 'Show + Sign', selector: { boolean: {} } },
    ],
  };
}

// Normalize flat config to nested structure (includes names)
function normalizeMeteredConfig(config: EnergyFlowCardConfig | Record<string, any>): EnergyFlowCardConfig {
  if ((config as EnergyFlowCardConfig).load) {
    return config as EnergyFlowCardConfig;
  }

  const normalizeEntity = (prefix: string): EntityConfig | undefined => {
    const entityId = (config as any)[`${prefix}_entity`];
    if (!entityId) return undefined;

    const normalized: EntityConfig = { entity: entityId };
    const name = (config as any)[`${prefix}_name`];
    const icon = (config as any)[`${prefix}_icon`];
    const min = (config as any)[`${prefix}_min`];
    const max = (config as any)[`${prefix}_max`];
    const tap = (config as any)[`${prefix}_tap_action`];
    const hold = (config as any)[`${prefix}_hold_action`];

    if (name !== undefined) normalized.name = name;
    if (icon !== undefined) normalized.icon = icon;
    if (min !== undefined) normalized.min = min;
    if (max !== undefined) normalized.max = max;
    if (tap !== undefined) normalized.tap = tap;
    if (hold !== undefined) normalized.hold = hold;

    return normalized;
  };

  const load = normalizeEntity('load');
  const grid = normalizeEntity('grid');
  const production = normalizeEntity('production');
  const batteryEntity = normalizeEntity('battery') as BatteryEntityConfig | undefined;

  if (batteryEntity) {
    const soc = (config as any)['battery_soc_entity'];
    const invertData = (config as any)['invert_battery_data'];
    const invertView = (config as any)['invert_battery_view'];
    const showPlus = (config as any)['show_plus'];

    if (soc !== undefined) batteryEntity.soc_entity = soc;
    if (invertData !== undefined || invertView !== undefined) {
      batteryEntity.invert = {
        data: invertData !== undefined ? invertData : batteryEntity.invert?.data,
        view: invertView !== undefined ? invertView : batteryEntity.invert?.view,
      };
    }
    if (showPlus !== undefined) batteryEntity.showPlus = showPlus;
  }

  if (!load) {
    return config as EnergyFlowCardConfig;
  }

  return {
    load,
    grid,
    production,
    battery: batteryEntity,
  };
}

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
