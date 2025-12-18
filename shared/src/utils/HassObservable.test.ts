import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HassObservable } from './HassObservable';
import type { HomeAssistant } from '../types/HASS';

describe('HassObservable', () => {
  let observable: HassObservable;
  let mockHass: HomeAssistant;

  beforeEach(() => {
    observable = new HassObservable();
    mockHass = {
      states: {
        'sensor.solar_power': { state: '1500', entity_id: 'sensor.solar_power' },
        'sensor.grid_power': { state: '200', entity_id: 'sensor.grid_power' },
        'sensor.battery_power': { state: '-500', entity_id: 'sensor.battery_power' },
      },
    } as any;
  });

  describe('subscribe', () => {
    it('should fire callback immediately with current value', () => {
      observable.updateHass(mockHass);
      const callback = vi.fn();
      
      observable.subscribe('sensor.solar_power', callback);
      
      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith('1500');
    });

    it('should not fire callback if entity does not exist', () => {
      observable.updateHass(mockHass);
      const callback = vi.fn();
      
      observable.subscribe('sensor.nonexistent', callback);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should return disposer function', () => {
      const callback = vi.fn();
      const unsubscribe = observable.subscribe('sensor.solar_power', callback);
      
      expect(typeof unsubscribe).toBe('function');
    });

    it('should allow multiple callbacks for same entity', () => {
      observable.updateHass(mockHass);
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      observable.subscribe('sensor.solar_power', callback1);
      observable.subscribe('sensor.solar_power', callback2);
      
      expect(callback1).toHaveBeenCalledWith('1500');
      expect(callback2).toHaveBeenCalledWith('1500');
    });
  });

  describe('updateHass', () => {
    it('should fire callbacks when entity state changes', () => {
      observable.updateHass(mockHass);
      const callback = vi.fn();
      observable.subscribe('sensor.solar_power', callback);
      
      callback.mockClear();
      
      const newHass = {
        states: {
          ...mockHass.states,
          'sensor.solar_power': { state: '2000', entity_id: 'sensor.solar_power' },
        },
      } as any;
      
      observable.updateHass(newHass);
      
      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith('2000');
    });

    it('should not fire callbacks when entity state unchanged', () => {
      observable.updateHass(mockHass);
      const callback = vi.fn();
      observable.subscribe('sensor.solar_power', callback);
      
      callback.mockClear();
      
      const newHass = {
        states: { ...mockHass.states },
      } as any;
      
      observable.updateHass(newHass);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should only check subscribed entities', () => {
      observable.updateHass(mockHass);
      const solarCallback = vi.fn();
      observable.subscribe('sensor.solar_power', solarCallback);
      
      solarCallback.mockClear();
      
      // Change grid power (not subscribed) and solar power
      const newHass = {
        states: {
          'sensor.solar_power': { state: '2000', entity_id: 'sensor.solar_power' },
          'sensor.grid_power': { state: '999', entity_id: 'sensor.grid_power' },
          'sensor.battery_power': { state: '-500', entity_id: 'sensor.battery_power' },
        },
      } as any;
      
      observable.updateHass(newHass);
      
      // Only solar callback should fire
      expect(solarCallback).toHaveBeenCalledOnce();
      expect(solarCallback).toHaveBeenCalledWith('2000');
    });

    it('should fire multiple callbacks for same entity', () => {
      observable.updateHass(mockHass);
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      observable.subscribe('sensor.solar_power', callback1);
      observable.subscribe('sensor.solar_power', callback2);
      
      callback1.mockClear();
      callback2.mockClear();
      
      const newHass = {
        states: {
          ...mockHass.states,
          'sensor.solar_power': { state: '3000', entity_id: 'sensor.solar_power' },
        },
      } as any;
      
      observable.updateHass(newHass);
      
      expect(callback1).toHaveBeenCalledWith('3000');
      expect(callback2).toHaveBeenCalledWith('3000');
    });

    it('should handle callback errors gracefully', () => {
      observable.updateHass(mockHass);
      const errorCallback = vi.fn(() => { throw new Error('Test error'); });
      const normalCallback = vi.fn();
      
      observable.subscribe('sensor.solar_power', errorCallback);
      observable.subscribe('sensor.solar_power', normalCallback);
      
      errorCallback.mockClear();
      normalCallback.mockClear();
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const newHass = {
        states: {
          ...mockHass.states,
          'sensor.solar_power': { state: '2000', entity_id: 'sensor.solar_power' },
        },
      } as any;
      
      observable.updateHass(newHass);
      
      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalledWith('2000');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[HassObservable] Error in callback'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('unsubscribe', () => {
    it('should stop firing callbacks after unsubscribe', () => {
      observable.updateHass(mockHass);
      const callback = vi.fn();
      const unsubscribe = observable.subscribe('sensor.solar_power', callback);
      
      callback.mockClear();
      unsubscribe();
      
      const newHass = {
        states: {
          ...mockHass.states,
          'sensor.solar_power': { state: '2000', entity_id: 'sensor.solar_power' },
        },
      } as any;
      
      observable.updateHass(newHass);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should clean up empty subscription sets', () => {
      const callback = vi.fn();
      const unsubscribe = observable.subscribe('sensor.solar_power', callback);
      
      expect(observable.subscriptionCount).toBe(1);
      
      unsubscribe();
      
      expect(observable.subscriptionCount).toBe(0);
    });

    it('should not affect other subscriptions to same entity', () => {
      observable.updateHass(mockHass);
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      const unsubscribe1 = observable.subscribe('sensor.solar_power', callback1);
      observable.subscribe('sensor.solar_power', callback2);
      
      callback1.mockClear();
      callback2.mockClear();
      
      unsubscribe1();
      
      const newHass = {
        states: {
          ...mockHass.states,
          'sensor.solar_power': { state: '2000', entity_id: 'sensor.solar_power' },
        },
      } as any;
      
      observable.updateHass(newHass);
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith('2000');
    });
  });

  describe('getState', () => {
    it('should return current state of entity', () => {
      observable.updateHass(mockHass);
      
      expect(observable.getState('sensor.solar_power')).toBe('1500');
      expect(observable.getState('sensor.grid_power')).toBe('200');
    });

    it('should return undefined for nonexistent entity', () => {
      observable.updateHass(mockHass);
      
      expect(observable.getState('sensor.nonexistent')).toBeUndefined();
    });

    it('should return undefined before hass is set', () => {
      expect(observable.getState('sensor.solar_power')).toBeUndefined();
    });
  });

  describe('hasEntity', () => {
    it('should return true for existing entity', () => {
      observable.updateHass(mockHass);
      
      expect(observable.hasEntity('sensor.solar_power')).toBe(true);
    });

    it('should return false for nonexistent entity', () => {
      observable.updateHass(mockHass);
      
      expect(observable.hasEntity('sensor.nonexistent')).toBe(false);
    });

    it('should return false before hass is set', () => {
      expect(observable.hasEntity('sensor.solar_power')).toBe(false);
    });
  });

  describe('dispose', () => {
    it('should clear all subscriptions', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      observable.subscribe('sensor.solar_power', callback1);
      observable.subscribe('sensor.grid_power', callback2);
      
      expect(observable.subscriptionCount).toBe(2);
      
      observable.unsubscribeAll();
      
      expect(observable.subscriptionCount).toBe(0);
    });

    it('should retain hass references after unsubscribeAll', () => {
      observable.updateHass(mockHass);
      
      expect(observable.getState('sensor.solar_power')).toBe('1500');
      
      observable.unsubscribeAll();
      
      // Hass reference should still be available
      expect(observable.getState('sensor.solar_power')).toBe('1500');
    });

    it('should not fire callbacks after unsubscribeAll', () => {
      observable.updateHass(mockHass);
      const callback = vi.fn();
      observable.subscribe('sensor.solar_power', callback);
      
      callback.mockClear();
      observable.unsubscribeAll();
      
      const newHass = {
        states: {
          ...mockHass.states,
          'sensor.solar_power': { state: '2000', entity_id: 'sensor.solar_power' },
        },
      } as any;
      
      observable.updateHass(newHass);
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('subscriptionCount', () => {
    it('should return 0 initially', () => {
      expect(observable.subscriptionCount).toBe(0);
    });

    it('should count single subscription', () => {
      observable.subscribe('sensor.solar_power', vi.fn());
      
      expect(observable.subscriptionCount).toBe(1);
    });

    it('should count multiple subscriptions to different entities', () => {
      observable.subscribe('sensor.solar_power', vi.fn());
      observable.subscribe('sensor.grid_power', vi.fn());
      observable.subscribe('sensor.battery_power', vi.fn());
      
      expect(observable.subscriptionCount).toBe(3);
    });

    it('should count multiple subscriptions to same entity', () => {
      observable.subscribe('sensor.solar_power', vi.fn());
      observable.subscribe('sensor.solar_power', vi.fn());
      
      expect(observable.subscriptionCount).toBe(2);
    });

    it('should update count after unsubscribe', () => {
      const unsubscribe1 = observable.subscribe('sensor.solar_power', vi.fn());
      const unsubscribe2 = observable.subscribe('sensor.grid_power', vi.fn());
      
      expect(observable.subscriptionCount).toBe(2);
      
      unsubscribe1();
      
      expect(observable.subscriptionCount).toBe(1);
      
      unsubscribe2();
      
      expect(observable.subscriptionCount).toBe(0);
    });
  });
});
