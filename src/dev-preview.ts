import './energy-flow-card'
import './energy-flow-card-editor'

import type { EnergyFlowCard } from './energy-flow-card'
import type { EnergyFlowCardEditor } from './energy-flow-card-editor'
import type { EnergyFlowCardConfig } from './config'
import { createMockHass, updateMockValues } from './preview/mock-hass'
import { SAMPLE_CONFIG, SAMPLE_VALUES, randomizeValues } from './preview/sample-config'

const hass = createMockHass(SAMPLE_VALUES)

const card = document.createElement('energy-flow-card') as EnergyFlowCard
card.setConfig(SAMPLE_CONFIG)
card.hass = hass

const editor = document.createElement('energy-flow-card-editor') as EnergyFlowCardEditor
editor.setConfig(SAMPLE_CONFIG)

type ConfigChangeEvent = CustomEvent<{ config: EnergyFlowCardConfig }>

editor.addEventListener('config-changed', (event: Event) => {
  const detail = (event as ConfigChangeEvent).detail
  if (!detail) return
  card.setConfig(detail.config)
  refreshCard()
})

const app = document.getElementById('app')
if (app) {
  const cardPanel = document.createElement('section')
  cardPanel.className = 'preview-panel'
  cardPanel.innerHTML = '<h2>Card preview</h2>'
  cardPanel.appendChild(card)

  const editorPanel = document.createElement('section')
  editorPanel.className = 'preview-panel'
  editorPanel.innerHTML = '<h2>Edit view</h2>'
  editorPanel.appendChild(editor)

  const controls = document.createElement('div')
  controls.className = 'preview-panel'
  controls.innerHTML = `
    <h2>Data controls</h2>
    <div class="controls-row">
      <button class="primary" id="randomize">Randomize values</button>
      <button class="secondary" id="reset">Reset values</button>
    </div>
    <p class="preview-note">Use this harness to verify configuration responses before installing in Home Assistant.</p>
  `

  app.append(controls, editorPanel, cardPanel)

  controls.querySelector<HTMLButtonElement>('#randomize')?.addEventListener('click', () => {
    updateMockValues(hass, randomizeValues())
    refreshCard()
  })

  controls.querySelector<HTMLButtonElement>('#reset')?.addEventListener('click', () => {
    updateMockValues(hass, SAMPLE_VALUES)
    refreshCard()
  })
} else {
  console.warn('Preview root element not found')
}

function refreshCard() {
  // Lit only re-renders when the hass reference changes, mimic HA behavior by cloning the object.
  card.hass = {
    ...hass,
    states: { ...hass.states },
  }
}
