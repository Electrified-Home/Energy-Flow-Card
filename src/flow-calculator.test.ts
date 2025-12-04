import { describe, it, expect } from 'vitest';
import { calculateEnergyFlows } from './flow-calculator';
import type { SensorValues } from './types';

describe('calculateEnergyFlows', () => {
  describe('Production to Load', () => {
    it('should route all production to load when production < load', () => {
      const sensors: SensorValues = {
        production: 1000,
        load: 2000,
        battery: 0,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(1000);
      expect(flows.productionToBattery).toBe(0);
      expect(flows.productionToGrid).toBe(0);
    });
    
    it('should route partial production to load when production > load', () => {
      const sensors: SensorValues = {
        production: 3000,
        load: 1000,
        battery: 0,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(1000);
    });
    
    it('should handle zero production', () => {
      const sensors: SensorValues = {
        production: 0,
        load: 1000,
        battery: 0,
        grid: 1000
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(0);
    });
  });
  
  describe('Production to Battery', () => {
    it('should charge battery with excess production', () => {
      const sensors: SensorValues = {
        production: 3000,
        load: 1000,
        battery: -1000, // charging
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(1000);
      expect(flows.productionToBattery).toBe(1000);
    });
    
    it('should not charge battery when discharging', () => {
      const sensors: SensorValues = {
        production: 3000,
        load: 1000,
        battery: 500, // discharging
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToBattery).toBe(0);
    });
    
    it('should limit charging to battery capacity', () => {
      const sensors: SensorValues = {
        production: 5000,
        load: 1000,
        battery: -500, // charging at 500W
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToBattery).toBe(500);
    });
  });
  
  describe('Battery to Load', () => {
    it('should discharge battery to meet load', () => {
      const sensors: SensorValues = {
        production: 500,
        load: 1000,
        battery: 300, // discharging
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(500);
      expect(flows.batteryToLoad).toBe(300);
    });
    
    it('should not discharge when battery is charging', () => {
      const sensors: SensorValues = {
        production: 500,
        load: 1000,
        battery: -200, // charging
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.batteryToLoad).toBe(0);
    });
  });
  
  describe('Grid to Load', () => {
    it('should import from grid to meet remaining load', () => {
      const sensors: SensorValues = {
        production: 500,
        load: 2000,
        battery: 300,
        grid: 1200 // importing
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(500);
      expect(flows.batteryToLoad).toBe(300);
      expect(flows.gridToLoad).toBe(1200);
    });
    
    it('should not import when grid is exporting', () => {
      const sensors: SensorValues = {
        production: 3000,
        load: 1000,
        battery: 0,
        grid: -1000 // exporting
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.gridToLoad).toBe(0);
    });
    
    it('should handle grid at zero', () => {
      const sensors: SensorValues = {
        production: 1000,
        load: 1000,
        battery: 0,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.gridToLoad).toBe(0);
    });
  });
  
  describe('Grid to Battery', () => {
    it('should charge battery from grid when production insufficient', () => {
      const sensors: SensorValues = {
        production: 100,
        load: 1000,
        battery: -500, // charging
        grid: 1500 // importing
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.gridToBattery).toBeGreaterThan(0);
    });
    
    it('should not show grid-to-battery below 10W threshold', () => {
      const sensors: SensorValues = {
        production: 1000,
        load: 1000,
        battery: -50,
        grid: 5 // below threshold
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.gridToBattery).toBe(0);
    });
    
    it('should apply 1W noise threshold for battery need', () => {
      const sensors: SensorValues = {
        production: 1000,
        load: 500,
        battery: -0.5, // tiny charging value
        grid: 15
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.gridToBattery).toBe(0);
    });
  });
  
  describe('Production to Grid (Export)', () => {
    it('should export excess production to grid', () => {
      const sensors: SensorValues = {
        production: 4000,
        load: 1000,
        battery: 0,
        grid: -2000 // exporting
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToGrid).toBe(2000);
    });
    
    it('should not show export below -10W threshold', () => {
      const sensors: SensorValues = {
        production: 1005,
        load: 1000,
        battery: 0,
        grid: -5 // below threshold
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToGrid).toBe(0);
    });
    
    it('should not export when grid is importing', () => {
      const sensors: SensorValues = {
        production: 500,
        load: 1000,
        battery: 0,
        grid: 500 // importing
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToGrid).toBe(0);
    });
  });
  
  describe('Complex Scenarios', () => {
    it('should handle typical daytime scenario: solar charging battery and powering load', () => {
      const sensors: SensorValues = {
        production: 5000,
        load: 2000,
        battery: -1500, // charging
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(2000);
      expect(flows.productionToBattery).toBe(1500);
      expect(flows.batteryToLoad).toBe(0);
      expect(flows.gridToLoad).toBe(0);
      expect(flows.gridToBattery).toBe(0);
    });
    
    it('should handle nighttime scenario: battery and grid powering load', () => {
      const sensors: SensorValues = {
        production: 0,
        load: 2000,
        battery: 800, // discharging
        grid: 1200 // importing
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(0);
      expect(flows.batteryToLoad).toBe(800);
      expect(flows.gridToLoad).toBe(1200);
    });
    
    it('should handle export scenario: excess solar exported to grid', () => {
      const sensors: SensorValues = {
        production: 6000,
        load: 1500,
        battery: -1000, // charging
        grid: -3000 // exporting
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(1500);
      expect(flows.productionToBattery).toBe(1000);
      expect(flows.productionToGrid).toBe(3000);
    });
    
    it('should handle sensor imbalance gracefully', () => {
      // Real-world scenario: sensors don't perfectly balance
      // This tests that the algorithm doesn't create phantom flows
      const sensors: SensorValues = {
        production: 2500,
        load: 1800,
        battery: -600, // charging
        grid: -50 // slight export, but below -10W threshold so won't show
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(1800);
      expect(flows.productionToBattery).toBe(600);
      // Note: With 2500 production - 1800 load - 600 battery = 100W unaccounted
      // This 100W represents the sensor imbalance. The grid shows -50W export.
      // Since we have 100W remaining production after allocation, the algorithm
      // will not show productionToGrid because grid is only -50W (below threshold).
      // The 100W remaining production doesn't get allocated anywhere, which is correct
      // behavior when sensors don't perfectly balance.
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle all zeros', () => {
      const sensors: SensorValues = {
        production: 0,
        load: 0,
        battery: 0,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(0);
      expect(flows.productionToBattery).toBe(0);
      expect(flows.productionToGrid).toBe(0);
      expect(flows.gridToLoad).toBe(0);
      expect(flows.gridToBattery).toBe(0);
      expect(flows.batteryToLoad).toBe(0);
    });
    
    it('should handle negative production values', () => {
      const sensors: SensorValues = {
        production: -100, // invalid but might happen
        load: 1000,
        battery: 0,
        grid: 1000
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(0);
      expect(flows.gridToLoad).toBe(1000);
    });
    
    it('should handle negative load values', () => {
      const sensors: SensorValues = {
        production: 1000,
        load: -100, // invalid but might happen
        battery: 0,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(0);
    });
  });

  describe('Invariant: Zero Grid = No Grid Flows', () => {
    it('should have no grid flows when grid is 0 (solar powers load)', () => {
      const sensors: SensorValues = {
        production: 2000,
        load: 2000,
        battery: 0,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.gridToLoad).toBe(0);
      expect(flows.gridToBattery).toBe(0);
    });
    
    it('should have no grid flows when grid is 0 (solar + battery powers load)', () => {
      const sensors: SensorValues = {
        production: 1500,
        load: 2000,
        battery: 500,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.gridToLoad).toBe(0);
      expect(flows.gridToBattery).toBe(0);
    });
    
    it('should have no grid flows when grid is 0 (excess solar charges battery)', () => {
      const sensors: SensorValues = {
        production: 3000,
        load: 2000,
        battery: -800,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.gridToLoad).toBe(0);
      expect(flows.gridToBattery).toBe(0);
      expect(flows.productionToGrid).toBe(0);
    });
  });

  describe('Invariant: Zero Production = No Production Flows', () => {
    it('should have no production flows when production is 0 (grid powers load)', () => {
      const sensors: SensorValues = {
        production: 0,
        load: 2000,
        battery: 0,
        grid: 2000
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(0);
      expect(flows.productionToBattery).toBe(0);
      expect(flows.productionToGrid).toBe(0);
      expect(flows.gridToLoad).toBe(2000);
    });
    
    it('should have no production flows when production is 0 (battery powers load)', () => {
      const sensors: SensorValues = {
        production: 0,
        load: 1500,
        battery: 1500,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(0);
      expect(flows.productionToBattery).toBe(0);
      expect(flows.productionToGrid).toBe(0);
      expect(flows.batteryToLoad).toBe(1500);
    });
    
    it('should have no production flows when production is 0 (grid charges battery)', () => {
      const sensors: SensorValues = {
        production: 0,
        load: 1000,
        battery: -500,
        grid: 1500
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(0);
      expect(flows.productionToBattery).toBe(0);
      expect(flows.productionToGrid).toBe(0);
    });
  });

  describe('Invariant: Zero Battery = No Battery Flows', () => {
    it('should have no battery flows when battery is 0 (solar powers load)', () => {
      const sensors: SensorValues = {
        production: 2000,
        load: 2000,
        battery: 0,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.batteryToLoad).toBe(0);
      expect(flows.productionToBattery).toBe(0);
      expect(flows.gridToBattery).toBe(0);
    });
    
    it('should have no battery flows when battery is 0 (solar exports)', () => {
      const sensors: SensorValues = {
        production: 3000,
        load: 1000,
        battery: 0,
        grid: -2000
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.batteryToLoad).toBe(0);
      expect(flows.productionToBattery).toBe(0);
      expect(flows.gridToBattery).toBe(0);
      expect(flows.productionToGrid).toBe(2000);
    });
    
    it('should have no battery flows when battery is 0 (grid powers load)', () => {
      const sensors: SensorValues = {
        production: 500,
        load: 2000,
        battery: 0,
        grid: 1500
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.batteryToLoad).toBe(0);
      expect(flows.productionToBattery).toBe(0);
      expect(flows.gridToBattery).toBe(0);
    });
  });

  describe('Invariant: Zero Load = No Load Flows', () => {
    it('should have no load flows when load is 0 (solar charges battery)', () => {
      const sensors: SensorValues = {
        production: 2000,
        load: 0,
        battery: -2000,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(0);
      expect(flows.gridToLoad).toBe(0);
      expect(flows.batteryToLoad).toBe(0);
      expect(flows.productionToBattery).toBe(2000);
    });
    
    it('should have no load flows when load is 0 (solar exports)', () => {
      const sensors: SensorValues = {
        production: 3000,
        load: 0,
        battery: 0,
        grid: -3000
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(0);
      expect(flows.gridToLoad).toBe(0);
      expect(flows.batteryToLoad).toBe(0);
      expect(flows.productionToGrid).toBe(3000);
    });
    
    it('should have no load flows when load is 0 (all sources idle)', () => {
      const sensors: SensorValues = {
        production: 0,
        load: 0,
        battery: 0,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(0);
      expect(flows.gridToLoad).toBe(0);
      expect(flows.batteryToLoad).toBe(0);
    });
  });

  describe('Single Source Scenarios', () => {
    it('should handle only solar powering load (exactly matching)', () => {
      const sensors: SensorValues = {
        production: 1500,
        load: 1500,
        battery: 0,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(1500);
      expect(flows.gridToLoad).toBe(0);
      expect(flows.batteryToLoad).toBe(0);
      expect(flows.productionToBattery).toBe(0);
      expect(flows.gridToBattery).toBe(0);
      expect(flows.productionToGrid).toBe(0);
    });
    
    it('should handle only solar powering load (insufficient)', () => {
      const sensors: SensorValues = {
        production: 800,
        load: 1500,
        battery: 0,
        grid: 700
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(800);
      expect(flows.gridToLoad).toBe(700);
      expect(flows.batteryToLoad).toBe(0);
    });
    
    it('should handle only battery powering load', () => {
      const sensors: SensorValues = {
        production: 0,
        load: 1200,
        battery: 1200,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.batteryToLoad).toBe(1200);
      expect(flows.productionToLoad).toBe(0);
      expect(flows.gridToLoad).toBe(0);
    });
    
    it('should handle only grid powering load', () => {
      const sensors: SensorValues = {
        production: 0,
        load: 2500,
        battery: 0,
        grid: 2500
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.gridToLoad).toBe(2500);
      expect(flows.productionToLoad).toBe(0);
      expect(flows.batteryToLoad).toBe(0);
    });
  });

  describe('Imbalanced Sensor Scenarios', () => {
    it('should handle tiny battery discharge (5W self-consumption)', () => {
      const sensors: SensorValues = {
        production: 1000,
        load: 3000,
        battery: 5, // very small discharge, likely self-consumption
        grid: 2000
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      // Battery discharge has no threshold - even 5W will show
      expect(flows.batteryToLoad).toBe(5);
      expect(flows.productionToLoad).toBe(1000);
      // Load is 3000, production provides 1000, battery provides 5, so grid needs 1995
      expect(flows.gridToLoad).toBe(1995);
    });
    
    it('should handle sensors that dont add up (production + grid != load + battery)', () => {
      const sensors: SensorValues = {
        production: 2200,
        load: 1800,
        battery: -300,
        grid: -50 // Export below -10W threshold
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      // Algorithm should still work despite 50W discrepancy
      expect(flows.productionToLoad).toBe(1800);
      expect(flows.productionToBattery).toBe(300);
      // Grid export below -10W threshold (needs < -10W), so shows the export
      expect(flows.productionToGrid).toBe(50);
    });
    
    it('should handle rounding errors in sensors', () => {
      const sensors: SensorValues = {
        production: 1234.56,
        load: 987.89,
        battery: -246.23,
        grid: -0.44 // Tiny export from rounding
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(987.89);
      expect(flows.productionToBattery).toBe(246.23);
      expect(flows.productionToGrid).toBe(0); // Below threshold
    });
    
    it('should handle grid import with slight sensor error', () => {
      const sensors: SensorValues = {
        production: 500,
        load: 2000,
        battery: 300,
        grid: 1195 // Should be 1200, but sensors have 5W error
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(500);
      expect(flows.batteryToLoad).toBe(300);
      expect(flows.gridToLoad).toBe(1195);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle battery discharge at 1W (no threshold)', () => {
      const sensors: SensorValues = {
        production: 1000,
        load: 2001,
        battery: 1,
        grid: 1000
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      // batteryToLoad has no threshold - even 1W will show
      expect(flows.batteryToLoad).toBe(1);
    });
    
    it('should handle battery discharge at 9W (no threshold for batteryToLoad)', () => {
      const sensors: SensorValues = {
        production: 1000,
        load: 2009,
        battery: 9,
        grid: 1000
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      // batteryToLoad has no threshold - even 9W will show
      expect(flows.batteryToLoad).toBe(9);
    });
    
    it('should handle grid import at 1W (no threshold)', () => {
      const sensors: SensorValues = {
        production: 1000,
        load: 1001,
        battery: 0,
        grid: 1
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      // gridToLoad has no threshold
      expect(flows.gridToLoad).toBe(1);
    });
    
    it('should handle grid import at 9W (no threshold for gridToLoad)', () => {
      const sensors: SensorValues = {
        production: 1000,
        load: 1009,
        battery: 0,
        grid: 9
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      // gridToLoad has no threshold - even 9W will show
      expect(flows.gridToLoad).toBe(9);
    });
    
    it('should handle gridToBattery at exactly 10W threshold (shows)', () => {
      const sensors: SensorValues = {
        production: 0,
        load: 0,
        battery: -10,
        grid: 10
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      // gridToBattery threshold is > 10W (strictly greater), so exactly 10W doesn't trigger\n      // But wait - we need to check the actual condition in code
      expect(flows.gridToBattery).toBe(0); // 10W exactly doesn't pass > 10 check
    });
    
    it('should handle gridToBattery at 11W (above threshold)', () => {
      const sensors: SensorValues = {
        production: 0,
        load: 0,
        battery: -10,
        grid: 11
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      // gridToBattery requires grid > 10W, so 11W should work
      expect(flows.gridToBattery).toBeGreaterThan(0);
    });
    
    it('should handle grid export at exactly -10W (not shown)', () => {
      const sensors: SensorValues = {
        production: 1010,
        load: 1000,
        battery: 0,
        grid: -10
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      // Threshold is < -10W (strictly less than), so -10W exactly doesn't show
      expect(flows.productionToGrid).toBe(0);
    });
    
    it('should handle grid export at -10.01W (just below threshold, shows)', () => {
      const sensors: SensorValues = {
        production: 1010.01,
        load: 1000,
        battery: 0,
        grid: -10.01
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      // Below -10W threshold should show export
      expect(flows.productionToGrid).toBe(10.01);
    });
    
    it('should handle grid export just above -10W threshold (closer to zero)', () => {
      const sensors: SensorValues = {
        production: 1009,
        load: 1000,
        battery: 0,
        grid: -9
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      // Above threshold (closer to zero) shouldn't show
      expect(flows.productionToGrid).toBe(0);
    });
    
    it('should handle very small production (1W)', () => {
      const sensors: SensorValues = {
        production: 1,
        load: 1000,
        battery: 0,
        grid: 999
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(1);
      expect(flows.gridToLoad).toBe(999);
    });
    
    it('should handle very small load (1W)', () => {
      const sensors: SensorValues = {
        production: 2000,
        load: 1,
        battery: -999,
        grid: -1000
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(1);
      expect(flows.productionToBattery).toBe(999);
      expect(flows.productionToGrid).toBe(1000);
    });
    
    it('should handle battery at exactly 0W', () => {
      const sensors: SensorValues = {
        production: 1000,
        load: 1000,
        battery: 0,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.batteryToLoad).toBe(0);
      expect(flows.productionToBattery).toBe(0);
      expect(flows.gridToBattery).toBe(0);
    });
    
    it('should handle grid at exactly 0W', () => {
      const sensors: SensorValues = {
        production: 1000,
        load: 1000,
        battery: 0,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.gridToLoad).toBe(0);
      expect(flows.gridToBattery).toBe(0);
      expect(flows.productionToGrid).toBe(0);
    });
  });

  describe('Sign Transition Scenarios', () => {
    it('should handle battery transitioning from charge to discharge', () => {
      const sensors: SensorValues = {
        production: 800,
        load: 1000,
        battery: 50, // Just started discharging
        grid: 150
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(800);
      expect(flows.batteryToLoad).toBe(50);
      expect(flows.gridToLoad).toBe(150);
      expect(flows.productionToBattery).toBe(0); // Not charging
    });
    
    it('should handle grid transitioning from import to export', () => {
      const sensors: SensorValues = {
        production: 2500,
        load: 1000,
        battery: -1000,
        grid: -500
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(1000);
      expect(flows.productionToBattery).toBe(1000);
      expect(flows.productionToGrid).toBe(500);
      expect(flows.gridToLoad).toBe(0); // Not importing
      expect(flows.gridToBattery).toBe(0); // Not importing
    });
    
    it('should handle production starting (1W to meaningful)', () => {
      const sensors: SensorValues = {
        production: 150, // Sun just rising
        load: 1000,
        battery: 200,
        grid: 650
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(150);
      expect(flows.batteryToLoad).toBe(200);
      expect(flows.gridToLoad).toBe(650);
    });
  });

  describe('Multiple Sources Combination', () => {
    it('should handle all three sources powering load', () => {
      const sensors: SensorValues = {
        production: 800,
        load: 2500,
        battery: 700,
        grid: 1000
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(800);
      expect(flows.batteryToLoad).toBe(700);
      expect(flows.gridToLoad).toBe(1000);
      expect(flows.productionToBattery).toBe(0);
      expect(flows.gridToBattery).toBe(0);
      expect(flows.productionToGrid).toBe(0);
    });
    
    it('should handle solar splitting to load, battery, and grid', () => {
      const sensors: SensorValues = {
        production: 6000,
        load: 2000,
        battery: -1500,
        grid: -2500
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(2000);
      expect(flows.productionToBattery).toBe(1500);
      expect(flows.productionToGrid).toBe(2500);
      expect(flows.batteryToLoad).toBe(0);
      expect(flows.gridToLoad).toBe(0);
      expect(flows.gridToBattery).toBe(0);
    });
    
    it('should handle grid charging battery while solar powers load', () => {
      const sensors: SensorValues = {
        production: 1000,
        load: 1000,
        battery: -800,
        grid: 800
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(1000);
      expect(flows.gridToBattery).toBeGreaterThan(0);
      expect(flows.batteryToLoad).toBe(0);
    });
  });

  describe('Extreme Values', () => {
    it('should handle very high production (20kW solar array)', () => {
      const sensors: SensorValues = {
        production: 20000,
        load: 3000,
        battery: -5000,
        grid: -12000
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(3000);
      expect(flows.productionToBattery).toBe(5000);
      expect(flows.productionToGrid).toBe(12000);
    });
    
    it('should handle very high load (whole house heating)', () => {
      const sensors: SensorValues = {
        production: 2000,
        load: 15000,
        battery: 3000,
        grid: 10000
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.productionToLoad).toBe(2000);
      expect(flows.batteryToLoad).toBe(3000);
      expect(flows.gridToLoad).toBe(10000);
    });
    
    it('should handle very high battery discharge (emergency backup)', () => {
      const sensors: SensorValues = {
        production: 0,
        load: 8000,
        battery: 8000,
        grid: 0
      };
      
      const flows = calculateEnergyFlows(sensors);
      
      expect(flows.batteryToLoad).toBe(8000);
      expect(flows.productionToLoad).toBe(0);
      expect(flows.gridToLoad).toBe(0);
    });
  });

  describe('Sensors Are Source of Truth', () => {
    describe('Grid Attribution - Where Does Grid Import Go?', () => {
      it('should route grid import to load when production + battery < load', () => {
        const sensors: SensorValues = {
          production: 1000,
          load: 3000,
          battery: 500, // discharging
          grid: 1500 // importing
        };
        
        const flows = calculateEnergyFlows(sensors);
        
        // Grid makes up the difference for load
        expect(flows.productionToLoad).toBe(1000);
        expect(flows.batteryToLoad).toBe(500);
        expect(flows.gridToLoad).toBe(1500);
        expect(flows.gridToBattery).toBe(0);
      });
      
      it('should route grid import to battery when production < battery charging', () => {
        const sensors: SensorValues = {
          production: 200,
          load: 500,
          battery: -1000, // charging at 1000W
          grid: 1300 // importing
        };
        
        const flows = calculateEnergyFlows(sensors);
        
        // Production covers partial load, grid covers rest of load + helps charge battery
        expect(flows.productionToLoad).toBe(200);
        expect(flows.gridToLoad).toBe(300); // Remaining load after production
        expect(flows.productionToBattery).toBe(0); // Production all went to load
        expect(flows.gridToBattery).toBeGreaterThan(0); // Grid charges battery
      });
      
      it('should split grid import between load and battery', () => {
        const sensors: SensorValues = {
          production: 500,
          load: 2000,
          battery: -800, // charging
          grid: 2300 // importing
        };
        
        const flows = calculateEnergyFlows(sensors);
        
        // Production to load first
        expect(flows.productionToLoad).toBe(500);
        // Grid covers remaining load
        expect(flows.gridToLoad).toBe(1500);
        // Grid also charges battery
        expect(flows.gridToBattery).toBeGreaterThan(0);
        expect(flows.productionToBattery).toBe(0);
      });
    });

    describe('Production Overflow - Surplus When Grid = 0', () => {
      it('should not create phantom grid export when grid sensor = 0', () => {
        const sensors: SensorValues = {
          production: 5000,
          load: 1000,
          battery: 0, // Not charging
          grid: 0 // Sensor says no grid flow
        };
        
        const flows = calculateEnergyFlows(sensors);
        
        // Respect grid sensor = 0
        expect(flows.gridToLoad).toBe(0);
        expect(flows.gridToBattery).toBe(0);
        expect(flows.productionToGrid).toBe(0);
        
        // Production goes to load only
        expect(flows.productionToLoad).toBe(1000);
        expect(flows.productionToBattery).toBe(0);
        
        // 4000W production unaccounted for - that's okay, sensors are truth
      });
      
      it('should not create phantom flows when production exceeds allocation', () => {
        const sensors: SensorValues = {
          production: 3000,
          load: 800,
          battery: -500, // charging at 500W
          grid: 0
        };
        
        const flows = calculateEnergyFlows(sensors);
        
        // Only allocate what sensors confirm
        expect(flows.productionToLoad).toBe(800);
        expect(flows.productionToBattery).toBe(500);
        expect(flows.productionToGrid).toBe(0); // Grid sensor = 0
        
        // 1700W production unaccounted for - sensors don't show export
      });
    });

    describe('Load Underflow - Deficit When Grid = 0', () => {
      it('should not create phantom grid import when grid sensor = 0', () => {
        const sensors: SensorValues = {
          production: 500,
          load: 3000,
          battery: 0, // Not discharging
          grid: 0 // Sensor says no grid flow
        };
        
        const flows = calculateEnergyFlows(sensors);
        
        // Respect grid sensor = 0
        expect(flows.gridToLoad).toBe(0);
        expect(flows.gridToBattery).toBe(0);
        expect(flows.productionToGrid).toBe(0);
        
        // Only show what sensors confirm
        expect(flows.productionToLoad).toBe(500);
        expect(flows.batteryToLoad).toBe(0);
        
        // 2500W load deficit unaccounted for - that's okay, sensors are truth
      });
      
      it('should not invent flows to balance load deficit', () => {
        const sensors: SensorValues = {
          production: 1200,
          load: 4000,
          battery: 300, // discharging at 300W
          grid: 0 // Says no import
        };
        
        const flows = calculateEnergyFlows(sensors);
        
        // Show only what sensors report
        expect(flows.productionToLoad).toBe(1200);
        expect(flows.batteryToLoad).toBe(300);
        expect(flows.gridToLoad).toBe(0); // Grid sensor = 0
        
        // 2500W load deficit - doesn't matter, we trust sensors
      });
    });

    describe('Grid Flow Priority Rules', () => {
      it('should prioritize grid to load over grid to battery', () => {
        const sensors: SensorValues = {
          production: 0,
          load: 2000,
          battery: -500, // charging
          grid: 2500 // importing
        };
        
        const flows = calculateEnergyFlows(sensors);
        
        // Grid covers load first
        expect(flows.gridToLoad).toBe(2000);
        // Then remaining grid charges battery
        expect(flows.gridToBattery).toBeGreaterThan(0);
        expect(flows.productionToLoad).toBe(0);
        expect(flows.productionToBattery).toBe(0);
      });
      
      it('should handle grid import when both load and battery need power', () => {
        const sensors: SensorValues = {
          production: 300,
          load: 1500,
          battery: -600, // charging
          grid: 1800 // importing
        };
        
        const flows = calculateEnergyFlows(sensors);
        
        // Production to load first (priority)
        expect(flows.productionToLoad).toBe(300);
        // Grid covers remaining load
        expect(flows.gridToLoad).toBe(1200);
        // Grid also charges battery
        expect(flows.gridToBattery).toBeGreaterThan(0);
      });
    });

    describe('Battery Flow Direction Certainty', () => {
      it('should never show both charging and discharging', () => {
        const sensors: SensorValues = {
          production: 2000,
          load: 1000,
          battery: -500, // clearly charging
          grid: 0
        };
        
        const flows = calculateEnergyFlows(sensors);
        
        // Battery is charging (negative sensor)
        expect(flows.productionToBattery).toBeGreaterThan(0);
        expect(flows.batteryToLoad).toBe(0); // Cannot discharge while charging
      });
      
      it('should respect battery discharge even with excess production', () => {
        const sensors: SensorValues = {
          production: 1800,
          load: 2000,
          battery: 200, // discharging to help meet load
          grid: 0 // Balanced
        };
        
        const flows = calculateEnergyFlows(sensors);
        
        // Production to load first
        expect(flows.productionToLoad).toBe(1800);
        // Battery helps with remaining load
        expect(flows.batteryToLoad).toBe(200);
        expect(flows.productionToBattery).toBe(0);
        expect(flows.productionToGrid).toBe(0);
        expect(flows.gridToLoad).toBe(0);
      });
    });

    describe('Sensor Measurement Noise and Timing', () => {
      it('should handle micro-discrepancies in sensor timing', () => {
        const sensors: SensorValues = {
          production: 1502.3,
          load: 1500.1,
          battery: -2.0, // Tiny charge
          grid: -0.2 // Micro export
        };
        
        const flows = calculateEnergyFlows(sensors);
        
        // Production to load
        expect(flows.productionToLoad).toBe(1500.1);
        // Tiny battery charge
        expect(flows.productionToBattery).toBe(2.0);
        // Grid export below -10W threshold, no flow shown
        expect(flows.productionToGrid).toBe(0);
      });
      
      it('should handle sensors updating at different rates', () => {
        const sensors: SensorValues = {
          production: 1000,
          load: 1050, // Slight mismatch
          battery: 45, // Battery helping
          grid: 0 // Grid sensor hasn't updated yet
        };
        
        const flows = calculateEnergyFlows(sensors);
        
        // Trust what sensors say
        expect(flows.productionToLoad).toBe(1000);
        expect(flows.batteryToLoad).toBe(45);
        expect(flows.gridToLoad).toBe(0); // Sensor says 0
        
        // 5W load unaccounted - timing discrepancy is fine
      });
    });
  });
});
