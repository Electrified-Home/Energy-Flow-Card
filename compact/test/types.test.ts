import { describe, it, expect, beforeEach } from 'vitest';
import type { CompactViewMode, CompactRenderData, EntityType, BarPercentages, BatteryBarData } from '../src/types';

describe('Compact Card Types', () => {
  describe('CompactViewMode', () => {
    it('should accept "compact" as valid mode', () => {
      const mode: CompactViewMode = 'compact';
      expect(mode).toBe('compact');
    });

    it('should accept "compact-battery" as valid mode', () => {
      const mode: CompactViewMode = 'compact-battery';
      expect(mode).toBe('compact-battery');
    });
  });

  describe('CompactRenderData', () => {
    it('should create valid render data object', () => {
      const data: CompactRenderData = {
        grid: 500,
        load: 1000,
        production: 800,
        battery: -200,
        flows: {
          productionToLoad: 800,
          productionToBattery: 0,
          productionToGrid: 0,
          batteryToLoad: 0,
          gridToLoad: 200,
          gridToBattery: 200
        },
        batterySoc: 75
      };

      expect(data.grid).toBe(500);
      expect(data.load).toBe(1000);
      expect(data.production).toBe(800);
      expect(data.battery).toBe(-200);
      expect(data.batterySoc).toBe(75);
    });

    it('should allow null batterySoc', () => {
      const data: CompactRenderData = {
        grid: 0,
        load: 100,
        production: 100,
        battery: 0,
        flows: {
          productionToLoad: 100,
          productionToBattery: 0,
          productionToGrid: 0,
          batteryToLoad: 0,
          gridToLoad: 0,
          gridToBattery: 0
        },
        batterySoc: null
      };

      expect(data.batterySoc).toBeNull();
    });
  });

  describe('EntityType', () => {
    it('should accept all valid entity types', () => {
      const types: EntityType[] = ['grid', 'load', 'production', 'battery'];
      
      types.forEach(type => {
        const entityType: EntityType = type;
        expect(entityType).toBe(type);
      });
    });
  });

  describe('BarPercentages', () => {
    it('should create valid bar percentages object', () => {
      const percentages: BarPercentages = {
        production: 60,
        battery: 20,
        grid: 20
      };

      expect(percentages.production).toBe(60);
      expect(percentages.battery).toBe(20);
      expect(percentages.grid).toBe(20);
    });

    it('should allow zero values', () => {
      const percentages: BarPercentages = {
        production: 0,
        battery: 0,
        grid: 100
      };

      expect(percentages.production).toBe(0);
      expect(percentages.battery).toBe(0);
      expect(percentages.grid).toBe(100);
    });
  });

  describe('BatteryBarData', () => {
    it('should create valid battery charging data', () => {
      const data: BatteryBarData = {
        gridWatts: 150,
        loadWatts: 0,
        productionWatts: 50,
        gridPercent: 75,
        loadPercent: 0,
        productionPercent: 25,
        gridIsImport: true,
        direction: 'up'
      };

      expect(data.direction).toBe('up');
      expect(data.gridIsImport).toBe(true);
      expect(data.gridWatts).toBe(150);
      expect(data.productionWatts).toBe(50);
    });

    it('should create valid battery discharging data', () => {
      const data: BatteryBarData = {
        gridWatts: 100,
        loadWatts: 400,
        productionWatts: 0,
        gridPercent: 20,
        loadPercent: 80,
        productionPercent: 0,
        gridIsImport: false,
        direction: 'down'
      };

      expect(data.direction).toBe('down');
      expect(data.gridIsImport).toBe(false);
      expect(data.loadWatts).toBe(400);
    });

    it('should create valid battery idle data', () => {
      const data: BatteryBarData = {
        gridWatts: 0,
        loadWatts: 0,
        productionWatts: 0,
        gridPercent: 0,
        loadPercent: 0,
        productionPercent: 0,
        gridIsImport: false,
        direction: 'none'
      };

      expect(data.direction).toBe('none');
      expect(data.gridWatts).toBe(0);
      expect(data.loadWatts).toBe(0);
      expect(data.productionWatts).toBe(0);
    });
  });
});
