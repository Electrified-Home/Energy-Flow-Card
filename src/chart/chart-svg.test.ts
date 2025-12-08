import { describe, it, expect } from 'vitest';
import { buildChartSVG, calculateChartDimensions, calculateChartScaling, createStackedPaths } from './chart-svg';

const samplePoints = [
  { time: new Date(), solar: 100, batteryDischarge: 50, batteryCharge: 0, gridImport: 25, gridExport: 0, load: 150 },
  { time: new Date(), solar: 200, batteryDischarge: 0, batteryCharge: 10, gridImport: 0, gridExport: 20, load: 180 },
];

describe('chart-svg helpers', () => {
  it('calculates chart dimensions', () => {
    const dims = calculateChartDimensions();
    expect(dims.chartWidth).toBeGreaterThan(0);
    expect(dims.chartHeight).toBeGreaterThan(0);
  });

  it('calculates scaling with supply/demand ratios', () => {
    const dims = calculateChartDimensions();
    const scaling = calculateChartScaling(samplePoints as any, dims.chartHeight, dims.margin.top);
    expect(scaling.zeroLineY).toBeGreaterThan(0);
    expect(scaling.supplyHeight).toBeGreaterThan(0);
  });

  it('creates stacked paths for supply and demand', () => {
    const dims = calculateChartDimensions();
    const scaling = calculateChartScaling(samplePoints as any, dims.chartHeight, dims.margin.top);
    const supply = createStackedPaths(samplePoints as any, dims.chartWidth, scaling.supplyHeight, scaling.scale, dims.margin, 'supply', scaling.zeroLineY);
    const demand = createStackedPaths(samplePoints as any, dims.chartWidth, scaling.demandHeight, scaling.scale, dims.margin, 'demand', scaling.zeroLineY);
    expect(supply).toContain('chart-area-solar');
    expect(demand).toContain('chart-area-grid-export');
  });

  it('builds full chart SVG string with axes and icons', () => {
    const dims = calculateChartDimensions();
    const scaling = calculateChartScaling(samplePoints as any, dims.chartHeight, dims.margin.top);
    const svg = buildChartSVG(samplePoints as any, dims, scaling, 12);
    expect(svg).toContain('chart-area-solar');
    expect(svg).toContain('chart-icon-source-load');
    expect(svg).toContain('chart-icon-source-grid');
  });
});
