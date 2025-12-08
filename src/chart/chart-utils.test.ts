import { describe, it, expect } from 'vitest';
import { createGridLines, createTimeLabels, createYAxisLabels, createAreaPath, createLoadLine } from './chart-utils';

describe('chart-utils', () => {
  describe('createGridLines', () => {
    it('should create 5 horizontal grid lines', () => {
      const result = createGridLines(600, 300, { top: 20, left: 60 });
      const lines = result.match(/<line/g);
      expect(lines).toHaveLength(5);
    });

    it('should position lines correctly', () => {
      const result = createGridLines(600, 300, { top: 20, left: 60 });
      expect(result).toContain('y1="20"');
      expect(result).toContain('x1="60"');
    });
  });

  describe('createTimeLabels', () => {
    it('should create 7 time labels', () => {
      const result = createTimeLabels(600, 300, { top: 20, bottom: 40, left: 60 }, 12);
      const labels = result.match(/<text/g);
      expect(labels).toHaveLength(7);
    });

    it('should format times as 12-hour AM/PM', () => {
      const result = createTimeLabels(600, 300, { top: 20, bottom: 40, left: 60 }, 12);
      expect(result).toMatch(/\d{1,2} (AM|PM)/);
    });
  });

  describe('createYAxisLabels', () => {
    it('should create labels for max supply, zero, and max demand', () => {
      const result = createYAxisLabels(150, 150, { top: 20, left: 60 }, 5000, 3000, 170);
      expect(result).toContain('5000W'); // max supply
      expect(result).toContain('0'); // zero line
      expect(result).toContain('-3000W'); // max demand (negative)
    });
  });

  describe('createAreaPath', () => {
    const dataPoints = [
      { solar: 1000, load: 2000 },
      { solar: 1500, load: 2200 },
      { solar: 2000, load: 2400 },
    ];

    it('should create SVG path for data with values', () => {
      const result = createAreaPath(
        dataPoints,
        100,
        200,
        0.1,
        { top: 20, right: 150, bottom: 40, left: 60 },
        d => d.solar,
        0,
        'down'
      );
      
      expect(result).toMatch(/^M \d+\.?\d* \d+\.?\d*/); // Starts with M (move)
      expect(result).toContain('L'); // Contains L (line to)
      expect(result).toContain('Z'); // Ends with Z (close path)
    });

    it('should return null for data with no values', () => {
      const emptyData = [
        { solar: 0, load: 2000 },
        { solar: 0, load: 2200 },
      ];
      
      const result = createAreaPath(
        emptyData,
        100,
        200,
        0.1,
        { top: 20, right: 150, bottom: 40, left: 60 },
        d => d.solar,
        0,
        'down'
      );
      
      expect(result).toBeNull();
    });

    it('should handle stacked areas with base value function', () => {
      const result = createAreaPath(
        dataPoints,
        100,
        200,
        0.1,
        { top: 20, right: 150, bottom: 40, left: 60 },
        d => d.load,
        d => d.solar, // Stack on top of solar
        'down'
      );
      
      expect(result).not.toBeNull();
      expect(result).toContain('Z');
    });
  });

  describe('createLoadLine', () => {
    it('should create line path for load data', () => {
      const dataPoints = [
        { load: 2000 },
        { load: 2200 },
        { load: 2400 },
      ];
      
      const result = createLoadLine(dataPoints, 600, 150, 0.1, { top: 20, right: 150, bottom: 40, left: 60 }, 170);
      
      expect(result).toContain('<path');
      expect(result).toContain('d="M');
      expect(result).toContain('stroke="#CCCCCC"');
    });

    it('should return empty string for no data', () => {
      const result = createLoadLine([], 600, 150, 0.1, { top: 20, right: 150, bottom: 40, left: 60 }, 170);
      expect(result).toBe('');
    });

    it('should use zero line Y position for vertical positioning', () => {
      const dataPoints = [{ load: 1000 }];
      const zeroLineY = 200;
      const scale = 0.1;
      
      const result = createLoadLine(dataPoints, 600, 150, scale, { top: 20, right: 150, bottom: 40, left: 60 }, zeroLineY);
      
      // Load should be positioned relative to zero line
      // y = zeroLineY - load * scale = 200 - 1000 * 0.1 = 100
      expect(result).toContain('M 60,100'); // First point at x=60 (left margin), y=100
    });
  });
});
