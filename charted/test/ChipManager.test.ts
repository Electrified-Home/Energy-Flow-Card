import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChipManager } from '../src/ChipManager';
import { HassObservable } from '../../shared/src/utils/HassObservable';
import type { ChartedCardConfig, HistoricalData } from '../src/types';
import type { HomeAssistant } from '../../shared/src/types/HASS';

describe('ChipManager', () => {
  let chipManager: ChipManager;
  let hassObservable: HassObservable;
  let mockChart: any;
  let mockConfig: ChartedCardConfig;
  let mockHass: HomeAssistant;

  beforeEach(() => {
    // Mock ECharts instance
    mockChart = {
      getOption: vi.fn(() => ({ series: [] })),
      setOption: vi.fn(),
    };

    // Mock config
    mockConfig = {
      type: 'custom:energy-flow-charted-card',
      hours_to_show: 24,
      points_per_hour: 12,
      entities: {
        solar: 'sensor.solar_power',
        grid: 'sensor.grid_power',
        battery: 'sensor.battery_power',
        load: 'sensor.load_power',
      },
      time_bands: [],
    };

    // Mock hass
    mockHass = {
      states: {
        'sensor.solar_power': { state: '1500', entity_id: 'sensor.solar_power' },
        'sensor.grid_power': { state: '200', entity_id: 'sensor.grid_power' },
        'sensor.battery_power': { state: '-500', entity_id: 'sensor.battery_power' },
        'sensor.load_power': { state: '1200', entity_id: 'sensor.load_power' },
      },
    } as any;

    hassObservable = new HassObservable();
    hassObservable.updateHass(mockHass);

    chipManager = new ChipManager(hassObservable, mockConfig, mockChart);
  });

  describe('initialization', () => {
    it('subscribes to all configured entities', () => {
      expect(hassObservable.subscriptionCount).toBe(4);
    });

    it('initializes with historical data', () => {
      const historicalData: HistoricalData = {
        solar: [{ start: 1000, end: 2000, mean: 1500 }],
        grid: [{ start: 1000, end: 2000, mean: 200 }],
        battery: [{ start: 1000, end: 2000, mean: -500 }],
        load: [{ start: 1000, end: 2000, mean: 1200 }],
      };

      chipManager.initialize(historicalData);
      // Verify liveValues are set (internal state, tested via renderChips behavior)
      expect(chipManager['liveValues'].load).toBe(1200);
    });
  });

  describe('live updates', () => {
    it('emits live debug payload on render', async () => {
      let payload: any;
      chipManager = new ChipManager(hassObservable, mockConfig, mockChart, (p) => payload = p);

      const historicalData: HistoricalData = {
        solar: [{ start: 1000, end: 2000, mean: 1500 }],
        grid: [{ start: 1000, end: 2000, mean: 200 }],
        battery: [{ start: 1000, end: 2000, mean: -500 }],
        load: [{ start: 1000, end: 2000, mean: 1200 }],
      };
      chipManager.initialize(historicalData);

      mockChart.getOption.mockReturnValue({
        series: [
          { name: 'Solar' },
          { name: 'Discharge' },
          { name: 'Import' },
          { name: 'Charge' },
          { name: 'Export' },
          { name: 'Load' },
        ],
      });

      mockChart.setOption.mockClear();
      hassObservable.updateHass(mockHass);
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(payload).toBeDefined();
      expect(payload.liveValues.load).toBeGreaterThan(0);
      expect(payload.chipPositions).toBeDefined();
    });
    it('batches multiple entity updates into single render', async () => {
      const historicalData: HistoricalData = {
        solar: [{ start: 1000, end: 2000, mean: 1500 }],
        grid: [{ start: 1000, end: 2000, mean: 200 }],
        battery: [{ start: 1000, end: 2000, mean: -500 }],
        load: [{ start: 1000, end: 2000, mean: 1200 }],
      };
      chipManager.initialize(historicalData);

      // Mock getOption to return valid series and x-axis for chip placement
      mockChart.getOption.mockReturnValue({
        series: [
          { name: 'Solar' },
          { name: 'Discharge' },
          { name: 'Import' },
          { name: 'Charge' },
          { name: 'Export' },
          { name: 'Load' },
        ],
        xAxis: { data: [1000, 2000] },
      });

      // Ignore the initialize call; focus on batched updates
      mockChart.setOption.mockClear();

      // Trigger multiple entity changes
      mockHass.states['sensor.solar_power'].state = '2000';
      hassObservable.updateHass(mockHass);

      mockHass.states['sensor.grid_power'].state = '300';
      hassObservable.updateHass(mockHass);

      // Wait for requestAnimationFrame batching
      await new Promise(resolve => setTimeout(resolve, 20));

      // Should only call setOption once (batched)
      expect(mockChart.setOption).toHaveBeenCalledTimes(1);
    });

    it('updates chip values when entity states change', async () => {
      const historicalData: HistoricalData = {
        solar: [{ start: 1000, end: 2000, mean: 1000 }],
        grid: [{ start: 1000, end: 2000, mean: 0 }],
        battery: [{ start: 1000, end: 2000, mean: 0 }],
        load: [{ start: 1000, end: 2000, mean: 1000 }],
      };
      chipManager.initialize(historicalData);

      mockChart.getOption.mockReturnValue({
        series: [
          { name: 'Solar' },
          { name: 'Discharge' },
          { name: 'Import' },
          { name: 'Charge' },
          { name: 'Export' },
          { name: 'Load' },
        ],
        xAxis: { data: [1000, 2000] },
      });

      mockChart.setOption.mockClear();

      // Change entity state
      mockHass.states['sensor.solar_power'].state = '3000';
      hassObservable.updateHass(mockHass);

      await new Promise(resolve => setTimeout(resolve, 20));

      // Verify setOption was called with updated values
      expect(mockChart.setOption).toHaveBeenCalled();
      const lastCall = mockChart.setOption.mock.calls.at(-1)?.[0];
      expect(lastCall?.series).toBeDefined();
      expect(lastCall?.series.length).toBe(6);
    });
  });

  describe('disposal', () => {
    it('unsubscribes from all entities', () => {
      expect(hassObservable.subscriptionCount).toBe(4);
      
      chipManager.dispose();
      
      expect(hassObservable.subscriptionCount).toBe(0);
    });

    it('cancels pending animation frame', () => {
      const rafSpy = vi.spyOn(global, 'cancelAnimationFrame');
      
      // Trigger update to schedule RAF
      mockHass.states['sensor.solar_power'].state = '2000';
      hassObservable.updateHass(mockHass);
      
      chipManager.dispose();
      
      expect(rafSpy).toHaveBeenCalled();
      rafSpy.mockRestore();
    });
  });
});
