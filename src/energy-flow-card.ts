import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

import {
  type EnergyFlowCardConfig,
  type EnergyFlowConfigInput,
  type EnergyEndpoint,
  ENERGY_ENDPOINT_LABELS,
  ENERGY_ENDPOINTS,
  formatPowerValue,
  normalizeConfig,
} from './config'
import type { HomeAssistant } from './types/home-assistant'

interface FlowWithValue {
  key: EnergyEndpoint
  label: string
  entityId?: string
  value?: number
}

@customElement('energy-flow-card')
export class EnergyFlowCard extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant
  @state() private _config?: EnergyFlowCardConfig

  public setConfig(config: EnergyFlowConfigInput): void {
    this._config = normalizeConfig(config)
  }

  public getCardSize(): number {
    return 3
  }

  protected render() {
    if (!this._config) {
      return html`<article class="card card--empty">
        <p>Configure the energy-flow card to begin visualizing power data.</p>
      </article>`
    }

    const flows = this._buildFlows()

    return html`
      <article class="card">
        <section class="flow-grid">
          ${flows.map((flow) => this._renderFlow(flow))}
        </section>
      </article>
    `
  }

  private _renderFlow(flow: FlowWithValue) {
    const hasValue = typeof flow.value === 'number'
    const display = this._config?.display ?? { unit: 'kW', decimals: 1, showIcons: true }
    return html`
      <div class="flow ${hasValue ? '' : 'flow--pending'}">
        <div class="flow__label">${flow.label}</div>
        <div class="flow__value">${formatPowerValue(flow.value, display.unit, display.decimals)}</div>
        <div class="flow__entity">${flow.entityId ?? 'Not configured'}</div>
      </div>
    `
  }

  private _buildFlows(): FlowWithValue[] {
    if (!this._config) {
      return []
    }

    const flows: FlowWithValue[] = []
    for (const key of ENERGY_ENDPOINTS) {
      const entityId = this._config.entities[key]
      flows.push({
        key,
        label: ENERGY_ENDPOINT_LABELS[key],
        entityId,
        value: this._readEntity(entityId),
      })
    }
    return flows
  }

  private _readEntity(entityId?: string): number | undefined {
    if (!entityId || !this.hass) {
      return undefined
    }

    const entity = this.hass.states[entityId]
    if (!entity) {
      return undefined
    }

    const value = Number(entity.state)
    return Number.isNaN(value) ? undefined : value
  }

  static styles = css`
    :host {
      display: block;
      font-family: 'Segoe UI', 'Inter', system-ui, sans-serif;
    }

    .card {
      background: linear-gradient(180deg, #0d1b2a, #152a45);
      border-radius: 20px;
      padding: 1.5rem;
      color: #f6fbff;
      box-shadow: 0 20px 30px rgba(5, 13, 32, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .card--empty {
      background: rgba(13, 27, 42, 0.65);
      text-align: center;
      font-size: 0.95rem;
    }

    .flow-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
    }

    .flow {
      padding: 1rem;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      min-height: 110px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: background 150ms ease;
    }

    .flow__label {
      font-size: 0.85rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.6);
    }

    .flow__value {
      font-size: 1.35rem;
      font-weight: 600;
    }

    .flow__entity {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
      word-break: break-all;
    }

    .flow--pending {
      background: rgba(255, 255, 255, 0.03);
      border-style: dashed;
    }
  `
}

const cardDefinition = {
  type: 'custom:energy-flow-card',
  name: 'Energy Flow Card',
  description: 'Displays a compact view of grid, battery, production, and home usage.',
}

;(window as typeof window & { customCards?: unknown[] }).customCards ??= []
;(window as typeof window & { customCards: unknown[] }).customCards.push(cardDefinition)

declare global {
  interface HTMLElementTagNameMap {
    'energy-flow-card': EnergyFlowCard
  }
}
