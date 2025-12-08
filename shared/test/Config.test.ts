import { describe, it, expect } from 'vitest';
import { getConfigForm, normalizeConfig } from '../src/Config';

describe('Config helpers', () => {
  it('getConfigForm returns expected core fields', () => {
    const form = getConfigForm();
    const names = form.schema.map((s: any) => s.name);
    expect(names).toContain('view_mode');
    expect(names).toContain('grid_entity');
    expect(names).toContain('load_entity');
  });

  it('normalizes flat config to nested shape', () => {
    const flat = {
      view_mode: 'compact',
      load_entity: 'sensor.load',
      grid_entity: 'sensor.grid',
      production_entity: 'sensor.prod',
      battery_entity: 'sensor.batt',
      battery_soc_entity: 'sensor.soc',
      invert_battery_data: true,
      invert_battery_view: true,
      show_plus: true,
    } as any;

    const normalized = normalizeConfig(flat);
    expect(normalized.mode).toBe('compact');
    expect(normalized.load?.entity).toBe('sensor.load');
    expect(normalized.battery?.soc_entity).toBe('sensor.soc');
    expect(normalized.battery?.invert?.data).toBe(true);
    expect(normalized.battery?.invert?.view).toBe(true);
    expect(normalized.battery?.showPlus).toBe(true);
  });

  it('normalizes invert data without invert view', () => {
    const flat = {
      load_entity: 'sensor.load',
      battery_entity: 'sensor.batt',
      invert_battery_data: true,
    } as any;

    const normalized = normalizeConfig(flat);
    expect(normalized.battery?.invert?.data).toBe(true);
    expect(normalized.battery?.invert?.view).toBeUndefined();
  });

  it('leaves showPlus undefined when not provided', () => {
    const flat = {
      load_entity: 'sensor.load',
      battery_entity: 'sensor.batt',
    } as any;
    const normalized = normalizeConfig(flat);
    expect(normalized.battery?.showPlus).toBeUndefined();
  });

  it('returns existing nested config unchanged', () => {
    const nested = {
      mode: 'default',
      load: { entity: 'sensor.load' },
    };
    const normalized = normalizeConfig(nested);
    expect(normalized).toBe(nested);
  });

  it('falls back to original if load missing', () => {
    const flat = { grid_entity: 'sensor.grid' } as any;
    const normalized = normalizeConfig(flat);
    expect(normalized).toBe(flat);
  });
});
