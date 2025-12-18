import { describe, it, expect } from 'vitest';
import { 
  processData, 
  getLatestValue, 
  buildTimestampArray,
  getValueAtTimestamp,
  getLiveValue
} from '../src/calculations';
import type { StatisticValue, HistoricalData } from '../src/types';
import type { HomeAssistant } from '../../shared/src/types/HASS';

describe('charted/calculations', () => {
  describe('processData', () => {
    it('separates positive and negative values', () => {
      const stats: StatisticValue[] = [
        { start: 1000, end: 2000, mean: 100 },
        { start: 2000, end: 3000, mean: -50 },
        { start: 3000, end: 4000, mean: 75 },
      ];

      const result = processData(stats);

      expect(result.positive).toEqual([
        [1500, 100],
        [2500, 0],
        [3500, 75],
      ]);
      expect(result.negative).toEqual([
        [1500, 0],
        [2500, -50],
        [3500, 0],
      ]);
    });

    it('handles empty data', () => {
      const result = processData([]);
      expect(result.positive).toEqual([]);
      expect(result.negative).toEqual([]);
    });

    it('uses midpoint for x-axis', () => {
      const stats: StatisticValue[] = [
        { start: 1000, end: 3000, mean: 50 },
      ];

      const result = processData(stats);
      expect(result.positive[0][0]).toBe(2000); // (1000 + 3000) / 2
    });
  });

  describe('getLatestValue', () => {
    it('returns the latest mean value', () => {
      const stats: StatisticValue[] = [
        { start: 1000, end: 2000, mean: 100 },
        { start: 2000, end: 3000, mean: 200 },
        { start: 3000, end: 4000, mean: 150 },
      ];

      expect(getLatestValue(stats)).toBe(150);
    });

    it('returns null for empty array', () => {
      expect(getLatestValue([])).toBeNull();
    });

    it('returns null for undefined', () => {
      expect(getLatestValue(undefined as any)).toBeNull();
    });
  });

  describe('buildTimestampArray', () => {
    it('collects all unique timestamps', () => {
      const data: HistoricalData = {
        solar: [
          { start: 1000, end: 2000, mean: 100 },
          { start: 2000, end: 3000, mean: 150 },
        ],
        grid: [
          { start: 1000, end: 2000, mean: 50 },
          { start: 3000, end: 4000, mean: 75 },
        ],
        battery: [
          { start: 2000, end: 3000, mean: -25 },
        ],
        load: [
          { start: 1000, end: 2000, mean: 200 },
        ],
      };

      const result = buildTimestampArray(data);

      expect(result.timestamps).toEqual([1000, 2000, 3000]);
      expect(result.firstTs).toBe(1000);
      expect(result.lastTs).toBe(3000);
    });

    it('handles empty data', () => {
      const data: HistoricalData = {
        solar: [],
        grid: [],
        battery: [],
        load: [],
      };

      const result = buildTimestampArray(data);

      expect(result.timestamps).toEqual([]);
      expect(result.firstTs).toBeGreaterThan(0); // fallback to Date.now()
      expect(result.lastTs).toBeGreaterThan(0);
    });

    it('sorts timestamps in ascending order', () => {
      const data: HistoricalData = {
        solar: [
          { start: 3000, end: 4000, mean: 100 },
          { start: 1000, end: 2000, mean: 150 },
        ],
        grid: [],
        battery: [],
        load: [],
      };

      const result = buildTimestampArray(data);

      expect(result.timestamps).toEqual([1000, 3000]);
    });
  });

  describe('getValueAtTimestamp', () => {
    it('returns value at specific timestamp', () => {
      const stats: StatisticValue[] = [
        { start: 1000, end: 2000, mean: 100 },
        { start: 2000, end: 3000, mean: 200 },
        { start: 3000, end: 4000, mean: 150 },
      ];

      expect(getValueAtTimestamp(stats, 2000)).toBe(200);
    });

    it('falls back to latest value if timestamp not found', () => {
      const stats: StatisticValue[] = [
        { start: 1000, end: 2000, mean: 100 },
        { start: 2000, end: 3000, mean: 200 },
      ];

      expect(getValueAtTimestamp(stats, 9999)).toBe(200);
    });

    it('returns 0 for empty data', () => {
      expect(getValueAtTimestamp([], 1000)).toBe(0);
      expect(getValueAtTimestamp(undefined, 1000)).toBe(0);
    });
  });

  describe('getLiveValue', () => {
    it('returns live state value when available', () => {
      const hass = {
        states: {
          'sensor.solar': { state: '1250.5', attributes: {} },
          'sensor.grid': { state: '-500', attributes: {} },
        },
      } as unknown as HomeAssistant;

      expect(getLiveValue(hass, 'sensor.solar', 1000)).toBe(1250.5);
      expect(getLiveValue(hass, 'sensor.grid', 100)).toBe(-500);
    });

    it('returns fallback when entity not found', () => {
      const hass = {
        states: {},
      } as unknown as HomeAssistant;

      expect(getLiveValue(hass, 'sensor.missing', 999)).toBe(999);
    });

    it('returns fallback when state is invalid', () => {
      const hass = {
        states: {
          'sensor.invalid': { state: 'unavailable', attributes: {} },
          'sensor.null': { state: null, attributes: {} },
        },
      } as unknown as HomeAssistant;

      expect(getLiveValue(hass, 'sensor.invalid', 500)).toBe(500);
      expect(getLiveValue(hass, 'sensor.null', 750)).toBe(750);
    });

    it('returns fallback when entityId is undefined', () => {
      const hass = {
        states: {},
      } as unknown as HomeAssistant;

      expect(getLiveValue(hass, undefined, 250)).toBe(250);
    });

    it('handles zero values correctly', () => {
      const hass = {
        states: {
          'sensor.zero': { state: '0', attributes: {} },
        },
      } as unknown as HomeAssistant;

      expect(getLiveValue(hass, 'sensor.zero', 100)).toBe(0);
    });

    it('handles negative values correctly', () => {
      const hass = {
        states: {
          'sensor.negative': { state: '-1500.75', attributes: {} },
        },
      } as unknown as HomeAssistant;

      expect(getLiveValue(hass, 'sensor.negative', 0)).toBe(-1500.75);
    });
  });
});
