import type { EnergyFlowCardConfig } from '../../shared/src/types/Config.d.ts';

// Compact card-specific config form (simplified, no names, no min/max, auto-detect 2nd bar)
export function getCompactConfigForm() {
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
export function normalizeCompactConfig(config: any): EnergyFlowCardConfig {
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
