import type { ECharts } from 'echarts/core';
import type { MarkPointComponentOption } from 'echarts/components';
import type { ChartedCardConfig, HistoricalData, StatisticValue, ChipPosition } from './types';
import { ICONS, COLORS, hexToRgba, buildTimeBandAreas, formatTimeLabel, formatTooltip, formatYAxisLabel } from './utils';

/**
 * Calculates stacked Y positions for all energy sources
 */
export function calculateStackedPositions(values: {
  solar: number;
  grid: number;
  battery: number;
  load: number;
}): {
  solarStackY: number;
  dischargeStackY: number;
  importStackY: number;
  chargeStackY: number;
  exportStackY: number;
  loadY: number;
} {
  const importVal = Math.max(0, values.grid);
  const exportVal = Math.min(0, values.grid);
  const dischargeVal = Math.max(0, values.battery);
  const chargeVal = Math.min(0, values.battery);

  // Stacked positions (grid always outermost; battery adjacent to zero on negatives)
  const solarStackY = values.solar;
  const dischargeStackY = values.solar + dischargeVal;
  const importStackY = values.solar + dischargeVal + importVal;
  const chargeStackY = chargeVal;
  const exportStackY = chargeVal + exportVal;

  return {
    solarStackY,
    dischargeStackY,
    importStackY,
    chargeStackY,
    exportStackY,
    loadY: values.load,
  };
}

/**
 * Creates a mark point for a series chip
 */
export function createMarkPoint(
  y: number,
  value: number,
  iconKey: keyof typeof ICONS,
  formatSigned: boolean,
  lastTs: number,
  entityId?: string,
  zIndex = 0
): MarkPointComponentOption {
  return {
    symbol: 'circle',
    symbolSize: 12,
    silent: false,
    z: zIndex,
    itemStyle: { color: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)' },
    label: {
      show: true,
      formatter: () => {
        if (formatSigned) {
          const shown = -value;
          const str = shown >= 0 ? `+${shown.toFixed(1)}` : shown.toFixed(1);
          return `${ICONS[iconKey] ?? '●'} ${str} W`;
        }
        return `${ICONS[iconKey] ?? '●'} ${value.toFixed(1)} W`;
      },
      color: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      padding: [6, 8],
      borderRadius: 6,
      fontSize: 16,
      position: 'right',
      distance: 1,
      align: 'left',
    },
    data: [
      {
        name: iconKey,
        coord: [lastTs, y],
        value,
        entityId,
      } as any,
    ],
  };
}

/**
 * Resolves chip position collisions using pixel-based positioning
 */
export function resolveChipCollisions(
  visibleChips: ChipPosition[],
  loadValue: number,
  chart: ECharts
): Record<string, number> {
  const chipPositions: Record<string, number> = {};
  const minGapPx = 32; // minimum pixel gap between chips

  const convertToPixel = (val: number): number | null => {
    try {
      const res = chart.convertToPixel({ yAxisIndex: 0 }, val);
      return typeof res === 'number' ? res : null;
    } catch {
      return null;
    }
  };

  const convertToValue = (px: number): number | null => {
    try {
      const res = chart.convertFromPixel({ yAxisIndex: 0 }, px);
      return typeof res === 'number' ? res : null;
    } catch {
      return null;
    }
  };

  const loadPx = convertToPixel(loadValue);
  if (loadPx !== null) {
    const chipsPx = visibleChips.map(c => ({
      name: c.name,
      px: convertToPixel(c.baseY) ?? 0,
      baseY: c.baseY,
    }));

    // Separate into above (smaller px = visually higher) and below load
    const above = chipsPx.filter(c => c.name !== 'Load' && c.px < loadPx).sort((a, b) => a.px - b.px);
    const below = chipsPx.filter(c => c.name !== 'Load' && c.px > loadPx).sort((a, b) => a.px - b.px);

    chipPositions['Load'] = loadValue;

    // Place chips above load (working upward from load)
    let lastPx = loadPx;
    for (const chip of above) {
      const targetPx = chip.px;
      const adjustedPx = (lastPx - targetPx < minGapPx) ? lastPx - minGapPx : targetPx;
      const adjustedVal = convertToValue(adjustedPx);
      chipPositions[chip.name] = adjustedVal !== null ? adjustedVal : chip.baseY;
      lastPx = adjustedPx;
    }

    // Place chips below load (working downward from load)
    lastPx = loadPx;
    for (const chip of below) {
      const targetPx = chip.px;
      const adjustedPx = (targetPx - lastPx < minGapPx) ? lastPx + minGapPx : targetPx;
      const adjustedVal = convertToValue(adjustedPx);
      chipPositions[chip.name] = adjustedVal !== null ? adjustedVal : chip.baseY;
      lastPx = adjustedPx;
    }
  } else {
    // Fallback: use base positions if pixel conversion fails
    visibleChips.forEach(c => chipPositions[c.name] = c.baseY);
  }

  return chipPositions;
}

/**
 * Creates a data series for the chart
 */
