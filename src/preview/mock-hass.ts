import type { HassEntity, HomeAssistant } from '../types/home-assistant'

export type MockEntityValues = Record<string, number>

export function createMockHass(values: MockEntityValues): HomeAssistant {
  const states: Record<string, HassEntity> = {}
  for (const [entityId, value] of Object.entries(values)) {
    states[entityId] = {
      entity_id: entityId,
      state: value.toString(),
      attributes: {
        unit_of_measurement: 'kW',
      },
    }
  }

  return {
    states,
    locale: {
      decimal_separator: '.',
      number_format: 'language',
    },
  }
}

export function updateMockValues(hass: HomeAssistant, values: MockEntityValues) {
  for (const [entityId, value] of Object.entries(values)) {
    const entity = hass.states[entityId]
    if (entity) {
      entity.state = value.toString()
    } else {
      hass.states[entityId] = {
        entity_id: entityId,
        state: value.toString(),
        attributes: {
          unit_of_measurement: 'kW',
        },
      }
    }
  }
}
