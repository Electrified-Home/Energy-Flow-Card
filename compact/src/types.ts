/**
 * Type definitions for Compact Energy Flow Card
 */

import type { EnergyFlows } from '../../shared/src/types/EnergyFlow';

/**
 * View mode for compact card
 * - 'compact': Load bar only
 * - 'compact-battery': Load bar + battery bar
 */
export type CompactViewMode = 'compact' | 'compact-battery';

/**
 * Data structure for rendering compact view
 */
export interface CompactRenderData {
  grid: number;
  load: number;
  production: number;
  battery: number;
  flows: EnergyFlows;
  batterySoc: number | null;
}

/**
 * Entity types supported by compact card
 */
export type EntityType = 'grid' | 'load' | 'production' | 'battery';

/**
 * Calculated percentages for bar segments
 */
export interface BarPercentages {
  production: number;
  battery: number;
  grid: number;
}

/**
 * Battery bar flow data
 */
export interface BatteryBarData {
  gridWatts: number;
  loadWatts: number;
  productionWatts: number;
  gridPercent: number;
  loadPercent: number;
  productionPercent: number;
  gridIsImport: boolean;
  direction: 'up' | 'down' | 'none';
}
