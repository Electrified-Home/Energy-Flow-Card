/**
 * DefaultRenderer
 * 
 * Renders the default SVG view with meters and animated energy flows.
 * Works with Meter instances - does not abstract them away.
 */

import { Meter } from '../Meter';
import type { EnergyFlowCardConfig } from '../types/Config.d.ts';
import type { HomeAssistant } from '../types/HASS.d.ts';
import type { EnergyFlows } from '../types/EnergyFlow.d.ts';
import { FlowRenderer } from './FlowRenderer';
import type { Position } from './FlowRenderer';

export interface DefaultRenderData {
  grid: number;
  load: number;
  production: number;
  battery: number;
  flows: EnergyFlows;
}

/**
 * DefaultRenderer coordinates the classic SVG meter visualization
 */
export class DefaultRenderer {
  private container: HTMLElement;
  private config: EnergyFlowCardConfig;
  private hass: HomeAssistant;
  private canvasWidth: number;
  private canvasHeight: number;
  private meterPositions: {
    production: Position;
    battery: Position;
    grid: Position;
    load: Position;
  };
  private meters: Map<string, Meter>;
  private flowRenderer?: FlowRenderer;
  private iconsExtracted: boolean;
  private iconExtractionTimeouts: Set<number>;
  private iconCache: Map<string, string>;
  
  private getDisplayNameCallback: (type: 'grid' | 'load' | 'production' | 'battery', fallback: string) => string;
  private getIconCallback: (type: 'grid' | 'load' | 'production' | 'battery', fallback: string) => string;
  private fireEventCallback: (event: string, detail?: any) => void;

  constructor(
    container: HTMLElement,
    config: EnergyFlowCardConfig,
    hass: HomeAssistant,
    getDisplayNameCallback: (type: 'grid' | 'load' | 'production' | 'battery', fallback: string) => string,
    getIconCallback: (type: 'grid' | 'load' | 'production' | 'battery', fallback: string) => string,
    fireEventCallback: (event: string, detail?: any) => void
  ) {
    this.container = container;
    this.config = config;
    this.hass = hass;
    this.getDisplayNameCallback = getDisplayNameCallback;
    this.getIconCallback = getIconCallback;
    this.fireEventCallback = fireEventCallback;
    
    this.meters = new Map();
    this.iconsExtracted = false;
    this.iconExtractionTimeouts = new Set();
    this.iconCache = new Map();
    
    // Canvas dimensions
    this.canvasWidth = 500;
    this.canvasHeight = 470;
    
    // Global offset for all meters
    const offsetX = 5;
    const offsetY = 3;
    
    // Meter positions (circle centers) in SVG coordinates
    this.meterPositions = {
      production: { x: 60 + offsetX, y: 80 + offsetY },
      battery: { x: 130 + offsetX, y: 240 + offsetY },
      grid: { x: 60 + offsetX, y: 400 + offsetY },
      load: { x: 360 + offsetX, y: 240 + offsetY }
    };
  }

  /**
   * Render the default view
   */
  render(data: DefaultRenderData): void {
    const { grid, load, production, battery, flows } = data;

    // Get min/max values with defaults
    const gridMin = this.config.grid?.min ?? -5000;
    const gridMax = this.config.grid?.max ?? 5000;
    const loadMax = this.config.load.max ?? 5000;
    const productionMax = this.config.production?.max ?? 5000;
    const batteryMin = this.config.battery?.min ?? -5000;
    const batteryMax = this.config.battery?.max ?? 5000;

    // Only do full render if structure doesn't exist
    if (!this.container.querySelector('.energy-flow-svg')) {
      this.iconsExtracted = false;
      this.initializeStructure(
        grid, load, production, battery,
        gridMin, gridMax, loadMax, productionMax, batteryMin, batteryMax
      );
      
      // Extract icon paths
      if (!this.iconsExtracted) {
        requestAnimationFrame(() => {
          this.extractIconPaths();
        });
      }
      
      // FlowRenderer will be initialized in initializeStructure's requestAnimationFrame
    } else {
      // Update existing meters
      const productionMeter = this.meters.get('production');
      const batteryMeter = this.meters.get('battery');
      const gridMeter = this.meters.get('grid');
      const loadMeter = this.meters.get('load');
      
      if (productionMeter) productionMeter.value = production;
      if (batteryMeter) {
        batteryMeter.invertView = this.config.battery?.invert?.view ?? false;
        batteryMeter.value = battery;
      }
      if (gridMeter) gridMeter.value = grid;
      if (loadMeter) loadMeter.value = load;
      
      // Initialize FlowRenderer if needed (for existing structure)
      if (!this.flowRenderer) {
        const svg = this.container.querySelector('.energy-flow-svg');
        if (svg) {
          this.flowRenderer = new FlowRenderer(svg as SVGElement, this.meterPositions);
          this.flowRenderer.start(); // Start the animation loop
        }
      }
    }

    // Update flows
    if (this.flowRenderer) {
      this.flowRenderer.updateFlows(flows);
    }
  }

