import { describe, it, expect } from 'vitest';
import { calculateLoadBarPercentages, calculateBatteryBarData } from '../src/calculations';
import type { EnergyFlows } from '../../shared/src/types/EnergyFlow';

describe('Compact Card Calculations', () => {
  describe('calculateLoadBarPercentages', () => {
    it('should calculate correct percentages for typical load scenario', () => {
      const load = 1000;
      const flows: EnergyFlows = {
        productionToLoad: 600,
        productionToBattery: 0,
        productionToGrid: 0,
        batteryToLoad: 200,
        gridToLoad: 200,
        gridToBattery: 0
      };

      const result = calculateLoadBarPercentages(load, flows);

      expect(result.true.production).toBe(60);
      expect(result.true.battery).toBe(20);
      expect(result.true.grid).toBe(20);
      expect(result.visual.production).toBe(60);
      expect(result.visual.battery).toBe(20);
      expect(result.visual.grid).toBe(20);
    });

    it('should scale visual percentages to 100% when sum is less', () => {
      const load = 1000;
      const flows: EnergyFlows = {
        productionToLoad: 400,
        productionToBattery: 0,
        productionToGrid: 0,
        batteryToLoad: 100,
        gridToLoad: 0,
        gridToBattery: 0
      };

      const result = calculateLoadBarPercentages(load, flows);

      expect(result.true.production).toBe(40);
      expect(result.true.battery).toBe(10);
      expect(result.true.grid).toBe(0);

      // Visual should scale to 100%
      expect(result.visual.production).toBeCloseTo(80);
      expect(result.visual.battery).toBeCloseTo(20);
      expect(result.visual.grid).toBe(0);
    });

    it('should handle zero load gracefully', () => {
      const load = 0;
      const flows: EnergyFlows = {
        productionToLoad: 0,
        productionToBattery: 0,
        productionToGrid: 0,
        batteryToLoad: 0,
        gridToLoad: 0,
        gridToBattery: 0
      };

      const result = calculateLoadBarPercentages(load, flows);

      expect(result.true.production).toBe(0);
      expect(result.true.battery).toBe(0);
      expect(result.true.grid).toBe(0);
      expect(result.visual.production).toBe(0);
      expect(result.visual.battery).toBe(0);
      expect(result.visual.grid).toBe(0);
    });

    it('should handle 100% grid import', () => {
      const load = 500;
      const flows: EnergyFlows = {
        productionToLoad: 0,
        productionToBattery: 0,
        productionToGrid: 0,
        batteryToLoad: 0,
        gridToLoad: 500,
        gridToBattery: 0
      };

      const result = calculateLoadBarPercentages(load, flows);

      expect(result.true.production).toBe(0);
      expect(result.true.battery).toBe(0);
      expect(result.true.grid).toBe(100);
      expect(result.visual.production).toBe(0);
      expect(result.visual.battery).toBe(0);
      expect(result.visual.grid).toBe(100);
    });

    it('should handle 100% production', () => {
      const load = 800;
      const flows: EnergyFlows = {
        productionToLoad: 800,
        productionToBattery: 0,
        productionToGrid: 0,
        batteryToLoad: 0,
        gridToLoad: 0,
        gridToBattery: 0
      };

      const result = calculateLoadBarPercentages(load, flows);

      expect(result.true.production).toBe(100);
      expect(result.true.battery).toBe(0);
      expect(result.true.grid).toBe(0);
      expect(result.visual.production).toBe(100);
      expect(result.visual.battery).toBe(0);
      expect(result.visual.grid).toBe(0);
    });

    it('should handle mixed sources with scaling', () => {
      const load = 2000;
      const flows: EnergyFlows = {
        productionToLoad: 800,
        productionToBattery: 0,
        productionToGrid: 0,
        batteryToLoad: 400,
        gridToLoad: 400,
        gridToBattery: 0
      };

      const result = calculateLoadBarPercentages(load, flows);

      expect(result.true.production).toBe(40);
      expect(result.true.battery).toBe(20);
      expect(result.true.grid).toBe(20);

      // Sum is 80%, so visual should scale by 100/80 = 1.25
      expect(result.visual.production).toBeCloseTo(50);
      expect(result.visual.battery).toBeCloseTo(25);
      expect(result.visual.grid).toBeCloseTo(25);
    });
  });

  describe('calculateBatteryBarData', () => {
    describe('charging scenarios', () => {
      it('should calculate correct data for battery charging from grid', () => {
        const battery = -200;
        const flows: EnergyFlows = {
          productionToLoad: 0,
          productionToBattery: 0,
          productionToGrid: 0,
          batteryToLoad: 0,
          gridToLoad: 0,
          gridToBattery: 200
        };

        const result = calculateBatteryBarData(battery, flows);

        expect(result.direction).toBe('up');
        expect(result.gridIsImport).toBe(true);
        expect(result.gridWatts).toBe(200);
        expect(result.loadWatts).toBe(0);
        expect(result.productionWatts).toBe(0);
        expect(result.gridPercent).toBe(100);
        expect(result.loadPercent).toBe(0);
        expect(result.productionPercent).toBe(0);
      });

      it('should calculate correct data for battery charging from production', () => {
        const battery = -300;
        const flows: EnergyFlows = {
          productionToLoad: 0,
          productionToBattery: 300,
          productionToGrid: 0,
          batteryToLoad: 0,
          gridToLoad: 0,
          gridToBattery: 0
        };

        const result = calculateBatteryBarData(battery, flows);

        expect(result.direction).toBe('up');
        expect(result.gridIsImport).toBe(true);
        expect(result.gridWatts).toBe(0);
        expect(result.loadWatts).toBe(0);
        expect(result.productionWatts).toBe(300);
        expect(result.gridPercent).toBe(0);
        expect(result.loadPercent).toBe(0);
        expect(result.productionPercent).toBe(100);
      });

      it('should calculate correct data for battery charging from mixed sources', () => {
        const battery = -400;
        const flows: EnergyFlows = {
          productionToLoad: 0,
          productionToBattery: 300,
          productionToGrid: 0,
          batteryToLoad: 0,
          gridToLoad: 0,
          gridToBattery: 100
        };

        const result = calculateBatteryBarData(battery, flows);

        expect(result.direction).toBe('up');
        expect(result.gridIsImport).toBe(true);
        expect(result.gridWatts).toBe(100);
        expect(result.productionWatts).toBe(300);
        expect(result.gridPercent).toBe(25);
        expect(result.productionPercent).toBe(75);
      });
    });

    describe('discharging scenarios', () => {
      it('should calculate correct data for battery discharging to load', () => {
        const battery = 500;
        const flows: EnergyFlows = {
          productionToLoad: 0,
          productionToBattery: 0,
          productionToGrid: 0,
          batteryToLoad: 500,
          gridToLoad: 0,
          gridToBattery: 0
        };

        const result = calculateBatteryBarData(battery, flows);

        expect(result.direction).toBe('down');
        expect(result.gridIsImport).toBe(false);
        expect(result.loadWatts).toBe(500);
        expect(result.gridWatts).toBe(0);
        expect(result.productionWatts).toBe(0);
        expect(result.loadPercent).toBe(100);
        expect(result.gridPercent).toBe(0);
      });

      it('should calculate correct data for battery discharging to grid', () => {
        const battery = 600;
        const flows: EnergyFlows = {
          productionToLoad: 0,
          productionToBattery: 0,
          productionToGrid: 0,
          batteryToLoad: 0,
          gridToLoad: 0,
          gridToBattery: 0
        };

        const result = calculateBatteryBarData(battery, flows);

        expect(result.direction).toBe('down');
        expect(result.gridIsImport).toBe(false);
        expect(result.loadWatts).toBe(0);
        expect(result.gridWatts).toBe(600); // All to grid
        expect(result.productionWatts).toBe(0);
      });

      it('should calculate correct data for battery discharging to both load and grid', () => {
        const battery = 800;
        const flows: EnergyFlows = {
          productionToLoad: 0,
          productionToBattery: 0,
          productionToGrid: 0,
          batteryToLoad: 600,
          gridToLoad: 0,
          gridToBattery: 0
        };

        const result = calculateBatteryBarData(battery, flows);

        expect(result.direction).toBe('down');
        expect(result.gridIsImport).toBe(false);
        expect(result.loadWatts).toBe(600);
        expect(result.gridWatts).toBe(200); // 800 - 600 = 200 to grid
        expect(result.loadPercent).toBe(75);
        expect(result.gridPercent).toBe(25);
      });
    });

    describe('idle scenarios', () => {
      it('should calculate correct data for idle battery', () => {
        const battery = 0;
        const flows: EnergyFlows = {
          productionToLoad: 0,
          productionToBattery: 0,
          productionToGrid: 0,
          batteryToLoad: 0,
          gridToLoad: 0,
          gridToBattery: 0
        };

        const result = calculateBatteryBarData(battery, flows);

        expect(result.direction).toBe('none');
        expect(result.gridIsImport).toBe(false);
        expect(result.gridWatts).toBe(0);
        expect(result.loadWatts).toBe(0);
        expect(result.productionWatts).toBe(0);
        expect(result.gridPercent).toBe(0);
        expect(result.loadPercent).toBe(0);
        expect(result.productionPercent).toBe(0);
      });
    });

    describe('edge cases', () => {
      it('should handle very small battery charge', () => {
        const battery = -1;
        const flows: EnergyFlows = {
          productionToLoad: 0,
          productionToBattery: 1,
          productionToGrid: 0,
          batteryToLoad: 0,
          gridToLoad: 0,
          gridToBattery: 0
        };

        const result = calculateBatteryBarData(battery, flows);

        expect(result.direction).toBe('up');
        expect(result.productionWatts).toBe(1);
        expect(result.productionPercent).toBe(100);
      });

      it('should handle very small battery discharge', () => {
        const battery = 1;
        const flows: EnergyFlows = {
          productionToLoad: 0,
          productionToBattery: 0,
          productionToGrid: 0,
          batteryToLoad: 1,
          gridToLoad: 0,
          gridToBattery: 0
        };

        const result = calculateBatteryBarData(battery, flows);

        expect(result.direction).toBe('down');
        expect(result.loadWatts).toBe(1);
        expect(result.loadPercent).toBe(100);
      });
    });
  });
});
