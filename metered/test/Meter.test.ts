/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { Meter } from '../src/Meter';

describe('Meter', () => {
  describe('Constructor and Initialization', () => {
    test('should initialize with basic unidirectional configuration', () => {
      const meter = new Meter('test', 100, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      expect(meter.id).toBe('test');
      expect(meter.value).toBe(100);
      expect(meter.min).toBe(0);
      expect(meter.max).toBe(1000);
      expect(meter.bidirectional).toBe(false);
      expect(meter.label).toBe('Test');
      expect(meter.icon).toBe('mdi:test');
      expect(meter.invertView).toBe(false);
      expect(meter.showPlus).toBe(false);
      expect(meter.element).toBe(null);
    });

    test('should initialize with bidirectional configuration', () => {
      const meter = new Meter('battery', 500, -1000, 1000, true, 'Battery', 'mdi:battery', 'WATTS');

      expect(meter.bidirectional).toBe(true);
      expect(meter.min).toBe(-1000);
      expect(meter.max).toBe(1000);
    });

    test('should initialize with optional parameters', () => {
      const meter = new Meter('grid', -200, -5000, 5000, true, 'Grid', 'mdi:grid', 'WATTS', true, true);

      expect(meter.invertView).toBe(true);
      expect(meter.showPlus).toBe(true);
    });

    test('should set geometry constants correctly', () => {
      const meter = new Meter('test', 0, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      expect(meter.radius).toBe(50);
      expect(meter.boxWidth).toBe(120);
      expect(meter.boxHeight).toBe(135);
      expect(meter.boxRadius).toBe(16);
      expect(meter.centerX).toBe(60); // boxWidth / 2
      expect(meter.centerY).toBe(75); // radius + 25
      expect(meter.offsetX).toBe(-60);
      expect(meter.offsetY).toBe(-75);
    });

    test('should initialize needle state', () => {
      const meter = new Meter('test', 500, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      expect(meter.needleState).toBeDefined();
      expect(meter.needleState.target).toBeGreaterThanOrEqual(0);
      expect(meter.needleState.current).toBe(0);
      expect(meter.needleState.ghost).toBe(0);
    });
  });

  describe('Value Management', () => {
    test('should update value via setter', () => {
      const meter = new Meter('test', 100, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      meter.value = 500;
      expect(meter.value).toBe(500);
    });

    test('should not trigger update when value unchanged', () => {
      const meter = new Meter('test', 100, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');
      const initialTarget = meter.needleState.target;

      meter.value = 100; // Same value
      expect(meter.needleState.target).toBe(initialTarget);
    });

    test('should update needle angle when value changes', () => {
      const meter = new Meter('test', 0, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');
      const initialTarget = meter.needleState.target;

      meter.value = 500; // 50% of max
      expect(meter.needleState.target).not.toBe(initialTarget);
      expect(meter.needleState.target).toBe(90); // 180 - (0.5 * 180) = 90
    });

    test('should handle negative values in bidirectional mode', () => {
      const meter = new Meter('battery', 0, -1000, 1000, true, 'Battery', 'mdi:battery', 'WATTS');

      meter.value = -500;
      expect(meter.value).toBe(-500);
      expect(meter.displayValue).toBe(-500);
    });
  });

  describe('Display Value and Invert View', () => {
    test('should return normal value when invertView is false', () => {
      const meter = new Meter('test', 100, 0, 1000, false, 'Test', 'mdi:test', 'WATTS', false);

      expect(meter.displayValue).toBe(100);
    });

    test('should return inverted value when invertView is true', () => {
      const meter = new Meter('test', 100, 0, 1000, false, 'Test', 'mdi:test', 'WATTS', true);

      expect(meter.displayValue).toBe(-100);
    });

    test('should toggle invertView', () => {
      const meter = new Meter('test', 100, 0, 1000, false, 'Test', 'mdi:test', 'WATTS',false);

      expect(meter.invertView).toBe(false);
      expect(meter.displayValue).toBe(100);

      meter.invertView = true;
      expect(meter.invertView).toBe(true);
      expect(meter.displayValue).toBe(-100);
    });

    test('should not trigger update when invertView unchanged', () => {
      const meter = new Meter('test', 100, 0, 1000, false, 'Test', 'mdi:test', 'WATTS',false);
      const initialTarget = meter.needleState.target;

      meter.invertView = false; // Same value
      expect(meter.needleState.target).toBe(initialTarget);
    });

    test('should update needle angle when invertView changes', () => {
      const meter = new Meter('battery', 500, -1000, 1000, true, 'Battery', 'mdi:battery', 'WATTS', false);
      const targetWhenNormal = meter.needleState.target;

      meter.invertView = true;
      expect(meter.needleState.target).not.toBe(targetWhenNormal);
    });
  });

  describe('Value Formatting', () => {
    test('should format positive values without sign by default', () => {
      const meter = new Meter('test', 100, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      expect(meter._formatValueText()).toBe('100');
    });

    test('should format positive values with + when showPlus is true', () => {
      const meter = new Meter('test', 100, 0, 1000, false, 'Test', 'mdi:test', 'WATTS', false, true);

      expect(meter._formatValueText()).toBe('+100\u00A0');
    });

    test('should format negative values with sign and space', () => {
      const meter = new Meter('battery', -100, -1000, 1000, true, 'Battery', 'mdi:battery', 'WATTS');

      expect(meter._formatValueText()).toBe('-100\u00A0');
    });

    test('should format zero without sign', () => {
      const meter = new Meter('test', 0, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      expect(meter._formatValueText()).toBe('0');
    });

    test('should format inverted negative as positive with sign when showPlus enabled', () => {
      const meter = new Meter('battery', -100, -1000, 1000, true, 'Battery', 'mdi:battery', 'WATTS', true, true);

      expect(meter._formatValueText()).toBe('+100\u00A0');
    });

    test('should round to nearest integer', () => {
      const meter = new Meter('test', 123.7, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      expect(meter._formatValueText()).toBe('124');
    });
  });

  describe('Needle Angle Calculation', () => {
    test('should calculate angle for unidirectional meter at 0%', () => {
      const meter = new Meter('test', 0, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      expect(meter.needleState.target).toBe(180); // 180 - (0 * 180)
    });

    test('should calculate angle for unidirectional meter at 50%', () => {
      const meter = new Meter('test', 500, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      expect(meter.needleState.target).toBe(90); // 180 - (0.5 * 180)
    });

    test('should calculate angle for unidirectional meter at 100%', () => {
      const meter = new Meter('test', 1000, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      expect(meter.needleState.target).toBe(0); // 180 - (1 * 180)
    });

    test('should calculate angle for bidirectional meter at min', () => {
      const meter = new Meter('battery', -1000, -1000, 1000, true, 'Battery', 'mdi:battery', 'WATTS');

      expect(meter.needleState.target).toBe(180); // 180 - (0 * 180)
    });

    test('should calculate angle for bidirectional meter at zero', () => {
      const meter = new Meter('battery', 0, -1000, 1000, true, 'Battery', 'mdi:battery', 'WATTS');

      expect(meter.needleState.target).toBe(90); // 180 - (0.5 * 180)
    });

    test('should calculate angle for bidirectional meter at max', () => {
      const meter = new Meter('battery', 1000, -1000, 1000, true, 'Battery', 'mdi:battery', 'WATTS');

      expect(meter.needleState.target).toBe(0); // 180 - (1 * 180)
    });

    test('should clamp angle for values exceeding max', () => {
      const meter = new Meter('test', 2000, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      expect(meter.needleState.target).toBe(0); // Clamped to max (100%)
    });

    test('should clamp angle for values below min', () => {
      const meter = new Meter('test', -500, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      expect(meter.needleState.target).toBe(180); // Clamped to min (0%)
    });
  });

  describe('SVG Generation', () => {
    test('should generate valid SVG element', () => {
      const meter = new Meter('test', 100, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');
      const element = meter.createElement();
      const svg = element.outerHTML;

      expect(svg).toContain('<g transform=');
      expect(svg).toContain('id="clip-test-local"');
      expect(svg).toContain('id="needle-test"');
      expect(svg).toContain('id="ghost-needle-test"');
      expect(svg).toContain('id="value-test"');
      expect(svg).toContain('id="dimmer-test"');
      expect(svg).toContain('id="icon-source-test"');
      expect(svg).toContain('id="icon-display-test"');
    });

    test('should include meter label in SVG', () => {
      const meter = new Meter('production', 500, 0, 5000, false, 'Production', 'mdi:solar-power', 'WATTS');
      const element = meter.createElement();
      const svg = element.outerHTML;

      expect(svg).toContain('>Production</text>');
    });

    test('should include meter icon in SVG', () => {
      const meter = new Meter('battery', 0, -1000, 1000, true, 'Battery', 'mdi:battery', 'WATTS');
      const element = meter.createElement();
      const svg = element.outerHTML;

      expect(svg).toContain('icon="mdi:battery"');
    });

    test('should include formatted value in SVG', () => {
      const meter = new Meter('test', 1234, 0, 5000, false, 'Test', 'mdi:test', 'WATTS');
      const element = meter.createElement();
      const svg = element.outerHTML;

      expect(svg).toContain('>1234</text>');
    });

    test('should generate tick marks for unidirectional meter', () => {
      const meter = new Meter('test', 500, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');
      const element = meter.createElement();
      const svg = element.outerHTML;

      // Unidirectional should have 3 ticks: 0, max/2, max
      const tickCount = (svg.match(/<line x1="\d+/g) || []).length;
      expect(tickCount).toBeGreaterThanOrEqual(3); // Ticks + zero line + needles
    });

    test('should generate tick marks for bidirectional meter', () => {
      const meter = new Meter('battery', 0, -1000, 1000, true, 'Battery', 'mdi:battery', 'WATTS');
      const element = meter.createElement();
      const svg = element.outerHTML;

      // Bidirectional should have 3 ticks: min, 0, max
      const tickCount = (svg.match(/<line x1="\d+/g) || []).length;
      expect(tickCount).toBeGreaterThanOrEqual(3);
    });

    test('should initialize needle state to current angle when creating SVG', () => {
      const meter = new Meter('test', 500, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');
      
      meter.createElement();

      expect(meter.needleState.current).toBe(meter.needleState.target);
      expect(meter.needleState.ghost).toBe(meter.needleState.target);
    });
  });

  describe('Animation Control', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      window.requestAnimationFrame = vi.fn((cb) => {
        setTimeout(() => cb(Date.now()), 16);
        return 1;
      }) as unknown as typeof requestAnimationFrame;
      window.cancelAnimationFrame = vi.fn();
    });

    test('should start animation', () => {
      const meter = new Meter('test', 100, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      meter.startAnimation();

      expect(requestAnimationFrame).toHaveBeenCalled();
    });

    test('should not start animation if already animating', () => {
      const meter = new Meter('test', 100, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      meter.startAnimation();
      const callCount = (requestAnimationFrame as unknown as ReturnType<typeof vi.fn>).mock.calls.length;
      
      meter.startAnimation(); // Try to start again

      expect((requestAnimationFrame as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount);
    });

    test('should stop animation', () => {
      const meter = new Meter('test', 100, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      meter.startAnimation();
      meter.stopAnimation();

      expect(cancelAnimationFrame).toHaveBeenCalled();
    });

    test('should clear animation state when stopped', () => {
      const meter = new Meter('test', 100, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      meter.startAnimation();
      meter.stopAnimation();

      expect(meter['_animationFrameId']).toBe(null);
      expect(meter['_lastAnimationTime']).toBe(null);
    });

    test('stopAnimation is safe when not running', () => {
      const meter = new Meter('test', 100, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      expect(() => meter.stopAnimation()).not.toThrow();
    });
  });

  describe('Tap Actions', () => {
    test('fires more-info by default', () => {
      const fireEvent = vi.fn();
      const meter = new Meter('test', 0, 0, 1000, false, 'Test', 'mdi:test', 'WATTS', false, false, undefined, 'sensor.test', fireEvent);

      const el = meter.createElement();
      el.dispatchEvent(new Event('click'));

      expect(fireEvent).toHaveBeenCalledWith('hass-more-info', { entityId: 'sensor.test' });
    });

    test('handles navigate action', () => {
      const fireEvent = vi.fn();
      const pushSpy = vi.spyOn(history, 'pushState');
      const meter = new Meter('test', 0, 0, 1000, false, 'Test', 'mdi:test', 'WATTS', false, false, { action: 'navigate', path: '/foo' }, 'sensor.test', fireEvent);

      const el = meter.createElement();
      el.dispatchEvent(new Event('click'));

      expect(pushSpy).toHaveBeenCalledWith(null, '', '/foo');
      expect(fireEvent).toHaveBeenCalledWith('location-changed', { replace: false });
    });

    test('handles url action', () => {
      const fireEvent = vi.fn();
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null as any);
      const meter = new Meter('test', 0, 0, 1000, false, 'Test', 'mdi:test', 'WATTS', false, false, { action: 'url', path: 'https://example.com' }, 'sensor.test', fireEvent);

      const el = meter.createElement();
      el.dispatchEvent(new Event('click'));

      expect(openSpy).toHaveBeenCalledWith('https://example.com');
    });

    test('handles toggle action', () => {
      const fireEvent = vi.fn();
      const meter = new Meter('test', 0, 0, 1000, false, 'Test', 'mdi:test', 'WATTS', false, false, { action: 'toggle' }, 'light.kitchen', fireEvent);

      const el = meter.createElement();
      el.dispatchEvent(new Event('click'));

      expect(fireEvent).toHaveBeenCalledWith('call-service', {
        domain: 'homeassistant',
        service: 'toggle',
        service_data: { entity_id: 'light.kitchen' }
      });
    });

    test('handles call-service action', () => {
      const fireEvent = vi.fn();
      const meter = new Meter('test', 0, 0, 1000, false, 'Test', 'mdi:test', 'WATTS', false, false, {
        action: 'call-service',
        service: 'light.turn_on',
        service_data: { brightness: 150 },
        target: { entity_id: 'light.kitchen' }
      }, 'light.kitchen', fireEvent);

      const el = meter.createElement();
      el.dispatchEvent(new Event('click'));

      expect(fireEvent).toHaveBeenCalledWith('call-service', {
        domain: 'light',
        service: 'turn_on',
        service_data: { brightness: 150 },
        target: { entity_id: 'light.kitchen' }
      });
    });

    test('skips action when set to none', () => {
      const fireEvent = vi.fn();
      const meter = new Meter('test', 0, 0, 1000, false, 'Test', 'mdi:test', 'WATTS', false, false, { action: 'none' }, 'sensor.test', fireEvent);

      const el = meter.createElement();
      el.dispatchEvent(new Event('click'));

      expect(fireEvent).not.toHaveBeenCalled();
    });
  });

  describe('Dimming Behavior', () => {
    test('should not dim when value is above threshold', () => {
      const meter = new Meter('test', 100, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');
      const element = meter.createElement();
      const dimmer = element.querySelector('#dimmer-test');
      
      meter.updateDimming();

      expect(dimmer?.getAttribute('opacity')).toBe('0');
    });

    test('should dim when value is near zero', () => {
      const meter = new Meter('test', 0.1, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');
      const element = meter.createElement();
      const dimmer = element.querySelector('#dimmer-test');
      
      meter.updateDimming();

      expect(dimmer?.getAttribute('opacity')).toBe('0.3');
    });

    test('should handle missing element gracefully', () => {
      const meter = new Meter('test', 0, 0, 1000, false, 'Test', 'mdi:test', 'WATTS');

      expect(() => meter.updateDimming()).not.toThrow();
    });
  });
});
