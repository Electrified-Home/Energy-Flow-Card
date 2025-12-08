export type StreamingMode = 'area' | 'line';
export type StreamingDirection = 'up' | 'down';

interface StreamingPlotOptions {
  mode: StreamingMode;
  direction: StreamingDirection;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  id?: string;
}

interface StreamingPoint {
  x: number;
  top: number;
  base: number;
}

/**
 * Minimal streaming SVG plot helper for incremental polygon/line building.
 */
export class StreamingPlot {
  private path: SVGPathElement;
  private points: StreamingPoint[] = [];
  private maxPoints = 1;
  private width = 0;
  private xOffset = 0;
  private zeroLineY = 0;
  private scale = 1;
  private mode: StreamingMode;
  private direction: StreamingDirection;

  constructor(group: Element, options: StreamingPlotOptions) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    if (options.id) path.setAttribute('id', options.id);
    if (options.fill) path.setAttribute('fill', options.fill);
    if (options.stroke) path.setAttribute('stroke', options.stroke);
    if (options.strokeWidth) path.setAttribute('stroke-width', String(options.strokeWidth));
    if (options.opacity !== undefined) path.setAttribute('opacity', String(options.opacity));
    path.setAttribute('fill-rule', 'evenodd');
    path.style.cursor = 'pointer';
    group.appendChild(path);

    this.path = path;
    this.mode = options.mode;
    this.direction = options.direction;
  }

  reset(maxPoints: number, width: number, zeroLineY: number, scale: number, xOffset = 0): void {
    this.maxPoints = Math.max(2, maxPoints);
    this.width = width;
    this.xOffset = xOffset;
    this.zeroLineY = zeroLineY;
    this.scale = scale;
    this.points = [];
    this.render();
  }

  addPoint(value: number, baseValue = 0): void {
    const xStep = this.width / (this.maxPoints - 1);

    if (this.points.length === this.maxPoints) {
      this.points.shift();
    }

    this.points.push({ x: 0, top: this.toY(value + baseValue), base: this.toY(baseValue) });

    for (let i = 0; i < this.points.length; i++) {
      this.points[i].x = this.xOffset + i * xStep;
    }

    this.render();
  }

  private toY(value: number): number {
    return this.direction === 'down'
      ? this.zeroLineY - value * this.scale
      : this.zeroLineY + value * this.scale;
  }

  private render(): void {
    if (this.points.length === 0) {
      this.path.setAttribute('d', '');
      return;
    }

    if (this.mode === 'line') {
      const cmds = this.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.top.toFixed(2)}`);
      this.path.setAttribute('d', cmds.join(' '));
      this.path.setAttribute('fill', 'none');
      return;
    }

    const tops = this.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.top.toFixed(2)}`);
    const bases = [...this.points].reverse().map(p => `L ${p.x.toFixed(2)} ${p.base.toFixed(2)}`);
    const d = `${tops.join(' ')} ${bases.join(' ')} Z`;
    this.path.setAttribute('d', d);
  }
}
