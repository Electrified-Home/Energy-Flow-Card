import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDisplayName, getIcon, updateSegmentVisibility, handleAction } from './helpers';
import type { EnergyFlowCardConfig } from '../types/Config';
import type { HomeAssistant } from '../types/HASS';

// Setup DOM for tests
beforeEach(() => {
  document.body.innerHTML = '';
  // Clear all mocks
  vi.clearAllMocks();
});

describe('helpers', () => {
  describe('getDisplayName', () => {
    it('should return custom name from config if provided', () => {
      const config = { 
        load: { entity: 'sensor.load' },
        production: { entity: 'sensor.solar', name: 'Solar Panels' } 
      } as EnergyFlowCardConfig;
      const result = getDisplayName(config, undefined, 'production', 'Production');
      expect(result).toBe('Solar Panels');
    });

    it('should return entity friendly name if no custom name', () => {
      const config = { 
        load: { entity: 'sensor.load' },
        production: { entity: 'sensor.solar' } 
      } as EnergyFlowCardConfig;
      const hass = {
        states: {
          'sensor.solar': {
            attributes: { friendly_name: 'My Solar Power' },
            state: '0'
          }
        }
      } as unknown as HomeAssistant;
      
      const result = getDisplayName(config, hass, 'production', 'Production');
      expect(result).toBe('My Solar Power');
    });

    it('should return fallback if no config or entity name', () => {
      const config = { 
        load: { entity: 'sensor.load' }
      } as EnergyFlowCardConfig;
      const result = getDisplayName(config, undefined, 'production', 'Production');
      expect(result).toBe('Production');
    });
  });

  describe('getIcon', () => {
    it('should return custom icon from config if provided', () => {
      const config = { 
        load: { entity: 'sensor.load' },
        production: { entity: 'sensor.solar', icon: 'mdi:solar-panel' } 
      } as EnergyFlowCardConfig;
      const result = getIcon(config, undefined, 'production', 'mdi:solar-power');
      expect(result).toBe('mdi:solar-panel');
    });

    it('should return entity icon if no custom icon', () => {
      const config = { 
        load: { entity: 'sensor.load' },
        production: { entity: 'sensor.solar' } 
      } as EnergyFlowCardConfig;
      const hass = {
        states: {
          'sensor.solar': {
            attributes: { icon: 'mdi:weather-sunny' },
            state: '0'
          }
        }
      } as unknown as HomeAssistant;
      
      const result = getIcon(config, hass, 'production', 'mdi:solar-power');
      expect(result).toBe('mdi:weather-sunny');
    });

    it('should return fallback if no config or entity icon', () => {
      const config = { 
        load: { entity: 'sensor.load' }
      } as EnergyFlowCardConfig;
      const result = getIcon(config, undefined, 'production', 'mdi:solar-power');
      expect(result).toBe('mdi:solar-power');
    });
  });

  describe('updateSegmentVisibility', () => {
    it('should set empty data-width-px if no value', () => {
      const segment = document.createElement('div');
      updateSegmentVisibility(segment, 100, false);
      expect(segment.getAttribute('data-width-px')).toBe('');
    });

    it('should set show-label for wide segments', () => {
      const segment = document.createElement('div');
      updateSegmentVisibility(segment, 100, true);
      expect(segment.getAttribute('data-width-px')).toBe('show-label');
    });

    it('should set show-icon for medium segments', () => {
      const segment = document.createElement('div');
      updateSegmentVisibility(segment, 50, true);
      expect(segment.getAttribute('data-width-px')).toBe('show-icon');
    });

    it('should set empty for narrow segments', () => {
      const segment = document.createElement('div');
      updateSegmentVisibility(segment, 30, true);
      expect(segment.getAttribute('data-width-px')).toBe('');
    });

    it('should handle null segment gracefully', () => {
      expect(() => updateSegmentVisibility(null as any, 100, true)).not.toThrow();
    });

    it('should handle boundary cases for thresholds', () => {
      const segment = document.createElement('div');
      
      // Exactly at label threshold (80)
      updateSegmentVisibility(segment, 80, true);
      expect(segment.getAttribute('data-width-px')).toBe('show-label');
      
      // Exactly at icon threshold (40)
      updateSegmentVisibility(segment, 40, true);
      expect(segment.getAttribute('data-width-px')).toBe('show-icon');
      
      // Just below icon threshold
      updateSegmentVisibility(segment, 39, true);
      expect(segment.getAttribute('data-width-px')).toBe('');
    });
  });

  describe('handleAction', () => {
    let mockHass: HomeAssistant;
    let fireEvent: (type: string, detail?: any) => void;

    beforeEach(() => {
      mockHass = {
        callService: vi.fn(),
        states: {}
      } as unknown as HomeAssistant;

      fireEvent = vi.fn() as any;

      // Mock window.open
      window.open = vi.fn();
      
      // Mock history
      window.history.pushState = vi.fn();
    });

    it('should handle more-info action', () => {
      const config = {
        action: 'more-info' as const,
        entity: 'sensor.solar'
      };

      handleAction(mockHass, fireEvent, config, 'sensor.solar');

      expect(fireEvent).toHaveBeenCalledWith('hass-more-info', { entityId: 'sensor.solar' });
    });

    it('should handle toggle action', () => {
      const config = {
        action: 'toggle' as const
      };

      handleAction(mockHass, fireEvent, config, 'switch.solar');

      expect(mockHass.callService).toHaveBeenCalledWith('homeassistant', 'toggle', {
        entity_id: 'switch.solar'
      });
    });

    it('should handle navigate action', () => {
      const config = {
        action: 'navigate' as const,
        path: '/lovelace/energy'
      };

      handleAction(mockHass, fireEvent, config, 'sensor.test');

      expect(window.history.pushState).toHaveBeenCalledWith(null, '', '/lovelace/energy');
      expect(fireEvent).toHaveBeenCalledWith('location-changed', { replace: false, path: '/lovelace/energy' });
    });

    it('should handle url action', () => {
      const config = {
        action: 'url' as const,
        path: 'https://example.com'
      };

      handleAction(mockHass, fireEvent, config, 'sensor.test');

      expect(window.open).toHaveBeenCalledWith('https://example.com');
    });

    it('should handle none action', () => {
      const config = {
        action: 'none' as const
      };

      expect(() => handleAction(mockHass, fireEvent, config, 'sensor.test')).not.toThrow();
      expect(fireEvent).not.toHaveBeenCalled();
      expect(mockHass.callService).not.toHaveBeenCalled();
    });

    it('should default to more-info if no action specified', () => {
      handleAction(mockHass, fireEvent, undefined, 'sensor.test');

      expect(fireEvent).toHaveBeenCalledWith('hass-more-info', { entityId: 'sensor.test' });
    });

    it('should handle call-service action', () => {
      const config = {
        action: 'call-service' as const,
        service: 'light.turn_on',
        service_data: {
          brightness: 255
        },
        target: {
          entity_id: 'light.living_room'
        }
      };

      handleAction(mockHass, fireEvent, config, 'light.living_room');

      expect(mockHass.callService).toHaveBeenCalledWith('light', 'turn_on',
        { brightness: 255 },
        { entity_id: 'light.living_room' }
      );
    });

    it('should handle call-service action without data or target', () => {
      const config = {
        action: 'call-service' as const,
        service: 'script.run'
      };

      handleAction(mockHass, fireEvent, config, 'script.test');

      expect(mockHass.callService).toHaveBeenCalledWith('script', 'run', {}, undefined);
    });

    it('should handle missing hass gracefully', () => {
      const config = {
        action: 'toggle' as const
      };

      expect(() => handleAction(undefined as any, fireEvent, config, 'switch.test')).not.toThrow();
      expect(mockHass.callService).not.toHaveBeenCalled();
    });

    it('should use entity from config if provided in more-info', () => {
      const config = {
        action: 'more-info' as const,
        entity: 'sensor.temperature'
      };

      handleAction(mockHass, fireEvent, config, 'sensor.other');

      expect(fireEvent).toHaveBeenCalledWith('hass-more-info', { entityId: 'sensor.temperature' });
    });

    it('should use entityId parameter when config entity not provided', () => {
      const config = {
        action: 'more-info' as const
      };

      handleAction(mockHass, fireEvent, config, 'sensor.fallback');

      expect(fireEvent).toHaveBeenCalledWith('hass-more-info', { entityId: 'sensor.fallback' });
    });
  });
});
