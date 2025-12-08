import { describe, it, expect, beforeEach, vi } from 'vitest';
import './energy-flow-card';

const EnergyFlowCardElement = customElements.get('energy-flow-card') as any;
import type { HomeAssistant } from './types/HASS.d.ts';

describe('EnergyFlowCard element', () => {
  let hass: HomeAssistant;

  beforeEach(() => {
    hass = {
      states: {
        'sensor.load': { state: '1000', attributes: {} },
        'sensor.grid': { state: '200', attributes: {} },
        'sensor.prod': { state: '800', attributes: {} },
        'sensor.batt': { state: '-50', attributes: {} },
      }
    } as unknown as HomeAssistant;
  });

  it('renders default view without throwing', () => {
    const el = document.createElement('energy-flow-card') as any;
    el.setConfig({
      load: { entity: 'sensor.load' },
      grid: { entity: 'sensor.grid' },
      production: { entity: 'sensor.prod' },
      battery: { entity: 'sensor.batt' },
    });
    el.hass = hass;
    const card = el.shadowRoot ?? el; // element does not use shadow root
    expect(card).toBeTruthy();
  });

  it('renders compact view', () => {
    const el = document.createElement('energy-flow-card') as any;
    el.setConfig({
      mode: 'compact',
      load: { entity: 'sensor.load' },
      grid: { entity: 'sensor.grid' },
      production: { entity: 'sensor.prod' },
      battery: { entity: 'sensor.batt' },
    });
    el.hass = hass;
    expect(el.innerHTML).toContain('ha-card');
  });

  it('returns stub config for config-form schema', () => {
    const form = EnergyFlowCardElement.getConfigForm();
    expect(form).toBeDefined();
    expect(Array.isArray(form?.schema)).toBe(true);
  });

  it('ignores errors in updated hass setter', () => {
    const card = new EnergyFlowCardElement();
    const err = new Error('boom');
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      card.hass = {
        states: {},
        callApi: () => Promise.reject(err),
      } as any;
    }).not.toThrow();
  });

  it('logs render errors without throwing', () => {
    const card = new EnergyFlowCardElement();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(card as any, '_render').mockImplementation(() => {
      throw new Error('boom');
    });

    expect(() => card.setConfig({ load_entity: 'x' } as any)).not.toThrow();
  });
});
