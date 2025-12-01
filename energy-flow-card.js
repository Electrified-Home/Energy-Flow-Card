(function() {
  if (customElements.get('energy-flow-card')) {
    return;
  }

  class EnergyFlowCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._entityId = null;
      this._hass = null;
    }

    setConfig(config) {
      if (!config || !config.entity) {
        throw new Error('Set the "entity" option (for example sensor.grid_power).');
      }

      this._entityId = config.entity;
      this._render();
    }

    set hass(hass) {
      this._hass = hass;
      this._render();
    }

    getCardSize() {
      return 2;
    }

    _render() {
      if (!this.shadowRoot || !this._entityId) {
        return;
      }

      var hass = this._hass || { states: {} };
      var states = hass.states || {};
      var stateObj = states[this._entityId];
      var value = stateObj ? stateObj.state : 'unknown';
      var unit = (stateObj && stateObj.attributes && stateObj.attributes.unit_of_measurement)
        ? stateObj.attributes.unit_of_measurement
        : 'kW';

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
          }

          ha-card {
            padding: 16px;
            box-sizing: border-box;
          }

          .flow-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 16px;
            align-items: center;
            text-align: center;
          }

          .node {
            border-radius: 12px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            padding: 16px;
            background: #f4f5f8;
            font-family: "Segoe UI", system-ui, sans-serif;
          }

          .node__label {
            font-size: 0.85rem;
            color: #4b5563;
            margin-bottom: 4px;
          }

          .node__value {
            font-size: 1.4rem;
            font-weight: 600;
          }

          svg {
            width: 100%;
            max-width: 160px;
            margin: 0 auto;
            display: block;
          }
        </style>
        <ha-card>
          <div class="flow-grid">
            <div class="node">
              <div class="node__label">Grid</div>
              <div class="node__value">${value} ${unit}</div>
            </div>
            <svg viewBox="0 0 120 60" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <rect x="20" y="10" width="80" height="40" rx="6" fill="#e5e7eb"></rect>
              <text x="60" y="35" text-anchor="middle" font-size="14" fill="#374151">Flow</text>
            </svg>
            <div class="node">
              <div class="node__label">Home</div>
              <div class="node__value">--</div>
            </div>
          </div>
        </ha-card>
      `;
    }
  }

  customElements.define('energy-flow-card', EnergyFlowCard);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'custom:energy-flow-card',
    name: 'Energy Flow Card',
    description: 'Minimal energy flow card scaffold.',
  });
})();
