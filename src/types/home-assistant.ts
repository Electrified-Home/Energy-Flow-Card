export interface HassEntity {
  entity_id: string
  state: string
  attributes: Record<string, unknown>
  last_changed?: string
  last_updated?: string
}

export interface HomeAssistant {
  states: Record<string, HassEntity>
  locale?: {
    decimal_separator?: string
    number_format?: 'system' | 'language' | 'comma_decimal' | 'decimal_comma'
  }
}

export interface LovelaceCardConfig {
  type: string
  [key: string]: unknown
}

export interface LovelaceCardEditor extends HTMLElement {
  setConfig(config: LovelaceCardConfig): void
}

export interface LovelaceCard extends HTMLElement {
  hass?: HomeAssistant
  setConfig(config: LovelaceCardConfig): void
  getCardSize?(): number
}
