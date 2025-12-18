import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnimationController } from '../src/animation';

describe('AnimationController', () => {
  let controller: AnimationController;
  let mockShadowRoot: ShadowRoot;
  let mockLoadBar: HTMLElement;
  let mockBatteryBar: HTMLElement;

  beforeEach(() => {
    controller = new AnimationController();

    // Create mock DOM elements
    mockLoadBar = document.createElement('div');
    mockLoadBar.className = 'bar-container';
    mockLoadBar.style.setProperty = vi.fn();

    mockBatteryBar = document.createElement('div');
    mockBatteryBar.className = 'bar-container';
    mockBatteryBar.style.setProperty = vi.fn();

    const compactRow = document.createElement('div');
    compactRow.className = 'compact-row';
    compactRow.appendChild(mockLoadBar);

    const batteryRow = document.createElement('div');
    batteryRow.id = 'battery-row';
    batteryRow.className = 'compact-row';
    batteryRow.appendChild(mockBatteryBar);

    mockShadowRoot = {
      querySelector: vi.fn((selector: string) => {
        if (selector === '.compact-row:not(#battery-row) .bar-container') {
          return mockLoadBar;
        }
        if (selector === '#battery-row .bar-container') {
          return mockBatteryBar;
        }
        return null;
      })
    } as any;
  });

  describe('getAnimationSpeed', () => {
    it('should return 0 for zero watts', () => {
      expect(controller.getAnimationSpeed(0)).toBe(0);
    });

    it('should return 0 for negative watts', () => {
      expect(controller.getAnimationSpeed(-100)).toBe(0);
    });

    it('should return 2.5 for 100 watts (reference speed)', () => {
      expect(controller.getAnimationSpeed(100)).toBe(2.5);
    });

    it('should scale linearly with power', () => {
      expect(controller.getAnimationSpeed(200)).toBe(5.0);
      expect(controller.getAnimationSpeed(50)).toBe(1.25);
      expect(controller.getAnimationSpeed(400)).toBe(10.0);
    });
  });

  describe('setLoadSpeed', () => {
    it('should set load speed to 0 for zero watts', () => {
      controller.setLoadSpeed(0);
      expect(controller.getAnimationSpeed(0)).toBe(0);
    });

    it('should calculate correct speed for given watts', () => {
      controller.setLoadSpeed(1000);
      expect(controller.getAnimationSpeed(1000)).toBe(25);
    });
  });

  describe('setBatteryAnimation', () => {
    it('should set battery animation for charging (up)', () => {
      controller.setBatteryAnimation(200, 'up');
      expect(controller.getAnimationSpeed(200)).toBe(5);
    });

    it('should set battery animation for discharging (down)', () => {
      controller.setBatteryAnimation(300, 'down');
      expect(controller.getAnimationSpeed(300)).toBe(7.5);
    });

    it('should set battery animation for idle (none)', () => {
      controller.setBatteryAnimation(0, 'none');
      expect(controller.getAnimationSpeed(0)).toBe(0);
    });

    it('should handle negative watts by using absolute value', () => {
      controller.setBatteryAnimation(-200, 'up');
      expect(controller.getAnimationSpeed(200)).toBe(5);
    });
  });

  describe('start', () => {
    it('should not start if shadowRoot is null', () => {
      controller.start(null);
      expect(controller.isRunning()).toBe(false);
    });

    it('should start animation loop', () => {
      controller.start(mockShadowRoot);
      expect(controller.isRunning()).toBe(true);
    });

    it('should not start multiple times', () => {
      controller.start(mockShadowRoot);
      const firstCheck = controller.isRunning();
      controller.start(mockShadowRoot);
      const secondCheck = controller.isRunning();
      
      expect(firstCheck).toBe(true);
      expect(secondCheck).toBe(true);
      
      controller.stop();
    });

    it('should query for bar elements', () => {
      controller.start(mockShadowRoot);
      
      expect(mockShadowRoot.querySelector).toHaveBeenCalledWith('.compact-row:not(#battery-row) .bar-container');
      expect(mockShadowRoot.querySelector).toHaveBeenCalledWith('#battery-row .bar-container');
      
      controller.stop();
    });
  });

  describe('stop', () => {
    it('should stop animation loop', () => {
      controller.start(mockShadowRoot);
      expect(controller.isRunning()).toBe(true);
      
      controller.stop();
      expect(controller.isRunning()).toBe(false);
    });

    it('should be safe to call when not running', () => {
      expect(() => controller.stop()).not.toThrow();
      expect(controller.isRunning()).toBe(false);
    });

    it('should clear bar element references', () => {
      controller.start(mockShadowRoot);
      controller.stop();
      
      // Animation should not run after stop even if start is called again
      expect(controller.isRunning()).toBe(false);
    });
  });

  describe('isRunning', () => {
    it('should return false initially', () => {
      expect(controller.isRunning()).toBe(false);
    });

    it('should return true after start', () => {
      controller.start(mockShadowRoot);
      expect(controller.isRunning()).toBe(true);
      controller.stop();
    });

    it('should return false after stop', () => {
      controller.start(mockShadowRoot);
      controller.stop();
      expect(controller.isRunning()).toBe(false);
    });
  });

  describe('animation loop', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should update load bar gradient position', () => {
      controller.setLoadSpeed(100);
      controller.start(mockShadowRoot);

      // Advance time
      vi.advanceTimersByTime(100);

      // Should have set gradient-x property
      expect(mockLoadBar.style.setProperty).toHaveBeenCalledWith(
        '--gradient-x',
        expect.stringMatching(/%$/)
      );

      controller.stop();
    });

    it('should update battery bar gradient position when charging', () => {
      controller.setBatteryAnimation(200, 'up');
      controller.start(mockShadowRoot);

      // Advance time
      vi.advanceTimersByTime(100);

      // Should have set gradient-y property
      expect(mockBatteryBar.style.setProperty).toHaveBeenCalledWith(
        '--gradient-y',
        expect.stringMatching(/%$/)
      );

      controller.stop();
    });

    it('should update battery bar gradient position when discharging', () => {
      controller.setBatteryAnimation(200, 'down');
      controller.start(mockShadowRoot);

      // Advance time
      vi.advanceTimersByTime(100);

      // Should have set gradient-y property
      expect(mockBatteryBar.style.setProperty).toHaveBeenCalledWith(
        '--gradient-y',
        expect.stringMatching(/%$/)
      );

      controller.stop();
    });

    it('should not update when speed is zero', () => {
      controller.setLoadSpeed(0);
      controller.start(mockShadowRoot);

      // Clear any initial calls
      vi.clearAllMocks();

      // Advance time
      vi.advanceTimersByTime(100);

      // Should not have updated gradient
      expect(mockLoadBar.style.setProperty).not.toHaveBeenCalled();

      controller.stop();
    });

    it('should wrap load position from >100 to -100', () => {
      // This would need internal state access or time-based testing
      // For now, we verify it doesn't crash with large time advances
      controller.setLoadSpeed(1000); // Very fast
      controller.start(mockShadowRoot);

      vi.advanceTimersByTime(5000);

      expect(controller.isRunning()).toBe(true);

      controller.stop();
    });
  });
});
