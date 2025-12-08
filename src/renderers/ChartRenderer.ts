import { createGridLines, createTimeLabels, createYAxisLabels, createAreaPath, createLoadLine } from '../chart/chart-utils';
import { StreamingPlot } from '../chart/StreamingPlot';
import { handleAction } from '../utils/helpers';
import type { EnergyFlowCardConfig, EntityConfig } from '../types/Config.d.ts';

export interface DataPoint {
  time: Date;
  solar: number;
  batteryDischarge: number;
  batteryCharge: number;
  gridImport: number;
  gridExport: number;
  load: number;
}

export interface LiveChartValues {
  grid: number;
  load: number;
  production: number;
  battery: number;
}

export interface ChartDataCache {
  timestamp: number;
  dataPoints: DataPoint[];
}

/**
 * ChartRenderer handles all chart mode rendering logic.
 * Responsibilities:
 * - Fetch and process historical data
 * - Render stacked area charts with proper scaling
 * - Extract and render icons from Home Assistant
 * - Update chart indicators with live values
 * - Handle click interactions on chart elements
 */
export class ChartRenderer {
  private hass: any;
  private config: EnergyFlowCardConfig;
  private fireEvent: (type: string, detail?: any) => void;
  private iconCache: Map<string, string> = new Map();
  private chartDataCache?: ChartDataCache;
  private chartRenderPending = false;
  private indicatorUpdateTimeout?: number;
  private lastIndicatorUpdate = 0;
  private liveChartValues?: LiveChartValues;
  private containerRef?: HTMLElement;
  private visibilityHandler?: () => void;
  private readonly fetchDeferMs = 16;
  private readonly cacheMaxAgeMs = 5 * 60 * 1000;
  private readonly refreshIntervalMs = 60 * 1000;
  private streamingSupplyPlots?: { solar: StreamingPlot; batteryDischarge: StreamingPlot; gridImport: StreamingPlot };
  private streamingDemandPlots?: { batteryCharge: StreamingPlot; gridExport: StreamingPlot };
  private streamingLoadPlot?: StreamingPlot;
  private streamingMeta?: { expectedPoints: number; supplyScale: number; demandScale: number; zeroLineY: number; chartWidth: number };
  private streamingQueue: DataPoint[] = []; // Queue of points to render
  private streamingActive = false;
  private streamingSvg?: Element;
  private streamingHoursToShow = 12;
  private streamingFrameId?: number;

  private getEntityId(entityConfig?: EntityConfig): string {
    return entityConfig?.entity || '';
  }

  private getTapAction(entityConfig?: EntityConfig): any {
    return entityConfig?.tap;
  }

