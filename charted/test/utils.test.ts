import { describe, it, expect } from 'vitest';
import { 
  hexToRgba, 
  parseTimeToOffset, 
  parseTimeSpan, 
  clamp, 
  formatTimeLabel, 
  formatYAxisLabel,
  buildTimeBandAreas
} from '../src/utils';
import type { TimeBandConfig } from '../src/types';

describe('charted/utils', () => {
  describe('hexToRgba', () => {
    it('converts hex to rgba with alpha', () => {
      expect(hexToRgba('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
      expect(hexToRgba('#00ff00', 1.0)).toBe('rgba(0, 255, 0, 1)');
      expect(hexToRgba('#0000ff', 0.0)).toBe('rgba(0, 0, 255, 0)');
    });

    it('handles 6-digit hex colors', () => {
      expect(hexToRgba('#4caf50', 0.98)).toBe('rgba(76, 175, 80, 0.98)');
    });
  });

  describe('parseTimeToOffset', () => {
    it('parses HH:MM to milliseconds from midnight', () => {
      expect(parseTimeToOffset('00:00')).toBe(0);
      expect(parseTimeToOffset('01:00')).toBe(60 * 60 * 1000);
      expect(parseTimeToOffset('12:30')).toBe((12 * 60 + 30) * 60 * 1000);
      expect(parseTimeToOffset('23:59')).toBe((23 * 60 + 59) * 60 * 1000);
    });

    it('handles invalid input', () => {
      expect(parseTimeToOffset('')).toBe(0);
      expect(parseTimeToOffset('invalid')).toBe(0);
    });
  });

  describe('parseTimeSpan', () => {
    it('parses hour spans', () => {
      expect(parseTimeSpan('12h')).toBe(12 * 60 * 60 * 1000);
      expect(parseTimeSpan('24h')).toBe(24 * 60 * 60 * 1000);
    });

    it('parses minute spans', () => {
      expect(parseTimeSpan('30min')).toBe(30 * 60 * 1000);
      expect(parseTimeSpan('5min')).toBe(5 * 60 * 1000);
    });

    it('parses day spans', () => {
      expect(parseTimeSpan('7d')).toBe(7 * 24 * 60 * 60 * 1000);
      expect(parseTimeSpan('1d')).toBe(24 * 60 * 60 * 1000);
    });

    it('returns default for invalid input', () => {
      const defaultValue = 12 * 60 * 60 * 1000;
      expect(parseTimeSpan('invalid')).toBe(defaultValue);
      expect(parseTimeSpan('')).toBe(defaultValue);
    });
  });

  describe('clamp', () => {
    it('clamps values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('handles edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('formatTimeLabel', () => {
    it('formats timestamps as 12-hour time', () => {
      const midnight = new Date('2024-01-01T00:00:00').getTime();
      expect(formatTimeLabel(midnight)).toBe('12:00 AM');

      const noon = new Date('2024-01-01T12:00:00').getTime();
      expect(formatTimeLabel(noon)).toBe('12:00 PM');

      const afternoon = new Date('2024-01-01T15:30:00').getTime();
      expect(formatTimeLabel(afternoon)).toBe('3:30 PM');

      const morning = new Date('2024-01-01T09:15:00').getTime();
      expect(formatTimeLabel(morning)).toBe('9:15 AM');
    });
  });

  describe('formatYAxisLabel', () => {
    it('rounds values to integers', () => {
      expect(formatYAxisLabel(123.456)).toBe('123');
      expect(formatYAxisLabel(999.999)).toBe('1000');
      expect(formatYAxisLabel(-42.7)).toBe('-43');
    });

    it('handles edge cases', () => {
      expect(formatYAxisLabel(0)).toBe('0');
      expect(formatYAxisLabel(0.4)).toBe('0');
      expect(formatYAxisLabel(0.5)).toBe('1');
    });
  });

  describe('buildTimeBandAreas', () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const startOfDay = new Date('2024-01-01T00:00:00').getTime();
    const endOfDay = startOfDay + dayMs;

    it('creates area for single band within range', () => {
      const bands: TimeBandConfig[] = [
        { start: '08:00', end: '17:00', color: '#ffeb3b', label: 'Peak' },
      ];

      const areas = buildTimeBandAreas(startOfDay, endOfDay, bands);

      expect(areas).toHaveLength(1);
      expect(areas[0]).toHaveLength(2);
      expect(areas[0][0].xAxis).toBe(startOfDay + 8 * 60 * 60 * 1000);
      expect(areas[0][1].xAxis).toBe(startOfDay + 17 * 60 * 60 * 1000);
    });

    it('handles band wrapping past midnight', () => {
      // Test with longer range to capture wrap
      const rangeStart = startOfDay;
      const rangeEnd = startOfDay + (2 * dayMs); // 2 full days
      
      const bands: TimeBandConfig[] = [
        { start: '22:00', end: '06:00', color: '#2196f3', label: 'Off-peak' },
      ];

      const areas = buildTimeBandAreas(rangeStart, rangeEnd, bands);

      // Should create at least 2 areas (one for each day's occurrence)
      expect(areas.length).toBeGreaterThanOrEqual(2);
      // First area starts at 22:00 of first day
      expect(areas[0][0].xAxis).toBe(startOfDay + 22 * 60 * 60 * 1000);
    });

    it('clamps band to range boundaries', () => {
      const rangeStart = startOfDay + 10 * 60 * 60 * 1000; // 10:00
      const rangeEnd = startOfDay + 14 * 60 * 60 * 1000; // 14:00

      const bands: TimeBandConfig[] = [
        { start: '08:00', end: '16:00', color: '#4caf50' },
      ];

      const areas = buildTimeBandAreas(rangeStart, rangeEnd, bands);

      expect(areas).toHaveLength(1);
      expect(areas[0][0].xAxis).toBe(rangeStart); // clamped from 08:00
      expect(areas[0][1].xAxis).toBe(rangeEnd); // clamped from 16:00
    });

    it('excludes band completely outside range', () => {
      const rangeStart = startOfDay + 10 * 60 * 60 * 1000;
      const rangeEnd = startOfDay + 12 * 60 * 60 * 1000;

      const bands: TimeBandConfig[] = [
        { start: '14:00', end: '16:00', color: '#f44336' },
      ];

      const areas = buildTimeBandAreas(rangeStart, rangeEnd, bands);

      expect(areas).toHaveLength(0);
    });

    it('handles multiple bands', () => {
      const bands: TimeBandConfig[] = [
        { start: '06:00', end: '09:00', color: '#ff9800', label: 'Morning' },
        { start: '17:00', end: '21:00', color: '#ffeb3b', label: 'Evening' },
      ];

      const areas = buildTimeBandAreas(startOfDay, endOfDay, bands);

      expect(areas.length).toBeGreaterThanOrEqual(2);
    });

    it('returns empty array for undefined bands', () => {
      const areas = buildTimeBandAreas(startOfDay, endOfDay, undefined as any);
      expect(areas).toEqual([]);
    });

    it('returns empty array for empty bands', () => {
      const areas = buildTimeBandAreas(startOfDay, endOfDay, []);
      expect(areas).toEqual([]);
    });

    it('includes label when provided', () => {
      const bands: TimeBandConfig[] = [
        { start: '12:00', end: '13:00', color: '#4caf50', label: 'Lunch' },
      ];

      const areas = buildTimeBandAreas(startOfDay, endOfDay, bands);

      expect(areas[0][0].label.show).toBe(true);
      expect(areas[0][0].label.formatter).toBe('Lunch');
    });

    it('hides label when not provided', () => {
      const bands: TimeBandConfig[] = [
        { start: '12:00', end: '13:00', color: '#4caf50' },
      ];

      const areas = buildTimeBandAreas(startOfDay, endOfDay, bands);

      expect(areas[0][0].label.show).toBe(false);
    });

    it('hides label when empty string', () => {
      const bands: TimeBandConfig[] = [
        { start: '12:00', end: '13:00', color: '#4caf50', label: '' },
      ];

      const areas = buildTimeBandAreas(startOfDay, endOfDay, bands);

      expect(areas[0][0].label.show).toBe(false);
    });

    it('applies correct color with alpha', () => {
      const bands: TimeBandConfig[] = [
        { start: '08:00', end: '17:00', color: '#ff0000' },
      ];

      const areas = buildTimeBandAreas(startOfDay, endOfDay, bands);

      expect(areas[0][0].itemStyle.color).toBe('rgba(255, 0, 0, 0.16)');
    });
  });
});
