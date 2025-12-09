/**
 * Flow Renderer - Handles animated flow lines and dots between energy components
 */

/** Position coordinates for flow paths */
export interface Position {
  x: number;
  y: number;
}

/** Animation state for flow dots */
export interface DotState {
  /** Progress along path (0-1) */
  progress: number;
  /** Movement velocity in units per second */
  velocity: number;
}

/**
 * FlowLine - Encapsulates a single animated flow line with glow effect and dots
 */
class FlowLine {
  private glowPath: SVGPathElement;
  private mainPath: SVGPathElement;
  private dots: SVGCircleElement[] = [];
  private dotStates: DotState[] = [];
  private pathData: string;
  private pathLength: number = 0;

  constructor(
    private group: SVGGElement,
    private flowId: string,
    from: Position,
    to: Position,
    power: number,
    color: string,
    private speedMultiplier: number,
    private dotsPerFlow: number
  ) {
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    this.pathData = `M ${from.x},${from.y} Q ${midX},${midY} ${to.x},${to.y}`;

    // Calculate styles based on power
    const { opacity, strokeWidth, dotRadius } = this.calculateStyles(power);
    const velocity = this.calculateVelocity(power);

    // Create glow path (wider, semi-transparent)
    this.glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.glowPath.setAttribute('d', this.pathData);
    this.glowPath.setAttribute('class', 'flow-line');
    this.glowPath.setAttribute('stroke', color);
    this.glowPath.setAttribute('stroke-opacity', String(opacity * 0.5));
    this.glowPath.setAttribute('stroke-width', String(strokeWidth * 2));
    this.glowPath.setAttribute('fill', 'none');
    this.glowPath.setAttribute('stroke-linecap', 'round');
    this.glowPath.setAttribute('style', 'transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;');
    this.glowPath.id = `glow-${flowId}`;
    this.group.appendChild(this.glowPath);

    // Create main path
    this.mainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.mainPath.setAttribute('d', this.pathData);
    this.mainPath.setAttribute('class', 'flow-line');
    this.mainPath.setAttribute('stroke', color);
    this.mainPath.setAttribute('stroke-opacity', String(opacity));
    this.mainPath.setAttribute('stroke-width', String(strokeWidth));
    this.mainPath.setAttribute('fill', 'none');
    this.mainPath.setAttribute('stroke-linecap', 'round');
    this.mainPath.setAttribute('style', 'transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;');
    this.mainPath.id = `path-${flowId}`;
    this.group.appendChild(this.mainPath);

    // Get path length
    this.pathLength = this.mainPath.getTotalLength();

    // Create animated dots
    for (let i = 0; i < this.dotsPerFlow; i++) {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('class', 'flow-dot');
      dot.setAttribute('id', `dot-${flowId}-${i}`);
      dot.setAttribute('r', String(dotRadius));
      dot.setAttribute('fill', color);
      dot.setAttribute('opacity', String(opacity));
      dot.setAttribute('style', 'transition: opacity 0.5s ease-out, r 0.5s ease-out;');
      this.group.appendChild(dot);
      this.dots.push(dot);

      const progress = i / this.dotsPerFlow;
      this.dotStates.push({ progress, velocity });

      // Set initial position
      const point = this.mainPath.getPointAtLength(progress * this.pathLength);
      dot.setAttribute('cx', String(point.x));
      dot.setAttribute('cy', String(point.y));
    }
  }

  private calculateStyles(power: number): { opacity: number; strokeWidth: number; dotRadius: number } {
    let opacity: number;
    if (power <= 100) {
      opacity = 0.25;
    } else if (power <= 200) {
      opacity = 0.25 + ((power - 100) / 100) * 0.75;
    } else {
      opacity = 1;
    }

    const minWidth = 2;
    const maxWidth = 23.76;
    const maxPower = 10000;
    let strokeWidth: number;
    if (power <= 100) {
      strokeWidth = minWidth;
    } else {
      const range = Math.min((power - 100) / (maxPower - 100), 1) * (maxWidth - minWidth);
      strokeWidth = minWidth + range;
    }

    const baseDotRadius = 2.5;
    const maxDotRadius = 3;
    const scaledRadius = baseDotRadius * (strokeWidth / minWidth);
    const dotRadius = Math.max(scaledRadius, maxDotRadius);

    return { opacity, strokeWidth, dotRadius };
  }

  private calculateVelocity(power: number): number {
    const baseSpeed = 40 * (power / 1000) * this.speedMultiplier;
    return this.pathLength > 0 ? baseSpeed / this.pathLength : 0;
  }

  update(power: number, color: string): void {
    const { opacity, strokeWidth, dotRadius } = this.calculateStyles(power);
    const velocity = this.calculateVelocity(power);

    // Update glow path
    this.glowPath.setAttribute('stroke', color);
    this.glowPath.setAttribute('stroke-opacity', String(opacity * 0.5));
    this.glowPath.setAttribute('stroke-width', String(strokeWidth * 2));

    // Update main path
    this.mainPath.setAttribute('stroke', color);
    this.mainPath.setAttribute('stroke-opacity', String(opacity));
    this.mainPath.setAttribute('stroke-width', String(strokeWidth));

    // Update dots
    this.dots.forEach((dot, i) => {
      dot.setAttribute('r', String(dotRadius));
      dot.setAttribute('opacity', String(opacity));
      dot.setAttribute('fill', color);
      this.dotStates[i].velocity = velocity;
    });
  }

