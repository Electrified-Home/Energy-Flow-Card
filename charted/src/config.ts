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
      { name: 'entities.solar', selector: { entity: {} } },
      { name: 'entities.grid', selector: { entity: {} } },
      { name: 'entities.battery', selector: { entity: {} } },
      { name: 'entities.load', selector: { entity: {} } },
    ],
  };
}

export function normalizeConfig(config: any): ChartedCardConfig {
  return {
    type: 'custom:energy-flow-charted-card',
    hours_to_show: config.hours_to_show,
    points_per_hour: config.points_per_hour,
    entities: {
      solar: config.entities?.solar || '',
      grid: config.entities?.grid || '',
      battery: config.entities?.battery || '',
      load: config.entities?.load || '',
    },
    time_bands: Array.isArray(config.time_bands) ? config.time_bands : [],
  };
}
