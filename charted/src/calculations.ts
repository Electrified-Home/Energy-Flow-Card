import type { ChartedCardConfig, HistoricalData, StatisticValue } from './types';
import type { HomeAssistant } from '../../shared/src/types/HASS';

/**
 * Fetches historical data for all configured entities
 * Uses the Home Assistant history API with minimal_response
 */
export async function fetchHistoricalData(
  hass: HomeAssistant,
  config: ChartedCardConfig
): Promise<HistoricalData> {
  const now = new Date();
  const hours = config.hours_to_show || 24;
  const spanMs = hours * 60 * 60 * 1000;
  const start = new Date(now.getTime() - spanMs);

  const entities = Object.values(config.entities).filter(e => e);
  if (entities.length === 0) {
    return { solar: [], grid: [], battery: [], load: [] };
  }

  const url = `history/period/${start.toISOString()}?filter_entity_id=${entities.join(',')}&end_time=${now.toISOString()}&minimal_response&no_attributes&significant_changes_only`;
  const response = (await hass.callApi('GET', url) || []) as any[][];

  const dataMap: Record<string, StatisticValue[]> = {};
  
  response.forEach((entityData: any, idx: number) => {
    const entityId = entities[idx];
    if (!entityId || !entityData) return;
    
    // Downsample based on points_per_hour (default 12 = 5 minute intervals)
    const pointsPerHour = config.points_per_hour || 12;
    const intervalMs = (60 * 60 * 1000) / pointsPerHour;
    const buckets = new Map<number, number[]>();
    
    entityData.forEach((point: any) => {
      const timestamp = new Date(point.last_changed).getTime();
      const bucketTime = Math.floor(timestamp / intervalMs) * intervalMs;
      const value = parseFloat(point.state) || 0;
      
      if (!buckets.has(bucketTime)) {
        buckets.set(bucketTime, []);
      }
      buckets.get(bucketTime)!.push(value);
    });
    
    // Average values in each bucket
    const stats: StatisticValue[] = [];
    buckets.forEach((values, timestamp) => {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      stats.push({
        start: timestamp,
        end: timestamp + intervalMs,
        mean: mean,
      });
    });
    
    stats.sort((a, b) => a.start - b.start);
    dataMap[entityId] = stats;
  });

  return {
    solar: dataMap[config.entities.solar] || [],
    grid: dataMap[config.entities.grid] || [],
    battery: dataMap[config.entities.battery] || [],
    load: dataMap[config.entities.load] || [],
  };
}

/**
 * Processes statistical data into positive and negative arrays for charting
 * Ensures all series have the same x-axis values for proper stacking
 */
export function processData(stats: StatisticValue[]): { 
  positive: [number, number][];
  negative: [number, number][];
} {
  const positive: [number, number][] = [];
  const negative: [number, number][] = [];
  
  stats.forEach((point) => {
    if (point.mean == null) return;
    const x = (point.start + point.end) / 2;
    
    // Always add to both arrays to keep timestamps aligned
    // For stacking to work, all series must have the same x-axis values
    if (point.mean >= 0) {
      positive.push([x, point.mean]);
      negative.push([x, 0]);
    } else {
      positive.push([x, 0]);
      negative.push([x, point.mean]);
    }
  });

  return { positive, negative };
}

/**
 * Extracts the latest value from statistical data
 */
export function getLatestValue(stats: StatisticValue[]): number | null {
  if (!stats || stats.length === 0) return null;
  const lastPoint = stats[stats.length - 1];
  return lastPoint.mean;
}

/**
 * Gets live value from hass state, falling back to historical if unavailable
 */
export function getLiveValue(
  hass: HomeAssistant,
  entityId: string | undefined,
  fallback: number
): number {
  if (!entityId) return fallback;
  const stateObj: any = hass?.states?.[entityId];
  const live = stateObj ? parseFloat(stateObj.state) : NaN;
  return Number.isFinite(live) ? live : fallback;
}

/**
 * Builds unified timestamp array from all entity data
 * Required for proper stacking alignment in ECharts
 */
export function buildTimestampArray(data: HistoricalData): {
  timestamps: number[];
  firstTs: number;
  lastTs: number;
} {
  const allTimestamps = new Set<number>();
  
  (['solar', 'grid', 'battery', 'load'] as const).forEach((k) => {
    (data[k] || []).forEach((s) => {
      const x = s.start; // quantized bucket start (e.g., 6:00, 6:05, ...)
      allTimestamps.add(x);
    });
  });
  
  const timestamps = Array.from(allTimestamps).sort((a, b) => a - b);
  const firstTs = timestamps[0] || Date.now();
  const lastTs = timestamps[timestamps.length - 1] || Date.now();
  
  return { timestamps, firstTs, lastTs };
}

/**
 * Gets value at specific timestamp from stats, with fallback to latest
 */
export function getValueAtTimestamp(
  stats: StatisticValue[] | undefined,
  ts: number
): number {
  if (!stats || stats.length === 0) return 0;
  const found = stats.find((s) => s.start === ts);
  if (found) return found.mean ?? 0;
  const last = stats[stats.length - 1];
  return last.mean ?? 0;
}
