import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  MarkPointComponent,
  MarkAreaComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ChartedCardConfig, HistoricalData } from './types';
import type { HomeAssistant } from '../../shared/src/types/HASS';
import type { HassObservable } from '../../shared/src/utils/HassObservable';
import { ChipManager } from './ChipManager';
import { 
  fetchHistoricalData, 
  buildTimestampArray,
  mergeLivePoint
} from './calculations';
import { 
  buildChartOption
} from './chartConfig';

// Register required ECharts components
echarts.use([LineChart, GridComponent, LegendComponent, MarkPointComponent, MarkAreaComponent, TooltipComponent, CanvasRenderer]);

/**
 * ChartedRenderer manages the ECharts instance lifecycle and coordinates data updates
 * It delegates data processing to calculations.ts and option building to chartConfig.ts
 */
export class ChartedRenderer {
  private chart: echarts.ECharts;
  private hass: HomeAssistant;
  private config: ChartedCardConfig;
  private container: HTMLElement;
  private resizeObserver: ResizeObserver;
  private chipManager: ChipManager;
  public lastHistoricalData?: HistoricalData;
  private onLiveValues?: (payload: any) => void;
  private disposed = false;

  constructor(
    container: HTMLElement,
    hass: HomeAssistant,
    config: ChartedCardConfig,
    hassObservable: HassObservable,
    onLiveValues?: (payload: any) => void
  ) {
    this.hass = hass;
    this.config = config;
    this.container = container;
    this.onLiveValues = onLiveValues;
    this.chart = echarts.init(container);
    this.chart.on('click', this._handleChartClick);
    
    // ChipManager handles all live chip updates via observable subscriptions
    this.chipManager = new ChipManager(hassObservable, config, this.chart, this.onLiveValues);
    
    // Watch for container size changes and resize chart
    this.resizeObserver = new ResizeObserver(() => {
      this.chart.resize();
    });
    this.resizeObserver.observe(container);
  }

  async update(hass: HomeAssistant, config: ChartedCardConfig) {
    if (this.disposed) return;

    this.hass = hass;
    this.config = config;

    try {
      const data = await fetchHistoricalData(hass, config);
      if (this.disposed) return;
      const { merged } = mergeLivePoint(data, hass, config);
      this.lastHistoricalData = merged;
      this._renderChart(merged);
      // Initialize chip manager with historical data for fallback values
      this.chipManager.initialize(merged);
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }

  private _renderChart(data: HistoricalData) {
    if (this.disposed) return;

    // Build unified timestamp array for proper stacking
    const { timestamps, firstTs, lastTs } = buildTimestampArray(data);

    // Build chart option (without chips - ChipManager handles those)
    const option = buildChartOption(
      data,
      timestamps,
      firstTs,
      lastTs,
      this.config
    );

    // Update chart
    this.chart.setOption(option, { notMerge: false, replaceMerge: ['series'] });
  }

  private _handleChartClick = (params: any) => {
    if (params.componentType !== 'markPoint') return;
    const entityId = params.data?.entityId as string | undefined;
    if (!entityId) return;
    this._openMoreInfo(entityId);
  };

  private _openMoreInfo(entityId: string) {
    const event = new CustomEvent('hass-more-info', {
      detail: { entityId },
      bubbles: true,
      composed: true,
    });
    this.container.dispatchEvent(event);
  }

  resize() {
    if (this.disposed) return;
    this.chart.resize();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.chart.off('click', this._handleChartClick);
    this.resizeObserver.disconnect();
    this.chipManager.dispose();
    this.chart.dispose();
  }
}
