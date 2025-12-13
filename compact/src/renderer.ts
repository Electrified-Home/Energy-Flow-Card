/**
 * CompactRenderer
 * 
 * Renders the compact bar view showing energy flow percentages
 * Supports two modes:
 * - 'compact': Shows only load bar with sources
 * - 'compact-battery': Shows load bar + battery bar
 */

import type { EnergyFlowCardConfig } from '../../shared/src/types/Config.d.ts';
import type { HomeAssistant } from '../../shared/src/types/HASS.d.ts';
import type { EnergyFlows } from '../../shared/src/types/EnergyFlow.d.ts';
import { updateSegmentVisibility } from '../../shared/src/utils/helpers';

export type CompactViewMode = 'compact' | 'compact-battery';

export interface CompactRenderData {
  grid: number;
  load: number;
  production: number;
  battery: number;
  flows: EnergyFlows;
  batterySoc: number | null;
}

export type EntityType = 'grid' | 'load' | 'production' | 'battery';

/**
 * CompactRenderer handles rendering the compact bar visualization
 */
export class CompactRenderer {
  private container: HTMLElement;
  private config: EnergyFlowCardConfig;
  private hass: HomeAssistant;
  private viewMode: CompactViewMode;
  private lastViewMode?: CompactViewMode;
  private getIconCallback: (type: EntityType, fallback: string) => string;
  private handleActionCallback: (action: unknown, entity?: string) => void;

  // Colors (darker hues - 50% brightness)
  private readonly productionColor = '#256028'; // Dark green
  private readonly batteryColor = '#104b79'; // Dark blue (load)
  private readonly gridColor = '#7a211b'; // Dark red (import)
  private readonly returnColor = '#7a6b1b'; // Dark yellow (export)

  // Animation state
  private animationFrameId: number | null = null;
  private loadPosition = 0;
  private batteryPosition = 0;
  private loadSpeed = 0;
  private batterySpeed = 0;
  private batteryDirection: 'up' | 'down' | 'none' = 'none';
  private lastAnimationTime = 0;

  constructor(
    container: HTMLElement,
    config: EnergyFlowCardConfig,
    hass: HomeAssistant,
    viewMode: CompactViewMode,
    getIconCallback: (type: EntityType, fallback: string) => string,
    handleActionCallback: (action: unknown, entity?: string) => void
  ) {
    this.container = container;
    this.config = config;
    this.hass = hass;
    this.viewMode = viewMode;
    this.getIconCallback = getIconCallback;
    this.handleActionCallback = handleActionCallback;
  }

  setConfig(config: EnergyFlowCardConfig): void {
    this.config = config;
  }

  /**
   * Render or update the compact view
   */
  render(data: CompactRenderData): void {
    // Initialize structure if needed
    if (!this.container.querySelector('.compact-view') || this.lastViewMode !== this.viewMode) {
      this.initializeStructure();
      this.attachEventHandlers();
      this.lastViewMode = this.viewMode;
    }

    // Update values and segments
    this.updateSegments(data);
  }

  /**
   * Update the view mode
   */
  setViewMode(viewMode: CompactViewMode): void {
    if (this.viewMode !== viewMode) {
      this.viewMode = viewMode;
      this.lastViewMode = undefined; // Force re-render
    }
  }

