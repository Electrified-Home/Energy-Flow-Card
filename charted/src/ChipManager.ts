import type { ECharts } from 'echarts/core';
import type { HassObservable } from '../../shared/src/utils/HassObservable';
import type { ChartedCardConfig, ChipPosition, HistoricalData } from './types';
import { getLiveValue, getValueAtTimestamp, buildTimestampArray } from './calculations';
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

  constructor(hassObservable: HassObservable, config: ChartedCardConfig, chart: ECharts) {
    this.hassObservable = hassObservable;
    this.config = config;
    this.chart = chart;

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

    // Get current live values from hass
    this.liveValues = {
      solar: parseFloat(hass.states[this.config.entities.solar]?.state || '0') || this.liveValues.solar,
      grid: parseFloat(hass.states[this.config.entities.grid]?.state || '0') || this.liveValues.grid,
      battery: parseFloat(hass.states[this.config.entities.battery]?.state || '0') || this.liveValues.battery,
      load: parseFloat(hass.states[this.config.entities.load]?.state || '0') || this.liveValues.load,
    };

    this.renderChips();
  }

  /**
   * Render chips using current live values
   */
  renderChips(): void {
    const option = this.chart.getOption() as any;
    if (!option.series) return;

    const xAxis = Array.isArray(option.xAxis) ? option.xAxis[0] : option.xAxis;
    const axisData = xAxis?.data as number[] | undefined;
    const axisLastTs = Array.isArray(axisData) && axisData.length > 0 ? axisData[axisData.length - 1] : undefined;
    const lastTs = axisLastTs ?? this.lastTimestamp;
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

    const hasTimeBands = (this.config.time_bands || []).length > 0;
    const offset = hasTimeBands ? 1 : 0;

    // Build series array with ONLY markPoint updates
    const series = option.series.map((s: any, i: number) => {
      const seriesIndex = i - offset;
      
      if (seriesIndex === 0) return { ...s, markPoint: showChip(this.liveValues.solar) ? createMarkPoint(chipPositions['Solar'] ?? stackedPositions.solarStackY, this.liveValues.solar, 'Solar', false, lastTs, this.config.entities.solar, 30) : undefined };
      if (seriesIndex === 1) return { ...s, markPoint: (this.liveValues.battery >= 0 && showChip(this.liveValues.battery)) ? createMarkPoint(chipPositions['Discharge'] ?? stackedPositions.dischargeStackY, this.liveValues.battery, 'Discharge', false, lastTs, this.config.entities.battery, 30) : undefined };
      if (seriesIndex === 2) return { ...s, markPoint: (this.liveValues.grid >= 0 && showChip(this.liveValues.grid)) ? createMarkPoint(chipPositions['Import'] ?? stackedPositions.importStackY, this.liveValues.grid, 'Import', false, lastTs, this.config.entities.grid, 30) : undefined };
      if (seriesIndex === 3) return { ...s, markPoint: (this.liveValues.battery < 0 && showChip(this.liveValues.battery)) ? createMarkPoint(chipPositions['Charge'] ?? stackedPositions.chargeStackY, this.liveValues.battery, 'Charge', true, lastTs, this.config.entities.battery, 30) : undefined };
      if (seriesIndex === 4) return { ...s, markPoint: (this.liveValues.grid < 0 && showChip(this.liveValues.grid)) ? createMarkPoint(chipPositions['Export'] ?? stackedPositions.exportStackY, this.liveValues.grid, 'Export', true, lastTs, this.config.entities.grid, 30) : undefined };
      if (seriesIndex === 5) return { ...s, markPoint: createMarkPoint(chipPositions['Load'] ?? this.liveValues.load, this.liveValues.load, 'Load', false, lastTs, this.config.entities.load, 30) };
      
      return s;
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
