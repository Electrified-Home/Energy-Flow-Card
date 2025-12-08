/**
 * General utility functions for the energy flow card
 */

import type { EnergyFlowCardConfig, EntityConfig } from '../types/Config.d.ts';
import type { HomeAssistant } from '../types/HASS.d.ts';

export function getDisplayName(
  config: EnergyFlowCardConfig,
  hass: HomeAssistant | undefined,
  entityType: 'grid' | 'load' | 'production' | 'battery',
  fallback: string
): string {
  const entityConfig = config[entityType] as EntityConfig | undefined;
  if (!entityConfig) return fallback;
  
  if (entityConfig.name) {
    return entityConfig.name;
  }

  if (entityConfig.entity && hass?.states[entityConfig.entity]) {
    return hass.states[entityConfig.entity].attributes.friendly_name || fallback;
  }

  return fallback;
}

export function getIcon(
  config: EnergyFlowCardConfig,
  hass: HomeAssistant | undefined,
  entityType: 'grid' | 'load' | 'production' | 'battery',
  fallback: string
): string {
  const entityConfig = config[entityType] as EntityConfig | undefined;
  if (!entityConfig) return fallback;
  
  if (entityConfig.icon) {
    return entityConfig.icon;
  }

  if (entityConfig.entity && hass?.states[entityConfig.entity]) {
    return hass.states[entityConfig.entity].attributes.icon || fallback;
  }

  return fallback;
}

export function handleAction(
  hass: HomeAssistant,
  fireEvent: (type: string, detail?: any) => void,
  actionConfig: any | undefined,
  entityId?: string
): void {
  if (!hass) return;
  
  // Default to more-info if no action configured
  const config = actionConfig || { action: 'more-info' as const };
  const action = config.action || 'more-info';
  
  switch (action) {
    case 'more-info':
      const entityToShow = config.entity || entityId;
      if (entityToShow) {
        fireEvent('hass-more-info', { entityId: entityToShow });
      }
      break;
      
    case 'navigate':
      if (config.path) {
        history.pushState(null, '', config.path);
        fireEvent('location-changed', { replace: false });
      }
      break;
      
    case 'url':
      if (config.path) {
        window.open(config.path);
      }
      break;
      
    case 'toggle':
      if (entityId) {
        hass.callService('homeassistant', 'toggle', { entity_id: entityId });
      }
      break;
      
    case 'call-service':
      if (config.service) {
        const [domain, service] = config.service.split('.');
        hass.callService(domain, service, config.service_data || {}, config.target);
      }
      break;
      
    case 'none':
      // Do nothing
      break;
  }
}

export function updateSegmentVisibility(segment: Element, pixelWidth: number, hasValue: boolean): void {
  if (!segment || !hasValue) {
    segment?.setAttribute('data-width-px', '');
    return;
  }

  // Thresholds for responsive hiding
  const SHOW_LABEL_THRESHOLD = 80; // Show label if segment is at least 80px wide
  const SHOW_ICON_THRESHOLD = 40;  // Show icon if segment is at least 40px wide

  if (pixelWidth >= SHOW_LABEL_THRESHOLD) {
    segment.setAttribute('data-width-px', 'show-label');
  } else if (pixelWidth >= SHOW_ICON_THRESHOLD) {
    segment.setAttribute('data-width-px', 'show-icon');
  } else {
    segment.setAttribute('data-width-px', '');
  }
}