  private ensureVisibilityListener(): void {
    if (this.visibilityHandler) return;

    this.visibilityHandler = () => {
      if (!this.isVisible()) return;
      const svg = this.containerRef?.querySelector('.chart-svg');
      if (svg && this.shouldRefresh()) {
        this.scheduleDataFetch(svg, 12, 'visibility', true);
      }
    };

    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  private isVisible(): boolean {
    if (!this.containerRef) return false;
    if (document.hidden) return false;
    if (!this.containerRef.isConnected) return false;
    return this.containerRef.offsetParent !== null;
  }

  private shouldRefresh(): boolean {
    if (this.chartRenderPending) return false;
    if (!this.isVisible()) return false;
    if (!this.chartDataCache) return true;

    const age = Date.now() - this.chartDataCache.timestamp;
    return age > this.refreshIntervalMs;
  }

  private scheduleDataFetch(svg: Element, hoursToShow: number, _reason: string, forceFetch = false): void {
    if (this.chartRenderPending) return;
    if (forceFetch) {
      this.chartDataCache = undefined;
      this.streamingMeta = undefined;
    }
    this.chartRenderPending = true;
    setTimeout(() => this.fetchAndRenderChart(svg, hoursToShow), this.fetchDeferMs);
  }

  constructor(hass: any, config: EnergyFlowCardConfig, fireEvent: (type: string, detail?: any) => void) {
    this.hass = hass;
    this.config = config;
    this.fireEvent = fireEvent;
  }

  setConfig(config: EnergyFlowCardConfig): void {
    this.config = config;
  }

  /**
   * Update live chart values for indicators
   */
  updateLiveValues(values: LiveChartValues): void {
    this.liveChartValues = values;
  }

  /**
   * Render chart view (main entry point)
   */
  render(container: HTMLElement): void {
    this.containerRef = container;
    this.ensureVisibilityListener();

    // Initialize chart structure if needed
    if (!container.querySelector('.chart-view')) {
      this.initializeChartStructure(container);
    } else {
      if (this.liveChartValues) {
        // Update live values for indicators
        this.throttledUpdateChartIndicators(container);
      }

      // Refresh data when view is visible and cache is stale
      const svg = container.querySelector('.chart-svg');
      if (svg && this.shouldRefresh()) {
        this.scheduleDataFetch(svg, 12, 'stale', true);
      }
    }
  }

  /**
   * Initialize chart HTML structure
   */
  private initializeChartStructure(container: HTMLElement): void {
    container.innerHTML = `
      <ha-card>
        <style>
          :host {
            display: block;
            width: 100%;
            height: 100%;
          }
          ha-card {
            padding: 0;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          .chart-view {
            display: flex;
            flex-direction: column;
            width: 100%;
            flex: 1;
            min-height: 0;
          }
          .chart-container {
            flex: 1;
            position: relative;
            min-height: 200px;
            overflow: hidden;
          }
          svg.chart-svg {
            width: 100%;
            height: 100%;
          }
        </style>
        <div class="chart-view">
          <div class="chart-container">
            <svg class="chart-svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
              <!-- Chart will be rendered here -->
            </svg>
          </div>
        </div>
      </ha-card>
    `;

    // Fetch and render chart data
    const svg = container.querySelector('.chart-svg');
    if (svg) {
      this.renderBaseFrame(svg, 12);
      this.scheduleDataFetch(svg, 12, 'initial');
    }
  }

  /**
   * Throttle chart indicator updates
   */
  private throttledUpdateChartIndicators(container: HTMLElement): void {
    if (this.indicatorUpdateTimeout) {
      clearTimeout(this.indicatorUpdateTimeout);
      this.indicatorUpdateTimeout = undefined;
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastIndicatorUpdate;
    const minUpdateInterval = 250;

    if (timeSinceLastUpdate >= minUpdateInterval) {
      const svg = container.querySelector('.chart-svg');
      if (svg) this.updateChartIndicators(svg);
      this.lastIndicatorUpdate = now;
    } else {
      const delay = minUpdateInterval - timeSinceLastUpdate;
      this.indicatorUpdateTimeout = window.setTimeout(() => {
        const svg = container.querySelector('.chart-svg');
        if (svg) this.updateChartIndicators(svg);
        this.lastIndicatorUpdate = Date.now();
        this.indicatorUpdateTimeout = undefined;
      }, delay);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.indicatorUpdateTimeout) {
      clearTimeout(this.indicatorUpdateTimeout);
      this.indicatorUpdateTimeout = undefined;
    }
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = undefined;
    }
    if (this.streamingFrameId) {
      cancelAnimationFrame(this.streamingFrameId);
      this.streamingFrameId = undefined;
    }
    this.streamingActive = false;
    this.chartDataCache = undefined;
  }

  /** Hide the loading overlay once data is ready or on error - REMOVED */
  private hideLoading(_svgElement: Element): void {
    // Loading message removed
  }

  /**
   * Get icon name from config or use default
   */
  private getIcon(entityConfig: EntityConfig | undefined, fallback: string): string {
    if (entityConfig?.icon) return entityConfig.icon;

    const entityId = entityConfig?.entity;
    if (entityId && this.hass?.states?.[entityId]) {
      const entityIcon = this.hass.states[entityId].attributes?.icon;
      if (entityIcon) return entityIcon;
    }

    return fallback;
  }

  /**
   * Fetch and render chart, using cache if available
   */
  async fetchAndRenderChart(svgElement: Element, hoursToShow = 12): Promise<void> {
    if (!this.chartRenderPending) {
      this.chartRenderPending = true;
    }

    const now = Date.now();
    const cacheAge = this.chartDataCache ? now - this.chartDataCache.timestamp : Infinity;

    // Clear expired cache
    if (this.chartDataCache && cacheAge >= this.cacheMaxAgeMs) {
      this.chartDataCache = undefined;
    }

    // Use cached data if fresh
    if (this.chartDataCache && cacheAge < this.cacheMaxAgeMs) {
      requestAnimationFrame(() => {
        this.renderChartFromCache(svgElement, hoursToShow);
      });
      this.chartRenderPending = false;
      return;
    }

    const end = new Date();
    const start = new Date(end.getTime() - hoursToShow * 60 * 60 * 1000);

    try {
      const [productionHistory, gridHistory, loadHistory, batteryHistory] = await this.fetchHistoriesProgressively(start, end);

      await this.drawStackedAreaChart(svgElement, productionHistory, gridHistory, loadHistory, batteryHistory, hoursToShow);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      this.chartRenderPending = false;
      svgElement.innerHTML = `
        <text x="400" y="200" text-anchor="middle" fill="rgb(160, 160, 160)" font-size="14">
          Error loading chart data
        </text>
      `;
      this.hideLoading(svgElement);
    }
  }

  /**
   * Fetch history from Home Assistant
   */
  private async fetchHistory(entityId: string, start: Date, end: Date): Promise<Array<{ state: string; last_changed: string }>> {
    if (!entityId) return [];
    const url = `history/period/${start.toISOString()}?filter_entity_id=${entityId}&end_time=${end.toISOString()}&minimal_response&no_attributes`;
    
    const response = await this.hass.callApi('GET', url);
    return response && response.length > 0 ? response[0] : [];
  }

  private async fetchHistoriesProgressively(start: Date, end: Date): Promise<[
    Array<{ state: string; last_changed: string }>,
    Array<{ state: string; last_changed: string }>,
    Array<{ state: string; last_changed: string }>,
    Array<{ state: string; last_changed: string }>
  ]> {
    const entities = [
      this.getEntityId(this.config.production),
      this.getEntityId(this.config.grid),
      this.getEntityId(this.config.load),
      this.getEntityId(this.config.battery),
    ];

    const histories: Array<Array<{ state: string; last_changed: string }>> = [];

    for (const entityId of entities) {
      histories.push(await this.fetchHistory(entityId, start, end));
      await new Promise(resolve => setTimeout(resolve, this.fetchDeferMs));
    }

    return histories as [
      Array<{ state: string; last_changed: string }>,
      Array<{ state: string; last_changed: string }>,
      Array<{ state: string; last_changed: string }>,
      Array<{ state: string; last_changed: string }>
    ];
  }

  private renderBaseFrame(svgElement: Element, hoursToShow: number): void {
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 150, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const supplyHeight = chartHeight * 0.5;
    const zeroLineY = margin.top + supplyHeight;

    const baseContent = `
      <g opacity="0.1">
        ${createGridLines(chartWidth, chartHeight, margin)}
      </g>
      <line x1="${margin.left}" y1="${zeroLineY}" x2="${margin.left + chartWidth}" y2="${zeroLineY}" stroke="rgb(160, 160, 160)" stroke-width="1" stroke-dasharray="4,4" />
    `;

    svgElement.innerHTML = `
      <g id="chart-base"></g>
      <g id="chart-content">
        <g id="chart-demand"></g>
        <g id="chart-supply"></g>
        <g id="chart-load"></g>
      </g>
      <g id="chart-icons"></g>
    `;

    const baseGroup = svgElement.querySelector('#chart-base');
    if (baseGroup) {
      baseGroup.innerHTML = baseContent;
    }

    // Initialize streaming plots early so they exist before data arrives
    this.ensureStreamingPlots(svgElement);
    
    // Pre-initialize with expected geometry so plots are ready to grow
    const expectedPoints = hoursToShow * 12;
    if (this.streamingSupplyPlots && this.streamingDemandPlots && this.streamingLoadPlot) {
      const xOffset = margin.left;
      this.streamingSupplyPlots.solar.reset(expectedPoints, chartWidth, zeroLineY, 1, xOffset);
      this.streamingSupplyPlots.batteryDischarge.reset(expectedPoints, chartWidth, zeroLineY, 1, xOffset);
      this.streamingSupplyPlots.gridImport.reset(expectedPoints, chartWidth, zeroLineY, 1, xOffset);
      this.streamingDemandPlots.batteryCharge.reset(expectedPoints, chartWidth, zeroLineY, 1, xOffset);
      this.streamingDemandPlots.gridExport.reset(expectedPoints, chartWidth, zeroLineY, 1, xOffset);
      this.streamingLoadPlot.reset(expectedPoints, chartWidth, zeroLineY, 1, xOffset);
    }
  }

  private renderChartLayers(
    svgElement: Element,
    layers: { baseContent: string; demandPaths: string | null; supplyPaths: string | null; loadLine: string | null },
    dataPoints: DataPoint[],
    chartWidth: number,
    margin: { top: number; right: number; bottom: number; left: number },
    supplyHeight: number,
    demandHeight: number,
    supplyScale: number,
    demandScale: number,
    zeroLineY: number,
    includeIcons = true
  ): void {
    const ensureGroup = (id: string) => {
      let group = svgElement.querySelector(`#${id}`);
      if (!group) {
        group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', id);
        svgElement.appendChild(group);
      }
      return group as Element;
    };

    const baseGroup = ensureGroup('chart-base');
    const demandGroup = ensureGroup('chart-demand');
    const supplyGroup = ensureGroup('chart-supply');
    const iconsGroup = ensureGroup('chart-icons');
    const loadGroup = ensureGroup('chart-load');

    baseGroup.innerHTML = layers.baseContent;

    requestAnimationFrame(() => {
      if (layers.demandPaths !== null) demandGroup.innerHTML = layers.demandPaths;
      if (layers.supplyPaths !== null) supplyGroup.innerHTML = layers.supplyPaths;
      iconsGroup.innerHTML = includeIcons ? this.createChartIconSources() : '';

      requestAnimationFrame(() => {
        if (includeIcons) {
          this.updateChartIndicators(svgElement);
          this.attachChartAreaClickHandlers(svgElement);
        }
        if (layers.loadLine !== null) {
          this.addLoadLineOnTop(loadGroup, layers.loadLine);
        }
        this.hideLoading(svgElement);

        if (includeIcons) {
          requestAnimationFrame(() => {
            this.extractChartIcons(svgElement, dataPoints, chartWidth, supplyHeight, demandHeight, supplyScale, demandScale, margin, zeroLineY);
          });
        }
      });
    });
  }

  private ensureStreamingPlots(svgElement: Element): void {
    const supplyGroup = svgElement.querySelector('#chart-supply');
    const demandGroup = svgElement.querySelector('#chart-demand');
    const loadGroup = svgElement.querySelector('#chart-load');
    if (!supplyGroup || !demandGroup || !loadGroup) return;

    // Clear existing paths if plots already exist (on reload/remount)
    if (this.streamingSupplyPlots) {
      // Plots exist, no need to recreate
      return;
    }

    // Create plots once - they'll be added to DOM immediately and start empty
    this.streamingSupplyPlots = {
      solar: new StreamingPlot(supplyGroup, { mode: 'area', direction: 'down', fill: '#388e3c', opacity: 0.85, id: 'chart-area-solar' }),
      batteryDischarge: new StreamingPlot(supplyGroup, { mode: 'area', direction: 'down', fill: '#1976d2', opacity: 0.8, id: 'chart-area-battery-discharge' }),
      gridImport: new StreamingPlot(supplyGroup, { mode: 'area', direction: 'down', fill: '#c62828', opacity: 0.8, id: 'chart-area-grid-import' }),
    };

    this.streamingDemandPlots = {
      batteryCharge: new StreamingPlot(demandGroup, { mode: 'area', direction: 'up', fill: '#1976d2', opacity: 0.8, id: 'chart-area-battery-charge' }),
      gridExport: new StreamingPlot(demandGroup, { mode: 'area', direction: 'up', fill: '#f9a825', opacity: 0.8, id: 'chart-area-grid-export' }),
    };

    this.streamingLoadPlot = new StreamingPlot(loadGroup, { mode: 'line', direction: 'down', stroke: '#CCCCCC', strokeWidth: 3, opacity: 0.9, id: 'load-line' });
  }

  /**
   * Render chart from cached data
   */
  renderChartFromCache(svgElement: Element, hoursToShow: number): void {
    if (!this.chartDataCache) return;

    const dataPoints = this.chartDataCache.dataPoints;
    
    // Calculate scaling
    const maxSupply = Math.max(...dataPoints.map(d => d.solar + d.batteryDischarge + d.gridImport), ...dataPoints.map(d => d.load));
    const maxDemand = Math.max(...dataPoints.map(d => d.batteryCharge + d.gridExport));
    const totalRange = maxSupply + maxDemand;
    const supplyRatio = totalRange > 0 ? maxSupply / totalRange : 0.5;
    const demandRatio = totalRange > 0 ? maxDemand / totalRange : 0.5;

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 150, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const supplyHeight = chartHeight * supplyRatio;
    const demandHeight = chartHeight * demandRatio;
    
    const supplyScale = maxSupply > 0 ? supplyHeight / (maxSupply * 1.1) : 1;
    const demandScale = maxDemand > 0 ? demandHeight / (maxDemand * 1.1) : 1;
    const zeroLineY = margin.top + supplyHeight;

    // Render chart paths
    const expectedPoints = Math.max(dataPoints.length, hoursToShow * 12);
    const supplyPaths = this.createStackedPaths(dataPoints, chartWidth, supplyHeight, supplyScale, margin, 'supply', zeroLineY, expectedPoints);
    const demandPaths = this.createStackedPaths(dataPoints, chartWidth, demandHeight, demandScale, margin, 'demand', zeroLineY, expectedPoints);
    const loadLine = createLoadLine(dataPoints, chartWidth, supplyHeight, supplyScale, margin, zeroLineY);

    const baseContent = `
      <g opacity="0.1">
        ${createGridLines(chartWidth, chartHeight, margin)}
      </g>
      <line x1="${margin.left}" y1="${zeroLineY}" x2="${margin.left + chartWidth}" y2="${zeroLineY}" stroke="rgb(160, 160, 160)" stroke-width="1" stroke-dasharray="4,4" />
      ${createTimeLabels(chartWidth, chartHeight, margin, hoursToShow)}
      ${createYAxisLabels(supplyHeight, demandHeight, margin, maxSupply, maxDemand, zeroLineY)}
    `;

    this.renderChartLayers(
      svgElement,
      {
        baseContent,
        demandPaths,
        supplyPaths,
        loadLine,
      },
      dataPoints,
      chartWidth,
      margin,
      supplyHeight,
      demandHeight,
      supplyScale,
      demandScale,
      zeroLineY,
      true
    );

    this.chartRenderPending = false;
  }

  /**
   * Draw stacked area chart from history data
   */
  private async drawStackedAreaChart(
    svgElement: Element,
    productionHistory: Array<{ state: string; last_changed: string }>,
    gridHistory: Array<{ state: string; last_changed: string }>,
    loadHistory: Array<{ state: string; last_changed: string }>,
    batteryHistory: Array<{ state: string; last_changed: string }>,
    hoursToShow: number
  ): Promise<void> {
    this.streamingMeta = undefined;

    // Collect 30-second raw data, then average into 5-minute visible ticks
    const rawPointsPerHour = 120;
    const totalRawPoints = hoursToShow * rawPointsPerHour;
    const visiblePointsPerHour = 12;
    const totalVisiblePoints = hoursToShow * visiblePointsPerHour;
    const rawPointsPerVisibleTick = 10;
    
    // Quantize to nearest 5-minute interval
    const now = new Date();
    const endMinutes = Math.floor(now.getMinutes() / 5) * 5;
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), endMinutes, 0, 0);
    const start = new Date(end.getTime() - hoursToShow * 60 * 60 * 1000);

