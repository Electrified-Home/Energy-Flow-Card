import type { ECharts } from 'echarts/core';
import type { HassObservable } from '../../shared/src/utils/HassObservable';
import type { ChartedCardConfig, ChipPosition, HistoricalData, LiveDebugPayload } from './types';
import { getLiveValue, getValueAtTimestamp, buildTimestampArray, quantizeTimestamp } from './calculations';
import { calculateStackedPositions, resolveChipCollisions, createMarkPoint } from './chartConfig';

/**
 * Manages live chip updates independently from chart data
 */
export class ChipManager {
  private hassObservable: HassObservable;
  private config: ChartedCardConfig;
  private chart: ECharts;
  private liveValues = { solar: 0, grid: 0, battery: 0, load: 0 };
  private updatePending = false;
  private rafId?: number;
  private lastTimestamp?: number;
  private onLiveValues?: (payload: LiveDebugPayload) => void;

  constructor(
    hassObservable: HassObservable,
    config: ChartedCardConfig,
    chart: ECharts,
    onLiveValues?: (payload: LiveDebugPayload) => void
  ) {
    this.hassObservable = hassObservable;
    this.config = config;
    this.chart = chart;
    this.onLiveValues = onLiveValues;

    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    const entities = Object.values(this.config.entities).filter(e => e);
    entities.forEach(entityId => {
      this.hassObservable.subscribe(entityId, () => {
        this.scheduleUpdate();
      });
    });
  }

  /**
   * Upserts a data point at the current interval boundary for live updates
   */
  private upsertSeriesData(
    series: any,
    timestamp: number,
    rawValue: number,
    mode: 'positive' | 'negative' | 'line'
  ): any {
    const data: [number, number][] = Array.isArray(series.data)
      ? series.data.map((pt: any) => [pt[0], pt[1]])
      : [];

    const value = mode === 'positive'
      ? Math.max(0, rawValue)
      : mode === 'negative'
        ? Math.min(0, rawValue)
        : rawValue;

    const idx = data.findIndex((d) => Array.isArray(d) && d[0] === timestamp);
    const point: [number, number] = [timestamp, value];

    if (idx >= 0) {
      data[idx] = point;
    } else {
      data.push(point);
      data.sort((a, b) => a[0] - b[0]);
    }

    return { ...series, data };
  }

  /**
   * Schedule a chip update (batches multiple entity changes into single render)
   */
  private scheduleUpdate(): void {
    if (this.updatePending) return;
    
    this.updatePending = true;
    this.rafId = requestAnimationFrame(() => {
      this.updatePending = false;
      this.updateChips();
    });
  }

  /**
   * Initialize chips with values from historical data
   */
  initialize(data: HistoricalData): void {
    const { lastTs } = buildTimestampArray(data);
    this.lastTimestamp = lastTs;

    const hass = this.hassObservable.hass;
    if (!hass) return;

    this.liveValues = {
      solar: getLiveValue(hass, this.config.entities.solar, getValueAtTimestamp(data.solar, lastTs)),
      grid: getLiveValue(hass, this.config.entities.grid, getValueAtTimestamp(data.grid, lastTs)),
      battery: getLiveValue(hass, this.config.entities.battery, getValueAtTimestamp(data.battery, lastTs)),
      load: getLiveValue(hass, this.config.entities.load, getValueAtTimestamp(data.load, lastTs)),
    };

    // Render chips with initial values
    this.renderChips();
  }

  /**
   * Update chips when entity values change
   */
  private updateChips(): void {
    const hass = this.hassObservable.hass;
    if (!hass) return;

    // Get current live values from hass (use getLiveValue for proper fallback handling)
    this.liveValues = {
      solar: getLiveValue(hass, this.config.entities.solar, this.liveValues.solar),
      grid: getLiveValue(hass, this.config.entities.grid, this.liveValues.grid),
      battery: getLiveValue(hass, this.config.entities.battery, this.liveValues.battery),
      load: getLiveValue(hass, this.config.entities.load, this.liveValues.load),
    };

    // Align to the active interval and render
    this.lastTimestamp = quantizeTimestamp(Date.now(), this.config.points_per_hour);

    this.renderChips();
  }

