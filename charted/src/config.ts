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
      { name: 'graph_span', selector: { text: {} } },
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
    graph_span: config.graph_span || '12h',
    graph_interval: config.graph_interval || '5min',
    entities: {
      solar: config.entities?.solar || '',
      grid: config.entities?.grid || '',
      battery: config.entities?.battery || '',
      load: config.entities?.load || '',
    },
    time_bands: Array.isArray(config.time_bands) ? config.time_bands : [],
  };
}
