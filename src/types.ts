/**
 * Core type definitions for the Energy Flow Card
 */

/** Sensor value representing power flow (in Watts) */
export interface SensorValues {
  /** Grid power: positive = importing, negative = exporting */
  grid: number;
  /** Solar/generation power: positive = generating */
  production: number;
  /** Home load power: positive = consuming */
  load: number;
  /** Battery power: positive = discharging, negative = charging */
  battery: number;
}

/** Calculated energy flows between components */
export interface EnergyFlows {
  /** Power flowing from production to load */
  productionToLoad: number;
  /** Power flowing from production to battery (charging) */
  productionToBattery: number;
  /** Power flowing from production to grid (export) */
  productionToGrid: number;
  /** Power flowing from grid to load (import) */
  gridToLoad: number;
  /** Power flowing from grid to battery (charging) */
  gridToBattery: number;
  /** Power flowing from battery to load (discharging) */
  batteryToLoad: number;
}

/** Position coordinates for meter placement */
export interface Position {
  x: number;
  y: number;
}

/** Animation state for flow dots */
export interface DotState {
  /** Progress along path (0-1) */
  progress: number;
  /** Movement velocity in units per second */
  velocity: number;
}

/** Needle animation state for meters */
export interface NeedleState {
  /** Target angle in degrees */
  target: number;
  /** Current angle in degrees */
  current: number;
  /** Ghost needle angle (lags behind current) */
  ghost: number;
}

/** Action configuration (HA standard) */
export interface ActionConfig {
  action: 'more-info' | 'toggle' | 'perform-action' | 'navigate' | 'url' | 'assist' | 'none';
  navigation_path?: string;
  navigation_replace?: boolean;
  url_path?: string;
  perform_action?: string;
  data?: any;
  target?: any;
  confirmation?: any;
  pipeline_id?: string;
  start_listening?: boolean;
  entity?: string;
}

/** Card configuration */
export interface EnergyFlowCardConfig {
  view_mode?: 'default' | 'compact';
  
  grid_entity: string;
  grid_name?: string;
  grid_icon?: string;
  grid_min?: number;
  grid_max?: number;
  grid_tap_action?: ActionConfig;
  
  load_entity: string;
  load_name?: string;
  load_icon?: string;
  load_max?: number;
  load_tap_action?: ActionConfig;
  
  production_entity: string;
  production_name?: string;
  production_icon?: string;
  production_max?: number;
  production_tap_action?: ActionConfig;
  
  battery_entity: string;
  battery_name?: string;
  battery_icon?: string;
  battery_min?: number;
  battery_max?: number;
  battery_tap_action?: ActionConfig;
  
  invert_battery_data?: boolean;
  invert_battery_view?: boolean;
  show_plus?: boolean;
}

/** Home Assistant entity state */
export interface HassEntity {
  state: string;
  attributes: {
    friendly_name?: string;
    icon?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/** Home Assistant instance */
export interface HomeAssistant {
  states: {
    [entity_id: string]: HassEntity;
  };
  [key: string]: any;
}
