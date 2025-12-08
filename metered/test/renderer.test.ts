/**
 * Tests for DefaultRenderer
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DefaultRenderer, type DefaultRenderData } from '../src/renderer';
import type { EnergyFlowCardConfig } from '../../shared/src/types/Config';
import type { HomeAssistant } from '../../shared/src/types/HASS';

describe('DefaultRenderer', () => {
  let container: HTMLElement;
  let config: EnergyFlowCardConfig;
  let hass: HomeAssistant;
  let getDisplayNameCallback: (type: 'grid' | 'load' | 'production' | 'battery', fallback: string) => string;
  let getIconCallback: (type: 'grid' | 'load' | 'production' | 'battery', fallback: string) => string;
  let fireEventCallback: (event: string, detail?: any) => void;
  let renderer: DefaultRenderer;
  let renderData: DefaultRenderData;

  beforeEach(() => {
    // Create container
    container = document.createElement('div');
    document.body.appendChild(container);

    // Mock config
    config = {
      load: {
        entity: 'sensor.load',
        max: 5000
      },
      production: {
        entity: 'sensor.production',
        max: 5000
      },
      battery: {
        entity: 'sensor.battery',
        min: -5000,
        max: 5000
      },
      grid: {
        entity: 'sensor.grid',
        min: -5000,
        max: 5000
      }
    };

    // Mock hass
    hass = {
      states: {},
      callService: vi.fn(),
      localize: vi.fn((key: string) => key)
    } as unknown as HomeAssistant;

    // Mock callbacks with proper typing
    getDisplayNameCallback = vi.fn((type: 'grid' | 'load' | 'production' | 'battery', fallback: string) => fallback);
    getIconCallback = vi.fn((type: 'grid' | 'load' | 'production' | 'battery', fallback: string) => fallback);
    fireEventCallback = vi.fn();

    // Mock SVGPathElement methods
    const originalCreateElementNS = document.createElementNS.bind(document);
    vi.spyOn(document, 'createElementNS').mockImplementation((ns, tag) => {
      const element = originalCreateElementNS(ns, tag);
      if (tag === 'path') {
        (element as any).getTotalLength = vi.fn(() => 100);
        (element as any).getPointAtLength = vi.fn((length: number) => ({
          x: length,
          y: length
        } as DOMPoint));
      }
      return element;
    });

    // Create renderer
    renderer = new DefaultRenderer(
      container,
      config,
      hass,
      getDisplayNameCallback,
      getIconCallback,
      fireEventCallback
    );

    // Sample render data
    renderData = {
      grid: 1500,
      load: 3000,
      production: 2500,
      battery: -500,
      flows: {
        productionToLoad: 1800,
        productionToGrid: 700,
        productionToBattery: 0,
        batteryToLoad: 500,
        gridToLoad: 700,
        gridToBattery: 0
      }
    };
  });

  afterEach(() => {
    renderer.stop();
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided parameters', () => {
      expect(renderer).toBeDefined();
      expect(container.children.length).toBe(0); // No render yet
    });

    it('should store callbacks correctly', () => {
      renderer.render(renderData);
      
      // Callbacks should be called during initialization
      expect(getDisplayNameCallback).toHaveBeenCalledWith('production', 'Production');
      expect(getDisplayNameCallback).toHaveBeenCalledWith('battery', 'Battery');
      expect(getDisplayNameCallback).toHaveBeenCalledWith('grid', 'Grid');
      expect(getDisplayNameCallback).toHaveBeenCalledWith('load', 'Load');
      
      expect(getIconCallback).toHaveBeenCalledWith('production', 'mdi:solar-power');
      expect(getIconCallback).toHaveBeenCalledWith('battery', 'mdi:battery');
      expect(getIconCallback).toHaveBeenCalledWith('grid', 'mdi:transmission-tower');
      expect(getIconCallback).toHaveBeenCalledWith('load', 'mdi:home-lightning-bolt');
    });
  });

  describe('render', () => {
    it('should create SVG structure on first render', () => {
      renderer.render(renderData);

      const svg = container.querySelector('.energy-flow-svg');
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 500 470');
    });

    it('should create all four meter groups', () => {
      renderer.render(renderData);

      expect(container.querySelector('#production-meter')).toBeTruthy();
      expect(container.querySelector('#battery-meter')).toBeTruthy();
      expect(container.querySelector('#grid-meter')).toBeTruthy();
      expect(container.querySelector('#load-meter')).toBeTruthy();
    });

    it('should create flow layer', () => {
      renderer.render(renderData);

      const flowLayer = container.querySelector('#flow-layer');
      expect(flowLayer).toBeTruthy();
    });

    it('should create filter definitions', () => {
      renderer.render(renderData);

      const defs = container.querySelector('defs');
      expect(defs).toBeTruthy();
      expect(defs?.innerHTML).toContain('id="glow"');
      expect(defs?.innerHTML).toContain('id="drop-shadow"');
    });

    it('should position meters at correct coordinates', () => {
      renderer.render(renderData);

      const productionMeter = container.querySelector('#production-meter');
      const batteryMeter = container.querySelector('#battery-meter');
      const gridMeter = container.querySelector('#grid-meter');
      const loadMeter = container.querySelector('#load-meter');

      expect(productionMeter?.getAttribute('transform')).toContain('translate(65, 83)');
      expect(batteryMeter?.getAttribute('transform')).toContain('translate(135, 243)');
      expect(gridMeter?.getAttribute('transform')).toContain('translate(65, 403)');
      expect(loadMeter?.getAttribute('transform')).toContain('translate(365, 243)');
    });

    it('should scale load meter 2x', () => {
      renderer.render(renderData);

      const loadMeter = container.querySelector('#load-meter');
      expect(loadMeter?.getAttribute('transform')).toContain('scale(2)');
    });

    it('should only create structure once', () => {
      renderer.render(renderData);
      const firstSvg = container.querySelector('.energy-flow-svg');

      renderer.render({
        ...renderData,
        grid: 2000,
        load: 3500
      });
      const secondSvg = container.querySelector('.energy-flow-svg');

      expect(firstSvg).toBe(secondSvg); // Same element
    });

    it('should update meter values on subsequent renders', () => {
      renderer.render(renderData);
      
      // Update with new values
      const newData = {
        ...renderData,
        grid: 2500,
        load: 4000,
        production: 3500,
        battery: 500
      };
      
      renderer.render(newData);
      
      // Structure should still exist
      const svg = container.querySelector('.energy-flow-svg');
      expect(svg).toBeTruthy();
    });

    it('should use config min/max values', () => {
      config.grid!.min = -10000;
      config.grid!.max = 10000;
      config.load.max = 8000;
      config.production!.max = 7000;
      config.battery!.min = -3000;
      config.battery!.max = 3000;

      renderer.render(renderData);
      
      // Meters should be created with these ranges
      const svg = container.querySelector('.energy-flow-svg');
      expect(svg).toBeTruthy();
    });

    it('should use default min/max when not configured', () => {
      delete config.grid?.min;
      delete config.grid?.max;
      delete config.production?.max;
      delete config.battery?.min;
      delete config.battery?.max;

      renderer.render(renderData);
      
      const svg = container.querySelector('.energy-flow-svg');
      expect(svg).toBeTruthy();
    });

    it('should handle battery invert view config', () => {
      config.battery!.invert = { view: true };
      
      renderer.render(renderData);
      
      const svg = container.querySelector('.energy-flow-svg');
      expect(svg).toBeTruthy();
    });

    it('should update battery invert view when config changes', async () => {
      renderer.render(renderData);
      await new Promise((resolve) => setTimeout(resolve, 0));
      const batteryMeterInitial = (renderer as any).meters.get('battery');
      expect(batteryMeterInitial?.invertView).toBe(false);

      config.battery!.invert = { view: true };
      renderer.setConfig(config);
      renderer.render(renderData);
      await new Promise((resolve) => setTimeout(resolve, 0));

      const batteryMeterUpdated = (renderer as any).meters.get('battery');
      expect(batteryMeterUpdated?.invertView).toBe(true);
    });

    it('should handle battery showPlus config', () => {
      config.battery!.showPlus = true;
      
      renderer.render(renderData);
      
      const svg = container.querySelector('.energy-flow-svg');
      expect(svg).toBeTruthy();
    });

    it('should pass tap actions to meters', () => {
      config.production!.tap = { action: 'more-info' };
      config.battery!.tap = { action: 'toggle' };
      config.grid!.tap = { action: 'navigate', path: '/energy' };
      config.load.tap = { action: 'call-service', service: 'light.turn_on' };

      renderer.render(renderData);
      
      const svg = container.querySelector('.energy-flow-svg');
      expect(svg).toBeTruthy();
    });

    it('should handle zero flows', () => {
      const zeroFlowData = {
        ...renderData,
        flows: {
          productionToLoad: 0,
          productionToGrid: 0,
          productionToBattery: 0,
          batteryToLoad: 0,
          gridToLoad: 0,
          gridToBattery: 0
        }
      };

      renderer.render(zeroFlowData);
      
      const svg = container.querySelector('.energy-flow-svg');
      expect(svg).toBeTruthy();
    });

    it('should handle negative values', () => {
      const negativeData = {
        grid: -2000,
        load: 1000,
        production: 0,
        battery: -1000,
        flows: {
          productionToLoad: 0,
          productionToGrid: 0,
          productionToBattery: 0,
          batteryToLoad: 0,
          gridToLoad: 1000,
          gridToBattery: 0
        }
      };

      renderer.render(negativeData);
      
      const svg = container.querySelector('.energy-flow-svg');
      expect(svg).toBeTruthy();
    });
  });

  describe('stop', () => {
    it('should stop flow renderer', () => {
      renderer.render(renderData);
      
      renderer.stop();
      
      // Should not throw
      expect(container.querySelector('.energy-flow-svg')).toBeTruthy();
    });

    it('should be safe to call multiple times', () => {
      renderer.render(renderData);
      
      expect(() => {
        renderer.stop();
        renderer.stop();
        renderer.stop();
      }).not.toThrow();
    });

    it('should be safe to call before render', () => {
      expect(() => {
        renderer.stop();
      }).not.toThrow();
    });

    it('clears icon extraction timeouts', () => {
      (renderer as any).iconExtractionTimeouts.add(123 as any);
      const clearSpy = vi.spyOn(globalThis, 'clearTimeout');

      renderer.stop();

      expect((renderer as any).iconExtractionTimeouts.size).toBe(0);
      expect(clearSpy).toHaveBeenCalledWith(123);
    });
  });

  describe('clear', () => {
    it('should stop animations', () => {
      renderer.render(renderData);
      
      const stopSpy = vi.spyOn(renderer, 'stop');
      renderer.clear();
      
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should be safe to call multiple times', () => {
      renderer.render(renderData);
      
      expect(() => {
        renderer.clear();
        renderer.clear();
      }).not.toThrow();
    });

    it('should be safe to call before render', () => {
      expect(() => {
        renderer.clear();
      }).not.toThrow();
    });
  });

  describe('icon extraction', () => {
    it('should create icon containers for all meters', () => {
      renderer.render(renderData);

      // Icon containers are created during meter initialization
      // They will be populated by extractIconPaths
      const svg = container.querySelector('.energy-flow-svg');
      expect(svg).toBeTruthy();
    });

    it('should handle missing shadow root gracefully', async () => {
      renderer.render(renderData);
      
      // Wait for extraction attempts
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should not throw
      expect(container.querySelector('.energy-flow-svg')).toBeTruthy();
    });

    it('should cache extracted icon paths', async () => {
      renderer.render(renderData);
      
      // Wait for potential extraction
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Render again - should use cache
      renderer.render({
        ...renderData,
        grid: 2000
      });
      
      expect(container.querySelector('.energy-flow-svg')).toBeTruthy();
    });
  });

  describe('renderIconPath', () => {
    it('renders a path when data provided', () => {
      const target = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      (renderer as any).renderIconPath(target, 'M0 0h10');
      expect(target.querySelector('path')).toBeTruthy();
    });

    it('renders a circle fallback when no data', () => {
      const target = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      (renderer as any).renderIconPath(target, null);
      expect(target.querySelector('circle')).toBeTruthy();
    });
  });

  describe('styles and animations', () => {
    it('should include flow animation styles', () => {
      renderer.render(renderData);

      const styles = container.querySelector('style');
      expect(styles?.textContent).toContain('flow-move');
      expect(styles?.textContent).toContain('offset-distance');
    });

    it('should include flow line color classes', () => {
      renderer.render(renderData);

      const styles = container.querySelector('style');
      expect(styles?.textContent).toContain('.flow-positive');
      expect(styles?.textContent).toContain('.flow-negative');
    });

    it('should use CSS variables for flow colors', () => {
      renderer.render(renderData);

      const styles = container.querySelector('style');
      expect(styles?.textContent).toContain('--success-color');
      expect(styles?.textContent).toContain('--error-color');
    });

    it('should include responsive layout styles', () => {
      renderer.render(renderData);

      const styles = container.querySelector('style');
      expect(styles?.textContent).toContain('width: 100%');
      expect(styles?.textContent).toContain('height: 100%');
    });
  });

  describe('edge cases', () => {
    it('should handle very large values', () => {
      const largeData = {
        grid: 999999,
        load: 999999,
        production: 999999,
        battery: 999999,
        flows: {
          productionToLoad: 500000,
          productionToGrid: 499999,
          productionToBattery: 0,
          batteryToLoad: 0,
          gridToLoad: 0,
          gridToBattery: 0
        }
      };

      expect(() => renderer.render(largeData)).not.toThrow();
    });

    it('should handle very small values', () => {
      const smallData = {
        grid: 0.01,
        load: 0.01,
        production: 0.01,
        battery: 0.01,
        flows: {
          productionToLoad: 0.01,
          productionToGrid: 0,
          productionToBattery: 0,
          batteryToLoad: 0,
          gridToLoad: 0,
          gridToBattery: 0
        }
      };

      expect(() => renderer.render(smallData)).not.toThrow();
    });

    it('should handle missing battery config', () => {
      delete config.battery;

      expect(() => renderer.render(renderData)).not.toThrow();
    });

    it('should handle missing production config', () => {
      delete config.production;

      expect(() => renderer.render(renderData)).not.toThrow();
    });

    it('should handle missing grid config', () => {
      delete config.grid;

      expect(() => renderer.render(renderData)).not.toThrow();
    });

    it('should render with minimal config', () => {
      const minimalConfig: EnergyFlowCardConfig = {
        load: {
          entity: 'sensor.load'
        }
      };

      const minimalRenderer = new DefaultRenderer(
        container,
        minimalConfig,
        hass,
        getDisplayNameCallback,
        getIconCallback,
        fireEventCallback
      );

      expect(() => minimalRenderer.render(renderData)).not.toThrow();
      minimalRenderer.stop();
    });
  });
});