    // Initialize streaming immediately
    this.streamingQueue = [];
    this.streamingSvg = svgElement;
    this.streamingHoursToShow = hoursToShow;

    // Start the streaming renderer right away (even with empty queue)
    if (!this.streamingActive) {
      this.startStreamingRenderer();
    }

    // Process data in chunks and queue as we go
    const chunkSize = 240;
    const rawDataPoints: DataPoint[] = [];

    for (let chunkStart = 0; chunkStart < totalRawPoints; chunkStart += chunkSize) {
      const chunkEnd = Math.min(chunkStart + chunkSize, totalRawPoints);
      
      if (chunkStart > 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      for (let i = chunkStart; i < chunkEnd; i++) {
        const time = new Date(start.getTime() + i * 30 * 1000);
        
        const production = this.interpolateValue(productionHistory, time);
        const grid = this.interpolateValue(gridHistory, time);
        const load = this.interpolateValue(loadHistory, time);
        let battery = this.interpolateValue(batteryHistory, time);
        
        if (this.config.battery?.invert?.data) {
          battery = -battery;
        }

        rawDataPoints.push({
          time,
          solar: Math.max(0, production),
          batteryDischarge: Math.max(0, battery),
          batteryCharge: Math.max(0, -battery),
          gridImport: Math.max(0, grid),
          gridExport: Math.max(0, -grid),
          load: Math.max(0, load),
        });
      }

      // After each chunk of raw data, convert completed 5-minute windows to visible points
      const firstCompleteVisibleIdx = Math.floor((chunkStart - 1) / rawPointsPerVisibleTick);
      const lastCompleteVisibleIdx = Math.floor((chunkEnd - 1) / rawPointsPerVisibleTick);

      for (let i = Math.max(0, firstCompleteVisibleIdx); i <= lastCompleteVisibleIdx; i++) {
        const startIdx = i * rawPointsPerVisibleTick;
        const endIdx = Math.min(startIdx + rawPointsPerVisibleTick, rawDataPoints.length);
        
        // Only queue if we have a complete window
        if (endIdx - startIdx === rawPointsPerVisibleTick) {
          const visibleTime = new Date(start.getTime() + (i + 1) * 5 * 60 * 1000);
          const windowSize = rawPointsPerVisibleTick;
          
          let solarSum = 0, batteryDischargeSum = 0, batteryChargeSum = 0;
          let gridImportSum = 0, gridExportSum = 0, loadSum = 0;
          
          for (let j = startIdx; j < endIdx; j++) {
            solarSum += rawDataPoints[j].solar;
            batteryDischargeSum += rawDataPoints[j].batteryDischarge;
            batteryChargeSum += rawDataPoints[j].batteryCharge;
            gridImportSum += rawDataPoints[j].gridImport;
            gridExportSum += rawDataPoints[j].gridExport;
            loadSum += rawDataPoints[j].load;
          }

          // Check if we already queued this point
          if (!this.streamingQueue.some(p => p.time.getTime() === visibleTime.getTime())) {
            this.streamingQueue.push({
              time: visibleTime,
              solar: solarSum / windowSize,
              batteryDischarge: batteryDischargeSum / windowSize,
              batteryCharge: batteryChargeSum / windowSize,
              gridImport: gridImportSum / windowSize,
              gridExport: gridExportSum / windowSize,
              load: loadSum / windowSize,
            });
          }
        }
      }
    }

    // Queue any remaining incomplete windows at the end
    const lastCompleteIdx = Math.floor((rawDataPoints.length - 1) / rawPointsPerVisibleTick);
    for (let i = lastCompleteIdx + 1; i < totalVisiblePoints; i++) {
      const visibleTime = new Date(start.getTime() + (i + 1) * 5 * 60 * 1000);
      const startIdx = i * rawPointsPerVisibleTick;
      const endIdx = Math.min(startIdx + rawPointsPerVisibleTick, rawDataPoints.length);
      const windowSize = endIdx - startIdx;
      
      if (windowSize > 0) {
        let solarSum = 0, batteryDischargeSum = 0, batteryChargeSum = 0;
        let gridImportSum = 0, gridExportSum = 0, loadSum = 0;
        
        for (let j = startIdx; j < endIdx; j++) {
          solarSum += rawDataPoints[j].solar;
          batteryDischargeSum += rawDataPoints[j].batteryDischarge;
          batteryChargeSum += rawDataPoints[j].batteryCharge;
          gridImportSum += rawDataPoints[j].gridImport;
          gridExportSum += rawDataPoints[j].gridExport;
          loadSum += rawDataPoints[j].load;
        }

        if (!this.streamingQueue.some(p => p.time.getTime() === visibleTime.getTime())) {
          this.streamingQueue.push({
            time: visibleTime,
            solar: solarSum / windowSize,
            batteryDischarge: batteryDischargeSum / windowSize,
            batteryCharge: batteryChargeSum / windowSize,
            gridImport: gridImportSum / windowSize,
            gridExport: gridExportSum / windowSize,
            load: loadSum / windowSize,
          });
        }
      }
    }
  }

