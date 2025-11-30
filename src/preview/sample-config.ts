import type { EnergyFlowCardConfig, EnergyFlowConfigInput } from '../config'
import { normalizeConfig } from '../config'
import type { MockEntityValues } from './mock-hass'

const BASE_CONFIG: EnergyFlowConfigInput = {
  type: 'custom:energy-flow-card',
  entities: {
    grid: 'sensor.grid_exchange_power',
    home: 'sensor.home_load_power',
    battery: 'sensor.home_battery_power',
    production: 'sensor.solar_inverter_power',
  },
  display: {
    unit: 'kW',
    decimals: 2,
  },
}

export const SAMPLE_CONFIG: EnergyFlowCardConfig = normalizeConfig(BASE_CONFIG)

export const SAMPLE_VALUES: MockEntityValues = {
  'sensor.grid_exchange_power': 1.3,
  'sensor.home_load_power': 4.6,
  'sensor.home_battery_power': -0.8,
  'sensor.solar_inverter_power': 5.7,
}

export function randomizeValues(seed: MockEntityValues = SAMPLE_VALUES): MockEntityValues {
  const next: MockEntityValues = {}
  for (const [entityId, value] of Object.entries(seed)) {
    const variance = (Math.random() - 0.5) * 1.5
    next[entityId] = Number((value + variance).toFixed(2))
  }
  return next
}
