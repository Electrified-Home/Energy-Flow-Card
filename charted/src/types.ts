export interface ChartedCardConfig {
  type: 'custom:energy-flow-charted-card';
  hours_to_show?: number;
  points_per_hour?: number;
  hours_entity?: string;
  points_per_hour_entity?: string;
  entities: {
    solar: string;
    grid: string;
    battery: string;
    load: string;
  };
  time_bands?: TimeBandConfig[];
  debug_overlay?: boolean;
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

export interface ProcessedData {
  positive: [number, number][];
  negative: [number, number][];
}

export interface HistoricalData {
  solar: StatisticValue[];
  grid: StatisticValue[];
  battery: StatisticValue[];
  load: StatisticValue[];
}

export interface ChipPosition {
  name: string;
  baseY: number;
  value: number;
}

export interface LiveValues {
  solar: number;
  grid: number;
  battery: number;
  load: number;
}

export interface LiveDebugPayload {
  timestamp: number;
  liveValues: LiveValues;
  chipPositions: Record<string, number>;
  stackedPositions: {
    solarStackY: number;
    dischargeStackY: number;
    importStackY: number;
    chargeStackY: number;
    exportStackY: number;
    loadY: number;
  };
}

export interface StackedValues {
  solar: number;
  discharge: number;
  import: number;
  charge: number;
  export: number;
  load: number;
}

export interface TimestampData {
  timestamps: number[];
  firstTs: number;
  lastTs: number;
}