  /**
   * Interpolate value from history at specific time
   */
  private interpolateValue(history: Array<{ state: string; last_changed: string }>, targetTime: Date): number {
    if (history.length === 0) return 0;

    let closestPoint = history[0];
    let minDiff = Math.abs(new Date(history[0].last_changed).getTime() - targetTime.getTime());

    for (const point of history) {
      const diff = Math.abs(new Date(point.last_changed).getTime() - targetTime.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closestPoint = point;
      }
    }

    return parseFloat(closestPoint.state) || 0;
  }

  /**
   * Create stacked area paths for supply or demand
   */
  private createStackedPaths(
    dataPoints: DataPoint[],
    chartWidth: number,
    chartHeight: number,
    yScale: number,
    margin: { top: number; right: number; bottom: number; left: number },
    type: 'supply' | 'demand',
    zeroLineY: number,
    totalPointsOverride?: number
  ): string {
    const totalPoints = totalPointsOverride ?? dataPoints.length;
    const safePoints = Math.max(2, totalPoints);
    const xStep = chartWidth / (safePoints - 1);

    if (type === 'supply') {
      const solarPath = createAreaPath(dataPoints, xStep, zeroLineY, yScale, margin, 
        d => d.solar, 0, 'down');
      
      const batteryPath = createAreaPath(dataPoints, xStep, zeroLineY, yScale, margin,
        d => d.batteryDischarge, d => d.solar, 'down');
      
      const gridPath = createAreaPath(dataPoints, xStep, zeroLineY, yScale, margin,
        d => d.gridImport, d => d.solar + d.batteryDischarge, 'down');

      return `
        ${gridPath ? `<path id="chart-area-grid-import" d="${gridPath}" fill="#c62828" opacity="0.8" style="cursor: pointer;" />` : ''}
        ${batteryPath ? `<path id="chart-area-battery-discharge" d="${batteryPath}" fill="#1976d2" opacity="0.8" style="cursor: pointer;" />` : ''}
        ${solarPath ? `<path id="chart-area-solar" d="${solarPath}" fill="#388e3c" opacity="0.85" style="cursor: pointer;" />` : ''}
      `;
    } else {
      const batteryChargePath = createAreaPath(dataPoints, xStep, zeroLineY, yScale, margin,
        d => d.batteryCharge, 0, 'up');
      
      const gridExportPath = createAreaPath(dataPoints, xStep, zeroLineY, yScale, margin,
        d => d.gridExport, d => d.batteryCharge, 'up');

      return `
        ${gridExportPath ? `<path id="chart-area-grid-export" d="${gridExportPath}" fill="#f9a825" opacity="0.8" style="cursor: pointer;" />` : ''}
        ${batteryChargePath ? `<path id="chart-area-battery-charge" d="${batteryChargePath}" fill="#1976d2" opacity="0.8" style="cursor: pointer;" />` : ''}
      `;
    }
  }