  /**
   * Render chips using current live values
   */
  renderChips(): void {
    const option = this.chart.getOption() as any;
    if (!option.series) return;
    const lastTs = this.lastTimestamp ?? quantizeTimestamp(Date.now(), this.config.points_per_hour);
    if (!lastTs) return;

    const stackedPositions = calculateStackedPositions(this.liveValues);
    const showChip = (val: number) => Math.abs(val) > 1e-3;
    
    const visibleChips: ChipPosition[] = [];
    visibleChips.push({ name: 'Load', baseY: this.liveValues.load, value: this.liveValues.load });
    if (showChip(this.liveValues.solar)) visibleChips.push({ name: 'Solar', baseY: stackedPositions.solarStackY, value: this.liveValues.solar });
    if (this.liveValues.battery >= 0 && showChip(this.liveValues.battery)) visibleChips.push({ name: 'Discharge', baseY: stackedPositions.dischargeStackY, value: this.liveValues.battery });
    if (this.liveValues.grid >= 0 && showChip(this.liveValues.grid)) visibleChips.push({ name: 'Import', baseY: stackedPositions.importStackY, value: this.liveValues.grid });
    if (this.liveValues.battery < 0 && showChip(this.liveValues.battery)) visibleChips.push({ name: 'Charge', baseY: stackedPositions.chargeStackY, value: this.liveValues.battery });
    if (this.liveValues.grid < 0 && showChip(this.liveValues.grid)) visibleChips.push({ name: 'Export', baseY: stackedPositions.exportStackY, value: this.liveValues.grid });

    const chipPositions = resolveChipCollisions(visibleChips, this.liveValues.load, this.chart);

    // Emit live values for debug overlay (not chart-dependent)
    this.onLiveValues?.({
      timestamp: lastTs,
      liveValues: { ...this.liveValues },
      chipPositions,
      stackedPositions,
    });

    // Build series array with data updates and markPoint placement based on names
    const series = option.series.map((s: any) => {
      switch (s.name) {
        case 'Solar': {
          const updated = this.upsertSeriesData(s, lastTs, this.liveValues.solar, 'positive');
          return showChip(this.liveValues.solar)
            ? { ...updated, markPoint: createMarkPoint(chipPositions['Solar'] ?? stackedPositions.solarStackY, this.liveValues.solar, 'Solar', false, lastTs, this.config.entities.solar, 30) }
            : { ...updated, markPoint: undefined };
        }
        case 'Discharge': {
          const updated = this.upsertSeriesData(s, lastTs, this.liveValues.battery, 'positive');
          return (this.liveValues.battery >= 0 && showChip(this.liveValues.battery))
            ? { ...updated, markPoint: createMarkPoint(chipPositions['Discharge'] ?? stackedPositions.dischargeStackY, this.liveValues.battery, 'Discharge', false, lastTs, this.config.entities.battery, 30) }
            : { ...updated, markPoint: undefined };
        }
        case 'Import': {
          const updated = this.upsertSeriesData(s, lastTs, this.liveValues.grid, 'positive');
          return (this.liveValues.grid >= 0 && showChip(this.liveValues.grid))
            ? { ...updated, markPoint: createMarkPoint(chipPositions['Import'] ?? stackedPositions.importStackY, this.liveValues.grid, 'Import', false, lastTs, this.config.entities.grid, 30) }
            : { ...updated, markPoint: undefined };
        }
        case 'Charge': {
          const updated = this.upsertSeriesData(s, lastTs, this.liveValues.battery, 'negative');
          return (this.liveValues.battery < 0 && showChip(this.liveValues.battery))
            ? { ...updated, markPoint: createMarkPoint(chipPositions['Charge'] ?? stackedPositions.chargeStackY, this.liveValues.battery, 'Charge', true, lastTs, this.config.entities.battery, 30) }
            : { ...updated, markPoint: undefined };
        }
        case 'Export': {
          const updated = this.upsertSeriesData(s, lastTs, this.liveValues.grid, 'negative');
          return (this.liveValues.grid < 0 && showChip(this.liveValues.grid))
            ? { ...updated, markPoint: createMarkPoint(chipPositions['Export'] ?? stackedPositions.exportStackY, this.liveValues.grid, 'Export', true, lastTs, this.config.entities.grid, 30) }
            : { ...updated, markPoint: undefined };
        }
        case 'Load': {
          const updated = this.upsertSeriesData(s, lastTs, this.liveValues.load, 'line');
          return { ...updated, markPoint: createMarkPoint(chipPositions['Load'] ?? this.liveValues.load, this.liveValues.load, 'Load', false, lastTs, this.config.entities.load, 30) };
        }
        default:
          return s;
      }
    });

    // Update chart with modified series
    this.chart.setOption({ series }, false);
  }

  dispose(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.hassObservable.unsubscribeAll();
  }
}
