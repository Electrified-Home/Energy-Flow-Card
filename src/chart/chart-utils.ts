/**
 * Chart utility functions for rendering SVG chart elements
 */

export function createGridLines(
  chartWidth: number,
  chartHeight: number,
  margin: { top: number; left: number }
): string {
  const lines: string[] = [];
  const numLines = 4;
  
  for (let i = 0; i <= numLines; i++) {
    const y = margin.top + (i * chartHeight / numLines);
    lines.push(`<line x1="${margin.left}" y1="${y}" x2="${margin.left + chartWidth}" y2="${y}" stroke="white" stroke-width="1" />`);
  }
  
  return lines.join('\n');
}

export function createTimeLabels(
  chartWidth: number,
  chartHeight: number,
  margin: { top: number; bottom: number; left: number },
  hoursToShow: number
): string {
  const labels: string[] = [];
  const numLabels = 6;
  const now = new Date();
  
  for (let i = 0; i <= numLabels; i++) {
    const hoursAgo = hoursToShow - (i * hoursToShow / numLabels);
    const time = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    
    // Quantize to nearest 30-minute mark
    const currentMinutes = time.getMinutes();
    const quantizedMinutes = currentMinutes < 15 ? 0 : (currentMinutes < 45 ? 30 : 0);
    const hourAdjust = (currentMinutes >= 45) ? 1 : 0;
    
    time.setMinutes(quantizedMinutes);
    time.setSeconds(0);
    time.setMilliseconds(0);
    if (hourAdjust) {
      time.setHours(time.getHours() + hourAdjust);
    }
    
    const x = margin.left + (i * chartWidth / numLabels);
    const y = margin.top + chartHeight + 20;
    
    // Format as 12-hour AM/PM
    const hours = time.getHours();
    const hours12 = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    labels.push(`
      <text x="${x}" y="${y}" text-anchor="middle" fill="rgb(160, 160, 160)" font-size="11">
        ${hours12} ${ampm}
      </text>
    `);
  }
  
  return labels.join('\n');
}

export function createYAxisLabels(
  supplyHeight: number,
  demandHeight: number,
  margin: { top: number; left: number },
  maxSupply: number,
  maxDemand: number,
  zeroLineY: number
): string {
  const labels: string[] = [];
  
  // Top label (max supply)
  labels.push(`<text x="${margin.left - 10}" y="${margin.top + 5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">${Math.round(maxSupply)}W</text>`);
  
  // Zero line label
  labels.push(`<text x="${margin.left - 10}" y="${zeroLineY + 5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">0</text>`);
  
  // Bottom label (max demand, shown as negative)
  labels.push(`<text x="${margin.left - 10}" y="${zeroLineY + demandHeight + 5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">-${Math.round(maxDemand)}W</text>`);
  
  return labels.join('\n');
}

export function createAreaPath(
  dataPoints: Array<any>,
  xStep: number,
  centerY: number,
  yScale: number,
  margin: { top: number; right: number; bottom: number; left: number },
  valueGetter: (d: any) => number,
  baseValueGetter: number | ((d: any) => number),
  direction: 'up' | 'down'
): string | null {
  const points: Array<{ x: number; y: number }> = [];
  const basePoints: Array<{ x: number; y: number }> = [];
  
  let hasData = false;

  dataPoints.forEach((d, i) => {
    const x = margin.left + i * xStep;
    const value = valueGetter(d);
    const baseValue = typeof baseValueGetter === 'function' ? baseValueGetter(d) : baseValueGetter;
    
    if (value > 0) hasData = true;
    
    const yOffset = direction === 'down' 
      ? -(value + baseValue) * yScale 
      : (value + baseValue) * yScale;
    const baseYOffset = direction === 'down'
      ? -baseValue * yScale
      : baseValue * yScale;
    
    points.push({ x, y: centerY + yOffset });
    basePoints.push({ x, y: centerY + baseYOffset });
  });

  if (!hasData) return null;

  // Create path: go along top edge, then back along bottom edge
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  for (let i = basePoints.length - 1; i >= 0; i--) {
    path += ` L ${basePoints[i].x} ${basePoints[i].y}`;
  }
  path += ' Z';

  return path;
}

export function createLoadLine(
  dataPoints: Array<any>,
  chartWidth: number,
  chartHeight: number,
  yScale: number,
  margin: { top: number; right: number; bottom: number; left: number },
  zeroLineY: number
): string {
  if (!dataPoints || dataPoints.length === 0) return '';

  const xStep = dataPoints.length > 1 ? chartWidth / (dataPoints.length - 1) : 0;

  // Create line path showing load on the supply (positive) side
  const pathPoints = dataPoints.map((d, i) => {
    const x = margin.left + i * xStep;
    const y = zeroLineY - d.load * yScale; // Positive values go up from zero line
    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
  }).join(' ');

  return `<path d="${pathPoints}" fill="none" stroke="#CCCCCC" stroke-width="3" opacity="0.9" />`;
}