  /**
   * Stop animations and clean up
   */
  stop(): void {
    // Stop flow animations
    if (this.flowRenderer) {
      this.flowRenderer.stop();
    }
    
    // Stop meter animations
    this.meters.forEach(meter => meter.stopAnimation());
    
    // Clear icon extraction timeouts
    this.iconExtractionTimeouts.forEach(id => clearTimeout(id));
    this.iconExtractionTimeouts.clear();
  }

  /**
   * Clear all flows and stop animation
   */
  clear(): void {
    this.stop();
    if (this.flowRenderer) {
      this.flowRenderer.clear();
    }
  }

  /**
   * Initialize the HTML structure and create Meter instances
   */
  private initializeStructure(
    grid: number,
    load: number,
    production: number,
    battery: number,
    gridMin: number,
    gridMax: number,
    loadMax: number,
    productionMax: number,
    batteryMin: number,
    batteryMax: number
  ): void {
    // Create meter instances with tap actions
    const productionMeter = new Meter('production', production, 0, productionMax, false, 
      this.getDisplayNameCallback('production', 'Production'),
      this.getIconCallback('production', 'mdi:solar-power'),
      'WATTS',
      false,
      false,
      this.config.production?.tap,
      this.config.production?.entity,
      this.fireEventCallback);
    const batteryMeter = new Meter('battery', battery, batteryMin, batteryMax, true,
      this.getDisplayNameCallback('battery', 'Battery'),
      this.getIconCallback('battery', 'mdi:battery'),
      'WATTS',
      this.config.battery?.invert?.view,
      this.config.battery?.showPlus,
      this.config.battery?.tap,
      this.config.battery?.entity,
      this.fireEventCallback);
    const gridMeter = new Meter('grid', grid, gridMin, gridMax, true,
      this.getDisplayNameCallback('grid', 'Grid'),
      this.getIconCallback('grid', 'mdi:transmission-tower'),
      'WATTS',
      false,
      false,
      this.config.grid?.tap,
      this.config.grid?.entity,
      this.fireEventCallback);
    const loadMeter = new Meter('load', load, 0, loadMax, false,
      this.getDisplayNameCallback('load', 'Load'),
      this.getIconCallback('load', 'mdi:home-lightning-bolt'),
      'WATTS',
      false,
      false,
      this.config.load.tap,
      this.config.load.entity,
      this.fireEventCallback);
    
    this.container.innerHTML = `
      <ha-card>
        <style>
          :host {
            display: block;
            width: 100%;
            height: 100%;
          }
          ha-card {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            padding: 8px;
            box-sizing: border-box;
            overflow: hidden;
          }
          .svg-wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          svg.energy-flow-svg {
            display: block;
            width: 100%;
            height: 100%;
          }
          .flow-line {
            fill: none;
            stroke-linecap: round;
          }
          .flow-positive { stroke: var(--success-color, #4caf50); }
          .flow-negative { stroke: var(--error-color, #f44336); }
          .flow-dot {
            offset-path: attr(data-path);
            offset-distance: 0%;
            animation: flow-move var(--flow-duration, 2s) linear infinite;
          }
          @keyframes flow-move {
            from { offset-distance: 0%; }
            to { offset-distance: 100%; }
          }
        </style>
        <div class="svg-wrapper">
          <svg class="energy-flow-svg" viewBox="0 0 ${this.canvasWidth} ${this.canvasHeight}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              ${this.createMeterDefs()}
            </defs>
            
            <!-- Flow lines layer (behind meters) -->
            <g id="flow-layer"></g>
            
            <!-- Production Meter (top left) -->
            <g id="production-meter" class="meter-group" transform="translate(${this.meterPositions.production.x}, ${this.meterPositions.production.y})"></g>
            
            <!-- Battery Meter (middle left, offset right) -->
            <g id="battery-meter" class="meter-group" transform="translate(${this.meterPositions.battery.x}, ${this.meterPositions.battery.y})"></g>
            
            <!-- Grid Meter (bottom left) -->
            <g id="grid-meter" class="meter-group" transform="translate(${this.meterPositions.grid.x}, ${this.meterPositions.grid.y})"></g>
            
            <!-- Load Meter (right, 2x size) -->
            <g id="load-meter" class="meter-group" transform="translate(${this.meterPositions.load.x}, ${this.meterPositions.load.y}) scale(2)"></g>
          </svg>
        </div>
      </ha-card>
    `;
    
    // Append meter elements and start animations
    requestAnimationFrame(() => {
      const productionContainer = this.container.querySelector('#production-meter');
      const batteryContainer = this.container.querySelector('#battery-meter');
      const gridContainer = this.container.querySelector('#grid-meter');
      const loadContainer = this.container.querySelector('#load-meter');
      
      if (productionContainer) productionContainer.appendChild(productionMeter.createElement());
      if (batteryContainer) batteryContainer.appendChild(batteryMeter.createElement());
      if (gridContainer) gridContainer.appendChild(gridMeter.createElement());
      if (loadContainer) loadContainer.appendChild(loadMeter.createElement());
      
      this.meters.set('production', productionMeter);
      this.meters.set('battery', batteryMeter);
      this.meters.set('grid', gridMeter);
      this.meters.set('load', loadMeter);
      
      // Start each meter's animation
      productionMeter.startAnimation();
      batteryMeter.startAnimation();
      gridMeter.startAnimation();
      loadMeter.startAnimation();
      
      // Update initial dimming
      productionMeter.updateDimming();
      batteryMeter.updateDimming();
      gridMeter.updateDimming();
      loadMeter.updateDimming();
      
      // Initialize FlowRenderer now that SVG is ready
      const svg = this.container.querySelector('.energy-flow-svg');
      if (svg && !this.flowRenderer) {
        this.flowRenderer = new FlowRenderer(svg as SVGElement, this.meterPositions);
        this.flowRenderer.start(); // Start the animation loop
      }
    });
  }

