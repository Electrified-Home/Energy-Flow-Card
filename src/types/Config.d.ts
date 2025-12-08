export type Action =
  'tap' |
  'hold';

export type ActionType =
  'more-info' |
  'navigate' |
  'url' |
  'toggle' |
  'call-service' |
  'none';

export interface ActionConfig {
  action: ActionType;
  entity?: string;
  path?: string;
  service?: string;
  service_data?: Record<string, any>;
  target?: any;
}

export interface EntityConfig {
  /** Entity ID (required) */
  entity: string;
  /** Display name (defaults to friendly_name from entity) */
  name?: string;
  /** Icon (defaults to icon from entity) */
  icon?: string;
  /** Minimum value for meters/gauges */
  min?: number;
  /** Maximum value for meters/gauges */
  max?: number;

  /** Action configurations */
  tap?: ActionConfig;
  hold?: ActionConfig;
}

export interface BatteryEntityConfig extends EntityConfig {
  /** Battery state of charge entity (for SOC display) */
  soc_entity?: string;
  invert?: { data?: boolean; view?: boolean };
  /** Show plus sign for positive battery values */
  showPlus?: boolean;
}

/** Main card configuration */
export interface EnergyFlowCardConfig {
  /** View mode for the card */
  mode?: 'default' | 'compact' | 'compact-battery' | 'flow' | 'chart';
  
  /** Load/consumption entity configuration (required - everything else is relative to load) */
  load: EntityConfig;
  
  /** Grid/utility entity configuration (optional) */
  grid?: EntityConfig;
  
  /** Production/solar entity configuration (optional) */
  production?: EntityConfig;
  
  /** Battery entity configuration (optional) */
  battery?: BatteryEntityConfig;
}