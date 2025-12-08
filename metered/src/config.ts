import type { EnergyFlowCardConfig, BatteryEntityConfig, EntityConfig } from '../../shared/src/types/Config.d.ts';

// Simplified config form for metered card (no view mode selector, includes names)
export function getMeteredConfigForm() {
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
export function normalizeMeteredConfig(config: EnergyFlowCardConfig | Record<string, any>): EnergyFlowCardConfig {
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
