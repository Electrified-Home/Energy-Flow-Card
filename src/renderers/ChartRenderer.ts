import { createGridLines, createTimeLabels, createYAxisLabels, createAreaPath, createLoadLine } from '../chart/chart-utils';
import { handleAction } from '../utils/helpers';

export interface ChartConfig {
  production_entity: string;
  grid_entity: string;
  load_entity: string;
  battery_entity: string;
  invert_battery_data?: boolean;
  production_icon?: string;
  grid_icon?: string;
  load_icon?: string;
  battery_icon?: string;
  production_tap_action?: any;
  grid_tap_action?: any;
  load_tap_action?: any;
  battery_tap_action?: any;
}

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
  private config: ChartConfig;
  private fireEvent: (type: string, detail?: any) => void;
  private iconCache: Map<string, string> = new Map();
  private chartDataCache?: ChartDataCache;
  private chartRenderPending = false;
  private indicatorUpdateTimeout?: number;
  private lastIndicatorUpdate = 0;
  private liveChartValues?: LiveChartValues;

  constructor(hass: any, config: ChartConfig, fireEvent: (type: string, detail?: any) => void) {
    this.hass = hass;
    this.config = config;
    this.fireEvent = fireEvent;
  }

  setConfig(config: ChartConfig): void {
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
    // Initialize chart structure if needed
    if (!container.querySelector('.chart-view')) {
      this.initializeChartStructure(container);
    } else if (this.liveChartValues) {
      // Update live values for indicators
      this.throttledUpdateChartIndicators(container);
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
          .loading-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: rgb(160, 160, 160);
            font-size: 14px;
          }
        </style>
        <div class="chart-view">
          <div class="chart-container">
            <div class="loading-message">Loading history data...</div>
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
      setTimeout(() => {
        this.fetchAndRenderChart(svg, 12);
      }, 100);
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
    this.chartDataCache = undefined;
  }

  /** Hide the loading overlay once data is ready or on error */
  private hideLoading(svgElement: Element): void {
    const container = svgElement.parentElement;
    const loading = container?.querySelector('.loading-message') as HTMLElement | null;
    if (loading) {
      loading.style.display = 'none';
    }
  }

  /**
   * Get icon name from config or use default
   */
  private getIcon(iconConfigKey: string, entityConfigKey: string, fallback: string): string {
    const configIcon = (this.config as any)[iconConfigKey];
    if (configIcon) return configIcon;

    const entityId = (this.config as any)[entityConfigKey];
    if (entityId && this.hass.states[entityId]) {
      const entityIcon = this.hass.states[entityId].attributes.icon;
      if (entityIcon) return entityIcon;
    }

    return fallback;
  }

  /**
   * Fetch and render chart, using cache if available
   */
  async fetchAndRenderChart(svgElement: Element, hoursToShow = 12): Promise<void> {
    if (this.chartRenderPending) return;

    const now = Date.now();
    const cacheAge = this.chartDataCache ? now - this.chartDataCache.timestamp : Infinity;
    const cacheMaxAge = 5 * 60 * 1000; // 5 minutes

    // Clear expired cache
    if (this.chartDataCache && cacheAge >= cacheMaxAge) {
      this.chartDataCache = undefined;
    }

    // Use cached data if fresh
    if (this.chartDataCache && cacheAge < cacheMaxAge) {
      requestAnimationFrame(() => {
        this.renderChartFromCache(svgElement);
      });
      return;
    }

    this.chartRenderPending = true;
    const end = new Date();
    const start = new Date(end.getTime() - hoursToShow * 60 * 60 * 1000);

    try {
      // Fetch history for all entities in parallel
      const [productionHistory, gridHistory, loadHistory, batteryHistory] = await Promise.all([
        this.fetchHistory(this.config.production_entity, start, end),
        this.fetchHistory(this.config.grid_entity, start, end),
        this.fetchHistory(this.config.load_entity, start, end),
        this.fetchHistory(this.config.battery_entity, start, end),
      ]);

      // Process chart
      const processChart = () => {
        this.drawStackedAreaChart(svgElement, productionHistory, gridHistory, loadHistory, batteryHistory, hoursToShow);
        this.chartRenderPending = false;
      };

      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(processChart, { timeout: 2000 });
      } else {
        setTimeout(processChart, 0);
      }
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
    const url = `history/period/${start.toISOString()}?filter_entity_id=${entityId}&end_time=${end.toISOString()}&minimal_response&no_attributes`;
    
    const response = await this.hass.callApi('GET', url);
    return response && response.length > 0 ? response[0] : [];
  }

  /**
   * Render chart from cached data
   */
  renderChartFromCache(svgElement: Element): void {
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
    const supplyPaths = this.createStackedPaths(dataPoints, chartWidth, supplyHeight, supplyScale, margin, 'supply', zeroLineY);
    const demandPaths = this.createStackedPaths(dataPoints, chartWidth, demandHeight, demandScale, margin, 'demand', zeroLineY);
    const loadLine = createLoadLine(dataPoints, chartWidth, supplyHeight, supplyScale, margin, zeroLineY);

    const chartContent = `
      <g opacity="0.1">
        ${createGridLines(chartWidth, chartHeight, margin)}
      </g>
      <line x1="${margin.left}" y1="${zeroLineY}" x2="${margin.left + chartWidth}" y2="${zeroLineY}" stroke="rgb(160, 160, 160)" stroke-width="1" stroke-dasharray="4,4" />
      ${demandPaths}
      ${supplyPaths}
      ${createTimeLabels(chartWidth, chartHeight, margin, 12)}
      ${createYAxisLabels(supplyHeight, demandHeight, margin, maxSupply, maxDemand, zeroLineY)}
    `;

    svgElement.innerHTML = chartContent;
    
    this.updateChartIndicators(svgElement);
    this.addLoadLineOnTop(svgElement, loadLine);
    this.hideLoading(svgElement);
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
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 150, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

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

    // Process data in chunks
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
        
        if (this.config.invert_battery_data) {
          battery = -battery;
        }

        // Visual inversion only (does not affect calculations elsewhere)

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
    }

    // Average into 5-minute points
    const dataPoints: DataPoint[] = [];

    for (let i = 0; i < totalVisiblePoints; i++) {
      const visibleTime = new Date(start.getTime() + (i + 1) * 5 * 60 * 1000);
      const startIdx = i * rawPointsPerVisibleTick;
      const endIdx = Math.min(startIdx + rawPointsPerVisibleTick, rawDataPoints.length);
      const windowSize = endIdx - startIdx;
      
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

      dataPoints.push({
        time: visibleTime,
        solar: solarSum / windowSize,
        batteryDischarge: batteryDischargeSum / windowSize,
        batteryCharge: batteryChargeSum / windowSize,
        gridImport: gridImportSum / windowSize,
        gridExport: gridExportSum / windowSize,
        load: loadSum / windowSize,
      });
    }

    // Cache processed data
    this.chartDataCache = {
      timestamp: Date.now(),
      dataPoints
    };

    // Calculate scaling
    const maxSupply = Math.max(...dataPoints.map(d => d.solar + d.batteryDischarge + d.gridImport), ...dataPoints.map(d => d.load));
    const maxDemand = Math.max(...dataPoints.map(d => d.batteryCharge + d.gridExport));
    
    const totalRange = maxSupply + maxDemand;
    const supplyRatio = totalRange > 0 ? maxSupply / totalRange : 0.5;
    const demandRatio = totalRange > 0 ? maxDemand / totalRange : 0.5;
    
    const supplyScale = maxSupply > 0 ? (chartHeight * supplyRatio) / (maxSupply * 1.1) : 1;
    const demandScale = maxDemand > 0 ? (chartHeight * demandRatio) / (maxDemand * 1.1) : 1;
    const scale = Math.min(supplyScale, demandScale);
    
    const supplyHeight = maxSupply * scale * 1.1;
    const demandHeight = maxDemand * scale * 1.1;
    const zeroLineY = margin.top + supplyHeight;

    // Create paths
    const supplyPaths = this.createStackedPaths(dataPoints, chartWidth, supplyHeight, scale, margin, 'supply', zeroLineY);
    const demandPaths = this.createStackedPaths(dataPoints, chartWidth, demandHeight, scale, margin, 'demand', zeroLineY);
    const loadLine = createLoadLine(dataPoints, chartWidth, supplyHeight, scale, margin, zeroLineY);

    // Build SVG content
    const svgContent = `
      <g opacity="0.1">
        ${createGridLines(chartWidth, chartHeight, margin)}
      </g>
      <line x1="${margin.left}" y1="${zeroLineY}" x2="${margin.left + chartWidth}" y2="${zeroLineY}" stroke="rgb(160, 160, 160)" stroke-width="1" stroke-dasharray="4,4" />
      ${demandPaths}
      ${supplyPaths}
      ${createTimeLabels(chartWidth, chartHeight, margin, hoursToShow)}
      ${createYAxisLabels(supplyHeight, demandHeight, margin, maxSupply, maxDemand, zeroLineY)}
      ${this.createChartIconSources()}
    `;

    svgElement.innerHTML = svgContent;
    this.hideLoading(svgElement);
    
    // Add click handlers
    this.attachChartAreaClickHandlers(svgElement);
    
    // Progressive rendering
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.extractChartIcons(svgElement, dataPoints, chartWidth, supplyHeight, demandHeight, scale, scale, margin, zeroLineY);
          
          requestAnimationFrame(() => {
            this.addLoadLineOnTop(svgElement, loadLine);
          });
        });
      });
    });
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
    zeroLineY: number
  ): string {
    const totalPoints = dataPoints.length;
    const xStep = chartWidth / (totalPoints - 1);

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
    const loadIcon = this.getIcon('load_icon', 'load_entity', 'mdi:home-lightning-bolt');
    const solarIcon = this.getIcon('production_icon', 'production_entity', 'mdi:solar-power');
    const batteryIcon = this.getIcon('battery_icon', 'battery_entity', 'mdi:battery');
    const gridIcon = this.getIcon('grid_icon', 'grid_entity', 'mdi:transmission-tower');

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
    updateIndicator('indicator-solar', solarY, '#388e3c', 'solar', formatValue(currentValues.solar), '', currentValues.solar > 0, this.config.production_entity, this.config.production_tap_action);
    updateIndicator('indicator-battery-discharge', batteryDischargeY, '#1976d2', 'battery', formatValue(currentValues.batteryDischarge), '+', currentValues.batteryDischarge > 0, this.config.battery_entity, this.config.battery_tap_action);
    updateIndicator('indicator-grid-import', gridImportY, '#c62828', 'grid', formatValue(currentValues.gridImport), '', currentValues.gridImport > 0, this.config.grid_entity, this.config.grid_tap_action);
    updateIndicator('indicator-battery-charge', batteryChargeY, '#1976d2', 'battery', formatValue(currentValues.batteryCharge), '-', currentValues.batteryCharge > 0, this.config.battery_entity, this.config.battery_tap_action);
    updateIndicator('indicator-grid-export', gridExportY, '#f9a825', 'grid', formatValue(currentValues.gridExport), '', currentValues.gridExport > 0, this.config.grid_entity, this.config.grid_tap_action);
    updateIndicator('indicator-load', loadY, '#CCCCCC', 'load', formatValue(currentValues.load), '', true, this.config.load_entity, this.config.load_tap_action);
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
    ['load', 'solar', 'battery', 'grid'].forEach(type => {
      const iconName = this.getIcon(`${type}_icon`, `${type}_entity`, '');
      if (this.iconCache.has(iconName)) {
        iconPaths[type] = this.iconCache.get(iconName) || null;
      }
    });

    this.renderChartIndicators(svgElement, dataPoints, chartWidth, supplyHeight, demandHeight, supplyScale, demandScale, margin, iconPaths, zeroLineY);
  }

  /**
   * Add load line on top of chart
   */
  private addLoadLineOnTop(svgElement: Element, loadLine: string): void {
    if (!loadLine) return;
    
    const existingLoadLine = svgElement.querySelector('#load-line');
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
      handleAction(this.hass, this.fireEvent, this.config.load_tap_action, this.config.load_entity);
    });
    
    svgElement.appendChild(path);
  }

  /**
   * Attach click handlers to chart areas
   */
  private attachChartAreaClickHandlers(svgElement: Element): void {
    const solarArea = svgElement.querySelector('#chart-area-solar');
    if (solarArea) {
      solarArea.addEventListener('click', () => {
        handleAction(this.hass, this.fireEvent, this.config.production_tap_action, this.config.production_entity);
      });
    }
    
    const batteryDischargeArea = svgElement.querySelector('#chart-area-battery-discharge');
    if (batteryDischargeArea) {
      batteryDischargeArea.addEventListener('click', () => {
        handleAction(this.hass, this.fireEvent, this.config.battery_tap_action, this.config.battery_entity);
      });
    }
    
    const batteryChargeArea = svgElement.querySelector('#chart-area-battery-charge');
    if (batteryChargeArea) {
      batteryChargeArea.addEventListener('click', () => {
        handleAction(this.hass, this.fireEvent, this.config.battery_tap_action, this.config.battery_entity);
      });
    }
    
    const gridImportArea = svgElement.querySelector('#chart-area-grid-import');
    if (gridImportArea) {
      gridImportArea.addEventListener('click', () => {
        handleAction(this.hass, this.fireEvent, this.config.grid_tap_action, this.config.grid_entity);
      });
    }
    
    const gridExportArea = svgElement.querySelector('#chart-area-grid-export');
    if (gridExportArea) {
      gridExportArea.addEventListener('click', () => {
        handleAction(this.hass, this.fireEvent, this.config.grid_tap_action, this.config.grid_entity);
      });
    }
  }

  /**
   * Clear cache (e.g., when data becomes stale)
   */
  clearCache(): void {
    this.chartDataCache = undefined;
  }
}
