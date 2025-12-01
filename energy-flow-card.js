class EnergyFlowCard extends HTMLElement {
  setConfig(config) {
    if (!config || !config.entity) {
      throw new Error('Set the "entity" property (e.g. sensor.grid_power).')
    }

    this._config = config
    if (!this._card) {
      this._card = document.createElement('ha-card')
      this.appendChild(this._card)
    }
    this._render()
  }

  set hass(hass) {
    this._hass = hass
    this._render()
  }

  _render() {
    if (!this._card || !this._config) return

    const entityId = this._config.entity
    const stateObj = this._hass?.states?.[entityId]
    const value = stateObj?.state ?? 'unknown'

    this._card.innerHTML = `
      <div style="padding:16px; display:flex; flex-direction:column; gap:8px;">
        <div style="font-size:1.1rem; font-weight:600;">Energy Flow Card (debug)</div>
        <div>
          <div style="font-size:0.8rem; color:#6b7280;">Entity</div>
          <div style="font-size:1rem;">${entityId}</div>
        </div>
        <div>
          <div style="font-size:0.8rem; color:#6b7280;">Value</div>
          <div style="font-size:1.4rem; font-weight:700;">${value}</div>
        </div>
      </div>
    `
  }
}

customElements.define('energy-flow-card', EnergyFlowCard)

window.customCards ??= []
window.customCards.push({
  type: 'custom:energy-flow-card',
  name: 'Energy Flow Card (debug)',
  description: 'Simple debugging card to confirm bundling works.',
})
