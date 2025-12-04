/**
 * Energy Flow Calculator
 * 
 * Calculates energy flows between components (production, battery, grid, load)
 * based on sensor readings.
 */

import type { SensorValues, EnergyFlows } from './types';

/**
 * Calculate energy flows between components based on sensor readings.
 * 
 * Strategy: Trust sensor readings and only show flows when confirmed by the relevant sensors.
 * The sensors may not perfectly balance due to measurement timing, conversion losses, and 
 * unaccounted consumption (e.g., battery charging inefficiency). This is normal and expected.
 * 
 * @param sensors - Power sensor values for all components
 * @returns Calculated flow values for each connection between components
 */
export function calculateEnergyFlows(sensors: SensorValues): EnergyFlows {
  const productionFlow = Math.max(0, sensors.production);
  const gridFlow = sensors.grid; // positive = import, negative = export
  const batteryFlow = sensors.battery; // positive = discharge, negative = charge
  const loadDemand = Math.max(0, sensors.load);
  
  // Initialize all possible flows
  const flows: EnergyFlows = {
    productionToLoad: 0,
    productionToBattery: 0,
    productionToGrid: 0,
    gridToLoad: 0,
    gridToBattery: 0,
    batteryToLoad: 0
  };
  
  // Track remaining capacity
  let remainingProduction = productionFlow;
  let remainingLoad = loadDemand;
  
  // Step 1: Production → Load (highest priority)
  // Production first serves the home load
  if (remainingProduction > 0 && remainingLoad > 0) {
    flows.productionToLoad = Math.min(remainingProduction, remainingLoad);
    remainingProduction -= flows.productionToLoad;
    remainingLoad -= flows.productionToLoad;
  }
  
  // Step 2: Production → Battery (when charging)
  // Excess production can charge the battery
  if (batteryFlow < 0 && remainingProduction > 0) {
    flows.productionToBattery = Math.min(remainingProduction, Math.abs(batteryFlow));
    remainingProduction -= flows.productionToBattery;
  }
  
  // Step 3: Battery → Load (when discharging)
  // Battery can supplement production to meet load
  if (batteryFlow > 0 && remainingLoad > 0) {
    flows.batteryToLoad = Math.min(batteryFlow, remainingLoad);
    remainingLoad -= flows.batteryToLoad;
  }
  
  // Step 4: Grid → Load (importing)
  // Grid imports to cover any remaining load
  if (remainingLoad > 0 && gridFlow > 0) {
    flows.gridToLoad = Math.min(gridFlow, remainingLoad);
    remainingLoad -= flows.gridToLoad;
  }
  
  // Step 5: Grid → Battery (importing to charge)
  // Grid can charge battery when production is insufficient
  // Use threshold to avoid showing noise from measurement fluctuations
  if (batteryFlow < 0 && gridFlow > 10) {
    const batteryNeed = Math.abs(batteryFlow) - flows.productionToBattery;
    if (batteryNeed > 1) { // Threshold to avoid micro-flows from noise
      flows.gridToBattery = Math.min(gridFlow - flows.gridToLoad, batteryNeed);
    }
  }
  
  // Step 6: Production → Grid (exporting)
  // Only show export flow when grid sensor confirms export (negative value)
  // Use threshold to avoid showing phantom exports at zero
  if (gridFlow < -10) { // Threshold: grid must be clearly exporting
    flows.productionToGrid = Math.abs(gridFlow);
  }
  
  return flows;
}