  /**
   * Create SVG filter definitions
   */
  private createMeterDefs(): string {
    return `
      <!-- Glow filter for flow lines -->
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feFlood flood-color="currentColor" flood-opacity="0.5" result="flood" />
        <feComposite in="flood" in2="blur" operator="in" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      
      <!-- Drop shadow filter for meters -->
      <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
        <feOffset in="blur" dx="0" dy="2" result="offsetBlur" />
        <feComponentTransfer in="offsetBlur" result="shadow">
          <feFuncA type="linear" slope="0.4" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    `;
  }

  /**
   * Extract icon paths from ha-icon elements
   */
  private extractIconPaths(): void {
    const meterIds = ['production', 'battery', 'grid', 'load'];
    
    meterIds.forEach(async (meterId) => {
      const iconContainer = this.container.querySelector(`#icon-${meterId}`);
      const iconSource = this.container.querySelector(`#ha-icon-${meterId}`);
      
      if (iconContainer && iconSource) {
        const iconName = iconSource.getAttribute('icon') || 'unknown';
        
        // Check cache first
        const cachedPath = this.iconCache.get(iconName);
        if (cachedPath) {
          this.renderIconPath(iconContainer, cachedPath);
          return;
        }
        
        const pathData = await this.extractIconPath(iconSource, iconName);
        this.renderIconPath(iconContainer, pathData);
      }
    });
    
    this.iconsExtracted = true;
  }

  /**
   * Extract SVG path from ha-icon element
   */
  private async extractIconPath(iconElement: Element, iconName: string, maxAttempts = 10): Promise<string | null> {
    return new Promise((resolve) => {
      const attemptExtraction = (attempt = 1, max = maxAttempts) => {
        const delay = attempt === 1 ? 0 : 100 * attempt;
        const timeoutId = window.setTimeout(async () => {
          try {
            const shadowRoot = (iconElement as any).shadowRoot;
            if (!shadowRoot) {
              if (attempt < max) {
                attemptExtraction(attempt + 1, max);
              } else {
                resolve(null);
              }
              return;
            }
            
            const svg = shadowRoot.querySelector('svg');
            if (!svg) {
              if (attempt < max) {
                attemptExtraction(attempt + 1, max);
              } else {
                resolve(null);
              }
              return;
            }
            
            const path = svg.querySelector('path');
            if (path) {
              const pathData = path.getAttribute('d');
              if (pathData && this.iconCache) {
                this.iconCache.set(iconName, pathData);
              }
              resolve(pathData);
            } else {
              if (attempt < max) {
                attemptExtraction(attempt + 1, max);
              } else {
                resolve(null);
              }
            }
          } catch (e) {
            console.error(`Failed to extract icon path for ${iconName} (attempt ${attempt}):`, e);
            if (attempt < max) {
              attemptExtraction(attempt + 1, max);
            } else {
              resolve(null);
            }
          }
        }, delay);
        this.iconExtractionTimeouts.add(timeoutId);
      };
      
      attemptExtraction();
    });
  }

  /**
   * Render an icon path in a container
   */
  private renderIconPath(container: Element, pathData: string | null): void {
    container.innerHTML = '';
    
    if (pathData) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', 'rgb(160, 160, 160)');
      path.setAttribute('transform', 'scale(1)');
      container.appendChild(path);
    } else {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '12');
      circle.setAttribute('cy', '12');
      circle.setAttribute('r', '8');
      circle.setAttribute('fill', 'rgb(160, 160, 160)');
      container.appendChild(circle);
    }
  }
}
