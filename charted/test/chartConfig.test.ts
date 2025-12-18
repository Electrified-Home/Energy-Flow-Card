import { describe, it, expect } from 'vitest';
import { calculateStackedPositions } from '../src/chartConfig';

describe('charted/chartConfig', () => {
  describe('calculateStackedPositions', () => {
    it('calculates positions for positive battery (discharge)', () => {
      const values = {
        solar: 1000,
        grid: 500,
        battery: 200,
        load: 1500,
      };

      const result = calculateStackedPositions(values);

      expect(result.solarStackY).toBe(1000);
      expect(result.dischargeStackY).toBe(1200); // solar + battery discharge
      expect(result.importStackY).toBe(1700); // solar + discharge + grid import
      expect(result.chargeStackY).toBe(0); // no charging
      expect(result.exportStackY).toBe(0); // no export
      expect(result.loadY).toBe(1500);
    });

    it('calculates positions for negative battery (charge)', () => {
      const values = {
        solar: 2000,
        grid: -500, // export
        battery: -300, // charging
        load: 1000,
      };

      const result = calculateStackedPositions(values);

      expect(result.solarStackY).toBe(2000);
      expect(result.dischargeStackY).toBe(2000); // no discharge
      expect(result.importStackY).toBe(2000); // no import
      expect(result.chargeStackY).toBe(-300); // battery charging
      expect(result.exportStackY).toBe(-800); // charge + export
      expect(result.loadY).toBe(1000);
    });

    it('handles grid import scenario', () => {
      const values = {
        solar: 100,
        grid: 500, // import
        battery: 0,
        load: 600,
      };

      const result = calculateStackedPositions(values);

      expect(result.solarStackY).toBe(100);
      expect(result.dischargeStackY).toBe(100);
      expect(result.importStackY).toBe(600); // solar + import
    });

    it('handles grid export scenario', () => {
      const values = {
        solar: 2000,
        grid: -700, // export
        battery: 0,
        load: 1000,
      };

      const result = calculateStackedPositions(values);

      expect(result.solarStackY).toBe(2000);
      expect(result.chargeStackY).toBe(0);
      expect(result.exportStackY).toBe(-700);
    });

    it('handles zero values', () => {
      const values = {
        solar: 0,
        grid: 0,
        battery: 0,
        load: 0,
      };

      const result = calculateStackedPositions(values);

      expect(result.solarStackY).toBe(0);
      expect(result.dischargeStackY).toBe(0);
      expect(result.importStackY).toBe(0);
      expect(result.chargeStackY).toBe(0);
      expect(result.exportStackY).toBe(0);
      expect(result.loadY).toBe(0);
    });
  });
});