  /**
   * Create hidden icon sources for extraction
   */
  private createChartIconSources(): string {
    const loadIcon = this.getIcon(this.config.load, 'mdi:home-lightning-bolt');
    const solarIcon = this.getIcon(this.config.production, 'mdi:solar-power');
    const batteryIcon = this.getIcon(this.config.battery, 'mdi:battery');
    const gridIcon = this.getIcon(this.config.grid, 'mdi:transmission-tower');

    return `
      <foreignObject id="chart-icon-source-load" x="-100" y="-100" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <ha-icon icon="${loadIcon}"></ha-icon>
        </div>
      </foreignObject>
      <foreignObject id="chart-icon-source-solar" x="-100" y="-100" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <ha-icon icon="${solarIcon}"></ha-icon>
        </div>
      </foreignObject>
      <foreignObject id="chart-icon-source-battery" x="-100" y="-100" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <ha-icon icon="${batteryIcon}"></ha-icon>
        </div>
      </foreignObject>
      <foreignObject id="chart-icon-source-grid" x="-100" y="-100" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <ha-icon icon="${gridIcon}"></ha-icon>
        </div>
      </foreignObject>
    `;
  }

  /**
   * Extract icon paths from Home Assistant icons
   */
  private async extractChartIcons(
    svgElement: Element,
    dataPoints: DataPoint[],
    chartWidth: number,
    supplyHeight: number,
    demandHeight: number,
    supplyScale: number,
    demandScale: number,
    margin: { top: number; right: number; bottom: number; left: number },
    zeroLineY: number
  ): Promise<void> {
    if (dataPoints.length === 0) return;

    const iconTypes = ['load', 'solar', 'battery', 'grid'];
    const iconPaths: { [key: string]: string | null } = {};

    for (const type of iconTypes) {
      const iconSourceFO = svgElement.querySelector(`#chart-icon-source-${type}`);
      if (!iconSourceFO) continue;

      const haIconDiv = iconSourceFO.querySelector('div');
      if (!haIconDiv) continue;

      const iconSource = haIconDiv.querySelector('ha-icon');
      if (!iconSource) continue;

      const iconName = iconSource.getAttribute('icon');
      if (!iconName) continue;

      if (this.iconCache.has(iconName)) {
        iconPaths[type] = this.iconCache.get(iconName) || null;
        continue;
      }

      const pathData = await this.extractIconPath(iconSource, iconName);
      iconPaths[type] = pathData;
      if (pathData) {
        this.iconCache.set(iconName, pathData);
      }
    }

    this.renderChartIndicators(svgElement, dataPoints, chartWidth, supplyHeight, demandHeight, supplyScale, demandScale, margin, iconPaths, zeroLineY);
  }