  animate(deltaTime: number): void {
    this.dotStates.forEach((state, i) => {
      if (state.velocity > 0) {
        // deltaTime is in milliseconds, convert to seconds
        state.progress += state.velocity * (deltaTime / 1000);
        if (state.progress >= 1) {
          state.progress = state.progress % 1;
        }

        try {
          if (this.pathLength > 0) {
            const point = this.mainPath.getPointAtLength(state.progress * this.pathLength);
            this.dots[i].setAttribute('cx', String(point.x));
            this.dots[i].setAttribute('cy', String(point.y));
          }
        } catch (_e) {
          // Ignore path errors
        }
      }
    });
  }

  fadeOut(callback: () => void): void {
    this.glowPath.setAttribute('stroke-opacity', '0');
    this.mainPath.setAttribute('stroke-opacity', '0');
    this.dots.forEach(dot => dot.setAttribute('opacity', '0'));
    setTimeout(callback, 500);
  }
}

export class FlowRenderer {
  private flowLines: Map<string, FlowLine> = new Map();
  private animationFrameId: number | null = null;
  private lastAnimationTime: number | null = null;
  private speedMultiplier = 0.8;
  private dotsPerFlow = 3;

  constructor(
    private container: SVGElement,
    private positions: Record<string, Position>
  ) {}

  /**
   * Update flows based on current power values
   */
  updateFlows(flows: {
    productionToLoad: number;
    productionToBattery: number;
    productionToGrid: number;
    gridToLoad: number;
    gridToBattery: number;
    batteryToLoad: number;
  }): void {
    const flowLayer = this.container.querySelector('#flow-layer') as SVGGElement;
    if (!flowLayer) return;

    const threshold = 0;
    const batteryThreshold = 10;

    // Update each flow with appropriate color
    this.updateOrCreateFlow(flowLayer, 'production-to-load', this.positions.production, this.positions.load, flows.productionToLoad, '#4caf50', threshold);
    this.updateOrCreateFlow(flowLayer, 'production-to-battery', this.positions.production, this.positions.battery, flows.productionToBattery, '#4caf50', threshold);
    this.updateOrCreateFlow(flowLayer, 'battery-to-load', this.positions.battery, this.positions.load, flows.batteryToLoad, '#2196f3', batteryThreshold);
    this.updateOrCreateFlow(flowLayer, 'grid-to-load', this.positions.grid, this.positions.load, flows.gridToLoad, '#f44336', threshold);
    this.updateOrCreateFlow(flowLayer, 'grid-to-battery', this.positions.grid, this.positions.battery, flows.gridToBattery, '#f44336', threshold);
    this.updateOrCreateFlow(flowLayer, 'production-to-grid', this.positions.production, this.positions.grid, flows.productionToGrid, '#ffeb3b', threshold);
  }

  /**
   * Start animation loop
   */
  start(): void {
    if (this.animationFrameId) return;
    this.lastAnimationTime = performance.now();
    this.animate();
  }

  /**
   * Stop animation loop
   */
  stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      this.lastAnimationTime = null;
    }
  }

  /**
   * Clear all flows
   */
  clear(): void {
    this.stop();
    this.flowLines.clear();
    const flowLayer = this.container.querySelector('#flow-layer') as SVGGElement;
    if (flowLayer) {
      flowLayer.innerHTML = '';
    }
  }

  private animate = (): void => {
    const now = performance.now();
    const deltaTime = this.lastAnimationTime ? now - this.lastAnimationTime : 0;
    this.lastAnimationTime = now;

    // Animate each flow line
    this.flowLines.forEach((flowLine) => {
      flowLine.animate(deltaTime);
    });

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private updateOrCreateFlow(
    flowLayer: SVGGElement,
    flowId: string,
    from: Position,
    to: Position,
    power: number,
    color: string,
    threshold: number
  ): void {
    const existingFlowLine = this.flowLines.get(flowId);

    if (power <= threshold) {
      if (existingFlowLine) {
        this.fadeOutFlow(flowLayer, flowId);
      }
      return;
    }

    if (!existingFlowLine) {
      this.drawFlow(flowLayer, flowId, from, to, power, color);
    } else {
      existingFlowLine.update(power, color);
    }
  }

  private drawFlow(
    flowLayer: SVGGElement,
    flowId: string,
    from: Position,
    to: Position,
    power: number,
    color: string
  ): void {
    // Create flow group
    const flowGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    flowGroup.setAttribute('id', flowId);
    flowLayer.appendChild(flowGroup);

    // Create FlowLine instance
    const flowLine = new FlowLine(
      flowGroup,
      flowId,
      from,
      to,
      power,
      color,
      this.speedMultiplier,
      this.dotsPerFlow
    );

    this.flowLines.set(flowId, flowLine);
  }

  private removeFlow(flowLayer: SVGGElement, flowId: string): void {
    const flow = flowLayer.querySelector(`#${flowId}`);
    if (flow) {
      flow.remove();
      this.flowLines.delete(flowId);
    }
  }

  private fadeOutFlow(flowLayer: SVGGElement, flowId: string): void {
    const flowLine = this.flowLines.get(flowId);
    if (!flowLine) return;

    flowLine.fadeOut(() => {
      this.removeFlow(flowLayer, flowId);
    });
  }
}
