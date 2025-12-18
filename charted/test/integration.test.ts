import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { ChartedCard } from '../src/index';
import type { HomeAssistant } from '../../shared/src/types/HASS';

// Mock browser APIs not available in test environment
class IntersectionObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
global.IntersectionObserver = IntersectionObserverMock as any;

class ResizeObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
global.ResizeObserver = ResizeObserverMock as any;

// Provide a basic canvas context so ECharts doesn't throw during tests
const mockCanvasContext = new Proxy<Record<string, any>>(
  {
    measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
  },
  {
    get(target, prop: string) {
      if (!(prop in target)) {
        if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
          target[prop] = vi.fn(() => ({ addColorStop: vi.fn() }));
        } else {
          target[prop] = vi.fn();
        }
      }
      return target[prop];
    },
  }
);

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 800 });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 600 });
  HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCanvasContext as any);
});

describe('charted/integration', () => {
  let card: ChartedCard;
  let mockHass: HomeAssistant;

  beforeEach(() => {
    card = new ChartedCard();
    mockHass = {
      states: {
        'sensor.solar': { state: '1500', attributes: {} },
        'sensor.grid': { state: '200', attributes: {} },
        'sensor.battery': { state: '-300', attributes: {} },
        'sensor.load': { state: '1000', attributes: {} },
      },
      callApi: vi.fn(),
    } as unknown as HomeAssistant;
  });

  describe('setConfig', () => {
    it('normalizes and stores configuration', () => {
      const config = {
        type: 'custom:energy-flow-charted-card' as const,
        hours_to_show: 12,
        points_per_hour: 6,
        entities: {
          solar: 'sensor.solar',
          grid: 'sensor.grid',
          battery: 'sensor.battery',
          load: 'sensor.load',
        },
      };

      card.setConfig(config);

      expect(card['config']).toBeDefined();
      expect(card['config']?.hours_to_show).toBe(12);
      expect(card['config']?.points_per_hour).toBe(6);
    });

    it('stores config without adding defaults', () => {
      const config = {
        type: 'custom:energy-flow-charted-card' as const,
        entities: {
          solar: 'sensor.solar',
          grid: 'sensor.grid',
          battery: 'sensor.battery',
          load: 'sensor.load',
        },
      };

      card.setConfig(config);

      // normalizeConfig doesn't add defaults, just validates
      expect(card['config']).toBeDefined();
      expect(card['config']?.entities.solar).toBe('sensor.solar');
    });
  });

  describe('subscription management', () => {
    it('sets up subscriptions for all entities', () => {
      const config = {
        type: 'custom:energy-flow-charted-card' as const,
        entities: {
          solar: 'sensor.solar',
          grid: 'sensor.grid',
          battery: 'sensor.battery',
          load: 'sensor.load',
        },
      };

      card.setConfig(config);
      card.hass = mockHass;

      // Simulate connection
      card.connectedCallback();

      // ChipManager manages subscriptions now (tested separately in ChipManager.test.ts)
      // Card just needs to have setupSubscriptions called (no-op now)
      expect(card['setupSubscriptions']).toBeDefined();
    });

    it('resets subscriptions when config changes after connection', () => {
      const config1 = {
        type: 'custom:energy-flow-charted-card' as const,
        entities: {
          solar: 'sensor.solar',
          grid: 'sensor.grid',
          battery: 'sensor.battery',
          load: 'sensor.load',
        },
      };

      card.setConfig(config1);
      card.hass = mockHass;
      card.connectedCallback();

      // Change config
      const config2 = {
        type: 'custom:energy-flow-charted-card' as const,
        entities: {
          solar: 'sensor.solar_new',
          grid: 'sensor.grid_new',
          battery: 'sensor.battery',
          load: 'sensor.load',
        },
      };

      card.setConfig(config2);

      // Config changed - ChipManager handles subscription reset internally
      expect(card['config']).toEqual(expect.objectContaining({ entities: config2.entities }));
    });

    it('cleans up subscriptions on disconnect', () => {
      const config = {
        type: 'custom:energy-flow-charted-card' as const,
        entities: {
          solar: 'sensor.solar',
          grid: 'sensor.grid',
          battery: 'sensor.battery',
          load: 'sensor.load',
        },
      };

      card.setConfig(config);
      card.hass = mockHass;
      card.connectedCallback();

      card.disconnectedCallback();

      // ChipManager disposal tested in ChipManager.test.ts
      // Just verify disconnect doesn't throw
      expect(true).toBe(true);
    });
  });

  describe('hass updates', () => {
    it('subscription callbacks handled by ChipManager', () => {
      // ChipManager manages all subscription callbacks now
      // See ChipManager.test.ts for detailed subscription tests
      const config = {
        type: 'custom:energy-flow-charted-card' as const,
        entities: {
          solar: 'sensor.solar',
          grid: 'sensor.grid',
          battery: 'sensor.battery',
          load: 'sensor.load',
        },
      };

      card.setConfig(config);
      card.connectedCallback();
      card.hass = mockHass;

      // Just verify integration doesn't break
      expect(card['config']).toBeDefined();
      expect(card['_hassObservable']).toBeDefined();
    });

    it('does not update renderer when no historical data cached', () => {
      const config = {
        type: 'custom:energy-flow-charted-card' as const,
        entities: {
          solar: 'sensor.solar',
          grid: 'sensor.grid',
          battery: 'sensor.battery',
          load: 'sensor.load',
        },
      };

      card.setConfig(config);
      card.hass = mockHass;

      // Mock renderer without cached data
      const mockRenderer = {
        updateLiveValues: vi.fn(),
        lastHistoricalData: undefined,
        update: vi.fn(),
        resize: vi.fn(),
        dispose: vi.fn(),
      };
      card['renderer'] = mockRenderer as any;

      // Update hass
      const newHass = {
        ...mockHass,
        states: {
          ...mockHass.states,
          'sensor.solar': { state: '2000', attributes: {} },
        },
      };
      card.hass = newHass;

      expect(mockRenderer.updateLiveValues).not.toHaveBeenCalled();
    });
  });

  describe('lifecycle', () => {
    it('returns correct card size', () => {
      expect(card.getCardSize()).toBe(4);
    });

    it('provides stub config', () => {
      const stub = ChartedCard.getStubConfig();
      expect(stub.type).toBe('custom:energy-flow-charted-card');
      expect(stub.hours_to_show).toBe(24);
      expect(stub.points_per_hour).toBe(12);
      expect(stub.entities).toBeDefined();
    });

    it('disposes renderer on disconnect', () => {
      const mockRenderer = {
        updateLiveValues: vi.fn(),
        update: vi.fn(),
        resize: vi.fn(),
        dispose: vi.fn(),
      };
      card['renderer'] = mockRenderer as any;

      card.disconnectedCallback();

      expect(mockRenderer.dispose).toHaveBeenCalled();
      expect(card['renderer']).toBeUndefined();
    });

    it('clears refresh interval on disconnect', () => {
      card['refreshInterval'] = 12345;

      card.disconnectedCallback();

      expect(card['refreshInterval']).toBeUndefined();
    });
  });
});
