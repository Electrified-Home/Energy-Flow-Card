import type { ChartedCardConfig } from './types';

export interface ChartedCardFormConfig {
  type: 'custom:energy-flow-charted-card';
  graph_span?: string;
  entities?: {
    solar?: string;
    grid?: string;
    battery?: string;
    load?: string;
  };
}

export function getChartedConfigForm() {
  return {
    schema: [
      { name: 'hours_to_show', selector: { number: { min: 1, max: 168, mode: 'box' } } },
      { name: 'points_per_hour', selector: { number: { min: 1, max: 60, mode: 'box' } } },
      { name: 'hours_entity', selector: { entity: {} } },
      { name: 'points_per_hour_entity', selector: { entity: {} } },
      { name: 'entities.solar', selector: { entity: {} } },
      { name: 'entities.grid', selector: { entity: {} } },
      { name: 'entities.battery', selector: { entity: {} } },
      { name: 'entities.load', selector: { entity: {} } },
      { name: 'debug_overlay', selector: { boolean: {} } },
    ],
  };
}

export function normalizeConfig(config: any): ChartedCardConfig {
  const toNum = (val: any) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : undefined;
  };

  const normalizeBand = (band: any) => band && {
    start: band.start ?? '',
    end: band.end ?? '',
    color: band.color ?? '',
    label: band.label ?? null,
  };

  const normalizedBands = Array.isArray(config.time_bands)
    ? config.time_bands.map(normalizeBand)
    : [];

  return {
    type: 'custom:energy-flow-charted-card',
    hours_to_show: toNum(config.hours_to_show),
    points_per_hour: toNum(config.points_per_hour),
    hours_entity: config.hours_entity || undefined,
    points_per_hour_entity: config.points_per_hour_entity || undefined,
    entities: {
      solar: config.entities?.solar || '',
      grid: config.entities?.grid || '',
      battery: config.entities?.battery || '',
      load: config.entities?.load || '',
    },
    time_bands: normalizedBands,
    debug_overlay: Boolean(config.debug_overlay),
  };
}