  /**
   * Initialize the HTML structure
   */
  private initializeStructure(): void {
    this.container.innerHTML = `
      <ha-card>
        <style>
          :host {
            display: block;
            width: 100%;
            height: 100%;
          }
          ha-card {
            padding: 16px;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .compact-view {
            display: flex;
            flex-direction: column;
            gap: ${this.viewMode === 'compact-battery' ? '12px' : '0'};
            width: 100%;
          }
          .compact-row {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
          }
          .bar-container {
            flex: 1;
            height: 60px;
            background: rgb(40, 40, 40);
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            position: relative;
          }
          .bar-container {
            --gradient-x: -100%;
            --gradient-y: 0%;
          }
          .bar-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0) 30%,
              rgba(255, 255, 255, 0.3) 50%,
              rgba(255, 255, 255, 0) 70%,
              rgba(255, 255, 255, 0) 100%
            );
            pointer-events: none;
            z-index: 10;
            will-change: transform, opacity;
            transform: translateX(var(--gradient-x));
            opacity: 1;
            transition: opacity 0.5s ease-out;
          }
          .bar-container.no-flow::before {
            opacity: 0;
          }
          #battery-row .bar-container::before {
            background: linear-gradient(
              180deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0) 30%,
              rgba(255, 255, 255, 0.3) 50%,
              rgba(255, 255, 255, 0) 70%,
              rgba(255, 255, 255, 0) 100%
            );
            transform: translateY(var(--gradient-y));
          }
          .bar-segment {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 14px;
            font-weight: 600;
            color: rgb(255, 255, 255);
            transition: width 0.5s ease-out;
            position: relative;
            cursor: pointer;
          }
          .bar-segment:hover {
            filter: brightness(1.2);
          }
          .bar-segment-content {
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
          }
          .bar-segment-icon {
            width: 24px;
            height: 24px;
            flex-shrink: 0;
            opacity: 1;
            color: rgb(255, 255, 255);
          }
          .bar-segment-label {
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          }
          .bar-segment[data-width-px] .bar-segment-label {
            display: none;
          }
          .bar-segment[data-width-px="show-label"] .bar-segment-label {
            display: inline;
          }
          .bar-segment[data-width-px] .bar-segment-icon {
            display: none;
          }
          .bar-segment[data-width-px="show-icon"] .bar-segment-icon,
          .bar-segment[data-width-px="show-label"] .bar-segment-icon {
            display: block;
          }
          .row-value {
            font-size: 24px;
            font-weight: 600;
            color: rgb(255, 255, 255);
            white-space: nowrap;
            min-width: 100px;
            text-align: right;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
          }
          .row-value:hover {
            filter: brightness(1.1);
          }
          .row-value.battery-discharge {
            text-align: left;
            flex-direction: row-reverse;
          }
          .row-icon {
            width: 28px;
            height: 28px;
            flex-shrink: 0;
            color: rgb(160, 160, 160);
            display: flex;
            align-items: center;
          }
          .row-text {
            display: flex;
            align-items: baseline;
            gap: 4px;
            line-height: 1;
          }
          .row-unit {
            font-size: 14px;
            color: rgb(160, 160, 160);
            margin-left: 4px;
          }
        </style>
        <div class="compact-view">
          ${this.viewMode === 'compact-battery' ? `
          <!-- Battery Row -->
          <div class="compact-row" id="battery-row">
            <div class="row-value" id="battery-soc-left" style="display: none;">
              <ha-icon class="row-icon" icon="${this.getIconCallback('battery', 'mdi:battery')}"></ha-icon>
              <div class="row-text">
                <span id="battery-soc-text-left">--</span><span class="row-unit">%</span>
              </div>
            </div>
            <div class="bar-container">
              <!-- Color order: red, yellow, blue, green (left to right) -->
              <div id="battery-grid-segment" class="bar-segment" style="background: ${this.gridColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback('grid', 'mdi:transmission-tower')}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="battery-load-segment" class="bar-segment" style="background: ${this.batteryColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback('load', 'mdi:home')}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="battery-production-segment" class="bar-segment" style="background: ${this.productionColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback('production', 'mdi:solar-power')}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
            </div>
            <div class="row-value" id="battery-soc-right">
              <ha-icon class="row-icon" icon="${this.getIconCallback('battery', 'mdi:battery')}"></ha-icon>
              <div class="row-text">
                <span id="battery-soc-text-right">--</span><span class="row-unit">%</span>
              </div>
            </div>
          </div>
          ` : ''}
          <!-- Load Row -->
          <div class="compact-row">
            <div class="bar-container">
              <div id="grid-segment" class="bar-segment" style="background: ${this.gridColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback('grid', 'mdi:transmission-tower')}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="battery-segment" class="bar-segment" style="background: ${this.batteryColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback('battery', 'mdi:battery')}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="production-segment" class="bar-segment" style="background: ${this.productionColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback('production', 'mdi:solar-power')}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
            </div>
            <div class="row-value">
              <ha-icon class="row-icon" icon="${this.getIconCallback('load', 'mdi:home-lightning-bolt')}"></ha-icon>
              <div class="row-text">
                <span id="load-value-text">0</span><span class="row-unit">W</span>
              </div>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Attach click event handlers
   */
  private attachEventHandlers(): void {
    requestAnimationFrame(() => {
      // Load row segments
      const productionSeg = this.container.querySelector('#production-segment');
      const batterySeg = this.container.querySelector('#battery-segment');
      const gridSeg = this.container.querySelector('#grid-segment');
      const loadValues = this.container.querySelectorAll('.row-value');
      const loadValue = loadValues[0]; // First row-value is the load
      
      if (productionSeg) {
        productionSeg.addEventListener('click', () => {
          this.handleActionCallback(this.config.production?.tap, this.config.production?.entity);
        });
      }
      if (batterySeg) {
        batterySeg.addEventListener('click', () => {
          this.handleActionCallback(this.config.battery?.tap, this.config.battery?.entity);
        });
      }
      if (gridSeg) {
        gridSeg.addEventListener('click', () => {
          this.handleActionCallback(this.config.grid?.tap, this.config.grid?.entity);
        });
      }
      if (loadValue) {
        loadValue.addEventListener('click', () => {
          this.handleActionCallback(this.config.load.tap, this.config.load.entity);
        });
      }
      
      // Battery row handlers if in compact-battery mode
      if (this.viewMode === 'compact-battery') {
        const batteryProdSeg = this.container.querySelector('#battery-production-segment');
        const batteryLoadSeg = this.container.querySelector('#battery-load-segment');
        const batteryGridSeg = this.container.querySelector('#battery-grid-segment');
        const batterySocLeft = this.container.querySelector('#battery-soc-left');
        const batterySocRight = this.container.querySelector('#battery-soc-right');
        
        if (batteryProdSeg) {
          batteryProdSeg.addEventListener('click', () => {
            this.handleActionCallback(this.config.production?.tap, this.config.production?.entity);
          });
        }
        if (batteryLoadSeg) {
          batteryLoadSeg.addEventListener('click', () => {
            this.handleActionCallback(this.config.load.tap, this.config.load.entity);
          });
        }
        if (batteryGridSeg) {
          batteryGridSeg.addEventListener('click', () => {
            this.handleActionCallback(this.config.grid?.tap, this.config.grid?.entity);
          });
        }
        if (batterySocLeft) {
          batterySocLeft.addEventListener('click', () => {
            this.handleActionCallback(this.config.battery?.tap, this.config.battery?.entity);
          });
        }
        if (batterySocRight) {
          batterySocRight.addEventListener('click', () => {
            this.handleActionCallback(this.config.battery?.tap, this.config.battery?.entity);
          });
        }
      }
    });
  }

  /**
   * Update segment widths and labels
   */
  private updateSegments(data: CompactRenderData): void {
    const { load, flows, battery, batterySoc } = data;

    // Calculate load bar percentages
    const productionValue = flows.productionToLoad;
    const batteryToLoad = flows.batteryToLoad;
    const gridToLoad = flows.gridToLoad;

    // Calculate TRUE percentages for labels (these show accurate data)
    const total = load || 1;
    const productionPercent = (productionValue / total) * 100;
    const batteryPercent = (batteryToLoad / total) * 100;
    const gridPercent = (gridToLoad / total) * 100;
    
    // Calculate VISUAL percentages for bar widths (scaled to fill 100%)
    const sumPercent = productionPercent + batteryPercent + gridPercent;
    let visualProductionPercent = productionPercent;
    let visualBatteryPercent = batteryPercent;
    let visualGridPercent = gridPercent;
    
    if (sumPercent > 0) {
      const scale = 100 / sumPercent;
      visualProductionPercent = productionPercent * scale;
      visualBatteryPercent = batteryPercent * scale;
      visualGridPercent = gridPercent * scale;
    }

    // Calculate battery bar values
    let batteryGridWatts = 0;
    let batteryLoadWatts = 0;
    let batteryProdWatts = 0;
    let visualBatteryGridPercent = 0;
    let visualBatteryLoadPercent = 0;
    let visualBatteryProdPercent = 0;
    
    if (this.viewMode === 'compact-battery') {
      if (battery < 0) {
        // CHARGING
        const batteryCharging = Math.abs(battery);
        const batteryTotal = batteryCharging || 1;
        
        batteryGridWatts = flows.gridToBattery;
        batteryProdWatts = flows.productionToBattery;
        
        const batteryGridPercent = (flows.gridToBattery / batteryTotal) * 100;
        const batteryProdPercent = (flows.productionToBattery / batteryTotal) * 100;
        
        const chargeSum = batteryGridPercent + batteryProdPercent;
        if (chargeSum > 0) {
          const scale = 100 / chargeSum;
          visualBatteryGridPercent = batteryGridPercent * scale;
          visualBatteryProdPercent = batteryProdPercent * scale;
        }
      } else if (battery > 0) {
        // DISCHARGING
        const batteryTotal = battery || 1;
        const batteryToGrid = battery - flows.batteryToLoad;
        
        batteryLoadWatts = flows.batteryToLoad;
        batteryGridWatts = batteryToGrid;
        
        const batteryLoadPercent = (flows.batteryToLoad / batteryTotal) * 100;
        const batteryGridPercent = (batteryToGrid / batteryTotal) * 100;
        
        const dischargeSum = batteryLoadPercent + batteryGridPercent;
        if (dischargeSum > 0) {
          const scale = 100 / dischargeSum;
          visualBatteryLoadPercent = batteryLoadPercent * scale;
          visualBatteryGridPercent = batteryGridPercent * scale;
        }
      }
    }

    requestAnimationFrame(() => {
      this.updateLoadBar(
        visualProductionPercent,
        visualBatteryPercent,
        visualGridPercent,
        productionPercent,
        batteryPercent,
        gridPercent,
        productionValue,
        batteryToLoad,
        gridToLoad,
        load
      );

      if (this.viewMode === 'compact-battery') {
        this.updateBatteryBar(
          visualBatteryGridPercent,
          visualBatteryLoadPercent,
          visualBatteryProdPercent,
          batteryGridWatts,
          batteryLoadWatts,
          batteryProdWatts,
          battery,
          batterySoc
        );
      }
    });
  }

  /**
   * Calculate animation duration based on power flow
   * Higher power = faster animation (shorter duration)
   */
  private getAnimationSpeed(watts: number): number {
    if (watts <= 0) return 0;
    
    // Linear relationship: speed is proportional to watts
    // Speed in % per second
    const referenceWatts = 100;
    const referenceSpeed = 2.5; // % per second at 100W
    
    return (watts / referenceWatts) * referenceSpeed;
  }

  /**
   * Start the animation loop
   */
  private startAnimation(): void {
    if (this.animationFrameId !== null) return;
    
    this.lastAnimationTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - this.lastAnimationTime) / 1000; // Convert to seconds
      this.lastAnimationTime = currentTime;
      
      // Update load bar position (horizontal)
      if (this.loadSpeed > 0) {
        this.loadPosition += this.loadSpeed * deltaTime;
        if (this.loadPosition > 100) this.loadPosition = -100;
        
        const loadBarContainer = this.container.querySelector('.compact-row:not(#battery-row) .bar-container') as HTMLElement;
        if (loadBarContainer) {
          const gradient = loadBarContainer.querySelector('::before');
          if (gradient) {
            (gradient as HTMLElement).style.transform = `translateX(${this.loadPosition}%)`;
          } else {
            // Fallback: set CSS variable
            loadBarContainer.style.setProperty('--gradient-x', `${this.loadPosition}%`);
          }
        }
      }
      
      // Update battery bar position (vertical)
      if (this.batterySpeed > 0 && this.batteryDirection !== 'none') {
        if (this.batteryDirection === 'up') {
          this.batteryPosition -= this.batterySpeed * deltaTime;
          if (this.batteryPosition < -100) this.batteryPosition = 100;
        } else {
          this.batteryPosition += this.batterySpeed * deltaTime;
          if (this.batteryPosition > 100) this.batteryPosition = -100;
        }
        
        const batteryBarContainer = this.container.querySelector('#battery-row .bar-container') as HTMLElement;
        if (batteryBarContainer) {
          batteryBarContainer.style.setProperty('--gradient-y', `${this.batteryPosition}%`);
        }
      }
      
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Stop the animation loop
   */
  private stopAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Update the load bar segments
   */
  private updateLoadBar(
    visualProductionPercent: number,
    visualBatteryPercent: number,
    visualGridPercent: number,
    productionPercent: number,
    batteryPercent: number,
    gridPercent: number,
    productionValue: number,
    batteryToLoad: number,
    gridToLoad: number,
    load: number
  ): void {
    const productionSegment = this.container.querySelector('#production-segment');
    const batterySegment = this.container.querySelector('#battery-segment');
    const gridSegment = this.container.querySelector('#grid-segment');
    const loadValueText = this.container.querySelector('#load-value-text');
    const barContainer = this.container.querySelector('.bar-container') as HTMLElement;

    // Update animation speed for load bar
    this.loadSpeed = this.getAnimationSpeed(load);
    if (barContainer) {
      if (this.loadSpeed > 0) {
        barContainer.classList.remove('no-flow');
        if (this.animationFrameId === null) {
          this.startAnimation();
        }
      } else {
        barContainer.classList.add('no-flow');
      }
    }

    if (productionSegment) {
      (productionSegment as HTMLElement).style.width = `${visualProductionPercent}%`;
      const label = productionSegment.querySelector('.bar-segment-label');
      if (label && productionValue > 0) {
        label.textContent = `${Math.round(productionPercent)}%`;
      }
      const widthPx = (visualProductionPercent / 100) * (barContainer?.clientWidth || 0);
      updateSegmentVisibility(productionSegment as HTMLElement, widthPx, productionValue > 0);
    }

    if (batterySegment) {
      (batterySegment as HTMLElement).style.width = `${visualBatteryPercent}%`;
      const label = batterySegment.querySelector('.bar-segment-label');
      if (label && batteryToLoad > 0) {
        label.textContent = `${Math.round(batteryPercent)}%`;
      }
      const widthPx = (visualBatteryPercent / 100) * (barContainer?.clientWidth || 0);
      updateSegmentVisibility(batterySegment as HTMLElement, widthPx, batteryToLoad > 0);
    }

    if (gridSegment) {
      (gridSegment as HTMLElement).style.width = `${visualGridPercent}%`;
      const label = gridSegment.querySelector('.bar-segment-label');
      if (label && gridToLoad > 0) {
        label.textContent = `${Math.round(gridPercent)}%`;
      }
      const widthPx = (visualGridPercent / 100) * (barContainer?.clientWidth || 0);
      updateSegmentVisibility(gridSegment as HTMLElement, widthPx, gridToLoad > 0);
    }

    if (loadValueText) {
      loadValueText.textContent = String(Math.round(load));
    }
  }

  /**
   * Update the battery bar segments
   */
  private updateBatteryBar(
    visualBatteryGridPercent: number,
    visualBatteryLoadPercent: number,
    visualBatteryProdPercent: number,
    batteryGridWatts: number,
    batteryLoadWatts: number,
    batteryProdWatts: number,
    battery: number,
    batterySoc: number | null
  ): void {
    const batteryGridSegment = this.container.querySelector('#battery-grid-segment');
    const batteryLoadSegment = this.container.querySelector('#battery-load-segment');
    const batteryProdSegment = this.container.querySelector('#battery-production-segment');
    const batterySocLeft = this.container.querySelector('#battery-soc-left') as HTMLElement | null;
    const batterySocRight = this.container.querySelector('#battery-soc-right') as HTMLElement | null;
    const batterySocTextLeft = this.container.querySelector('#battery-soc-text-left');
    const batterySocTextRight = this.container.querySelector('#battery-soc-text-right');
    const batteryBarContainers = this.container.querySelectorAll('.bar-container');
    const batteryBarContainer = batteryBarContainers[0] as HTMLElement | null;
    const batteryRow = this.container.querySelector('#battery-row') as HTMLElement | null;
    
    let gridIsImport = false;
    
    if (battery < 0) {
      // CHARGING
      gridIsImport = true;
      const wasNotCharging = this.batteryDirection !== 'up';
      this.batteryDirection = 'up';
      if (wasNotCharging) {
        this.batteryPosition = 100; // Start from bottom
      }
      if (batteryRow) {
        batteryRow.classList.add('charging');
        batteryRow.classList.remove('discharging');
      }
      if (batterySocLeft) batterySocLeft.style.display = 'none';
      if (batterySocRight) batterySocRight.style.display = 'flex';
      if (batterySocTextRight && batterySoc !== null) {
        batterySocTextRight.textContent = batterySoc.toFixed(1);
      }
    } else if (battery > 0) {
      // DISCHARGING
      gridIsImport = false;
      const wasNotDischarging = this.batteryDirection !== 'down';
      this.batteryDirection = 'down';
      if (wasNotDischarging) {
        this.batteryPosition = -100; // Start from top
      }
      if (batteryRow) {
        batteryRow.classList.add('discharging');
        batteryRow.classList.remove('charging');
      }
      if (batterySocLeft) batterySocLeft.style.display = 'flex';
      if (batterySocRight) batterySocRight.style.display = 'none';
      if (batterySocTextLeft && batterySoc !== null) {
        batterySocTextLeft.textContent = batterySoc.toFixed(1);
      }
    } else {
      // IDLE
      this.batteryDirection = 'none';
      if (batteryRow) {
        batteryRow.classList.remove('charging', 'discharging');
      }
      if (batterySocLeft) batterySocLeft.style.display = 'none';
      if (batterySocRight) batterySocRight.style.display = 'flex';
      if (batterySocTextRight && batterySoc !== null) {
        batterySocTextRight.textContent = batterySoc.toFixed(1);
      }
    }
    
    // Update animation speed for battery bar
    this.batterySpeed = this.getAnimationSpeed(Math.abs(battery));
    if (batteryBarContainer) {
      if (this.batterySpeed > 0) {
        batteryBarContainer.classList.remove('no-flow');
        if (this.animationFrameId === null) {
          this.startAnimation();
        }
      } else {
        batteryBarContainer.classList.add('no-flow');
      }
    }
    
    // Update grid segment
    if (batteryGridSegment) {
      const gridColorToUse = gridIsImport ? this.gridColor : this.returnColor;
      (batteryGridSegment as HTMLElement).style.width = `${visualBatteryGridPercent}%`;
      (batteryGridSegment as HTMLElement).style.background = gridColorToUse;
      const label = batteryGridSegment.querySelector('.bar-segment-label');
      if (label && batteryGridWatts > 0) {
        label.textContent = `${Math.round(batteryGridWatts)}W`;
      }
      const pixelWidth = (visualBatteryGridPercent / 100) * (batteryBarContainer?.offsetWidth || 0);
      updateSegmentVisibility(batteryGridSegment, pixelWidth, batteryGridWatts > 0);
    }
    
    // Update load segment
    if (batteryLoadSegment) {
      (batteryLoadSegment as HTMLElement).style.width = `${visualBatteryLoadPercent}%`;
      const label = batteryLoadSegment.querySelector('.bar-segment-label');
      if (label && batteryLoadWatts > 0) {
        label.textContent = `${Math.round(batteryLoadWatts)}W`;
      }
      const pixelWidth = (visualBatteryLoadPercent / 100) * (batteryBarContainer?.offsetWidth || 0);
      updateSegmentVisibility(batteryLoadSegment, pixelWidth, batteryLoadWatts > 0);
    }
    
    // Update production segment
    if (batteryProdSegment) {
      (batteryProdSegment as HTMLElement).style.width = `${visualBatteryProdPercent}%`;
      const label = batteryProdSegment.querySelector('.bar-segment-label');
      if (label && batteryProdWatts > 0) {
        label.textContent = `${Math.round(batteryProdWatts)}W`;
      }
      const pixelWidth = (visualBatteryProdPercent / 100) * (batteryBarContainer?.offsetWidth || 0);
      updateSegmentVisibility(batteryProdSegment, pixelWidth, batteryProdWatts > 0);
    }
  }
}
