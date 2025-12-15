import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { normalizeConfig } from './config';
import { ChartedRenderer } from './renderer';
import type { ChartedCardConfig } from './types';
import type { HomeAssistant } from '../../shared/src/types/HASS';

export class ChartedCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config?: ChartedCardConfig;
  private _renderer?: ChartedRenderer;

  static getConfigElement() {
    return document.createElement('energy-flow-charted-card-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:energy-flow-charted-card',
      hours_to_show: 24,
      points_per_hour: 12,
      entities: {
        solar: '',
        grid: '',
        battery: '',
        load: '',
      },
    };
  }

  static getConfigForm() {
    return [];
  }

  setConfig(config: ChartedCardConfig) {
    this._config = normalizeConfig(config);
  }

  getCardSize() {
    return 4;
  }

  protected updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);
    
    if (changedProps.has('hass') || changedProps.has('_config')) {
      this._updateChart();
    }
  }

  private async _updateChart() {
    if (!this.hass || !this._config) return;

    const container = this.renderRoot?.querySelector('#chart-container') as HTMLElement;
    if (!container) return;

    if (!this._renderer) {
      this._renderer = new ChartedRenderer(container, this.hass, this._config);
    }

    await this._renderer.update(this.hass, this._config);
  }

  protected render() {
    if (!this._config) {
      return html`<div class="card">No configuration</div>`;
    }

    return html`
      <div class="card">
        <div id="chart-container"></div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    .card {
      background: var(--ha-card-background, #1c1c1c);
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    #chart-container {
      width: 100%;
      height: 350px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'energy-flow-charted-card': ChartedCard;
  }
}

// Register the card
if (!customElements.get('energy-flow-charted-card')) {
  customElements.define('energy-flow-charted-card', ChartedCard);
  console.info(
    '%c ENERGY-FLOW-CHARTED-CARD %c 1.0.0 ',
    'color: white; background: green; font-weight: 700;',
    'color: green; background: white; font-weight: 700;'
  );
}
