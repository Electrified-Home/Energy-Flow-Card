import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { normalizeConfig, getChartedConfigForm } from './config';
import { ChartedRenderer } from './renderer';
import type { ChartedCardConfig } from './types';
import type { HomeAssistant } from '../../shared/src/types/HASS';

export class ChartedCard extends LitElement {
  private _hass!: HomeAssistant;
  @state() private _config?: ChartedCardConfig;
  private _renderer?: ChartedRenderer;
  private _refreshInterval?: number;
  private _intersectionObserver?: IntersectionObserver;
  private _lastHistoryFetch: number = 0;

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    
    // Update live chip values immediately when hass changes
    if (this._renderer && this._renderer.lastHistoricalData) {
      this._renderer.updateLiveValues(hass);
    }
  }

  get hass(): HomeAssistant {
    return this._hass;
  }

  static getConfigElement() {
    return undefined;
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
    return getChartedConfigForm();
  }

  setConfig(config: ChartedCardConfig) {
    this._config = normalizeConfig(config);
  }

  getCardSize() {
    return 4;
  }

  connectedCallback() {
    super.connectedCallback();
    
    // Refresh history data at the same interval as data points
    // Default: 12 points per hour = 5 minute intervals
    const pointsPerHour = this._config?.points_per_hour || 12;
    const refreshMs = (60 * 60 * 1000) / pointsPerHour;
    this._refreshInterval = window.setInterval(() => {
      this._fetchHistoryData();
    }, refreshMs);
    
    // Watch for visibility changes (e.g., tab switching)
    this._intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (this._renderer) {
            // Card became visible, resize and fetch if stale
            this._renderer.resize();
            const pointsPerHour = this._config?.points_per_hour || 12;
            const staleDuration = (60 * 60 * 1000) / pointsPerHour;
            if (Date.now() - this._lastHistoryFetch > staleDuration) {
              this._fetchHistoryData();
            }
          } else {
            // Card became visible but renderer not created yet (hidden tab on load)
            this._updateChart();
          }
        }
      });
    });
    this._intersectionObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
      this._intersectionObserver = undefined;
    }
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
      this._refreshInterval = undefined;
    }
    if (this._renderer) {
      this._renderer.dispose();
      this._renderer = undefined;
    }
  }

  protected updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);
    
    if (changedProps.has('_config')) {
      // Config changed - full chart rebuild
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
    this._lastHistoryFetch = Date.now();
  }

  private async _fetchHistoryData() {
    if (!this._renderer || !this.hass || !this._config) return;
    await this._renderer.update(this.hass, this._config);
    this._lastHistoryFetch = Date.now();
  }

  private _updateLiveValues() {
    if (!this._renderer || !this.hass) return;
    this._renderer.updateLiveValues(this.hass);
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
