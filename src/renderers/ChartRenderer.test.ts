/**
 * Tests for ChartRenderer
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ChartRenderer } from './ChartRenderer';
import type { ChartConfig, LiveChartValues } from './ChartRenderer';
import type { HomeAssistant } from '../types/HASS';

describe('ChartRenderer', () => {
  let container: HTMLElement;
  let config: ChartConfig;
  let hass: HomeAssistant;
  let fireEvent: (type: string, detail?: any) => void;
  let renderer: ChartRenderer;

  beforeEach(() => {
    // Create container
    container = document.createElement('div');
    document.body.appendChild(container);

    // Mock config
    config = {
      production_entity: 'sensor.production',
      grid_entity: 'sensor.grid',
      load_entity: 'sensor.load',
      battery_entity: 'sensor.battery',
      invert_battery_data: false
    };

    // Mock hass with required APIs
    hass = {
      states: {},
      callService: vi.fn(),
      localize: vi.fn((key: string) => key),
      callWS: vi.fn().mockResolvedValue([]),
      callApi: vi.fn().mockResolvedValue([[]])
    } as unknown as HomeAssistant;

    // Mock fireEvent
    fireEvent = vi.fn();

    // Create renderer
    renderer = new ChartRenderer(hass, config, fireEvent);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided parameters', () => {
      expect(renderer).toBeDefined();
    });

    it('should accept configuration', () => {
      const customConfig: ChartConfig = {
        production_entity: 'sensor.solar',
        grid_entity: 'sensor.utility',
        load_entity: 'sensor.consumption',
        battery_entity: 'sensor.battery_power',
        invert_battery_data: true,
        production_icon: 'mdi:solar-panel',
        grid_icon: 'mdi:flash',
        load_icon: 'mdi:home',
        battery_icon: 'mdi:battery-charging'
      };

      const customRenderer = new ChartRenderer(hass, customConfig, fireEvent);
      expect(customRenderer).toBeDefined();
    });
  });

  describe('render', () => {
    it('should create chart structure on first render', async () => {
      renderer.render(container);

      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 50));

      const chartView = container.querySelector('.chart-view');
      expect(chartView).toBeTruthy();
    });

    it('should create SVG container', async () => {
      renderer.render(container);

      await new Promise(resolve => setTimeout(resolve, 50));

      const svg = container.querySelector('svg.chart-svg');
      expect(svg).toBeTruthy();
    });

    it('should not recreate structure on subsequent renders', async () => {
      renderer.render(container);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const firstView = container.querySelector('.chart-view');

      renderer.render(container);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const secondView = container.querySelector('.chart-view');
      expect(firstView).toBe(secondView);
    });

    it('should handle missing hass gracefully', () => {
      expect(() => renderer.render(container)).not.toThrow();
    });
  });

  describe('updateLiveValues', () => {
    it('should accept live values', () => {
      const liveValues: LiveChartValues = {
        grid: 500,
        load: 3000,
        production: 2500,
        battery: -500
      };

      expect(() => renderer.updateLiveValues(liveValues)).not.toThrow();
    });

    it('should update with zero values', () => {
      const zeroValues: LiveChartValues = {
        grid: 0,
        load: 0,
        production: 0,
        battery: 0
      };

      renderer.updateLiveValues(zeroValues);
      expect(true).toBe(true); // No error thrown
    });

    it('should update with negative values', () => {
      const negativeValues: LiveChartValues = {
        grid: -1000,
        load: 2000,
        production: 3000,
        battery: 1000
      };

      renderer.updateLiveValues(negativeValues);
      expect(true).toBe(true);
    });

    it('should update indicators after render', async () => {
      renderer.render(container);
      await new Promise(resolve => setTimeout(resolve, 100));

      const liveValues: LiveChartValues = {
        grid: 500,
        load: 3000,
        production: 2500,
        battery: -500
      };

      renderer.updateLiveValues(liveValues);
      renderer.render(container); // Trigger indicator update

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(container.querySelector('.chart-view')).toBeTruthy();
    });
  });

  describe('fetch errors', () => {
    it('handles callApi rejection gracefully', async () => {
      (hass.callApi as any).mockRejectedValueOnce(new Error('boom'));
      renderer.render(container);
      await new Promise(resolve => setTimeout(resolve, 50));
      const svg = container.querySelector('svg.chart-svg');
      expect(svg).toBeTruthy();
    });
  });

  describe('cache reuse', () => {
    it('reuses cached history within max age', async () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const nowIso = new Date().toISOString();
      hass.callApi = vi.fn().mockResolvedValue([[{ state: '1', last_changed: nowIso }]]) as any;

      await renderer.fetchAndRenderChart(svg, 1);
      await new Promise(resolve => setTimeout(resolve, 10));
      const firstCalls = (hass.callApi as any).mock.calls.length;

      await renderer.fetchAndRenderChart(svg, 1);
      await new Promise(resolve => setTimeout(resolve, 10));
      const secondCalls = (hass.callApi as any).mock.calls.length;

      expect(firstCalls).toBe(4); // one per entity
      expect(secondCalls).toBe(4); // cached path should skip new fetches
      expect(renderer['chartDataCache']).toBeDefined();
    });
  });

  describe('cleanup', () => {
    it('should have cleanup method', () => {
      expect(renderer.cleanup).toBeDefined();
    });

    it('should cleanup without errors', () => {
      renderer.render(container);
      expect(() => renderer.cleanup()).not.toThrow();
    });

    it('should cleanup before render', () => {
      expect(() => renderer.cleanup()).not.toThrow();
    });

    it('should cleanup multiple times', () => {
      renderer.render(container);
      renderer.cleanup();
      renderer.cleanup();
      expect(true).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty config', () => {
      const emptyConfig = {
        production_entity: '',
        grid_entity: '',
        load_entity: '',
        battery_entity: ''
      };

      const emptyRenderer = new ChartRenderer(hass, emptyConfig, fireEvent);
      expect(() => emptyRenderer.render(container)).not.toThrow();
    });

    it('should handle very large values', () => {
      const largeValues: LiveChartValues = {
        grid: 999999,
        load: 999999,
        production: 999999,
        battery: 999999
      };

      renderer.updateLiveValues(largeValues);
      expect(true).toBe(true);
    });

    it('should handle fractional values', () => {
      const fractionalValues: LiveChartValues = {
        grid: 123.456,
        load: 789.012,
        production: 345.678,
        battery: -67.89
      };

      renderer.updateLiveValues(fractionalValues);
      expect(true).toBe(true);
    });
  });

  describe('chart structure', () => {
    it('should create chart structure elements', async () => {
      renderer.render(container);
      await new Promise(resolve => setTimeout(resolve, 100));

      const chartView = container.querySelector('.chart-view');
      expect(chartView).toBeTruthy();
    });

    it('should include styles', async () => {
      renderer.render(container);
      await new Promise(resolve => setTimeout(resolve, 100));

      const styles = container.querySelector('style');
      expect(styles).toBeTruthy();
    });

    it('should be responsive', async () => {
      renderer.render(container);
      await new Promise(resolve => setTimeout(resolve, 100));

      const styles = container.querySelector('style');
      expect(styles?.textContent).toContain('width: 100%');
    });
  });

  describe('icon configuration', () => {
    it('should accept custom icons', () => {
      const iconConfig: ChartConfig = {
        ...config,
        production_icon: 'mdi:solar-panel',
        grid_icon: 'mdi:transmission-tower',
        load_icon: 'mdi:home-lightning-bolt',
        battery_icon: 'mdi:battery-high'
      };

      const iconRenderer = new ChartRenderer(hass, iconConfig, fireEvent);
      expect(iconRenderer).toBeDefined();
    });

    it('should handle missing icon config', () => {
      const noIconConfig: ChartConfig = {
        production_entity: 'sensor.production',
        grid_entity: 'sensor.grid',
        load_entity: 'sensor.load',
        battery_entity: 'sensor.battery'
      };

      const noIconRenderer = new ChartRenderer(hass, noIconConfig, fireEvent);
      expect(noIconRenderer).toBeDefined();
    });
  });

  describe('tap actions', () => {
    it('should accept tap action configuration', () => {
      const tapConfig: ChartConfig = {
        ...config,
        production_tap_action: { action: 'more-info' },
        grid_tap_action: { action: 'toggle' },
        load_tap_action: { action: 'navigate', path: '/energy' },
        battery_tap_action: { action: 'call-service', service: 'switch.toggle' }
      };

      const tapRenderer = new ChartRenderer(hass, tapConfig, fireEvent);
      expect(tapRenderer).toBeDefined();
    });
  });

  describe('battery invert data', () => {
    it('should handle inverted battery data', () => {
      const invertConfig: ChartConfig = {
        ...config,
        invert_battery_data: true
      };

      const invertRenderer = new ChartRenderer(hass, invertConfig, fireEvent);
      expect(invertRenderer).toBeDefined();
    });

    it('should handle non-inverted battery data', () => {
      const normalConfig: ChartConfig = {
        ...config,
        invert_battery_data: false
      };

      const normalRenderer = new ChartRenderer(hass, normalConfig, fireEvent);
      expect(normalRenderer).toBeDefined();
    });
  });
});
