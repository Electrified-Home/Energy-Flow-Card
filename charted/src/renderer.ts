import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ChartedCardConfig, StatisticValue } from './types';
import type { HomeAssistant } from '../../shared/src/types/HASS';

// Register required ECharts components
echarts.use([LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

interface ProcessedData {
  positive: [number, number][];
  negative: [number, number][];
}

export class ChartedRenderer {
  private chart: echarts.ECharts;
  private hass: HomeAssistant;
  private config: ChartedCardConfig;
  private resizeObserver: ResizeObserver;

  constructor(container: HTMLElement, hass: HomeAssistant, config: ChartedCardConfig) {
    this.hass = hass;
    this.config = config;
    this.chart = echarts.init(container);
    
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
    const spanMs = this._parseTimeSpan(this.config.graph_span);
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
      
      // Downsample to configurable intervals (default 5 minutes)
      const intervalMs = this._parseTimeSpan(this.config.graph_interval || '5min');
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
      };
    };

    // Solar (production)
    datasets.push(makeSeries(data.solar, 'Solar', 'production', '#4caf50', true, 'down'));

    // Grid Import (production) and Grid Export (storage)
    datasets.push(makeSeries(data.grid, 'Import', 'production', '#f44336', true, 'down'));
    datasets.push(makeSeries(data.grid, 'Export', 'storage', '#ffeb3b', false, 'up'));

    // Battery Charging (production) and Battery Discharging (storage)
    datasets.push(makeSeries(data.battery, 'Charge', 'production', '#00bcd4', true, 'down'));
    datasets.push(makeSeries(data.battery, 'Discharge', 'storage', '#2196f3', false, 'up'));

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
        });
    }

    const option = {
      legend: {
        data: ['Solar', 'Import', 'Export', 'Charge', 'Discharge', 'Load'],
        orient: 'vertical',
        right: 10,
        top: 'middle',
        itemWidth: 14,
        itemHeight: 10,
        textStyle: { color: '#ffffff', fontSize: 12 },
      },
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
    this.resizeObserver.disconnect();
    this.chart.dispose();
  }
}
