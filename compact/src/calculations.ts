/**
 * Calculation utilities for compact card bar percentages and flows
 */

import type { EnergyFlows } from '../../shared/src/types/EnergyFlow';
import type { BarPercentages, BatteryBarData } from './types';

/**
 * Calculate load bar percentages (true and visual)
 * True percentages show actual contribution, visual percentages scale to 100%
 */
export function calculateLoadBarPercentages(
  load: number,
  flows: EnergyFlows
): { true: BarPercentages; visual: BarPercentages } {
  const total = load || 1;
  
  const trueProduction = (flows.productionToLoad / total) * 100;
  const trueBattery = (flows.batteryToLoad / total) * 100;
  const trueGrid = (flows.gridToLoad / total) * 100;
  
  const sumPercent = trueProduction + trueBattery + trueGrid;
  
  let visualProduction = trueProduction;
  let visualBattery = trueBattery;
  let visualGrid = trueGrid;
  
  if (sumPercent > 0) {
    const scale = 100 / sumPercent;
    visualProduction = trueProduction * scale;
    visualBattery = trueBattery * scale;
    visualGrid = trueGrid * scale;
  }
  
  return {
    true: {
      production: trueProduction,
      battery: trueBattery,
      grid: trueGrid
    },
    visual: {
      production: visualProduction,
      battery: visualBattery,
      grid: visualGrid
    }
  };
}

/**
 * Calculate battery bar flow data
 * @param battery - Battery power reading (positive = discharge, negative = charge)
 * @param flows - Calculated energy flows
 * @param actualGrid - Actual grid power reading (positive = import, negative = export)
 */
export function calculateBatteryBarData(
  battery: number,
  flows: EnergyFlows,
  actualGrid: number
): BatteryBarData {
  let gridWatts = 0;
  let loadWatts = 0;
  let productionWatts = 0;
  let gridPercent = 0;
  let loadPercent = 0;
  let productionPercent = 0;
  let gridIsImport = false;
  let direction: 'up' | 'down' | 'none' = 'none';

  if (battery < 0) {
    // CHARGING
    direction = 'up';
    gridIsImport = true;
    
    const batteryCharging = Math.abs(battery);
    const batteryTotal = batteryCharging || 1;

    gridWatts = flows.gridToBattery;
    productionWatts = flows.productionToBattery;

    const rawGridPercent = (flows.gridToBattery / batteryTotal) * 100;
    const rawProductionPercent = (flows.productionToBattery / batteryTotal) * 100;

    const chargeSum = rawGridPercent + rawProductionPercent;
    if (chargeSum > 0) {
      const scale = 100 / chargeSum;
      gridPercent = rawGridPercent * scale;
      productionPercent = rawProductionPercent * scale;
    }
  } else if (battery > 0) {
    // DISCHARGING
    direction = 'down';
    
    const batteryTotal = battery || 1;
    const batteryToGrid = battery - flows.batteryToLoad;

    loadWatts = flows.batteryToLoad;
    
    // Only show grid export flow if grid is actually exporting (negative)
    // Clamp to actual export amount to avoid showing impossible flows
    // Never use export color/visualization when grid is importing or idle
    if (actualGrid < -10) {
      gridIsImport = false; // Exporting
      gridWatts = Math.min(batteryToGrid, Math.abs(actualGrid));
    } else {
      // Grid is not exporting (importing or zero), so any remaining battery discharge
      // is unaccounted (losses, measurement timing, etc) - don't show it as export
      gridIsImport = true; // Treat as import to avoid export color
      gridWatts = 0;
    }

    const rawLoadPercent = (flows.batteryToLoad / batteryTotal) * 100;
    const rawGridPercent = (gridWatts / batteryTotal) * 100;

    const dischargeSum = rawLoadPercent + rawGridPercent;
    if (dischargeSum > 0) {
      const scale = 100 / dischargeSum;
      loadPercent = rawLoadPercent * scale;
      gridPercent = rawGridPercent * scale;
    }
  } else {
    // IDLE
    direction = 'none';
  }

  return {
    gridWatts,
    loadWatts,
    productionWatts,
    gridPercent,
    loadPercent,
    productionPercent,
    gridIsImport,
    direction
  };
}
