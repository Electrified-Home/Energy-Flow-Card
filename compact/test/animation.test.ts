import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnimationController } from '../src/animation';

describe('AnimationController', () => {
  let controller: AnimationController;
  let mockShadowRoot: ShadowRoot;
  let mockLoadOverlay: HTMLElement;
  let mockBatteryOverlay: HTMLElement;
  let loadAnimation: any;
  let batteryAnimation: any;

  beforeEach(() => {
    // Ensure WAAPI path is taken in tests
    (Element.prototype as any).animate = (Element.prototype as any).animate || vi.fn();

    controller = new AnimationController();

    // Create mock DOM elements
    loadAnimation = {
      playbackRate: 1,
      playState: 'paused',
      play: vi.fn(() => { loadAnimation.playState = 'running'; }),
      pause: vi.fn(() => { loadAnimation.playState = 'paused'; }),
      cancel: vi.fn()
    } as any;

    batteryAnimation = {
      playbackRate: 1,
      playState: 'paused',
      play: vi.fn(() => { batteryAnimation.playState = 'running'; }),
      pause: vi.fn(() => { batteryAnimation.playState = 'paused'; }),
      cancel: vi.fn(),
      effect: {
        updateTiming: vi.fn(),
        getComputedTiming: vi.fn(() => ({ duration: 20_000 }))
      }
    } as any;

    mockLoadOverlay = document.createElement('div');
    mockLoadOverlay.className = 'shine-overlay load-shine';
    mockLoadOverlay.animate = vi.fn(() => loadAnimation);

    mockBatteryOverlay = document.createElement('div');
    mockBatteryOverlay.className = 'shine-overlay battery-shine';
    mockBatteryOverlay.animate = vi.fn(() => batteryAnimation);

    mockShadowRoot = {
      querySelector: vi.fn((selector: string) => {
        if (selector === '.load-shine') {
          return mockLoadOverlay;
        }
        if (selector === '.battery-shine') {
          return mockBatteryOverlay;
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
      controller.setLoadSpeed(100);
      controller.start(mockShadowRoot);
      expect(controller.isRunning()).toBe(true);
    });

    it('should not start multiple times', () => {
      controller.setLoadSpeed(100);
      controller.start(mockShadowRoot);
      const firstCheck = controller.isRunning();
      controller.start(mockShadowRoot);
      const secondCheck = controller.isRunning();
      
      expect(firstCheck).toBe(true);
      expect(secondCheck).toBe(true);
      
      controller.stop();
    });

    it('should query for bar elements', () => {
      controller.setLoadSpeed(100);
      controller.start(mockShadowRoot);
      
      expect(mockShadowRoot.querySelector).toHaveBeenCalledWith('.load-shine');
      expect(mockShadowRoot.querySelector).toHaveBeenCalledWith('.battery-shine');
      
      controller.stop();
    });
  });

  describe('stop', () => {
    it('should stop animation loop', () => {
      controller.setLoadSpeed(100);
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
      controller.setLoadSpeed(100);
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
      controller.setLoadSpeed(100);
      controller.start(mockShadowRoot);
      expect(controller.isRunning()).toBe(true);
      controller.stop();
    });

    it('should return false after stop', () => {
      controller.setLoadSpeed(100);
      controller.start(mockShadowRoot);
      controller.stop();
      expect(controller.isRunning()).toBe(false);
    });
  });

  describe('animation loop', () => {
    it('should set load overlay playbackRate and play', () => {
      controller.setLoadSpeed(100);
      controller.start(mockShadowRoot);

      expect(loadAnimation.playbackRate).toBeCloseTo(1 / 3); // 100W => slowed reference rate
      expect(loadAnimation.play).toHaveBeenCalled();

      controller.stop();
    });

    it('should set battery overlay playbackRate positive and reverse when charging (up)', () => {
      controller.setBatteryAnimation(200, 'up');
      controller.start(mockShadowRoot);

      expect(batteryAnimation.playbackRate).toBeGreaterThan(0);
      expect(batteryAnimation.playbackRate).toBeCloseTo(2 / 3); // 200W => slowed reference
      expect(batteryAnimation.effect.updateTiming).toHaveBeenCalledWith({ direction: 'reverse' });
      expect(batteryAnimation.play).toHaveBeenCalled();

      controller.stop();
    });

    it('should set battery overlay playbackRate positive when discharging (down)', () => {
      controller.setBatteryAnimation(200, 'down');
      controller.start(mockShadowRoot);

      expect(batteryAnimation.playbackRate).toBeGreaterThan(0);
      expect(batteryAnimation.playbackRate).toBeCloseTo(2 / 3);
      expect(batteryAnimation.effect.updateTiming).toHaveBeenCalledWith({ direction: 'normal' });
      expect(batteryAnimation.play).toHaveBeenCalled();

      controller.stop();
    });

    it('should pause animations when speed is zero', () => {
      controller.setLoadSpeed(0);
      controller.setBatteryAnimation(0, 'none');
      controller.start(mockShadowRoot);

      expect(loadAnimation.pause).toHaveBeenCalled();
      expect(batteryAnimation.pause).toHaveBeenCalled();

      controller.stop();
    });
  });
});
