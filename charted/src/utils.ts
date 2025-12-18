import type { TimeBandConfig } from './types';

/**
 * Converts hex color to rgba with specified alpha
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Parses time string (HH:MM) to milliseconds offset from midnight
 */
export function parseTimeToOffset(value: string): number {
  if (!value) return 0;
  const [hStr, mStr] = value.split(':');
  const hours = parseInt(hStr, 10) || 0;
  const minutes = parseInt(mStr, 10) || 0;
  return (hours * 60 + minutes) * 60 * 1000;
}

/**
 * Parses time span string (e.g., "12h", "30min", "2d") to milliseconds
 */
export function parseTimeSpan(span: string): number {
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

/**
 * Clamps value between min and max
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Formats timestamp as time string for x-axis labels
 */
export function formatTimeLabel(value: number): string {
  const date = new Date(value);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

/**
 * Formats tooltip with time and series values
 */
export function formatTooltip(params: any): string {
  const time = new Date(params[0].data[0]).toLocaleTimeString();
  let result = `${time}<br/>`;
  params.forEach((param: any) => {
    result += `${param.marker} ${param.seriesName}: ${param.data[1].toFixed(2)} W<br/>`;
  });
  return result;
}

/**
 * Formats y-axis labels
 */
export function formatYAxisLabel(value: number): string {
  return Math.round(value).toString();
}

/**
 * Icon mapping for different energy types
 */
export const ICONS = {
  Solar: '☀️',
  Import: '🔌',
  Export: '🔌',
  Discharge: '🔋',
  Charge: '🔋',
  Load: '⚙️',
} as const;

/**
 * Color scheme for the chart
 */
export const COLORS = {
  solar: '#4caf50',
  discharge: '#2196f3',
  import: '#f44336',
  charge: '#00bcd4',
  export: '#ffeb3b',
  load: '#ffffff',
} as const;

/**
 * Builds time band areas for chart background
 */
export function buildTimeBandAreas(
  rangeStart: number,
  rangeEnd: number,
  bands: TimeBandConfig[]
): any[] {
  if (!bands || bands.length === 0) return [];

  const dayMs = 24 * 60 * 60 * 1000;
  const areas: any[] = [];

  const startDay = new Date(rangeStart);
  startDay.setHours(0, 0, 0, 0);
  const firstDayStart = startDay.getTime();

  for (let dayStart = firstDayStart; dayStart <= rangeEnd + dayMs; dayStart += dayMs) {
    bands.forEach((band) => {
      const startOffset = parseTimeToOffset(band.start);
      const endOffset = parseTimeToOffset(band.end);

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
            color: hexToRgba(band.color || '#ffeb3b', 0.16),
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
