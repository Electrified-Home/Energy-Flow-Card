import { describe, expect, it } from 'vitest'

import { normalizeConfig, type EnergyFlowConfigInput } from './config'

describe('normalizeConfig', () => {
  const base: EnergyFlowConfigInput = {
    type: 'custom:energy-flow-card',
    entities: {
      grid: 'sensor.grid_power',
      home: 'sensor.home_power',
    },
  }

  it('fills defaults for optional fields', () => {
    const normalized = normalizeConfig({ ...base })
    expect(normalized.display.unit).toBe('kW')
    expect(normalized.display.decimals).toBe(1)
  })

  it('accepts custom display options', () => {
    const normalized = normalizeConfig({
      ...base,
      display: {
        unit: 'W',
        decimals: 2,
      },
    })
    expect(normalized.display.unit).toBe('W')
    expect(normalized.display.decimals).toBe(2)
  })

  it('throws when fewer than two entities are provided', () => {
    expect(() =>
      normalizeConfig({
        ...base,
        entities: {
          grid: 'sensor.grid_power',
        },
      })
    ).toThrowError(/two entities/i)
  })

  it('throws when the entity id is malformed', () => {
    expect(() =>
      normalizeConfig({
        ...base,
        entities: {
          grid: 'grid_power',
          home: 'sensor.home_power',
        },
      })
    ).toThrowError(/entity_id/i)
  })
})