  /**
   * Extract single icon path from shadow DOM
   */
  private async extractIconPath(iconElement: Element, iconName: string, maxAttempts = 10): Promise<string | null> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const shadowRoot = iconElement.shadowRoot;
        if (!shadowRoot) {
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }

        let svgElement = shadowRoot.querySelector('svg');
        
        if (!svgElement) {
          const haSvgIcon = shadowRoot.querySelector('ha-svg-icon');
          if (haSvgIcon && haSvgIcon.shadowRoot) {
            svgElement = haSvgIcon.shadowRoot.querySelector('svg');
          }
        }

        if (!svgElement) {
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }

        const pathElement = svgElement.querySelector('path');
        if (!pathElement) {
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }

        const pathData = pathElement.getAttribute('d');
        if (pathData) {
          return pathData;
        }
      } catch (e) {
        console.error(`Failed to extract icon path for ${iconName} (attempt ${attempt + 1}):`, e);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return null;
  }

  /**
   * Render chart indicators with native SVG
   */
  private renderChartIndicators(
    svgElement: Element,
    dataPoints: DataPoint[],
    chartWidth: number,
    supplyHeight: number,
    demandHeight: number,
    supplyScale: number,
    demandScale: number,
    margin: { top: number; right: number; bottom: number; left: number },
    iconPaths: { [key: string]: string | null },
    zeroLineY: number
  ): void {
    let indicatorsGroup = svgElement.querySelector('#chart-indicators') as SVGGElement | null;
    const isFirstRender = !indicatorsGroup;
    
    if (!indicatorsGroup) {
      indicatorsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      indicatorsGroup.setAttribute('id', 'chart-indicators');
      svgElement.appendChild(indicatorsGroup);
    }

    if (isFirstRender) {
      const iconSources = svgElement.querySelectorAll('[id^="chart-icon-source-"]');
      iconSources.forEach(source => source.remove());
    }

    // Use live values or last historical point
    let currentValues;
    if (this.liveChartValues) {
        const { grid, load, production } = this.liveChartValues;
        const batteryRaw = this.liveChartValues.battery;
        const battery = batteryRaw;
      currentValues = {
        load: Math.max(0, load),
        solar: Math.max(0, production),
        batteryDischarge: Math.max(0, battery),
        batteryCharge: Math.max(0, -battery),
        gridImport: Math.max(0, grid),
        gridExport: Math.max(0, -grid),
      };
    } else {
      currentValues = dataPoints[dataPoints.length - 1];
    }

    const rightX = margin.left + chartWidth;

    // Calculate Y positions
    const loadY = zeroLineY - currentValues.load * supplyScale;
    const solarY = zeroLineY - currentValues.solar * supplyScale;
    const batteryDischargeY = zeroLineY - (currentValues.solar + currentValues.batteryDischarge) * supplyScale;
    const gridImportY = zeroLineY - (currentValues.solar + currentValues.batteryDischarge + currentValues.gridImport) * supplyScale;
    const batteryChargeY = zeroLineY + currentValues.batteryCharge * demandScale;
    const gridExportY = zeroLineY + (currentValues.batteryCharge + currentValues.gridExport) * demandScale;

    const formatValue = (value: number): string => {
      return `${Math.round(value)} W`;
    };

    const updateIndicator = (id: string, y: number, color: string, iconType: string, value: string, prefix = '', shouldShow = true, entity?: string, tapAction?: any) => {
      let group = indicatorsGroup!.querySelector(`#${id}`) as SVGGElement | null;
      
      if (!shouldShow) {
        if (group) group.remove();
        return;
      }
      
      if (!group) {
        group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', id);
        group.style.cursor = 'pointer';
        
        const iconPath = iconPaths[iconType];
        if (iconPath) {
          const icon = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          icon.setAttribute('class', 'indicator-icon');
          icon.setAttribute('transform', 'translate(10, -8) scale(0.67)');
          
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', iconPath);
          path.setAttribute('fill', color);
          icon.appendChild(path);
          
          group.appendChild(icon);
        }

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'indicator-text');
        text.setAttribute('x', '28');
        text.setAttribute('y', '4');
        text.setAttribute('fill', color);
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', '600');
        group.appendChild(text);
        
        if (entity && tapAction) {
          group.addEventListener('click', () => {
            handleAction(this.hass, this.fireEvent, tapAction, entity);
          });
        }
        
        indicatorsGroup!.appendChild(group);
      }
      
      group.setAttribute('transform', `translate(${rightX + 10}, ${y})`);
      
      const text = group.querySelector('.indicator-text');
      if (text) {
        text.textContent = `${prefix}${value}`;
      }
    };

    // Update all indicators
    updateIndicator('indicator-solar', solarY, '#388e3c', 'solar', formatValue(currentValues.solar), '', currentValues.solar > 0, this.getEntityId(this.config.production), this.getTapAction(this.config.production));
    updateIndicator('indicator-battery-discharge', batteryDischargeY, '#1976d2', 'battery', formatValue(currentValues.batteryDischarge), '+', currentValues.batteryDischarge > 0, this.getEntityId(this.config.battery), this.getTapAction(this.config.battery));
    updateIndicator('indicator-grid-import', gridImportY, '#c62828', 'grid', formatValue(currentValues.gridImport), '', currentValues.gridImport > 0, this.getEntityId(this.config.grid), this.getTapAction(this.config.grid));
    updateIndicator('indicator-battery-charge', batteryChargeY, '#1976d2', 'battery', formatValue(currentValues.batteryCharge), '-', currentValues.batteryCharge > 0, this.getEntityId(this.config.battery), this.getTapAction(this.config.battery));
    updateIndicator('indicator-grid-export', gridExportY, '#f9a825', 'grid', formatValue(currentValues.gridExport), '', currentValues.gridExport > 0, this.getEntityId(this.config.grid), this.getTapAction(this.config.grid));
    updateIndicator('indicator-load', loadY, '#CCCCCC', 'load', formatValue(currentValues.load), '', true, this.getEntityId(this.config.load), this.getTapAction(this.config.load));
  }

  /**
   * Update chart indicators with throttling
   */
  updateChartIndicators(svgElement: Element): void {
    if (!this.chartDataCache || !svgElement) return;

    const dataPoints = this.chartDataCache.dataPoints;
    const maxSupply = Math.max(...dataPoints.map(d => d.solar + d.batteryDischarge + d.gridImport), ...dataPoints.map(d => d.load));
    const maxDemand = Math.max(...dataPoints.map(d => d.batteryCharge + d.gridExport));
    
    const totalRange = maxSupply + maxDemand;
    const supplyRatio = totalRange > 0 ? maxSupply / totalRange : 0.5;
    const demandRatio = totalRange > 0 ? maxDemand / totalRange : 0.5;

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 150, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const supplyHeight = chartHeight * supplyRatio;
    const demandHeight = chartHeight * demandRatio;
    
    const supplyScale = maxSupply > 0 ? supplyHeight / (maxSupply * 1.1) : 1;
    const demandScale = maxDemand > 0 ? demandHeight / (maxDemand * 1.1) : 1;
    const zeroLineY = margin.top + supplyHeight;

    // Get cached icon paths
    const iconPaths: { [key: string]: string | null } = {};
    const entityMap: Record<string, EntityConfig | undefined> = {
      load: this.config.load,
      solar: this.config.production,
      battery: this.config.battery,
      grid: this.config.grid,
    };

    ['load', 'solar', 'battery', 'grid'].forEach(type => {
      const iconName = this.getIcon(entityMap[type], '');
      if (this.iconCache.has(iconName)) {
        iconPaths[type] = this.iconCache.get(iconName) || null;
      }
    });

    this.renderChartIndicators(svgElement, dataPoints, chartWidth, supplyHeight, demandHeight, supplyScale, demandScale, margin, iconPaths, zeroLineY);
  }

  /**
   * Add load line on top of chart
   */
  private addLoadLineOnTop(loadGroup: Element, loadLine: string): void {
    if (!loadLine) return;
    
    const existingLoadLine = loadGroup.querySelector('#load-line');
    if (existingLoadLine) {
      existingLoadLine.remove();
    }
    
    const pathMatch = loadLine.match(/d="([^"]+)"/);
    if (!pathMatch) return;
    
    const pathData = pathMatch[1];
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('id', 'load-line');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#CCCCCC');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('opacity', '0.9');
    path.style.cursor = 'pointer';
    
    path.addEventListener('click', () => {
      handleAction(this.hass, this.fireEvent, this.getTapAction(this.config.load), this.getEntityId(this.config.load));
    });
    
    loadGroup.appendChild(path);
  }

  /**
   * Attach click handlers to chart areas
   */
  private attachChartAreaClickHandlers(svgElement: Element): void {
    const solarArea = svgElement.querySelector('#chart-area-solar');
    if (solarArea) {
      solarArea.addEventListener('click', () => {
        handleAction(this.hass, this.fireEvent, this.getTapAction(this.config.production), this.getEntityId(this.config.production));
      });
    }
    
    const batteryDischargeArea = svgElement.querySelector('#chart-area-battery-discharge');
    if (batteryDischargeArea) {
      batteryDischargeArea.addEventListener('click', () => {
        handleAction(this.hass, this.fireEvent, this.getTapAction(this.config.battery), this.getEntityId(this.config.battery));
      });
    }
    
    const batteryChargeArea = svgElement.querySelector('#chart-area-battery-charge');
    if (batteryChargeArea) {
      batteryChargeArea.addEventListener('click', () => {
        handleAction(this.hass, this.fireEvent, this.getTapAction(this.config.battery), this.getEntityId(this.config.battery));
      });
    }
    
    const gridImportArea = svgElement.querySelector('#chart-area-grid-import');
    if (gridImportArea) {
      gridImportArea.addEventListener('click', () => {
        handleAction(this.hass, this.fireEvent, this.getTapAction(this.config.grid), this.getEntityId(this.config.grid));
      });
    }
    
    const gridExportArea = svgElement.querySelector('#chart-area-grid-export');
    if (gridExportArea) {
      gridExportArea.addEventListener('click', () => {
        handleAction(this.hass, this.fireEvent, this.getTapAction(this.config.grid), this.getEntityId(this.config.grid));
      });
    }
  }

  /**
   * Start streaming renderer that pulls ONE point from queue per frame
   */
  private startStreamingRenderer(): void {
    if (this.streamingActive) return;
    this.streamingActive = true;
    
    const streamDelay = Number((globalThis as any).__mockStreamStepDelayMs ?? 0) || 0;

    if (this.streamingSvg) {
      this.ensureStreamingPlots(this.streamingSvg);
    }

    const processOnePoint = () => {
      if (!this.streamingActive || !this.streamingSvg) {
        return;
      }

      const point = this.streamingQueue.shift();
      
      if (point) {
        if (!this.streamingMeta) {
          this.initializeStreamingMeta();
        }
        
        if (this.streamingMeta && this.streamingSupplyPlots && this.streamingDemandPlots && this.streamingLoadPlot) {
          this.streamingSupplyPlots.solar.addPoint(point.solar, 0);
          this.streamingSupplyPlots.batteryDischarge.addPoint(point.batteryDischarge, point.solar);
          this.streamingSupplyPlots.gridImport.addPoint(point.gridImport, point.solar + point.batteryDischarge);
          
          this.streamingDemandPlots.batteryCharge.addPoint(point.batteryCharge, 0);
          this.streamingDemandPlots.gridExport.addPoint(point.gridExport, point.batteryCharge);
          
          this.streamingLoadPlot.addPoint(point.load, 0);
        }
      }

      if (this.streamingQueue.length > 0) {
        if (streamDelay > 0) {
          setTimeout(() => {
            this.streamingFrameId = requestAnimationFrame(processOnePoint);
          }, streamDelay);
        } else {
          this.streamingFrameId = requestAnimationFrame(processOnePoint);
        }
      } else {
        this.streamingActive = false;
        if (this.streamingSvg) {
          this.finalizeChart(this.streamingSvg, [], this.streamingHoursToShow);
        }
      }
    };

    this.streamingFrameId = requestAnimationFrame(processOnePoint);
  }

  /**
   * Initialize streaming metadata from the queue (peek at all points for scaling)
   */
  private initializeStreamingMeta(): void {
    if (!this.streamingSvg || !this.streamingSupplyPlots) return;
    
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 150, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Peek at entire queue to calculate stable scales
    let maxSupply = 1;
    let maxDemand = 1;
    
    for (const pt of this.streamingQueue) {
      const supply = pt.solar + pt.batteryDischarge + pt.gridImport;
      const demand = pt.batteryCharge + pt.gridExport;
      maxSupply = Math.max(maxSupply, supply, pt.load);
      maxDemand = Math.max(maxDemand, demand);
    }
    
    const totalRange = maxSupply + maxDemand;
    const supplyRatio = totalRange > 0 ? maxSupply / totalRange : 0.5;
    const demandRatio = totalRange > 0 ? maxDemand / totalRange : 0.5;
    
    const supplyHeight = chartHeight * supplyRatio;
    const demandHeight = chartHeight * demandRatio;
    const zeroLineY = margin.top + supplyHeight;
    const supplyScale = maxSupply > 0 ? supplyHeight / (maxSupply * 1.1) : 1;
    const demandScale = maxDemand > 0 ? demandHeight / (maxDemand * 1.1) : 1;
    
    this.streamingMeta = {
      expectedPoints: this.streamingQueue.length,
      supplyScale,
      demandScale,
      zeroLineY,
      chartWidth,
    };
    
    // Reset plots with correct geometry
    const xOffset = margin.left;

    this.streamingSupplyPlots.solar.reset(this.streamingMeta.expectedPoints, chartWidth, zeroLineY, supplyScale, xOffset);
    this.streamingSupplyPlots.batteryDischarge.reset(this.streamingMeta.expectedPoints, chartWidth, zeroLineY, supplyScale, xOffset);
    this.streamingSupplyPlots.gridImport.reset(this.streamingMeta.expectedPoints, chartWidth, zeroLineY, supplyScale, xOffset);
    
    this.streamingDemandPlots!.batteryCharge.reset(this.streamingMeta.expectedPoints, chartWidth, zeroLineY, demandScale, xOffset);
    this.streamingDemandPlots!.gridExport.reset(this.streamingMeta.expectedPoints, chartWidth, zeroLineY, demandScale, xOffset);
    
    this.streamingLoadPlot!.reset(this.streamingMeta.expectedPoints, chartWidth, zeroLineY, supplyScale, xOffset);
  }

  /**
   * Finalize chart with icons and full render
   */
  private async finalizeChart(svgElement: Element, _dataPoints: DataPoint[], hoursToShow: number): Promise<void> {
    // Add labels now that streaming is complete and we know final scaling
    if (this.streamingMeta) {
      const width = 800;
      const height = 400;
      const margin = { top: 20, right: 150, bottom: 40, left: 60 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;
      const zeroLineY = this.streamingMeta.zeroLineY;
      const supplyHeight = zeroLineY - margin.top;
      const demandHeight = chartHeight - supplyHeight;
      
      // Use scales from streamingMeta to back-calculate max values
      const maxSupply = supplyHeight / (this.streamingMeta.supplyScale * 1.1);
      const maxDemand = demandHeight / (this.streamingMeta.demandScale * 1.1);
      
      const baseGroup = svgElement.querySelector('#chart-base');
      if (baseGroup) {
        const labelsContent = `
          ${createTimeLabels(chartWidth, chartHeight, margin, hoursToShow)}
          ${createYAxisLabels(supplyHeight, demandHeight, margin, maxSupply, maxDemand, zeroLineY)}
        `;
        baseGroup.insertAdjacentHTML('beforeend', labelsContent);
      }
    }

    // Extract icons and update indicators
    await this.extractChartIcons(svgElement, [], 0, 0, 0, 0, 0, { top: 0, right: 0, bottom: 0, left: 0 }, 0);
    this.updateChartIndicators(svgElement);
    this.attachChartAreaClickHandlers(svgElement);

    this.chartRenderPending = false;
  }

  /**
   * Clear cache (e.g., when data becomes stale)
   */
  clearCache(): void {
    if (this.streamingFrameId) {
      cancelAnimationFrame(this.streamingFrameId);
      this.streamingFrameId = undefined;
    }
    this.streamingActive = false;
    this.streamingQueue = [];
    this.chartDataCache = undefined;
  }
}

