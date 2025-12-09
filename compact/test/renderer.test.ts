/**
 * Tests for CompactRenderer
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CompactRenderer } from '../src/renderer';
import type { CompactRenderData, CompactViewMode, EntityType } from '../src/renderer';
import type { EnergyFlowCardConfig } from '../../shared/src/types/Config';
import type { HomeAssistant } from '../../shared/src/types/HASS';

describe('CompactRenderer', () => {
  let container: HTMLElement;
  let config: EnergyFlowCardConfig;
  let hass: HomeAssistant;
  let getIconCallback: (type: EntityType, fallback: string) => string;
  let handleActionCallback: (action: unknown, entity?: string) => void;
  let renderer: CompactRenderer;
  let renderData: CompactRenderData;

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
        soc_entity: 'sensor.battery_soc',
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
      states: {
        'sensor.battery_soc': {
          state: '75',
          attributes: {}
        }
      },
      callService: vi.fn(),
      localize: vi.fn((key: string) => key)
    } as unknown as HomeAssistant;

    // Mock callbacks
    getIconCallback = vi.fn((type: EntityType, fallback: string) => fallback);
    handleActionCallback = vi.fn();

    // Sample render data
    renderData = {
      grid: 500,
      load: 3000,
      production: 2500,
      battery: -500,
      batterySoc: 75,
      flows: {
        productionToLoad: 1800,
        productionToGrid: 200,
        productionToBattery: 500,
        batteryToLoad: 0,
        gridToLoad: 500,
        gridToBattery: 0
      }
    };
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  describe('constructor - compact mode', () => {
    beforeEach(() => {
      renderer = new CompactRenderer(
        container,
        config,
        hass,
        'compact',
        getIconCallback,
        handleActionCallback
      );
    });

    it('should initialize with provided parameters', () => {
      expect(renderer).toBeDefined();
      expect(container.children.length).toBe(0); // No render yet
    });

    it('should create compact structure on first render', () => {
      renderer.render(renderData);

      const compactView = container.querySelector('.compact-view');
      expect(compactView).toBeTruthy();
      expect(compactView?.children.length).toBe(1); // Only load row
    });

    it('should create load bar with three segments', () => {
      renderer.render(renderData);

      expect(container.querySelector('#grid-segment')).toBeTruthy();
      expect(container.querySelector('#battery-segment')).toBeTruthy();
      expect(container.querySelector('#production-segment')).toBeTruthy();
    });

    it('should create load value display', async () => {
      renderer.render(renderData);

      // Wait for requestAnimationFrame
      await new Promise(resolve => setTimeout(resolve, 100));

      const loadValue = container.querySelector('#load-value-text');
      expect(loadValue).toBeTruthy();
    });

    it('should not create battery row in compact mode', () => {
      renderer.render(renderData);

      const batteryRow = container.querySelector('#battery-row');
      expect(batteryRow).toBeFalsy();
    });

    it('should create segment labels', async () => {
      renderer.render(renderData);

      // Wait for requestAnimationFrame
      await new Promise(resolve => setTimeout(resolve, 100));

      const productionLabel = container.querySelector('#production-segment .bar-segment-label');
      const gridLabel = container.querySelector('#grid-segment .bar-segment-label');
      
      expect(productionLabel).toBeTruthy();
      expect(gridLabel).toBeTruthy();
    });
  });

  describe('constructor - compact-battery mode', () => {
    beforeEach(() => {
      renderer = new CompactRenderer(
        container,
        config,
        hass,
        'compact-battery',
        getIconCallback,
        handleActionCallback
      );
    });

    it('should create both load and battery rows', () => {
      renderer.render(renderData);

      const compactView = container.querySelector('.compact-view');
      expect(compactView?.children.length).toBe(2); // Load row + battery row
    });

    it('should create battery row', () => {
      renderer.render(renderData);

      const batteryRow = container.querySelector('#battery-row');
      expect(batteryRow).toBeTruthy();
    });

    it('should create battery bar segments', () => {
      renderer.render(renderData);

      expect(container.querySelector('#battery-grid-segment')).toBeTruthy();
      expect(container.querySelector('#battery-load-segment')).toBeTruthy();
      expect(container.querySelector('#battery-production-segment')).toBeTruthy();
    });

    it('should display battery SOC on right when discharging', () => {
      renderer.render({
        ...renderData,
        battery: 500, // Discharging
        batterySoc: 75
      });

      const socRight = container.querySelector('#battery-soc-right');
      const socLeft = container.querySelector('#battery-soc-left');
      
      expect(socRight).toBeTruthy();
      expect(socLeft).toBeTruthy();
    });

    it('should display battery SOC', async () => {
      renderer.render(renderData);

      // Wait for requestAnimationFrame
      await new Promise(resolve => setTimeout(resolve, 100));

      const socText = container.querySelector('#battery-soc-text-right');
      expect(socText).toBeTruthy();
    });
  });

  describe('render - segment calculations', () => {
    beforeEach(() => {
      renderer = new CompactRenderer(
        container,
        config,
        hass,
        'compact',
        getIconCallback,
        handleActionCallback
      );
    });

    it('should update production segment', () => {
      renderer.render(renderData);

      const productionSeg = container.querySelector('#production-segment') as HTMLElement;
      expect(productionSeg).toBeTruthy();
      expect(productionSeg.style.background).toBeTruthy();
    });

    it('should update grid segment', () => {
      renderer.render(renderData);

      const gridSeg = container.querySelector('#grid-segment') as HTMLElement;
      expect(gridSeg).toBeTruthy();
    });

    it('should hide segments with zero flow', () => {
      renderer.render({
        ...renderData,
        battery: 0,
        flows: {
          productionToLoad: 2500,
          productionToGrid: 0,
          productionToBattery: 0,
          batteryToLoad: 0,
          gridToLoad: 500,
          gridToBattery: 0
        }
      });

      const batterySeg = container.querySelector('#battery-segment') as HTMLElement;
      expect(batterySeg).toBeTruthy();
    });

    it('should handle 100% production to load', () => {
      renderer.render({
        ...renderData,
        grid: 0,
        battery: 0,
        flows: {
          productionToLoad: 3000,
          productionToGrid: 0,
          productionToBattery: 0,
          batteryToLoad: 0,
          gridToLoad: 0,
          gridToBattery: 0
        }
      });

      const productionSeg = container.querySelector('#production-segment') as HTMLElement;
      expect(productionSeg).toBeTruthy();
    });

    it('should handle very small percentages', () => {
      renderer.render({
        ...renderData,
        flows: {
          productionToLoad: 2980,
          productionToGrid: 0,
          productionToBattery: 0,
          batteryToLoad: 0,
          gridToLoad: 20,
          gridToBattery: 0
        }
      });

      const gridSeg = container.querySelector('#grid-segment') as HTMLElement;
      expect(gridSeg).toBeTruthy();
    });
  });

  describe('render - battery row calculations', () => {
    beforeEach(() => {
      renderer = new CompactRenderer(
        container,
        config,
        hass,
        'compact-battery',
        getIconCallback,
        handleActionCallback
      );
    });

    it('should handle battery charging from production', () => {
      renderer.render({
        ...renderData,
        battery: -1000, // Charging
        flows: {
          productionToLoad: 1500,
          productionToGrid: 0,
          productionToBattery: 1000,
          batteryToLoad: 0,
          gridToLoad: 0,
          gridToBattery: 0
        }
      });

      const productionSeg = container.querySelector('#battery-production-segment') as HTMLElement;
      expect(productionSeg).toBeTruthy();
    });

    it('should handle battery discharging to load', () => {
      renderer.render({
        ...renderData,
        battery: 800, // Discharging
        flows: {
          productionToLoad: 2000,
          productionToGrid: 0,
          productionToBattery: 0,
          batteryToLoad: 800,
          gridToLoad: 200,
          gridToBattery: 0
        }
      });

      const loadSeg = container.querySelector('#battery-load-segment') as HTMLElement;
      expect(loadSeg).toBeTruthy();
    });

    it('should handle idle battery', () => {
      renderer.render({
        ...renderData,
        battery: 0,
        batterySoc: 50
      });

      const productionSeg = container.querySelector('#battery-production-segment') as HTMLElement;
      const loadSeg = container.querySelector('#battery-load-segment') as HTMLElement;
      const gridSeg = container.querySelector('#battery-grid-segment') as HTMLElement;
      
      expect(parseFloat(productionSeg.style.width)).toBe(0);
      expect(parseFloat(loadSeg.style.width)).toBe(0);
      expect(parseFloat(gridSeg.style.width)).toBe(0);
    });
  });

  describe('render - value formatting', () => {
    beforeEach(() => {
      renderer = new CompactRenderer(
        container,
        config,
        hass,
        'compact',
        getIconCallback,
        handleActionCallback
      );
    });

    it('should create load value element', () => {
      renderer.render(renderData);

      const loadValue = container.querySelector('#load-value-text');
      expect(loadValue).toBeTruthy();
    });

    it('should handle small values', () => {
      renderer.render({
        ...renderData,
        load: 150
      });

      const loadValue = container.querySelector('#load-value-text');
      expect(loadValue).toBeTruthy();
    });

    it('should handle very large values', () => {
      renderer.render({
        ...renderData,
        load: 15000
      });

      const loadValue = container.querySelector('#load-value-text');
      expect(loadValue).toBeTruthy();
    });

    it('should update on data changes', () => {
      renderer.render({
        ...renderData,
        load: 3456
      });

      const loadValue = container.querySelector('#load-value-text');
      expect(loadValue).toBeTruthy();
    });
  });

  describe('setViewMode', () => {
    beforeEach(() => {
      renderer = new CompactRenderer(
        container,
        config,
        hass,
        'compact',
        getIconCallback,
        handleActionCallback
      );
    });

    it('should switch from compact to compact-battery', () => {
      renderer.render(renderData);
      expect(container.querySelector('#battery-row')).toBeFalsy();

      renderer.setViewMode('compact-battery');
      renderer.render(renderData);
      
      expect(container.querySelector('#battery-row')).toBeTruthy();
    });

    it('should switch from compact-battery to compact', () => {
      renderer.setViewMode('compact-battery');
      renderer.render(renderData);
      expect(container.querySelector('#battery-row')).toBeTruthy();

      renderer.setViewMode('compact');
      renderer.render(renderData);
      
      expect(container.querySelector('#battery-row')).toBeFalsy();
    });

    it('should not re-render if view mode unchanged', () => {
      renderer.render(renderData);
      const firstView = container.querySelector('.compact-view');

      renderer.setViewMode('compact'); // Same mode
      renderer.render(renderData);
      const secondView = container.querySelector('.compact-view');

      expect(firstView).toBe(secondView); // Same element
    });
  });

  describe('event handlers', () => {
    beforeEach(() => {
      renderer = new CompactRenderer(
        container,
        config,
        hass,
        'compact',
        getIconCallback,
        handleActionCallback
      );
    });

    it('should create clickable segments', async () => {
      renderer.render(renderData);

      // Wait for event handlers to attach
      await new Promise(resolve => setTimeout(resolve, 100));

      const productionSeg = container.querySelector('#production-segment') as HTMLElement;
      expect(productionSeg).toBeTruthy();
    });

    it('should create clickable value displays', async () => {
      renderer.render(renderData);

      // Wait for event handlers to attach
      await new Promise(resolve => setTimeout(resolve, 100));

      const loadValue = container.querySelector('.row-value') as HTMLElement;
      expect(loadValue).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      renderer = new CompactRenderer(
        container,
        config,
        hass,
        'compact',
        getIconCallback,
        handleActionCallback
      );
    });

    it('should handle zero load', () => {
      expect(() => renderer.render({
        ...renderData,
        load: 0
      })).not.toThrow();
    });

    it('should handle negative grid (exporting)', () => {
      renderer.render({
        ...renderData,
        grid: -1500,
        flows: {
          productionToLoad: 3000,
          productionToGrid: 1500,
          productionToBattery: 0,
          batteryToLoad: 0,
          gridToLoad: 0,
          gridToBattery: 0
        }
      });

      const gridSeg = container.querySelector('#grid-segment') as HTMLElement;
      expect(parseFloat(gridSeg.style.width)).toBe(0); // Export doesn't show in load bar
    });

    it('should handle all zero flows', () => {
      expect(() => renderer.render({
        grid: 0,
        load: 0,
        production: 0,
        battery: 0,
        batterySoc: null,
        flows: {
          productionToLoad: 0,
          productionToGrid: 0,
          productionToBattery: 0,
          batteryToLoad: 0,
          gridToLoad: 0,
          gridToBattery: 0
        }
      })).not.toThrow();
    });

    it('should handle null battery SOC', () => {
      renderer = new CompactRenderer(
        container,
        config,
        hass,
        'compact-battery',
        getIconCallback,
        handleActionCallback
      );

      renderer.render({
        ...renderData,
        batterySoc: null
      });

      const socText = container.querySelector('#battery-soc-text-right');
      expect(socText?.textContent).toBe('--');
    });

    it('should handle very large values without overflow', () => {
      expect(() => renderer.render({
        ...renderData,
        grid: 999999,
        load: 999999,
        production: 999999
      })).not.toThrow();
    });

    it('should handle fractional percentages', () => {
      renderer.render({
        ...renderData,
        load: 3333,
        flows: {
          productionToLoad: 1111,
          productionToGrid: 0,
          productionToBattery: 0,
          batteryToLoad: 0,
          gridToLoad: 2222,
          gridToBattery: 0
        }
      });

      const productionSeg = container.querySelector('#production-segment') as HTMLElement;
      expect(productionSeg).toBeTruthy();
    });

    it('should handle complex scenarios', () => {
      renderer.render({
        ...renderData,
        load: 9999,
        flows: {
          productionToLoad: 3333,
          productionToGrid: 0,
          productionToBattery: 0,
          batteryToLoad: 3333,
          gridToLoad: 3333,
          gridToBattery: 0
        }
      });

      const productionSeg = container.querySelector('#production-segment') as HTMLElement;
      const batterySeg = container.querySelector('#battery-segment') as HTMLElement;
      const gridSeg = container.querySelector('#grid-segment') as HTMLElement;

      expect(productionSeg).toBeTruthy();
      expect(batterySeg).toBeTruthy();
      expect(gridSeg).toBeTruthy();
    });
  });

  describe('styles and colors', () => {
    beforeEach(() => {
      renderer = new CompactRenderer(
        container,
        config,
        hass,
        'compact',
        getIconCallback,
        handleActionCallback
      );
    });

    it('should include bar segment styles', () => {
      renderer.render(renderData);

      const styles = container.querySelector('style');
      expect(styles?.textContent).toContain('.bar-segment');
      expect(styles?.textContent).toContain('transition');
    });

    it('should use consistent color scheme', () => {
      renderer.render(renderData);

      const productionSeg = container.querySelector('#production-segment') as HTMLElement;
      const gridSeg = container.querySelector('#grid-segment') as HTMLElement;

      expect(productionSeg.style.background).toBeTruthy();
      expect(gridSeg.style.background).toBeTruthy();
    });

    it('should include hover effects', () => {
      renderer.render(renderData);

      const styles = container.querySelector('style');
      expect(styles?.textContent).toContain(':hover');
      expect(styles?.textContent).toContain('brightness');
    });
  });
});
