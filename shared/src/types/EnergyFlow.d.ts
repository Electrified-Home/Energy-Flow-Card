/**
 * Energy flow calculation types
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
