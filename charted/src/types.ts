export interface ChartedCardConfig {
  type: 'custom:energy-flow-charted-card';
  graph_span: string;
  graph_interval?: string; // e.g., '5min', '1min', '10min'
  entities: {
    solar: string;
    grid: string;
    battery: string;
    load: string;
  };
}

export interface StatisticValue {
  start: number;
  end: number;
  mean: number | null;
}
