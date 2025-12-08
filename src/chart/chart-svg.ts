/**
 * SVG chart generation for the chart view
 */

import type { ChartDataPoint } from './chart-data';
import { createGridLines, createTimeLabels, createYAxisLabels, createAreaPath, createLoadLine } from './chart-utils';

export interface ChartDimensions {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  chartWidth: number;
  chartHeight: number;
}

export interface ChartScaling {
  maxSupply: number;
  maxDemand: number;
  supplyScale: number;
  demandScale: number;
  scale: number;
  supplyHeight: number;
  demandHeight: number;
  zeroLineY: number;
}

export function calculateChartDimensions(): ChartDimensions {
  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 150, bottom: 40, left: 60 };
  
  return {
    width,
    height,
    margin,
    chartWidth: width - margin.left - margin.right,
    chartHeight: height - margin.top - margin.bottom,
  };
}

export function calculateChartScaling(dataPoints: ChartDataPoint[], chartHeight: number, marginTop: number): ChartScaling {
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
  const zeroLineY = marginTop + supplyHeight;

  return {
    maxSupply,
    maxDemand,
    supplyScale,
    demandScale,
    scale,
    supplyHeight,
    demandHeight,
    zeroLineY,
  };
}

export function createStackedPaths(
  dataPoints: ChartDataPoint[],
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

export function buildChartSVG(
  dataPoints: ChartDataPoint[],
  dims: ChartDimensions,
  scaling: ChartScaling,
  hoursToShow: number
): string {
  const supplyPaths = createStackedPaths(dataPoints, dims.chartWidth, scaling.supplyHeight, scaling.scale, dims.margin, 'supply', scaling.zeroLineY);
  const demandPaths = createStackedPaths(dataPoints, dims.chartWidth, scaling.demandHeight, scaling.scale, dims.margin, 'demand', scaling.zeroLineY);
  const loadLine = createLoadLine(dataPoints, dims.chartWidth, scaling.supplyHeight, scaling.scale, dims.margin, scaling.zeroLineY);

  return `
    <!-- Grid lines -->
    <g opacity="0.1">
      ${createGridLines(dims.chartWidth, dims.chartHeight, dims.margin)}
    </g>
    
    <!-- Zero line -->
    <line 
      x1="${dims.margin.left}" 
      y1="${scaling.zeroLineY}" 
      x2="${dims.margin.left + dims.chartWidth}" 
      y2="${scaling.zeroLineY}" 
      stroke="rgb(160, 160, 160)" 
      stroke-width="1" 
      stroke-dasharray="4,4"
    />
    
    <!-- Demand areas (below zero line) -->
    ${demandPaths}
    
    <!-- Supply areas (above zero line) -->
    ${supplyPaths}

    <!-- Load line overlay -->
    ${loadLine}
    
    <!-- Time axis labels -->
    ${createTimeLabels(dims.chartWidth, dims.chartHeight, dims.margin, hoursToShow)}
    
    <!-- Y-axis labels -->
    ${createYAxisLabels(scaling.supplyHeight, scaling.demandHeight, dims.margin, scaling.maxSupply, scaling.maxDemand, scaling.zeroLineY)}
    
    <!-- Hidden icon sources for extraction -->
    <foreignObject id="chart-icon-source-load" x="-100" y="-100" width="24" height="24">
      <div xmlns="http://www.w3.org/1999/xhtml">
        <ha-icon icon="mdi:home-lightning-bolt"></ha-icon>
      </div>
    </foreignObject>
    <foreignObject id="chart-icon-source-solar" x="-100" y="-100" width="24" height="24">
      <div xmlns="http://www.w3.org/1999/xhtml">
        <ha-icon icon="mdi:solar-power"></ha-icon>
      </div>
    </foreignObject>
    <foreignObject id="chart-icon-source-battery" x="-100" y="-100" width="24" height="24">
      <div xmlns="http://www.w3.org/1999/xhtml">
        <ha-icon icon="mdi:battery"></ha-icon>
      </div>
    </foreignObject>
    <foreignObject id="chart-icon-source-grid" x="-100" y="-100" width="24" height="24">
      <div xmlns="http://www.w3.org/1999/xhtml">
        <ha-icon icon="mdi:transmission-tower"></ha-icon>
      </div>
    </foreignObject>
  `;
}
