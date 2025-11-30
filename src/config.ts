import type { LovelaceCardConfig } from './types/home-assistant'

export type EnergyEndpoint = 'grid' | 'home' | 'battery' | 'production'

export interface EnergyFlowEntities {
  grid?: string
  home?: string
  battery?: string
  production?: string
}

export interface EnergyDisplayOptions {
  unit: string
  decimals: number
  showIcons: boolean
}

export interface EnergyFlowCardConfig extends LovelaceCardConfig {
  type: 'custom:energy-flow-card'
  entities: EnergyFlowEntities
  display: EnergyDisplayOptions
}

export type EnergyFlowConfigInput = Partial<
  Omit<EnergyFlowCardConfig, 'type' | 'entities' | 'display'>
> &
  LovelaceCardConfig & {
    entities?: Partial<Record<EnergyEndpoint, string>>
    display?: Partial<EnergyDisplayOptions>
  }

export interface EnergyFlowDatum {
  key: EnergyEndpoint
  label: string
  entityId?: string
}

const DEFAULT_UNIT = 'kW'
const DEFAULT_DECIMALS = 1

export const ENERGY_ENDPOINTS: EnergyEndpoint[] = ['grid', 'home', 'battery', 'production']

export const ENERGY_ENDPOINT_LABELS: Record<EnergyEndpoint, string> = {
  grid: 'Grid',
  home: 'Home Load',
  battery: 'Battery',
  production: 'Production',
}

export const DEFAULT_CONFIG: EnergyFlowCardConfig = {
  type: 'custom:energy-flow-card',
  entities: {},
  display: {
    unit: DEFAULT_UNIT,
    decimals: DEFAULT_DECIMALS,
    showIcons: true,
  },
}

export function normalizeConfig(input: EnergyFlowConfigInput): EnergyFlowCardConfig {
  if (!input) {
    throw new Error('Configuration is required.')
  }

  const entities = normalizeEntities(input.entities)
  const display = normalizeDisplay(input.display)

  return {
    type: 'custom:energy-flow-card',
    entities,
    display,
  }
}

function normalizeEntities(
  entities?: Partial<Record<EnergyEndpoint, string>>
): EnergyFlowEntities {
  if (!entities) {
    throw new Error('Provide at least two energy entities to visualize.')
  }

  const normalized: EnergyFlowEntities = {}
  let configuredCount = 0

  for (const key of ENERGY_ENDPOINTS) {
    const value = sanitizeEntityId(entities[key])
    if (value) {
      normalized[key] = value
      configuredCount += 1
    }
  }

  if (configuredCount < 2) {
    throw new Error('Set at least two entities (for example grid + home) to render a flow.')
  }

  return normalized
}

function normalizeDisplay(display?: Partial<EnergyDisplayOptions>): EnergyDisplayOptions {
  const decimals = typeof display?.decimals === 'number' && display.decimals >= 0 ? Math.min(3, Math.round(display.decimals)) : DEFAULT_DECIMALS
  const unit = typeof display?.unit === 'string' && display.unit.trim().length > 0 ? display.unit.trim() : DEFAULT_UNIT
  const showIcons = display?.showIcons ?? true

  return { unit, decimals, showIcons }
}

function sanitizeEntityId(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  if (!trimmed.includes('.')) {
    throw new Error(`"${trimmed}" is not a valid entity_id. Expected domain.object_id format.`)
  }

  return trimmed
}

export function formatPowerValue(value: number | undefined, unit: string, decimals: number): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—'
  }
  return `${value.toFixed(decimals)} ${unit}`
}
