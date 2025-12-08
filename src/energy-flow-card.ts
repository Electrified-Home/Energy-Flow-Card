import { calculateEnergyFlows } from './flow-calculator';
import type { BatteryEntityConfig, EnergyFlowCardConfig, EntityConfig } from './types/Config.d.ts';
import type { HomeAssistant } from './types/HASS.d.ts';
import { CompactRenderer } from './renderers/CompactRenderer';
import type { CompactViewMode } from './renderers/CompactRenderer';
import { DefaultRenderer } from './renderers/DefaultRenderer';
import { ChartRenderer } from './renderers/chart-renderer';

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
    return {
      schema: [
        { name: "view_mode", label: "View Mode", selector: { select: { options: [{value: "default", label: "Default"}, {value: "compact", label: "Compact Bar"}, {value: "compact-battery", label: "Compact with Battery"}, {value: "chart", label: "Chart"}] } } },
        { name: "grid_entity", label: "Grid", required: true, selector: { entity: { domain: "sensor", device_class: "power" } } },
        { name: "grid_name", selector: { entity_name: {} }, context: { entity: "grid_entity" } },
        { name: "grid_icon", selector: { icon: {} }, context: { icon_entity: "grid_entity" } },
        { name: "grid_min", label: "Grid Min (W)", selector: { number: { mode: "box" } } },
        { name: "grid_max", label: "Grid Max (W)", selector: { number: { mode: "box" } } },
        { name: "grid_tap_action", label: "Grid Tap Action", selector: { "ui-action": {} } },
        { name: "load_entity", label: "Load", required: true, selector: { entity: { domain: "sensor", device_class: "power" } } },
        { name: "load_name", selector: { entity_name: {} }, context: { entity: "load_entity" } },
        { name: "load_icon", selector: { icon: {} }, context: { icon_entity: "load_entity" } },
        { name: "load_max", label: "Load Max (W)", selector: { number: { mode: "box" } } },
        { name: "load_tap_action", label: "Load Tap Action", selector: { "ui-action": {} } },
        { name: "production_entity", label: "Production", required: true, selector: { entity: { domain: "sensor", device_class: "power" } } },
        { name: "production_name", selector: { entity_name: {} }, context: { entity: "production_entity" } },
        { name: "production_icon", selector: { icon: {} }, context: { icon_entity: "production_entity" } },
        { name: "production_max", label: "Production Max (W)", selector: { number: { mode: "box" } } },
        { name: "production_tap_action", label: "Production Tap Action", selector: { "ui-action": {} } },
        { name: "battery_entity", label: "Battery", required: true, selector: { entity: { domain: "sensor", device_class: "power" } } },
        { name: "battery_name", selector: { entity_name: {} }, context: { entity: "battery_entity" } },
        { name: "battery_icon", selector: { icon: {} }, context: { icon_entity: "battery_entity" } },
        { name: "battery_min", label: "Battery Min (W)", selector: { number: { mode: "box" } } },
        { name: "battery_max", label: "Battery Max (W)", selector: { number: { mode: "box" } } },
        { name: "battery_tap_action", label: "Battery Tap Action", selector: { "ui-action": {} } },
        { name: "battery_soc_entity", label: "Battery SOC (%) Entity", selector: { entity: { domain: "sensor" } } },
        { name: "invert_battery_data", label: "Invert Battery Data", selector: { boolean: {} } },
        { name: "invert_battery_view", label: "Invert Battery View", selector: { boolean: {} } },
        { name: "show_plus", label: "Show + Sign", selector: { boolean: {} } }
      ]
    };
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
    this._config = this._normalizeConfig(config);
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
      // Initialize ChartRenderer if needed
      if (!this._chartRenderer) {
        const chartConfig = {
          production_entity: this._config.production?.entity || '',
          grid_entity: this._config.grid?.entity || '',
          load_entity: this._config.load.entity,
          battery_entity: this._config.battery?.entity || '',
          invert_battery_data: this._config.battery?.invert?.data,
          production_icon: this._config.production?.icon,
          grid_icon: this._config.grid?.icon,
          load_icon: this._config.load.icon,
          battery_icon: this._config.battery?.icon,
          production_tap_action: this._config.production?.tap,
          grid_tap_action: this._config.grid?.tap,
          load_tap_action: this._config.load.tap,
          battery_tap_action: this._config.battery?.tap
        };
        this._chartRenderer = new ChartRenderer(this._hass, chartConfig, this._fireEvent.bind(this));
      }
      
      // Update live values and render
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
        this._getDisplayName.bind(this),
        this._getIcon.bind(this),
        this._fireEvent.bind(this)
      );
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

  private _getEntityConfigByType(type: 'grid' | 'load' | 'production' | 'battery') {
    return this._config?.[type];
  }

  private _getDisplayName(type: 'grid' | 'load' | 'production' | 'battery', fallback: string): string {
    const entityConfig = this._getEntityConfigByType(type);
    if (!entityConfig) return fallback;
    
    // Check if custom name is set in config
    if (entityConfig.name) {
      return entityConfig.name;
    }
    
    // Fall back to entity friendly name
    if (entityConfig.entity) {
      const entityState = this._getEntityState(entityConfig.entity);
      if (entityState?.attributes?.friendly_name) {
        return entityState.attributes.friendly_name;
      }
    }
    
    // Fall back to default label
    return fallback;
  }

  private _getIcon(type: 'grid' | 'load' | 'production' | 'battery', fallback: string): string {
    const entityConfig = this._getEntityConfigByType(type);
    if (!entityConfig) return fallback;
    
    // Check if custom icon is set in config
    if (entityConfig.icon) {
      return entityConfig.icon;
    }
    
    // Fall back to entity icon
    if (entityConfig.entity) {
      const entityState = this._getEntityState(entityConfig.entity);
      if (entityState?.attributes?.icon) {
        return entityState.attributes.icon;
      }
    }
    
    // Fall back to default icon
    return fallback;
  }

  private _handleAction(actionConfig: any | undefined, entityId?: string): void {
    if (!this._hass) return;
    
    // Default to more-info if no action configured
    const config = actionConfig || { action: 'more-info' };
    const action = config.action || 'more-info';
    
    switch (action) {
      case 'more-info':
        const entityToShow = config.entity || entityId;
        this._fireEvent('hass-more-info', { entityId: entityToShow });
        break;
        
      case 'navigate':
        if (config.navigation_path) {
          history.pushState(null, '', config.navigation_path);
          this._fireEvent('location-changed', { replace: config.navigation_replace || false });
        }
        break;
        
      case 'url':
        if (config.url_path) {
          window.open(config.url_path);
        }
        break;
        
      case 'toggle':
        this._hass.callService('homeassistant', 'toggle', { entity_id: entityId });
        break;
        
      case 'perform-action':
        if (config.perform_action) {
          const [domain, service] = config.perform_action.split('.');
          this._hass.callService(domain, service, config.data || {}, config.target);
        }
        break;
        
      case 'assist':
        this._fireEvent('show-dialog', {
          dialogTag: 'ha-voice-command-dialog',
          dialogParams: {
            pipeline_id: config.pipeline_id || 'last_used',
            start_listening: config.start_listening
          }
        });
        break;
        
      case 'none':
        // Do nothing
        break;
    }
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
        (type, fallback) => this._getIcon(type, fallback),
        (action, entity) => this._handleAction(action, entity)
      );
    } else {
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

  private _normalizeConfig(config: EnergyFlowCardConfig | Record<string, any>): EnergyFlowCardConfig {
    // If already in the expected nested shape, return as-is
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

    // Map view mode
    const mode = (config as any).view_mode || (config as any).mode;

    // Ensure required load exists; if not, fall back to provided config as-is to avoid losing data
    if (!load) {
      return config as EnergyFlowCardConfig;
    }

    return {
      mode,
      load,
      grid,
      production,
      battery: batteryEntity,
    };
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
