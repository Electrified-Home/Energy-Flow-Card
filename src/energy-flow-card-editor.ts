import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import {
  DEFAULT_CONFIG,
  type EnergyEndpoint,
  ENERGY_ENDPOINT_LABELS,
  ENERGY_ENDPOINTS,
  type EnergyFlowCardConfig,
  type EnergyFlowConfigInput,
  normalizeConfig,
} from './config'
import type { LovelaceCardEditor } from './types/home-assistant'

interface ConfigChangedDetail {
  config: EnergyFlowCardConfig
}

@customElement('energy-flow-card-editor')
export class EnergyFlowCardEditor extends LitElement implements LovelaceCardEditor {
  @state() private _config: EnergyFlowConfigInput = DEFAULT_CONFIG
  @state() private _error = ''

  public setConfig(config: EnergyFlowConfigInput): void {
    this._config = {
      ...config,
      type: 'custom:energy-flow-card',
      entities: { ...(config.entities ?? {}) },
      display: {
        ...(config.display ?? DEFAULT_CONFIG.display),
      },
    }
    this._error = ''
  }

  protected render() {
    const display = this._config.display ?? DEFAULT_CONFIG.display
    return html`
      <section class="editor">
        <div class="editor-grid">
          ${ENERGY_ENDPOINTS.map((endpoint) => this._renderEntityField(endpoint))}
        </div>

        <div class="editor-grid">
          <div class="form-field">
            <label for="unit">Unit</label>
            <input
              id="unit"
              name="unit"
              type="text"
              .value=${display.unit}
              @input=${(event: Event) => this._handleDisplayChange('unit', event)}
            />
          </div>
          <div class="form-field">
            <label for="decimals">Decimals</label>
            <input
              id="decimals"
              name="decimals"
              type="number"
              min="0"
              max="3"
              step="1"
              .value=${String(display.decimals)}
              @input=${(event: Event) => this._handleDisplayChange('decimals', event)}
            />
          </div>
        </div>

        <p class="helper-text">
          Map each endpoint to the Home Assistant sensor entity that reports live power data.
        </p>
        ${this._error
          ? html`<p class="error-banner">${this._error}</p>`
          : null}
      </section>
    `
  }

  private _renderEntityField(endpoint: EnergyEndpoint) {
    const entityId = this._config.entities?.[endpoint] ?? ''
    return html`
      <div class="form-field">
        <label for="${endpoint}">${ENERGY_ENDPOINT_LABELS[endpoint]}</label>
        <input
          id="${endpoint}"
          name="${endpoint}"
          type="text"
          .value=${entityId}
          placeholder="sensor.${endpoint}_power"
          @input=${(event: Event) => this._handleEntityInput(endpoint, event)}
        />
      </div>
    `
  }

  private _handleEntityInput(endpoint: EnergyEndpoint, event: Event) {
    const input = event.target as HTMLInputElement
    const entityId = input.value
    this._commitConfig({
      entities: {
        ...(this._config.entities ?? {}),
        [endpoint]: entityId,
      },
    })
  }

  private _handleDisplayChange(field: 'unit' | 'decimals', event: Event) {
    const input = event.target as HTMLInputElement
    const value = field === 'decimals' ? Number(input.value) : input.value
    this._commitConfig({
      display: {
        ...(this._config.display ?? DEFAULT_CONFIG.display),
        [field]: value,
      },
    })
  }

  private _commitConfig(partial: Partial<EnergyFlowConfigInput>) {
    this._config = {
      ...this._config,
      ...partial,
      type: 'custom:energy-flow-card',
      entities: {
        ...(this._config.entities ?? {}),
        ...(partial.entities ?? {}),
      },
      display: {
        ...(this._config.display ?? DEFAULT_CONFIG.display),
        ...(partial.display ?? {}),
      },
    }

    try {
      const normalized = normalizeConfig(this._config)
      this._error = ''
      this.dispatchEvent(
        new CustomEvent<ConfigChangedDetail>('config-changed', {
          detail: { config: normalized },
          bubbles: true,
          composed: true,
        })
      )
    } catch (error) {
      this._error = (error as Error).message
    }
  }

  static styles = css`
    :host {
      display: block;
      font-family: 'Segoe UI', 'Inter', system-ui, sans-serif;
    }

    .editor {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-field label {
      font-size: 0.85rem;
      color: #4a5568;
      font-weight: 600;
    }

    .form-field input {
      border: 1px solid #d7ddeb;
      border-radius: 10px;
      padding: 0.55rem 0.75rem;
      font-size: 0.95rem;
      font-family: inherit;
    }

    .editor-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .helper-text {
      margin: 0;
      font-size: 0.85rem;
      color: #5f6b7c;
    }

    .error-banner {
      margin: 0;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      background: rgba(226, 74, 74, 0.12);
      border: 1px solid rgba(226, 74, 74, 0.4);
      color: #7a1f1f;
      font-size: 0.85rem;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'energy-flow-card-editor': EnergyFlowCardEditor
  }
}