export function createSeries(
  stats: StatisticValue[] | undefined,
  timestamps: number[],
  name: string,
  stack: string,
  color: string,
  isPositive: boolean,
  gradientDir: 'down' | 'up',
  markPoint?: MarkPointComponentOption
): any {
  const valueMap = new Map<number, number>();
  (stats || []).forEach((s) => {
    const x = s.start; // use quantized bucket start
    valueMap.set(x, s.mean ?? 0);
  });

  const dataPoints = timestamps.map((t) => {
    const v = valueMap.get(t) ?? 0;
    const val = isPositive ? Math.max(0, v) : Math.min(0, v);
    return [t, val];
  });

  const gradient = gradientDir === 'down'
    ? { x: 0, y: 0, x2: 0, y2: 1 }
    : { x: 0, y: 1, x2: 0, y2: 0 };

  return {
    name,
    type: 'line',
    smooth: true,
    stack,
    stackStrategy: 'all',
    showSymbol: false,
    areaStyle: {
      color: {
        type: 'linear',
        ...gradient,
        colorStops: [
          { offset: 0, color: hexToRgba(color, 0.98) },
          { offset: 1, color: hexToRgba(color, 0.8) },
        ],
      },
    },
    lineStyle: { width: 0 },
    data: dataPoints,
    color,
    markPoint,
  };
}

/**
 * Creates the load line series (non-stacked)
 */
export function createLoadSeries(
  loadStats: StatisticValue[] | undefined,
  markPoint?: MarkPointComponentOption
): any {
  if (!loadStats || loadStats.length === 0) return null;

  const lineData = loadStats.map(s => [s.start, s.mean]);
  return {
    name: 'Load',
    type: 'line',
    smooth: true,
    showSymbol: false,
    lineStyle: {
      width: 4,
      color: COLORS.load,
    },
    data: lineData,
    color: COLORS.load,
    markPoint,
  };
}

/**
 * Creates time band series for chart background
 */
export function createTimeBandSeries(
  firstTs: number,
  lastTs: number,
  timeBands: ChartedCardConfig['time_bands']
): any | null {
  const bandAreas = buildTimeBandAreas(firstTs, lastTs, timeBands || []);
  if (bandAreas.length === 0) return null;

  return {
    name: 'Time Bands',
    type: 'line',
    data: [],
    silent: true,
    symbol: 'none',
    lineStyle: { opacity: 0 },
    markArea: {
      silent: true,
      itemStyle: { opacity: 1 },
      data: bandAreas,
    },
    z: -5,
  };
}

/**
 * Builds complete chart option configuration (without chips - ChipManager handles those)
 */
export function buildChartOption(
  data: HistoricalData,
  timestamps: number[],
  firstTs: number,
  lastTs: number,
  config: ChartedCardConfig
): any {
  const datasets: any[] = [];

  // Time bands (optional background shading)
  const timeBandSeries = createTimeBandSeries(firstTs, lastTs, config.time_bands);
  if (timeBandSeries) {
    datasets.push(timeBandSeries);
  }

  // Solar (production) - ChipManager will add markPoint
  datasets.push(createSeries(
    data.solar,
    timestamps,
    'Solar',
    'production',
    COLORS.solar,
    true,
    'down'
  ));

  // Battery Discharge (production, near zero) - ChipManager will add markPoint
  datasets.push(createSeries(
    data.battery,
    timestamps,
    'Discharge',
    'production',
    COLORS.discharge,
    true,
    'down'
  ));

  // Grid Import (production, outermost) - ChipManager will add markPoint
  datasets.push(createSeries(
    data.grid,
    timestamps,
    'Import',
    'production',
    COLORS.import,
    true,
    'down'
  ));

  // Battery Charge (storage, touching zero) - ChipManager will add markPoint
  datasets.push(createSeries(
    data.battery,
    timestamps,
    'Charge',
    'storage',
    COLORS.charge,
    false,
    'up'
  ));

  // Grid Export (storage, outermost) - ChipManager will add markPoint
  datasets.push(createSeries(
    data.grid,
    timestamps,
    'Export',
    'storage',
    COLORS.export,
    false,
    'up'
  ));

  // Load line (not stacked) - ChipManager will add markPoint
  const loadSeries = createLoadSeries(data.load);
  if (loadSeries) {
    datasets.push(loadSeries);
  }

  return {
    legend: { show: false },
    grid: {
      left: 50,
      right: 120,
      top: 40,
      bottom: 50,
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: formatTimeLabel,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      name: 'W',
      min: 'dataMin',
      max: 'dataMax',
      axisLabel: {
        formatter: formatYAxisLabel,
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 13,
      },
      axisLine: {
        show: true,
        lineStyle: { color: 'rgba(255, 255, 255, 0.6)', width: 1 },
      },
      axisTick: {
        show: true,
        lineStyle: { color: 'rgba(255, 255, 255, 0.6)' },
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1,
        },
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: formatTooltip,
    },
    series: datasets,
  };
}
