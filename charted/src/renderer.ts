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
import type { ChartedCardConfig, StatisticValue } from './types';
import type { HomeAssistant } from '../../shared/src/types/HASS';
import type { MarkPointComponentOption } from 'echarts/components';

// Register required ECharts components
echarts.use([LineChart, GridComponent, LegendComponent, MarkPointComponent, MarkAreaComponent, TooltipComponent, CanvasRenderer]);

interface ProcessedData {
  positive: [number, number][];
  negative: [number, number][];
}

export class ChartedRenderer {
  private chart: echarts.ECharts;
  private hass: HomeAssistant;
  private config: ChartedCardConfig;
  private container: HTMLElement;
  private resizeObserver: ResizeObserver;

  constructor(container: HTMLElement, hass: HomeAssistant, config: ChartedCardConfig) {
    this.hass = hass;
    this.config = config;
    this.container = container;
    this.chart = echarts.init(container);
    this.chart.on('click', this._handleChartClick);
    
    // Watch for container size changes and resize chart
    this.resizeObserver = new ResizeObserver(() => {
      this.chart.resize();
    });
    this.resizeObserver.observe(container);
  }

  async update(hass: HomeAssistant, config: ChartedCardConfig) {
    this.hass = hass;
    this.config = config;

    try {
      const data = await this._fetchData();
      this._renderChart(data);
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }

  private async _fetchData() {
    const now = new Date();
    const hours = this.config.hours_to_show || 24;
    const spanMs = hours * 60 * 60 * 1000;
    const start = new Date(now.getTime() - spanMs);

    const entities = Object.values(this.config.entities).filter(e => e);
    if (entities.length === 0) {
      return { solar: [], grid: [], battery: [], load: [] };
    }

    // Use statistics API with 5-minute periods instead of raw history
    const url = `history/period/${start.toISOString()}?filter_entity_id=${entities.join(',')}&end_time=${now.toISOString()}&minimal_response&no_attributes&significant_changes_only`;
    const response = await this.hass.callApi('GET', url) as any[][];

    const dataMap: Record<string, StatisticValue[]> = {};
    
    response.forEach((entityData: any, idx: number) => {
      const entityId = entities[idx];
      if (!entityId) return;
      
      // Downsample based on points_per_hour (default 12 = 5 minute intervals)
      const pointsPerHour = this.config.points_per_hour || 12;
      const intervalMs = (60 * 60 * 1000) / pointsPerHour;
      const buckets = new Map<number, number[]>();
      
      entityData.forEach((point: any) => {
        const timestamp = new Date(point.last_changed).getTime();
        const bucketTime = Math.floor(timestamp / intervalMs) * intervalMs;
        const value = parseFloat(point.state) || 0;
        
        if (!buckets.has(bucketTime)) {
          buckets.set(bucketTime, []);
        }
        buckets.get(bucketTime)!.push(value);
      });
      
      // Average values in each bucket
      const stats: StatisticValue[] = [];
      buckets.forEach((values, timestamp) => {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        stats.push({
          start: timestamp,
          end: timestamp + intervalMs,
          mean: mean,
        });
      });
      
      stats.sort((a, b) => a.start - b.start);
      dataMap[entityId] = stats;
    });

    return {
      solar: dataMap[this.config.entities.solar] || [],
      grid: dataMap[this.config.entities.grid] || [],
      battery: dataMap[this.config.entities.battery] || [],
      load: dataMap[this.config.entities.load] || [],
    };
  }

  private _getLatestValue(stats: StatisticValue[]): number | null {
    if (!stats || stats.length === 0) return null;
    const lastPoint = stats[stats.length - 1];
    return lastPoint.mean;
  }

  private _processData(stats: StatisticValue[]): { positive: [number, number][], negative: [number, number][] } {
    const positive: [number, number][] = [];
    const negative: [number, number][] = [];
    
    stats.forEach((point) => {
      if (point.mean == null) return;
      const x = (point.start + point.end) / 2;
      
      // Always add to both arrays to keep timestamps aligned
      // For stacking to work, all series must have the same x-axis values
      if (point.mean >= 0) {
        positive.push([x, point.mean]);
        negative.push([x, 0]);
      } else {
        positive.push([x, 0]);
        negative.push([x, point.mean]);
      }
    });

    return { positive, negative };
  }

  private _renderChart(data: Record<string, StatisticValue[]>) {
    const datasets: any[] = [];
    const icons: Record<string, string> = {
      Solar: '☀️',
      Import: '🔌',
      Export: '🔌',
      Discharge: '🔋',
      Charge: '🔋',
      Load: '⚙️',
    };
    
    // Production stack: Solar + Grid Import + Battery Charging (all positive)
    // Storage stack: Battery Discharging + Grid Export (all negative)
    // Load: separate white line

    // Build a unified timestamp axis so all stacked series align exactly
    const allTimestamps = new Set<number>();
    ['solar', 'grid', 'battery', 'load'].forEach((k) => {
      (data[k] || []).forEach((s) => {
        const x = s.start; // quantized bucket start (e.g., 6:00, 6:05, ...)
        allTimestamps.add(x);
      });
    });
    const timestamps = Array.from(allTimestamps).sort((a, b) => a - b);

    const makeSeries = (
      stats: StatisticValue[] | undefined,
      name: string,
      stack: string,
      color: string,
      isPositive: boolean,
      gradientDir: 'down' | 'up',
      markPoint?: MarkPointComponentOption,
    ) => {
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
      const seriesPoints = stats || [];
      const latest = seriesPoints.length > 0 ? seriesPoints[seriesPoints.length - 1] : null;
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
              { offset: 0, color: this._hexToRgba(color, 0.98) },
              { offset: 1, color: this._hexToRgba(color, 0.8) },
            ],
          },
        },
        lineStyle: { width: 0 },
        data: dataPoints,
        color,
        markPoint,
      };
    };

    // Helpers to pick latest aligned values
    const getLatestValue = (stats: StatisticValue[] | undefined, ts: number) => {
      if (!stats || stats.length === 0) return 0;
      const found = stats.find((s) => s.start === ts);
      if (found) return found.mean ?? 0;
      const last = stats[stats.length - 1];
      return last.mean ?? 0;
    };

    const lastTs = timestamps[timestamps.length - 1];
    const firstTs = timestamps[0];
    // Latest values from stats, then override with live state if available
    const solarStat = getLatestValue(data.solar, lastTs);
    const gridStat = getLatestValue(data.grid, lastTs);
    const batteryStat = getLatestValue(data.battery, lastTs);
    const loadStat = getLatestValue(data.load, lastTs);

    const solarVal = this._getLiveValue(this.config.entities.solar, solarStat);
    const gridVal = this._getLiveValue(this.config.entities.grid, gridStat);
    const batteryVal = this._getLiveValue(this.config.entities.battery, batteryStat);
    const loadVal = this._getLiveValue(this.config.entities.load, loadStat);

    const importVal = Math.max(0, gridVal);
    const exportVal = Math.min(0, gridVal);
    const dischargeVal = Math.max(0, batteryVal);
    const chargeVal = Math.min(0, batteryVal);

    // Stacked positions (grid always outermost; battery adjacent to zero on negatives)
    const solarStackY = solarVal;
    const dischargeStackY = solarVal + dischargeVal;
    const importStackY = solarVal + dischargeVal + importVal;
    const chargeStackY = chargeVal;
    const exportStackY = chargeVal + exportVal;

    // Build markPoints: icon + value only
    const makeMarkPoint = (
      y: number,
      value: number,
      iconKey: string,
      formatSigned = false,
      entityId?: string,
      zIndex = 0,
    ): MarkPointComponentOption => ({
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
            return `${icons[iconKey] ?? '●'} ${str} W`;
          }
          return `${icons[iconKey] ?? '●'} ${value.toFixed(1)} W`;
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
    });

    // Build series with markPoints aligned to stacked positions
    const showChip = (val: number) => Math.abs(val) > 1e-3;

    // Compute chip Y positions with collision avoidance (load is anchor, always visible)
    const chipPositions: Record<string, number> = {};
    
    // Collect all visible chips
    const visibleChips: { name: string; baseY: number; value: number }[] = [];
    visibleChips.push({ name: 'Load', baseY: loadVal, value: loadVal }); // always visible
    if (showChip(solarVal)) visibleChips.push({ name: 'Solar', baseY: solarStackY, value: solarVal });
    if (batteryVal >= 0 && showChip(batteryVal)) visibleChips.push({ name: 'Discharge', baseY: dischargeStackY, value: batteryVal });
    if (gridVal >= 0 && showChip(gridVal)) visibleChips.push({ name: 'Import', baseY: importStackY, value: gridVal });
    if (batteryVal < 0 && showChip(batteryVal)) visibleChips.push({ name: 'Charge', baseY: chargeStackY, value: batteryVal });
    if (gridVal < 0 && showChip(gridVal)) visibleChips.push({ name: 'Export', baseY: exportStackY, value: gridVal });
    
    // Pixel-based collision resolution
    const convertToPixel = (val: number): number | null => {
      try {
        const res = this.chart.convertToPixel({ yAxisIndex: 0 }, val);
        return typeof res === 'number' ? res : null;
      } catch {
        return null;
      }
    };
    
    const convertToValue = (px: number): number | null => {
      try {
        const res = this.chart.convertFromPixel({ yAxisIndex: 0 }, px);
        return typeof res === 'number' ? res : null;
      } catch {
        return null;
      }
    };
    
    const loadPx = convertToPixel(loadVal);
    if (loadPx !== null) {
      const minGapPx = 32; // minimum pixel gap between chips
      const chipsPx = visibleChips.map(c => ({
        name: c.name,
        px: convertToPixel(c.baseY) ?? 0,
        baseY: c.baseY,
      }));
      
      // Separate into above (smaller px = visually higher) and below load
      const above = chipsPx.filter(c => c.name !== 'Load' && c.px < loadPx).sort((a, b) => a.px - b.px);
      const below = chipsPx.filter(c => c.name !== 'Load' && c.px > loadPx).sort((a, b) => a.px - b.px);
      
      chipPositions['Load'] = loadVal;
      
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

    // Optional time-band shading behind all series
    const bandAreas = this._buildTimeBandAreas(firstTs, lastTs, this.config.time_bands || []);
    if (bandAreas.length > 0) {
      datasets.push({
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
      });
    }

    // Solar (production)
    datasets.push(makeSeries(
      data.solar,
      'Solar',
      'production',
      '#4caf50',
      true,
      'down',
      showChip(solarVal) ? makeMarkPoint(chipPositions['Solar'] ?? solarStackY, solarVal, 'Solar', false, this.config.entities.solar, 30) : undefined,
    ));

    // Battery Discharge (production, near zero), then Grid Import outermost
    datasets.push(makeSeries(
      data.battery,
      'Discharge',
      'production',
      '#2196f3',
      true,
      'down',
      batteryVal >= 0 && showChip(batteryVal) ? makeMarkPoint(chipPositions['Discharge'] ?? dischargeStackY, batteryVal, 'Discharge', true, this.config.entities.battery, 20) : undefined,
    ));
    datasets.push(makeSeries(
      data.grid,
      'Import',
      'production',
      '#f44336',
      true,
      'down',
      gridVal >= 0 && showChip(gridVal) ? makeMarkPoint(chipPositions['Import'] ?? importStackY, gridVal, 'Import', false, this.config.entities.grid, 10) : undefined,
    ));

    // Battery Charge (storage, touching zero), then Grid Export outermost
    datasets.push(makeSeries(
      data.battery,
      'Charge',
      'storage',
      '#00bcd4',
      false,
      'up',
      batteryVal < 0 && showChip(batteryVal) ? makeMarkPoint(chipPositions['Charge'] ?? chargeStackY, batteryVal, 'Charge', true, this.config.entities.battery, 20) : undefined,
    ));
    datasets.push(makeSeries(
      data.grid,
      'Export',
      'storage',
      '#ffeb3b',
      false,
      'up',
      gridVal < 0 && showChip(gridVal) ? makeMarkPoint(chipPositions['Export'] ?? exportStackY, gridVal, 'Export', false, this.config.entities.grid, 10) : undefined,
    ));

    // Add load line (not stacked)
    const loadStats = data.load;
    if (loadStats && loadStats.length > 0) {
      const lineData = loadStats.map(s => [s.start, s.mean]);
        datasets.push({
          name: 'Load',
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 4,
            color: '#ffffff',
          },
          data: lineData,
          color: '#ffffff',
          markPoint: makeMarkPoint(chipPositions['Load'] ?? loadVal, loadVal, 'Load', false, this.config.entities.load, 40),
        });
    }

    const option = {
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
          formatter: (value: number) => {
            const date = new Date(value);
            let hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
          },
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
          formatter: (value: number) => Math.round(value).toString(),
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
        formatter: (params: any) => {
          const time = new Date(params[0].data[0]).toLocaleTimeString();
          let result = `${time}<br/>`;
          params.forEach((param: any) => {
            result += `${param.marker} ${param.seriesName}: ${param.data[1].toFixed(2)} W<br/>`;
          });
          return result;
        },
      },
      series: datasets,
    };

    this.chart.setOption(option);
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

  private _getLiveValue(entityId: string | undefined, fallback: number): number {
    if (!entityId) return fallback;
    const stateObj: any = (this.hass as any)?.states?.[entityId];
    const live = stateObj ? parseFloat(stateObj.state) : NaN;
    return Number.isFinite(live) ? live : fallback;
  }

  private _buildTimeBandAreas(rangeStart: number, rangeEnd: number, bands: ChartedCardConfig['time_bands']): any[] {
    if (!bands || bands.length === 0) return [];

    const dayMs = 24 * 60 * 60 * 1000;
    const areas: any[] = [];

    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

    const startDay = new Date(rangeStart);
    startDay.setHours(0, 0, 0, 0);
    const firstDayStart = startDay.getTime();

    for (let dayStart = firstDayStart; dayStart <= rangeEnd + dayMs; dayStart += dayMs) {
      bands.forEach((band) => {
        const startOffset = this._parseTimeToOffset(band.start);
        const endOffset = this._parseTimeToOffset(band.end);

        let bandStart = dayStart + startOffset;
        let bandEnd = dayStart + endOffset;
        if (endOffset <= startOffset) {
          bandEnd += dayMs; // wraps past midnight
        }

        if (bandEnd < rangeStart || bandStart > rangeEnd) return;

        bandStart = clamp(bandStart, rangeStart, rangeEnd);
        bandEnd = clamp(bandEnd, rangeStart, rangeEnd);

        areas.push([
          {
            xAxis: bandStart,
            itemStyle: {
              color: this._hexToRgba(band.color || '#ffeb3b', 0.16),
            },
            label: band.label != null && band.label !== ''
              ? {
                show: true,
                formatter: band.label,
                color: '#ffffff',
                fontSize: 12,
                backgroundColor: 'rgba(0,0,0,0.35)',
                padding: [3, 6],
                borderRadius: 4,
              }
              : { show: false },
          },
          {
            xAxis: bandEnd,
          },
        ]);
      });
    }

    return areas;
  }

  private _parseTimeToOffset(value: string): number {
    if (!value) return 0;
    const [hStr, mStr] = value.split(':');
    const hours = parseInt(hStr, 10) || 0;
    const minutes = parseInt(mStr, 10) || 0;
    return (hours * 60 + minutes) * 60 * 1000;
  }

  private _createFloatingLabels(data: Record<string, StatisticValue[]>, sources: any[]) {
    const labelHeight = 24;
    const minSpacing = 4;
    
    interface LabelPosition {
      name: string;
      value: number;
      color: string;
      icon: string;
      y: number;
      priority: number;
    }
    
    const icons: Record<string, string> = {
      'Solar': '☀️',
      'Grid': '⚡',
      'Battery': '🔋',
      'Load': '⚙️',
    };
    
    const labels: LabelPosition[] = [];
    const priorities = { 'Load': 0, 'Battery': 1, 'Solar': 2, 'Grid': 3 };
    
    // Get latest values and initial positions
    sources.forEach((source) => {
      const stats = data[source.key];
      const value = this._getLatestValue(stats);
      if (value !== null) {
        labels.push({
          name: source.name,
          value,
          color: source.color,
          icon: icons[source.name] || '●',
          y: value,
          priority: priorities[source.name as keyof typeof priorities] ?? 99,
        });
      }
    });
    
    // Sort by priority (Load first)
    labels.sort((a, b) => a.priority - b.priority);
    
    // Collision detection and resolution
    for (let i = 0; i < labels.length; i++) {
      for (let j = 0; j < i; j++) {
        const current = labels[i];
        const other = labels[j];
        const distance = Math.abs(current.y - other.y);
        
        if (distance < labelHeight + minSpacing) {
          // Move current label away from other
          const direction = current.value > other.y ? 1 : -1;
          current.y = other.y + direction * (labelHeight + minSpacing);
        }
      }
    }
    
    return labels.map((label) => ({
      type: 'group',
      right: 10,
      y: label.y,
      children: [
        {
          type: 'text',
          style: {
            text: `${label.icon} ${label.name}`,
            fontSize: 12,
            fill: label.color,
            fontWeight: 'bold',
          },
          z: 100,
        },
        {
          type: 'text',
          left: 80,
          style: {
            text: `${label.value.toFixed(1)} kW`,
            fontSize: 12,
            fill: label.color,
          },
          z: 100,
        },
      ],
    }));
  }

  private _hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private _parseTimeSpan(span: string): number {
    const match = span.match(/^(\d+)(h|min|d)$/);
    if (!match) return 12 * 60 * 60 * 1000; // default 12h
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'h': return value * 60 * 60 * 1000;
      case 'min': return value * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 12 * 60 * 60 * 1000;
    }
  }

  dispose() {
    this.chart.off('click', this._handleChartClick);
    this.resizeObserver.disconnect();
    this.chart.dispose();
  }
}
