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
  time_bands?: TimeBandConfig[];
}

export interface StatisticValue {
  start: number;
  end: number;
  mean: number | null;
}

export interface TimeBandConfig {
  start: string; // 'HH:MM'
  end: string;   // 'HH:MM'
  color: string; // hex color like '#ffeb3b'
  label?: string | null;
}
