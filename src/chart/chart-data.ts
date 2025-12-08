/**
 * Chart data fetching and processing
 */

import type { HomeAssistant } from '../types/HASS.d.ts';

export interface ChartDataPoint {
  time: Date;
  solar: number;
  batteryDischarge: number;
  batteryCharge: number;
  gridImport: number;
  gridExport: number;
  load: number;
}

export interface ChartCache {
  timestamp: number;
  dataPoints: ChartDataPoint[];
}

export async function fetchHistory(
  hass: HomeAssistant,
  entityId: string,
  start: Date,
  end: Date
): Promise<Array<{ state: string; last_changed: string }>> {
  const url = `history/period/${start.toISOString()}?filter_entity_id=${entityId}&end_time=${end.toISOString()}&minimal_response&no_attributes`;
  const response = await hass.callApi('GET', url);
  return response[0] || [];
}

export function interpolateValue(
  history: Array<{ state: string; last_changed: string }>,
  targetTime: Date
): number {
  if (history.length === 0) return 0;

  let closestPoint = history[0];
  let minDiff = Math.abs(new Date(history[0].last_changed).getTime() - targetTime.getTime());

  for (const point of history) {
    const diff = Math.abs(new Date(point.last_changed).getTime() - targetTime.getTime());
    if (diff < minDiff) {
      minDiff = diff;
      closestPoint = point;
    }
  }

  return parseFloat(closestPoint.state) || 0;
}

export async function processChartData(
  productionHistory: Array<{ state: string; last_changed: string }>,
  gridHistory: Array<{ state: string; last_changed: string }>,
  loadHistory: Array<{ state: string; last_changed: string }>,
  batteryHistory: Array<{ state: string; last_changed: string }>,
  hoursToShow: number,
  invertBatteryData: boolean
): Promise<ChartDataPoint[]> {
  const rawPointsPerHour = 120; // 30-second intervals
  const totalRawPoints = hoursToShow * rawPointsPerHour;
  const visiblePointsPerHour = 12; // 5-minute intervals
  const totalVisiblePoints = hoursToShow * visiblePointsPerHour;
  const rawPointsPerVisibleTick = 10;
  
  // Quantize to the nearest 5-minute interval
  const now = new Date();
  const endMinutes = Math.floor(now.getMinutes() / 5) * 5;
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), endMinutes, 0, 0);
  const start = new Date(end.getTime() - hoursToShow * 60 * 60 * 1000);

  // Process raw data in chunks
  const chunkSize = 240;
  const rawDataPoints: ChartDataPoint[] = [];

  for (let chunkStart = 0; chunkStart < totalRawPoints; chunkStart += chunkSize) {
    const chunkEnd = Math.min(chunkStart + chunkSize, totalRawPoints);
    
    if (chunkStart > 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    for (let i = chunkStart; i < chunkEnd; i++) {
      const time = new Date(start.getTime() + i * 30 * 1000);
      
      const production = interpolateValue(productionHistory, time);
      const grid = interpolateValue(gridHistory, time);
      const load = interpolateValue(loadHistory, time);
      let battery = interpolateValue(batteryHistory, time);
      
      if (invertBatteryData) {
        battery = -battery;
      }

      rawDataPoints.push({
        time,
        solar: Math.max(0, production),
        batteryDischarge: Math.max(0, battery),
        batteryCharge: Math.max(0, -battery),
        gridImport: Math.max(0, grid),
        gridExport: Math.max(0, -grid),
        load: Math.max(0, load),
      });
    }
  }

  // Average into 5-minute visible data points
  const dataPoints: ChartDataPoint[] = [];

  for (let i = 0; i < totalVisiblePoints; i++) {
    const visibleTime = new Date(start.getTime() + (i + 1) * 5 * 60 * 1000);
    const startIdx = i * rawPointsPerVisibleTick;
    const endIdx = Math.min(startIdx + rawPointsPerVisibleTick, rawDataPoints.length);
    const windowSize = endIdx - startIdx;
    
    let solarSum = 0, batteryDischargeSum = 0, batteryChargeSum = 0;
    let gridImportSum = 0, gridExportSum = 0, loadSum = 0;
    
    for (let j = startIdx; j < endIdx; j++) {
      solarSum += rawDataPoints[j].solar;
      batteryDischargeSum += rawDataPoints[j].batteryDischarge;
      batteryChargeSum += rawDataPoints[j].batteryCharge;
      gridImportSum += rawDataPoints[j].gridImport;
      gridExportSum += rawDataPoints[j].gridExport;
      loadSum += rawDataPoints[j].load;
    }

    dataPoints.push({
      time: visibleTime,
      solar: solarSum / windowSize,
      batteryDischarge: batteryDischargeSum / windowSize,
      batteryCharge: batteryChargeSum / windowSize,
      gridImport: gridImportSum / windowSize,
      gridExport: gridExportSum / windowSize,
      load: loadSum / windowSize,
    });
  }

  // Clear raw data
  rawDataPoints.length = 0;

  return dataPoints;
}
