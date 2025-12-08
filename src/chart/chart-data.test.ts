import { describe, it, expect, vi } from 'vitest';
import { interpolateValue, processChartData, type ChartDataPoint } from './chart-data';

describe('chart-data', () => {
  describe('interpolateValue', () => {
    it('should return 0 for empty history', () => {
      const result = interpolateValue([], new Date());
      expect(result).toBe(0);
    });

    it('should return closest value by timestamp', () => {
      const history = [
        { state: '100', last_changed: '2025-01-01T12:00:00Z' },
        { state: '200', last_changed: '2025-01-01T12:05:00Z' },
        { state: '300', last_changed: '2025-01-01T12:10:00Z' },
      ];
      
      // Target between first and second - should get closest
      const result = interpolateValue(history, new Date('2025-01-01T12:02:00Z'));
      expect(result).toBe(100);
    });

    it('should parse numeric state values', () => {
      const history = [
        { state: '42.5', last_changed: '2025-01-01T12:00:00Z' },
      ];
      
      const result = interpolateValue(history, new Date('2025-01-01T12:00:00Z'));
      expect(result).toBe(42.5);
    });

    it('should return 0 for non-numeric values', () => {
      const history = [
        { state: 'unavailable', last_changed: '2025-01-01T12:00:00Z' },
      ];
      
      const result = interpolateValue(history, new Date('2025-01-01T12:00:00Z'));
      expect(result).toBe(0);
    });

    it('should handle single data point', () => {
      const history = [
        { state: '150', last_changed: '2025-01-01T12:00:00Z' },
      ];
      
      const result = interpolateValue(history, new Date('2025-01-01T13:00:00Z'));
      expect(result).toBe(150);
    });

    it('should find exact timestamp match', () => {
      const history = [
        { state: '100', last_changed: '2025-01-01T12:00:00Z' },
        { state: '200', last_changed: '2025-01-01T12:05:00Z' },
      ];
      
      const result = interpolateValue(history, new Date('2025-01-01T12:05:00Z'));
      expect(result).toBe(200);
    });
  });

  describe('processChartData', () => {
    const createHistory = (values: number[], baseTime: Date) => {
      return values.map((val, i) => ({
        state: val.toString(),
        last_changed: new Date(baseTime.getTime() + i * 60000).toISOString(),
      }));
    };

    it('should process data for 1 hour period', async () => {
      const baseTime = new Date('2025-12-07T12:00:00Z');
      const productionHistory = createHistory([100, 200, 300], baseTime);
      const gridHistory = createHistory([50, -50, 0], baseTime);
      const loadHistory = createHistory([150, 180, 200], baseTime);
      const batteryHistory = createHistory([0, 20, -10], baseTime);

      const result = await processChartData(
        productionHistory,
        gridHistory,
        loadHistory,
        batteryHistory,
        1,
        false
      );

      expect(result).toBeDefined();
      expect(result.length).toBe(12); // 12 five-minute intervals in 1 hour
      expect(result[0]).toHaveProperty('time');
      expect(result[0]).toHaveProperty('solar');
      expect(result[0]).toHaveProperty('batteryDischarge');
      expect(result[0]).toHaveProperty('batteryCharge');
      expect(result[0]).toHaveProperty('gridImport');
      expect(result[0]).toHaveProperty('gridExport');
      expect(result[0]).toHaveProperty('load');
    });

    it('should process data for 12 hour period', async () => {
      const baseTime = new Date('2025-12-07T00:00:00Z');
      const productionHistory = createHistory([0, 0, 0], baseTime);
      const gridHistory = createHistory([100, 100, 100], baseTime);
      const loadHistory = createHistory([100, 100, 100], baseTime);
      const batteryHistory = createHistory([0, 0, 0], baseTime);

      const result = await processChartData(
        productionHistory,
        gridHistory,
        loadHistory,
        batteryHistory,
        12,
        false
      );

      expect(result.length).toBe(144); // 12 five-minute intervals per hour × 12 hours
    });

    it('should handle battery data inversion', async () => {
      const baseTime = new Date('2025-12-07T12:00:00Z');
      const productionHistory = createHistory([100], baseTime);
      const gridHistory = createHistory([0], baseTime);
      const loadHistory = createHistory([100], baseTime);
      const batteryHistory = createHistory([50], baseTime); // Positive = discharging

      const normalResult = await processChartData(
        productionHistory,
        gridHistory,
        loadHistory,
        batteryHistory,
        1,
        false
      );

      const invertedResult = await processChartData(
        productionHistory,
        gridHistory,
        loadHistory,
        batteryHistory,
        1,
        true
      );

      // When inverted, positive battery becomes negative (charging)
      expect(normalResult[0].batteryDischarge).toBeGreaterThan(0);
      expect(normalResult[0].batteryCharge).toBe(0);
      expect(invertedResult[0].batteryDischarge).toBe(0);
      expect(invertedResult[0].batteryCharge).toBeGreaterThan(0);
    });

    it('should ensure all values are non-negative', async () => {
      const baseTime = new Date('2025-12-07T12:00:00Z');
      const productionHistory = createHistory([-100], baseTime); // Negative production
      const gridHistory = createHistory([50], baseTime);
      const loadHistory = createHistory([-50], baseTime); // Negative load
      const batteryHistory = createHistory([0], baseTime);

      const result = await processChartData(
        productionHistory,
        gridHistory,
        loadHistory,
        batteryHistory,
        1,
        false
      );

      result.forEach(point => {
        expect(point.solar).toBeGreaterThanOrEqual(0);
        expect(point.batteryDischarge).toBeGreaterThanOrEqual(0);
        expect(point.batteryCharge).toBeGreaterThanOrEqual(0);
        expect(point.gridImport).toBeGreaterThanOrEqual(0);
        expect(point.gridExport).toBeGreaterThanOrEqual(0);
        expect(point.load).toBeGreaterThanOrEqual(0);
      });
    });

    it('should correctly separate grid import/export', async () => {
      const baseTime = new Date('2025-12-07T12:00:00Z');
      const productionHistory = createHistory([0], baseTime);
      const gridHistoryImport = createHistory([100], baseTime); // Positive = import
      const gridHistoryExport = createHistory([-100], baseTime); // Negative = export
      const loadHistory = createHistory([100], baseTime);
      const batteryHistory = createHistory([0], baseTime);

      const importResult = await processChartData(
        productionHistory,
        gridHistoryImport,
        loadHistory,
        batteryHistory,
        1,
        false
      );

      const exportResult = await processChartData(
        productionHistory,
        gridHistoryExport,
        loadHistory,
        batteryHistory,
        1,
        false
      );

      expect(importResult[0].gridImport).toBeGreaterThan(0);
      expect(importResult[0].gridExport).toBe(0);
      expect(exportResult[0].gridImport).toBe(0);
      expect(exportResult[0].gridExport).toBeGreaterThan(0);
    });

    it('should average raw data into 5-minute intervals', async () => {
      const baseTime = new Date('2025-12-07T12:00:00Z');
      // Create history with consistent values
      const constantValue = 100;
      const productionHistory = Array(20).fill(null).map((_, i) => ({
        state: constantValue.toString(),
        last_changed: new Date(baseTime.getTime() + i * 30000).toISOString(), // 30-second intervals
      }));

      const result = await processChartData(
        productionHistory,
        [],
        [],
        [],
        1,
        false
      );

      // Each 5-minute interval should average to the constant value
      expect(result[0].solar).toBeCloseTo(constantValue, 0);
    });

    it('should handle empty history arrays', async () => {
      const result = await processChartData(
        [],
        [],
        [],
        [],
        1,
        false
      );

      expect(result.length).toBe(12);
      result.forEach(point => {
        expect(point.solar).toBe(0);
        expect(point.load).toBe(0);
        expect(point.gridImport).toBe(0);
        expect(point.batteryDischarge).toBe(0);
      });
    });

    it('should handle 24 hour period efficiently', async () => {
      const baseTime = new Date('2025-12-07T00:00:00Z');
      const productionHistory = createHistory([100], baseTime);
      const gridHistory = createHistory([0], baseTime);
      const loadHistory = createHistory([100], baseTime);
      const batteryHistory = createHistory([0], baseTime);

      const startTime = Date.now();
      const result = await processChartData(
        productionHistory,
        gridHistory,
        loadHistory,
        batteryHistory,
        24,
        false
      );
      const endTime = Date.now();

      expect(result.length).toBe(288); // 24 hours × 12 intervals
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
    });

    it('should create properly structured ChartDataPoint objects', async () => {
      const baseTime = new Date('2025-12-07T12:00:00Z');
      const productionHistory = createHistory([100], baseTime);
      const gridHistory = createHistory([50], baseTime);
      const loadHistory = createHistory([150], baseTime);
      const batteryHistory = createHistory([0], baseTime);

      const result = await processChartData(
        productionHistory,
        gridHistory,
        loadHistory,
        batteryHistory,
        1,
        false
      );

      const point = result[0];
      expect(point.time).toBeInstanceOf(Date);
      expect(typeof point.solar).toBe('number');
      expect(typeof point.batteryDischarge).toBe('number');
      expect(typeof point.batteryCharge).toBe('number');
      expect(typeof point.gridImport).toBe('number');
      expect(typeof point.gridExport).toBe('number');
      expect(typeof point.load).toBe('number');
    });
  });
});
