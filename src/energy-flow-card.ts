import { Meter } from './Meter.js';
import { calculateEnergyFlows } from './flow-calculator.js';
import type { EnergyFlowCardConfig, HomeAssistant, DotState, Position } from './types.js';

// Main card class
class EnergyFlowCard extends HTMLElement {
  private _resizeObserver: ResizeObserver | null;
  private _animationFrameId: number | null;
  private _flowDots: Map<string, DotState[]>;
  private _lastAnimationTime: number | null;
  private _iconCache: Map<string, string>;
  private _iconsExtracted: boolean;
  private _meters: Map<string, Meter>;
  private _liveChartValues?: { grid: number; load: number; production: number; battery: number };
  private _speedMultiplier: number;
  private _dotsPerFlow: number;
  private _meterPositions: {
    production: Position;
    battery: Position;
    grid: Position;
    load: Position;
  };
  private _canvasWidth: number;
  private _canvasHeight: number;
  private _config?: EnergyFlowCardConfig;
  private _hass?: HomeAssistant;
  private _lastValues?: { grid: number; production: number; load: number; battery: number };
  private _lastViewMode?: string;
  private _iconExtractionTimeouts: Set<number>;
  private _chartDataCache?: {
    timestamp: number;
    dataPoints: Array<{
      time: Date;
      solar: number;
      batteryDischarge: number;
      batteryCharge: number;
      gridImport: number;
      gridExport: number;
      load: number;
    }>;
  };
  private _chartRenderPending: boolean;

  constructor() {
    super();
    this._resizeObserver = null;
    this._animationFrameId = null;
    this._flowDots = new Map();
    this._lastAnimationTime = null;
    this._iconCache = new Map();
    this._iconsExtracted = false;
    this._iconExtractionTimeouts = new Set();
    this._chartDataCache = undefined;
    this._chartRenderPending = false;
    
    // Meter instances
    this._meters = new Map();
    
    // Animation speed multiplier (higher = faster dots)
    this._speedMultiplier = 0.8;
    
    // Number of dots per flow
    this._dotsPerFlow = 3;
    
    // Canvas dimensions
    const canvasWidth = 500;
    const canvasHeight = 470;
    
    // Global offset for all meters
    const offsetX = 5;
    const offsetY = 3;
    
    // Meter positions (circle centers) in SVG coordinates
    // These are relative positions that get offset by the global offset
    this._meterPositions = {
      production: { x: 60 + offsetX, y: 80 + offsetY },
      battery: { x: 130 + offsetX, y: 240 + offsetY },
      grid: { x: 60 + offsetX, y: 400 + offsetY },
      load: { x: 360 + offsetX, y: 240 + offsetY }
    };
    
    // Store canvas dimensions for use in template
    this._canvasWidth = canvasWidth;
    this._canvasHeight = canvasHeight;
  }

  static getStubConfig() {
    return {};
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "view_mode", label: "View Mode", selector: { select: { options: [{value: "default", label: "Default"}, {value: "compact", label: "Compact Bar"}, {value: "compact-battery", label: "Compact with Battery"}, {value: "chart", label: "Chart"}] } } },
        { name: "grid_entity", label: "Grid", required: true, selector: { entity: { domain: "sensor", device_class: "power" } } },
        { name: "grid_name", selector: { entity_name: {} }, context: { entity: "grid_entity" } },
        { name: "grid_icon", selector: { icon: {} }, context: { icon_entity: "grid_entity" } },
        { name: "grid_min", label: "Grid Min (W)", selector: { number: { mode: "box" } } },
        { name: "grid_max", label: "Grid Max (W)", selector: { number: { mode: "box" } } },
        { name: "grid_tap_action", label: "Grid Tap Action", selector: { "ui-action": {} } },
        { name: "load_entity", label: "Load", required: true, selector: { entity: { domain: "sensor", device_class: "power" } } },
        { name: "load_name", selector: { entity_name: {} }, context: { entity: "load_entity" } },
        { name: "load_icon", selector: { icon: {} }, context: { icon_entity: "load_entity" } },
        { name: "load_max", label: "Load Max (W)", selector: { number: { mode: "box" } } },
        { name: "load_tap_action", label: "Load Tap Action", selector: { "ui-action": {} } },
        { name: "production_entity", label: "Production", required: true, selector: { entity: { domain: "sensor", device_class: "power" } } },
        { name: "production_name", selector: { entity_name: {} }, context: { entity: "production_entity" } },
        { name: "production_icon", selector: { icon: {} }, context: { icon_entity: "production_entity" } },
        { name: "production_max", label: "Production Max (W)", selector: { number: { mode: "box" } } },
        { name: "production_tap_action", label: "Production Tap Action", selector: { "ui-action": {} } },
        { name: "battery_entity", label: "Battery", required: true, selector: { entity: { domain: "sensor", device_class: "power" } } },
        { name: "battery_name", selector: { entity_name: {} }, context: { entity: "battery_entity" } },
        { name: "battery_icon", selector: { icon: {} }, context: { icon_entity: "battery_entity" } },
        { name: "battery_min", label: "Battery Min (W)", selector: { number: { mode: "box" } } },
        { name: "battery_max", label: "Battery Max (W)", selector: { number: { mode: "box" } } },
        { name: "battery_tap_action", label: "Battery Tap Action", selector: { "ui-action": {} } },
        { name: "battery_soc_entity", label: "Battery SOC (%) Entity", selector: { entity: { domain: "sensor" } } },
        { name: "invert_battery_data", label: "Invert Battery Data", selector: { boolean: {} } },
        { name: "invert_battery_view", label: "Invert Battery View", selector: { boolean: {} } },
        { name: "show_plus", label: "Show + Sign", selector: { boolean: {} } }
      ]
    };
  }

  connectedCallback() {
    // Set up resize observer to redraw flows when card is resized
    this._resizeObserver = new ResizeObserver(() => {
      if (this._lastValues) {
        // Use requestAnimationFrame to ensure DOM has settled
        const values = this._lastValues; // Capture to avoid undefined in closure
        requestAnimationFrame(() => {
          this._drawFlows(
            values.grid,
            values.production,
            values.load,
            values.battery
          );
        });
      }
    });
    
    // Observe the container, not the card itself
    if (this.parentElement) {
      this._resizeObserver.observe(this.parentElement);
    }
    this._resizeObserver.observe(this);
    
    // Animation loop will be started on first render to avoid race conditions
  }

  disconnectedCallback() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    
    // Stop all meter animations
    this._meters.forEach(meter => meter.stopAnimation());
    
    // Stop flow animation loop
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
    
    // Clear icon extraction timeouts
    this._iconExtractionTimeouts.forEach(timeout => clearTimeout(timeout));
    this._iconExtractionTimeouts.clear();
    
    // Clear chart data cache to prevent memory leaks
    this._chartDataCache = undefined;
    
    // Clear icon cache
    this._iconCache.clear();
  }

  setConfig(config: EnergyFlowCardConfig): void {
    this._config = config;
    this._render();
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._config || !this._hass) return;

    const gridState = this._getEntityState(this._config.grid_entity);
    const loadState = this._getEntityState(this._config.load_entity);
    const productionState = this._getEntityState(this._config.production_entity);
    const batteryState = this._getEntityState(this._config.battery_entity);

    // Calculate flow directions and magnitudes
    const grid = parseFloat(gridState?.state ?? '0') || 0;
    const load = parseFloat(loadState?.state ?? '0') || 0;
    const production = parseFloat(productionState?.state ?? '0') || 0;
    let battery = parseFloat(batteryState?.state ?? '0') || 0;
    
    // Invert battery data if configured (affects interpretation)
    if (this._config.invert_battery_data) {
      battery = -battery;
    }

    // Check view mode
    const viewMode = this._config.view_mode || 'default';
    
    // Clean up chart cache if switching away from chart view
    if (this._lastViewMode === 'chart' && viewMode !== 'chart') {
      this._chartDataCache = undefined;
    }
    
    if (viewMode === 'compact' || viewMode === 'compact-battery') {
      this._renderCompactView(grid, load, production, battery, viewMode);
      return;
    }
    if (viewMode === 'chart') {
      // Only update live values, don't re-render entire chart on every state change
      this._liveChartValues = { grid, load, production, battery };
      
      // Only render chart if view mode changed or chart doesn't exist
      if (this._lastViewMode !== 'chart' || !this.querySelector('.chart-view')) {
        this._renderChartView(grid, load, production, battery);
      } else {
        // Just update the live indicators without re-fetching/re-rendering
        this._updateChartIndicators();
      }
      return;
    }

    // Get min/max values with defaults
    const gridMin = this._config.grid_min != null ? this._config.grid_min : -5000;
    const gridMax = this._config.grid_max != null ? this._config.grid_max : 5000;
    const loadMax = this._config.load_max != null ? this._config.load_max : 5000;
    const productionMax = this._config.production_max != null ? this._config.production_max : 5000;
    const batteryMin = this._config.battery_min != null ? this._config.battery_min : -5000;
    const batteryMax = this._config.battery_max != null ? this._config.battery_max : 5000;

    // Only do full render if structure doesn't exist
    if (!this.querySelector('.energy-flow-svg')) {
      this._iconsExtracted = false; // Reset flag on full render
      
      // Create fireEvent callback for meters (bound to this context)
      const fireEvent = (event: string, detail?: any) => {
        this._fireEvent.call(this, event, detail);
      };
      
      // Create meter instances with tap actions
      const productionMeter = new Meter('production', production, 0, productionMax, false, 
        this._getDisplayName('production_name', 'production_entity', 'Production'),
        this._getIcon('production_icon', 'production_entity', 'mdi:solar-power'),
        'WATTS',
        false,
        false,
        this._config.production_tap_action,
        this._config.production_entity,
        fireEvent);
      const batteryMeter = new Meter('battery', battery, batteryMin, batteryMax, true,
        this._getDisplayName('battery_name', 'battery_entity', 'Battery'),
        this._getIcon('battery_icon', 'battery_entity', 'mdi:battery'),
        'WATTS',
        this._config.invert_battery_view,
        this._config.show_plus,
        this._config.battery_tap_action,
        this._config.battery_entity,
        fireEvent);
      const gridMeter = new Meter('grid', grid, gridMin, gridMax, true,
        this._getDisplayName('grid_name', 'grid_entity', 'Grid'),
        this._getIcon('grid_icon', 'grid_entity', 'mdi:transmission-tower'),
        'WATTS',
        false,
        false,
        this._config.grid_tap_action,
        this._config.grid_entity,
        fireEvent);
      const loadMeter = new Meter('load', load, 0, loadMax, false,
        this._getDisplayName('load_name', 'load_entity', 'Load'),
        this._getIcon('load_icon', 'load_entity', 'mdi:home-lightning-bolt'),
        'WATTS',
        false,
        false,
        this._config.load_tap_action,
        this._config.load_entity,
        fireEvent);
      
      this.innerHTML = `
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
            <svg class="energy-flow-svg" viewBox="0 0 ${this._canvasWidth} ${this._canvasHeight}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              ${this._createMeterDefs()}
            </defs>
            
            <!-- Flow lines layer (behind meters) -->
            <g id="flow-layer"></g>
            
            <!-- Production Meter (top left) -->
            <g id="production-meter" class="meter-group" transform="translate(${this._meterPositions.production.x}, ${this._meterPositions.production.y})"></g>
            
            <!-- Battery Meter (middle left, offset right) -->
            <g id="battery-meter" class="meter-group" transform="translate(${this._meterPositions.battery.x}, ${this._meterPositions.battery.y})"></g>
            
            <!-- Grid Meter (bottom left) -->
            <g id="grid-meter" class="meter-group" transform="translate(${this._meterPositions.grid.x}, ${this._meterPositions.grid.y})"></g>
            
            <!-- Load Meter (right, 2x size) -->
            <g id="load-meter" class="meter-group" transform="translate(${this._meterPositions.load.x}, ${this._meterPositions.load.y}) scale(2)"></g>
          </svg>
          </div>
        </ha-card>
      `;
      
      // Append meter elements and start animations
      requestAnimationFrame(() => {
        const productionContainer = this.querySelector('#production-meter');
        const batteryContainer = this.querySelector('#battery-meter');
        const gridContainer = this.querySelector('#grid-meter');
        const loadContainer = this.querySelector('#load-meter');
        
        if (productionContainer) productionContainer.appendChild(productionMeter.createElement());
        if (batteryContainer) batteryContainer.appendChild(batteryMeter.createElement());
        if (gridContainer) gridContainer.appendChild(gridMeter.createElement());
        if (loadContainer) loadContainer.appendChild(loadMeter.createElement());
        
        this._meters.set('production', productionMeter);
        this._meters.set('battery', batteryMeter);
        this._meters.set('grid', gridMeter);
        this._meters.set('load', loadMeter);
        
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
      });
    } else {
      // Update existing meters
      const productionMeter = this._meters.get('production');
      const batteryMeter = this._meters.get('battery');
      const gridMeter = this._meters.get('grid');
      const loadMeter = this._meters.get('load');
      
      if (productionMeter) productionMeter.value = production;
      if (batteryMeter) {
        batteryMeter.invertView = this._config.invert_battery_view ?? false;
        batteryMeter.value = battery;
      }
      if (gridMeter) gridMeter.value = grid;
      if (loadMeter) loadMeter.value = load;
    }

    // Store values for resize handler and draw flows
    this._lastValues = { grid, production, load, battery };
    
    // Start animation loop on first render (not in connectedCallback to avoid race conditions)
    if (!this._animationFrameId) {
      this._startFlowAnimationLoop();
    }
    
    // Extract icon paths if not already done
    if (!this._iconsExtracted) {
      requestAnimationFrame(() => {
        this._extractIconPaths();
      });
    }
    
    // Wait for DOM to be ready before drawing flows
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._drawFlows(grid, production, load, battery);
      });
    });
  }

  private _getEntityState(entityId: string) {
    return this._hass?.states?.[entityId];
  }

  private _getDisplayName(configKey: keyof EnergyFlowCardConfig, entityKey: keyof EnergyFlowCardConfig, fallback: string): string {
    // Check if custom name is set in config
    if (this._config?.[configKey]) {
      return String(this._config[configKey]);
    }
    // Fall back to entity friendly name
    const entityId = this._config?.[entityKey] as string | undefined;
    if (entityId) {
      const entityState = this._getEntityState(entityId);
      if (entityState?.attributes?.friendly_name) {
        return entityState.attributes.friendly_name;
      }
    }
    // Fall back to default label
    return fallback;
  }

  private _getIcon(configKey: keyof EnergyFlowCardConfig, entityKey: keyof EnergyFlowCardConfig, fallback: string): string {
    // Check if custom icon is set in config
    if (this._config?.[configKey]) {
      return String(this._config[configKey]);
    }
    // Fall back to entity icon
    const entityId = this._config?.[entityKey] as string | undefined;
    if (entityId) {
      const entityState = this._getEntityState(entityId);
      if (entityState?.attributes?.icon) {
        return entityState.attributes.icon;
      }
    }
    // Fall back to default icon
    return fallback;
  }

  private _handleAction(actionConfig: any | undefined, entityId: string): void {
    if (!this._hass) return;
    
    // Default to more-info if no action configured
    const config = actionConfig || { action: 'more-info' };
    const action = config.action || 'more-info';
    
    switch (action) {
      case 'more-info':
        const entityToShow = config.entity || entityId;
        this._fireEvent('hass-more-info', { entityId: entityToShow });
        break;
        
      case 'navigate':
        if (config.navigation_path) {
          history.pushState(null, '', config.navigation_path);
          this._fireEvent('location-changed', { replace: config.navigation_replace || false });
        }
        break;
        
      case 'url':
        if (config.url_path) {
          window.open(config.url_path);
        }
        break;
        
      case 'toggle':
        this._hass.callService('homeassistant', 'toggle', { entity_id: entityId });
        break;
        
      case 'perform-action':
        if (config.perform_action) {
          const [domain, service] = config.perform_action.split('.');
          this._hass.callService(domain, service, config.data || {}, config.target);
        }
        break;
        
      case 'assist':
        this._fireEvent('show-dialog', {
          dialogTag: 'ha-voice-command-dialog',
          dialogParams: {
            pipeline_id: config.pipeline_id || 'last_used',
            start_listening: config.start_listening
          }
        });
        break;
        
      case 'none':
        // Do nothing
        break;
    }
  }

  private _fireEvent(type: string, detail: any = {}): void {
    // Handle call-service events specially
    if (type === 'call-service' && this._hass) {
      this._hass.callService(detail.domain, detail.service, detail.service_data || {}, detail.target);
      return;
    }
    
    const event = new CustomEvent(type, {
      detail,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  _createMeterDefs() {
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
   * Calculate energy flows between meters based on sensor readings.
   * Uses the tested calculateEnergyFlows function.
   */
  private _calculateFlows(grid: number, production: number, load: number, battery: number) {
    return calculateEnergyFlows({ grid, production, load, battery });
  }

  private _drawFlows(grid: number, production: number, load: number, battery: number): void {
    const flowLayer = this.querySelector('#flow-layer') as SVGGElement | null;
    if (!flowLayer) return;

    // Use stored meter positions
    const productionPos = this._meterPositions.production;
    const batteryPos = this._meterPositions.battery;
    const gridPos = this._meterPositions.grid;
    const loadPos = this._meterPositions.load;

    // Calculate all energy flows
    const {
      productionToLoad,
      productionToBattery,
      productionToGrid,
      gridToLoad,
      gridToBattery,
      batteryToLoad
    } = this._calculateFlows(grid, production, load, battery);
    
    // Define flow visualization parameters
    // Green: Production to load/battery (good renewable energy)
    // Blue: Battery to load (stored energy supporting home)
    // Yellow: Export to grid (solar/battery exporting)
    // Red: Import from grid (any grid import is "bad")
    const threshold = 0;
    const batteryToLoadThreshold = 10;
    const flowDefinitions = [
      { id: 'production-to-load', from: productionPos, to: loadPos, power: productionToLoad, color: '#4caf50', threshold },
      { id: 'production-to-battery', from: productionPos, to: batteryPos, power: productionToBattery, color: '#4caf50', threshold },
      { id: 'battery-to-load', from: batteryPos, to: loadPos, power: batteryToLoad, color: '#2196f3', threshold: batteryToLoadThreshold },
      { id: 'grid-to-load', from: gridPos, to: loadPos, power: gridToLoad, color: '#f44336', threshold },
      { id: 'grid-to-battery', from: gridPos, to: batteryPos, power: gridToBattery, color: '#f44336', threshold },
      { id: 'production-to-grid', from: productionPos, to: gridPos, power: productionToGrid, color: '#ffeb3b', threshold }
    ];
    
    // Update or create flow visualizations
    flowDefinitions.forEach(flow => {
      if (flow.power > flow.threshold) {
        this._updateOrCreateFlow(flowLayer, flow.id, flow.from, flow.to, flow.power, flow.color);
      } else {
        this._fadeOutFlow(flowLayer, flow.id);
      }
    });
  }

  private _startFlowAnimationLoop(): void {
    const animate = (timestamp: number) => {
      if (!this._lastAnimationTime) {
        this._lastAnimationTime = timestamp;
      }
      
      const deltaTime = timestamp - (this._lastAnimationTime ?? timestamp);
      this._lastAnimationTime = timestamp;
      
      // Update all flow dots
      this._flowDots.forEach((dotStates, flowId) => {
        const path = this.querySelector(`#path-${flowId}`) as SVGPathElement | null;
        
        if (path && dotStates && dotStates.length > 0) {
          dotStates.forEach((dotState, dotIndex) => {
            const dot = this.querySelector(`#dot-${flowId}-${dotIndex}`);
            
            if (dot && dotState.velocity > 0) {
              // Update progress based on velocity and time
              dotState.progress += (dotState.velocity * deltaTime) / 1000; // velocity is in units per second
              
              // Loop back to start when reaching end
              if (dotState.progress >= 1) {
                dotState.progress = dotState.progress % 1;
              }
              
              // Get point along path (with safety check)
              try {
                const pathLength = path.getTotalLength();
                if (pathLength > 0) {
                  const point = path.getPointAtLength(dotState.progress * pathLength);
                  
                  // Update dot position
                  dot.setAttribute('cx', String(point.x));
                  dot.setAttribute('cy', String(point.y));
                }
              } catch (e) {
                // Path not ready yet, skip this frame
              }
            }
          });
        }
      });
      
      this._animationFrameId = requestAnimationFrame(animate);
    };
    
    this._animationFrameId = requestAnimationFrame(animate);
  }

  private _updateOrCreateFlow(
    flowLayer: SVGGElement,
    flowId: string,
    from: Position,
    to: Position,
    power: number,
    color: string
  ): void {
    let flowGroup = flowLayer.querySelector(`#${flowId}`);
    
    // Calculate visual properties based on power
    // Opacity: 0-100W = 25%, 100-200W = 25% to 100%
    let opacity;
    if (power <= 100) {
      opacity = 0.25;
    } else if (power <= 200) {
      opacity = 0.25 + ((power - 100) / 100) * 0.75; // 0.25 to 1.0
    } else {
      opacity = 1.0;
    }
    
    // Width: Base 2px, grows above 100W up to 10,000W (max 23.76px)
    const baseWidth = 2;
    const maxWidth = 23.76;
    const maxPowerForWidth = 10000;
    let strokeWidth;
    if (power <= 100) {
      strokeWidth = baseWidth;
    } else {
      const widthGrowth = Math.min((power - 100) / (maxPowerForWidth - 100), 1) * (maxWidth - baseWidth);
      strokeWidth = baseWidth + widthGrowth;
    }
    
    // Dot radius: Grows proportionally with line width
    const baseDotRadius = 2.5;
    const minDotRadius = 3;
    const calculatedDotRadius = baseDotRadius * (strokeWidth / baseWidth);
    const dotRadius = Math.max(calculatedDotRadius, minDotRadius);
    
    // Speed: Calculate path length to determine velocity in pixels per second
    // This ensures all dots travel the same pixel distance regardless of path length
    const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const controlX = (from.x + to.x) / 2;
    const controlY = (from.y + to.y) / 2;
    const d = `M ${from.x},${from.y} Q ${controlX},${controlY} ${to.x},${to.y}`;
    tempPath.setAttribute('d', d);
    const pathLength = tempPath.getTotalLength();
    
    // Base: 40 pixels/sec at 1000W, scales linearly with power (no max)
    const basePixelsPerSecond = 40;
    const referencePower = 1000;
    const pixelsPerSecond = (basePixelsPerSecond * (power / referencePower)) * this._speedMultiplier;
    
    // Convert pixels/sec to units/sec (where 1 unit = complete path)
    const velocity = pathLength > 0 ? pixelsPerSecond / pathLength : 0;
    
    if (!flowGroup) {
      // Create new flow
      flowGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      flowGroup.id = flowId;
      flowLayer.appendChild(flowGroup);
      
      // Create glow path (wider, behind, half opacity)
      const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      glowPath.setAttribute('d', d);
      glowPath.setAttribute('class', 'flow-line');
      glowPath.setAttribute('stroke', color);
      glowPath.setAttribute('stroke-opacity', String(opacity * 0.5));
      glowPath.setAttribute('stroke-width', String(strokeWidth * 2));
      glowPath.setAttribute('style', 'transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;');
      glowPath.id = `glow-${flowId}`;
      flowGroup.appendChild(glowPath);
      
      // Create main path on top
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'flow-line');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-opacity', String(opacity));
      path.setAttribute('stroke-width', String(strokeWidth));
      path.setAttribute('style', 'transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;');
      path.id = `path-${flowId}`;
      flowGroup.appendChild(path);
      
      // Create multiple dots with staggered starting positions
      const dotStates = [];
      for (let i = 0; i < this._dotsPerFlow; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'flow-dot');
        circle.setAttribute('id', `dot-${flowId}-${i}`);
        circle.setAttribute('r', String(dotRadius));
        circle.setAttribute('fill', color);
        circle.setAttribute('opacity', String(opacity));
        circle.setAttribute('style', 'transition: opacity 0.5s ease-out, r 0.5s ease-out;');
        flowGroup.appendChild(circle);
        
        // Stagger dots evenly along the path
        const startProgress = i / this._dotsPerFlow;
        dotStates.push({ progress: startProgress, velocity });
      }
      
      // Initialize dot states array
      this._flowDots.set(flowId, dotStates);
    } else {
      // Update existing flow
      const glowPath = flowGroup.querySelector(`#glow-${flowId}`);
      const path = flowGroup.querySelector(`#path-${flowId}`);
      
      if (glowPath && path) {
        const controlX = (from.x + to.x) / 2;
        const controlY = (from.y + to.y) / 2;
        const d = `M ${from.x},${from.y} Q ${controlX},${controlY} ${to.x},${to.y}`;
        
        // Update glow path
        glowPath.setAttribute('d', d);
        glowPath.setAttribute('stroke-opacity', String(opacity * 0.5));
        glowPath.setAttribute('stroke-width', String(strokeWidth * 2));
        
        // Update main path
        path.setAttribute('d', d);
        path.setAttribute('stroke-opacity', String(opacity));
        path.setAttribute('stroke-width', String(strokeWidth));
      }
      
      // Update all dots' appearance and velocity
      const dotStates = this._flowDots.get(flowId);
      if (dotStates) {
        dotStates.forEach((dotState, dotIndex) => {
          const dot = flowGroup!.querySelector(`#dot-${flowId}-${dotIndex}`);
          if (dot) {
            dot.setAttribute('r', String(dotRadius));
            dot.setAttribute('opacity', String(opacity));
            dot.setAttribute('fill', color);
          }
          
          // Update velocity (preserves progress)
          dotState.velocity = velocity;
        });
      }
    }
  }

  private _removeFlow(flowLayer: SVGGElement, flowId: string): void {
    const flowGroup = flowLayer.querySelector(`#${flowId}`);
    if (flowGroup) {
      flowGroup.remove();
    }
    
    // Remove dot state
    this._flowDots.delete(flowId);
  }

  private _fadeOutFlow(flowLayer: SVGGElement, flowId: string): void {
    const flowGroup = flowLayer.querySelector(`#${flowId}`);
    if (!flowGroup) return;
    
    // Fade out by setting opacity to 0
    const glowPath = flowGroup.querySelector(`#glow-${flowId}`);
    const path = flowGroup.querySelector(`#path-${flowId}`);
    
    if (glowPath) glowPath.setAttribute('stroke-opacity', '0');
    if (path) path.setAttribute('stroke-opacity', '0');
    
    // Fade out dots
    const dotStates = this._flowDots.get(flowId);
    if (dotStates) {
      dotStates.forEach((dotState, dotIndex) => {
        const dot = flowGroup.querySelector(`#dot-${flowId}-${dotIndex}`);
        if (dot) dot.setAttribute('opacity', '0');
      });
    }
    
    // Remove from DOM after transition completes (500ms)
    setTimeout(() => {
      this._removeFlow(flowLayer, flowId);
    }, 500);
  }

  _extractIconPaths() {
    // Extract SVG paths from ha-icon shadow DOM and render as native SVG
    const meterIds = ['production', 'battery', 'grid', 'load'];
    
    meterIds.forEach(id => {
      const iconSourceFO = this.querySelector(`#icon-source-${id}`);
      const iconDisplay = this.querySelector(`#icon-display-${id}`);
      
      if (!iconSourceFO || !iconDisplay) {
        console.warn(`Icon elements not found for ${id}`);
        return;
      }
      
      // Find the ha-icon inside the foreignObject
      const haIconDiv = iconSourceFO.querySelector('div');
      if (!haIconDiv) {
        console.warn(`No div found in foreignObject for ${id}`);
        return;
      }
      
      const iconSource = haIconDiv.querySelector('ha-icon');
      if (!iconSource) {
        console.warn(`No ha-icon found for ${id}`);
        return;
      }
      
      const iconName = iconSource.getAttribute('icon');
      if (!iconName) {
        console.warn(`No icon attribute for ${id}`);
        return;
      }
      
      // Check cache first
      if (this._iconCache.has(iconName)) {
        const pathData = this._iconCache.get(iconName);
        this._renderIconPath(iconDisplay, pathData);
        // Hide the foreignObject version once we have the native SVG
        (iconSourceFO as HTMLElement).style.display = 'none';
        return;
      }
      
      // Try multiple times with increasing delays
      const attemptExtraction = (attempt = 0, maxAttempts = 10) => {
        const delay = attempt * 100; // 0ms, 100ms, 200ms, 300ms, etc.
        
        const timeoutId = window.setTimeout(() => {
          this._iconExtractionTimeouts.delete(timeoutId);
          try {
            const shadowRoot = iconSource.shadowRoot;
            if (!shadowRoot) {
              if (attempt < maxAttempts) {
                attemptExtraction(attempt + 1, maxAttempts);
              }
              return;
            }
            
            // In Home Assistant, ha-icon contains ha-svg-icon which has its own shadow DOM
            // Try direct SVG first (for simple cases like simulate.html)
            let svgElement = shadowRoot.querySelector('svg');
            
            // If no direct SVG, check if there's a ha-svg-icon element
            if (!svgElement) {
              const haSvgIcon = shadowRoot.querySelector('ha-svg-icon');
              if (haSvgIcon && haSvgIcon.shadowRoot) {
                svgElement = haSvgIcon.shadowRoot.querySelector('svg');
              }
            }
            
            if (!svgElement) {
              if (attempt < maxAttempts) {
                attemptExtraction(attempt + 1, maxAttempts);
              }
              return;
            }
            
            const pathElement = svgElement.querySelector('path');
            if (!pathElement) {
              if (attempt < maxAttempts) {
                attemptExtraction(attempt + 1, maxAttempts);
              }
              return;
            }
            
            const pathData = pathElement.getAttribute('d');
            if (pathData) {
              // Cache the path data
              this._iconCache.set(iconName, pathData);
              
              // Render as native SVG
              this._renderIconPath(iconDisplay, pathData);
              
              // Hide the foreignObject version once we have the native SVG
              (iconSourceFO as HTMLElement).style.display = 'none';
            } else {
              if (attempt < maxAttempts) {
                attemptExtraction(attempt + 1, maxAttempts);
              }
            }
          } catch (e) {
            console.error(`Failed to extract icon path for ${iconName} (attempt ${attempt + 1}):`, e);
            if (attempt < maxAttempts) {
              attemptExtraction(attempt + 1, maxAttempts);
            }
          }
        }, delay);
        this._iconExtractionTimeouts.add(timeoutId);
      };
      
      // Start extraction attempts
      attemptExtraction();
    });
    
    this._iconsExtracted = true;
  }

  private _renderIconPath(container: Element, pathData: string | undefined): void {
    // Clear any existing content
    container.innerHTML = '';
    
    if (pathData) {
      // Create native SVG path element directly (no foreignObject!)
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', 'rgb(160, 160, 160)');
      path.setAttribute('transform', 'scale(1)'); // 24x24 icon in 24x24 space
      
      container.appendChild(path);
    } else {
      // Fallback: render a simple circle as placeholder
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '12');
      circle.setAttribute('cy', '12');
      circle.setAttribute('r', '8');
      circle.setAttribute('fill', 'rgb(160, 160, 160)');
      
      container.appendChild(circle);
    }
  }

  private _drawFlow(flowLayer: SVGGElement, from: Position, to: Position, power: number, isPositive: boolean): void {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const controlX = (from.x + to.x) / 2;
    const controlY = (from.y + to.y) / 2;
    
    const d = `M ${from.x},${from.y} Q ${controlX},${controlY} ${to.x},${to.y}`;
    path.setAttribute('d', d);
    path.setAttribute('class', `flow-line ${isPositive ? 'flow-positive' : 'flow-negative'}`);
    path.setAttribute('id', `path-${Math.random()}`);
    
    flowLayer.appendChild(path);

    // Animate dots
    const numDots = Math.min(Math.max(Math.floor(power / 1000), 1), 3);
    for (let i = 0; i < numDots; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', `flow-dot ${isPositive ? 'flow-positive' : 'flow-negative'}`);
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', isPositive ? 'var(--success-color, #4caf50)' : 'var(--error-color, #f44336)');
      
      const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
      animateMotion.setAttribute('dur', '2s');
      animateMotion.setAttribute('repeatCount', 'indefinite');
      animateMotion.setAttribute('begin', `${i * 0.6}s`);
      
      const mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
      mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${path.id}`);
      
      animateMotion.appendChild(mpath);
      circle.appendChild(animateMotion);
      flowLayer.appendChild(circle);
    }
  }

  private _renderCompactView(grid: number, load: number, production: number, battery: number, viewMode: 'compact' | 'compact-battery'): void {
    // Use the same flow calculator to get accurate contributions to load
    const flows = this._calculateFlows(grid, production, load, battery);
    
    const productionValue = flows.productionToLoad;
    const batteryToLoad = flows.batteryToLoad;
    const gridToLoad = flows.gridToLoad;

    // Calculate TRUE percentages for labels (these show accurate data)
    const total = load || 1;
    const productionPercent = (productionValue / total) * 100;
    const batteryPercent = (batteryToLoad / total) * 100;
    const gridPercent = (gridToLoad / total) * 100;
    
    // Calculate VISUAL percentages for bar widths (scaled to fill 100%)
    // This ensures the bar always fills completely when there's any activity
    const sumPercent = productionPercent + batteryPercent + gridPercent;
    let visualProductionPercent = productionPercent;
    let visualBatteryPercent = batteryPercent;
    let visualGridPercent = gridPercent;
    
    if (sumPercent > 0) {
      // Scale to fill the bar completely (visual only)
      const scale = 100 / sumPercent;
      visualProductionPercent = productionPercent * scale;
      visualBatteryPercent = batteryPercent * scale;
      visualGridPercent = gridPercent * scale;
    }

    // Colors (darker hues - 50% brightness)
    const productionColor = '#256028'; // Dark green
    const batteryColor = '#104b79'; // Dark blue (load)
    const gridColor = '#7a211b'; // Dark red (import)
    const returnColor = '#7a6b1b'; // Dark yellow (export)

    // Get battery SOC if available
    let batterySoc: number | null = null;
    if (viewMode === 'compact-battery' && this._config?.battery_soc_entity) {
      const socState = this._getEntityState(this._config.battery_soc_entity);
      batterySoc = parseFloat(socState?.state ?? '0') || 0;
    }

    // Calculate battery bar percentages
    let batteryGridPercent = 0;  // Red when charging from grid, Yellow when discharging to grid
    let batteryLoadPercent = 0;  // Blue when discharging to load
    let batteryProdPercent = 0;  // Green when charging from production
    
    // Battery watt values (for labels - battery bar shows watts, not percentages)
    let batteryGridWatts = 0;
    let batteryLoadWatts = 0;
    let batteryProdWatts = 0;
    
    // Visual percentages (scaled to fill bar)
    let visualBatteryGridPercent = 0;
    let visualBatteryLoadPercent = 0;
    let visualBatteryProdPercent = 0;
    
    if (viewMode === 'compact-battery') {
      if (battery < 0) {
        // Battery is CHARGING (negative value) - show sources
        const batteryCharging = Math.abs(battery);
        const batteryTotal = batteryCharging || 1;
        
        // Watt values for labels
        batteryGridWatts = flows.gridToBattery;
        batteryProdWatts = flows.productionToBattery;
        
        // True percentages (for scaling)
        batteryGridPercent = (flows.gridToBattery / batteryTotal) * 100;
        batteryProdPercent = (flows.productionToBattery / batteryTotal) * 100;
        
        // Visual percentages - scale to fill bar completely
        const chargeSum = batteryGridPercent + batteryProdPercent;
        if (chargeSum > 0) {
          const scale = 100 / chargeSum;
          visualBatteryGridPercent = batteryGridPercent * scale;
          visualBatteryProdPercent = batteryProdPercent * scale;
        }
        
      } else if (battery > 0) {
        // Battery is DISCHARGING (positive value) - show destinations
        const batteryTotal = battery || 1;
        const batteryToGrid = battery - flows.batteryToLoad;
        
        // Watt values for labels
        batteryLoadWatts = flows.batteryToLoad;
        batteryGridWatts = batteryToGrid;
        
        // True percentages (for scaling)
        batteryLoadPercent = (flows.batteryToLoad / batteryTotal) * 100;
        batteryGridPercent = (batteryToGrid / batteryTotal) * 100;
        
        // Visual percentages - scale to fill bar completely
        const dischargeSum = batteryLoadPercent + batteryGridPercent;
        if (dischargeSum > 0) {
          const scale = 100 / dischargeSum;
          visualBatteryLoadPercent = batteryLoadPercent * scale;
          visualBatteryGridPercent = batteryGridPercent * scale;
        }
      }
    }

    // Only render if structure doesn't exist or needs update
    if (!this.querySelector('.compact-view') || this._lastViewMode !== viewMode) {
      this.innerHTML = `
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
              gap: ${viewMode === 'compact-battery' ? '12px' : '0'};
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
              overflow: hidden;
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
            <!-- Load Row -->
            <div class="compact-row">
              <div class="bar-container">
                <div id="grid-segment" class="bar-segment" style="background: ${gridColor}; width: ${gridPercent}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon('grid_icon', 'grid_entity', 'mdi:transmission-tower')}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-segment" class="bar-segment" style="background: ${batteryColor}; width: ${batteryPercent}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon('battery_icon', 'battery_entity', 'mdi:battery')}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="production-segment" class="bar-segment" style="background: ${productionColor}; width: ${productionPercent}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon('production_icon', 'production_entity', 'mdi:solar-power')}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
              </div>
              <div class="row-value">
                <ha-icon class="row-icon" icon="${this._getIcon('load_icon', 'load_entity', 'mdi:home-lightning-bolt')}"></ha-icon>
                <div class="row-text">
                  <span id="load-value-text">${Math.round(load)}</span><span class="row-unit">W</span>
                </div>
              </div>
            </div>
            ${viewMode === 'compact-battery' ? `
            <!-- Battery Row -->
            <div class="compact-row" id="battery-row">
              <div class="row-value" id="battery-soc-left" style="display: none;">
                <ha-icon class="row-icon" icon="${this._getIcon('battery_icon', 'battery_entity', 'mdi:battery')}"></ha-icon>
                <div class="row-text">
                  <span id="battery-soc-text-left">${batterySoc !== null ? batterySoc.toFixed(1) : '--'}</span><span class="row-unit">%</span>
                </div>
              </div>
              <div class="bar-container">
                <!-- Color order: red, yellow, blue, green (left to right) -->
                <div id="battery-grid-segment" class="bar-segment" style="background: ${battery < 0 ? gridColor : returnColor}; width: ${batteryGridPercent}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon('grid_icon', 'grid_entity', 'mdi:transmission-tower')}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-load-segment" class="bar-segment" style="background: ${batteryColor}; width: ${batteryLoadPercent}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon('load_icon', 'load_entity', 'mdi:home')}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-production-segment" class="bar-segment" style="background: ${productionColor}; width: ${batteryProdPercent}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon('production_icon', 'production_entity', 'mdi:solar-power')}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
              </div>
              <div class="row-value" id="battery-soc-right">
                <ha-icon class="row-icon" icon="${this._getIcon('battery_icon', 'battery_entity', 'mdi:battery')}"></ha-icon>
                <div class="row-text">
                  <span id="battery-soc-text-right">${batterySoc !== null ? batterySoc.toFixed(1) : '--'}</span><span class="row-unit">%</span>
                </div>
              </div>
            </div>
            ` : ''}
          </div>
        </ha-card>
      `;
      this._lastViewMode = viewMode;
      
      // Attach click handlers to compact view elements
      requestAnimationFrame(() => {
        if (this._config) {
          // Attach handlers to load row segments
          const productionSeg = this.querySelector('#production-segment');
          const batterySeg = this.querySelector('#battery-segment');
          const gridSeg = this.querySelector('#grid-segment');
          const loadValues = this.querySelectorAll('.row-value');
          const loadValue = loadValues[0]; // First row-value is the load
          
          if (productionSeg) {
            productionSeg.addEventListener('click', () => {
              this._handleAction(this._config!.production_tap_action, this._config!.production_entity);
            });
          }
          if (batterySeg) {
            batterySeg.addEventListener('click', () => {
              this._handleAction(this._config!.battery_tap_action, this._config!.battery_entity);
            });
          }
          if (gridSeg) {
            gridSeg.addEventListener('click', () => {
              this._handleAction(this._config!.grid_tap_action, this._config!.grid_entity);
            });
          }
          if (loadValue) {
            loadValue.addEventListener('click', () => {
              this._handleAction(this._config!.load_tap_action, this._config!.load_entity);
            });
          }
          
          // Attach handlers to battery row if in compact-battery mode
          if (viewMode === 'compact-battery') {
            const batteryProdSeg = this.querySelector('#battery-production-segment');
            const batteryLoadSeg = this.querySelector('#battery-load-segment');
            const batteryGridSeg = this.querySelector('#battery-grid-segment');
            const batterySocLeft = this.querySelector('#battery-soc-left');
            const batterySocRight = this.querySelector('#battery-soc-right');
            
            if (batteryProdSeg) {
              batteryProdSeg.addEventListener('click', () => {
                this._handleAction(this._config!.production_tap_action, this._config!.production_entity);
              });
            }
            if (batteryLoadSeg) {
              batteryLoadSeg.addEventListener('click', () => {
                this._handleAction(this._config!.load_tap_action, this._config!.load_entity);
              });
            }
            if (batteryGridSeg) {
              batteryGridSeg.addEventListener('click', () => {
                this._handleAction(this._config!.grid_tap_action, this._config!.grid_entity);
              });
            }
            if (batterySocLeft) {
              batterySocLeft.addEventListener('click', () => {
                this._handleAction(this._config!.battery_tap_action, this._config!.battery_entity);
              });
            }
            if (batterySocRight) {
              batterySocRight.addEventListener('click', () => {
                this._handleAction(this._config!.battery_tap_action, this._config!.battery_entity);
              });
            }
          }
        }
      });
    }

    // Update segment widths and labels (wrapped in requestAnimationFrame to ensure DOM has settled)
    const updateSegments = () => {
      const productionSegment = this.querySelector('#production-segment');
      const batterySegment = this.querySelector('#battery-segment');
      const gridSegment = this.querySelector('#grid-segment');
      const loadValueText = this.querySelector('#load-value-text');

      if (productionSegment) {
        // Use visual percentage for width (fills bar), true percentage for label (shows accuracy)
        (productionSegment as HTMLElement).style.width = `${visualProductionPercent}%`;
        const label = productionSegment.querySelector('.bar-segment-label');
        if (label && productionValue > 0) {
          label.textContent = `${Math.round(productionPercent)}%`;
        }
        const barContainer = this.querySelector('.bar-container');
        const widthPx = (visualProductionPercent / 100) * (barContainer?.clientWidth || 0);
        this._updateSegmentVisibility(productionSegment as HTMLElement, widthPx, productionValue > 0);
      }

      if (batterySegment) {
        // Use visual percentage for width, true percentage for label
        (batterySegment as HTMLElement).style.width = `${visualBatteryPercent}%`;
        const label = batterySegment.querySelector('.bar-segment-label');
        if (label && batteryToLoad > 0) {
          label.textContent = `${Math.round(batteryPercent)}%`;
        }
        const barContainer = this.querySelector('.bar-container');
        const widthPx = (visualBatteryPercent / 100) * (barContainer?.clientWidth || 0);
        this._updateSegmentVisibility(batterySegment as HTMLElement, widthPx, batteryToLoad > 0);
      }

      if (gridSegment) {
        // Use visual percentage for width, true percentage for label
        (gridSegment as HTMLElement).style.width = `${visualGridPercent}%`;
        const label = gridSegment.querySelector('.bar-segment-label');
        if (label && gridToLoad > 0) {
          label.textContent = `${Math.round(gridPercent)}%`;
        }
        const barContainer = this.querySelector('.bar-container');
        const widthPx = (visualGridPercent / 100) * (barContainer?.clientWidth || 0);
        this._updateSegmentVisibility(gridSegment as HTMLElement, widthPx, gridToLoad > 0);
      }

      if (loadValueText) {
        loadValueText.textContent = String(Math.round(load));
      }
      
      // Update battery row segments if in compact-battery mode
      if (viewMode === 'compact-battery') {
        const batteryGridSegment = this.querySelector('#battery-grid-segment');
        const batteryLoadSegment = this.querySelector('#battery-load-segment');
        const batteryProdSegment = this.querySelector('#battery-production-segment');
        const batterySocLeft = this.querySelector('#battery-soc-left') as HTMLElement | null;
        const batterySocRight = this.querySelector('#battery-soc-right') as HTMLElement | null;
        const batterySocTextLeft = this.querySelector('#battery-soc-text-left');
        const batterySocTextRight = this.querySelector('#battery-soc-text-right');
        const batteryBarContainers = this.querySelectorAll('.bar-container');
        const batteryBarContainer = batteryBarContainers[1] as HTMLElement | null; // Second bar container is battery
        
        // Determine grid color based on charging/discharging
        let gridIsImport = false; // Red = import, Yellow = export
        
        if (battery < 0) {
          // CHARGING: show sources (production and/or grid charging battery)
          gridIsImport = true; // Red color - importing from grid to charge
          
          if (batterySocLeft) batterySocLeft.style.display = 'none';
          if (batterySocRight) batterySocRight.style.display = 'flex';
          if (batterySocTextRight && batterySoc !== null) {
            batterySocTextRight.textContent = batterySoc.toFixed(1);
          }
        } else if (battery > 0) {
          // DISCHARGING: show destinations (battery going to load and/or grid)
          gridIsImport = false; // Yellow color - exporting to grid
          
          if (batterySocLeft) batterySocLeft.style.display = 'flex';
          if (batterySocRight) batterySocRight.style.display = 'none';
          if (batterySocTextLeft && batterySoc !== null) {
            batterySocTextLeft.textContent = batterySoc.toFixed(1);
          }
        } else {
          // IDLE (battery = 0): show percentage on RIGHT (default), no bar segments
          if (batterySocLeft) batterySocLeft.style.display = 'none';
          if (batterySocRight) batterySocRight.style.display = 'flex';
          if (batterySocTextRight && batterySoc !== null) {
            batterySocTextRight.textContent = batterySoc.toFixed(1);
          }
        }
        
        // Update grid segment
        // Use VISUAL percentage for width (fills bar), WATT values for label (shows accuracy)
        if (batteryGridSegment) {
          const gridColorToUse = gridIsImport ? '#7a211b' : '#7a6b1b'; // Red or Yellow
          (batteryGridSegment as HTMLElement).style.width = `${visualBatteryGridPercent}%`;
          (batteryGridSegment as HTMLElement).style.background = gridColorToUse;
          const label = batteryGridSegment.querySelector('.bar-segment-label');
          if (label && batteryGridWatts > 0) {
            label.textContent = `${Math.round(batteryGridWatts)}W`;
          }
          const pixelWidth = (visualBatteryGridPercent / 100) * (batteryBarContainer?.offsetWidth || 0);
          this._updateSegmentVisibility(batteryGridSegment, pixelWidth, batteryGridWatts > 0);
        }
        
        // Update load segment (blue, only when discharging to load)
        if (batteryLoadSegment) {
          (batteryLoadSegment as HTMLElement).style.width = `${visualBatteryLoadPercent}%`;
          const label = batteryLoadSegment.querySelector('.bar-segment-label');
          if (label && batteryLoadWatts > 0) {
            label.textContent = `${Math.round(batteryLoadWatts)}W`;
          }
          const pixelWidth = (visualBatteryLoadPercent / 100) * (batteryBarContainer?.offsetWidth || 0);
          this._updateSegmentVisibility(batteryLoadSegment, pixelWidth, batteryLoadWatts > 0);
        }
        
        // Update production segment (green, only when charging from production)
        if (batteryProdSegment) {
          (batteryProdSegment as HTMLElement).style.width = `${visualBatteryProdPercent}%`;
          const label = batteryProdSegment.querySelector('.bar-segment-label');
          if (label && batteryProdWatts > 0) {
            label.textContent = `${Math.round(batteryProdWatts)}W`;
          }
          const pixelWidth = (visualBatteryProdPercent / 100) * (batteryBarContainer?.offsetWidth || 0);
          this._updateSegmentVisibility(batteryProdSegment, pixelWidth, batteryProdWatts > 0);
        }
      }
    };

    // Wait for DOM to settle before calculating widths
    requestAnimationFrame(updateSegments)
  }

  private async _renderChartView(grid: number, load: number, production: number, battery: number): Promise<void> {
    // Initialize chart view on first render or view mode change
    if (!this.querySelector('.chart-view') || this._lastViewMode !== 'chart') {
      this.innerHTML = `
        <ha-card>
          <style>
            :host {
              display: block;
              width: 100%;
              height: 100%;
            }
            ha-card {
              padding: 0;
              box-sizing: border-box;
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
            }
            .chart-view {
              display: flex;
              flex-direction: column;
              width: 100%;
              flex: 1;
              min-height: 0;
            }
            .chart-container {
              flex: 1;
              position: relative;
              min-height: 200px;
              overflow: hidden;
            }
            svg.chart-svg {
              width: 100%;
              height: 100%;
            }
            .loading-message {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: rgb(160, 160, 160);
              font-size: 14px;
            }
          </style>
          <div class="chart-view">
            <div class="chart-container">
              <div class="loading-message">Loading history data...</div>
              <svg class="chart-svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
                <!-- Chart will be rendered here -->
              </svg>
            </div>
          </div>
        </ha-card>
      `;
      this._lastViewMode = 'chart';
    }

    // Store live values for indicators
    this._liveChartValues = { grid, load, production, battery };
    
    // Fetch and render chart data
    await this._fetchAndRenderChartData();
  }

  private async _fetchAndRenderChartData(): Promise<void> {
    if (!this._hass || !this._config) return;
    if (this._chartRenderPending) return; // Prevent concurrent fetches

    const hoursToShow = 12;
    const now = Date.now();
    const cacheAge = this._chartDataCache ? now - this._chartDataCache.timestamp : Infinity;
    const cacheMaxAge = 5 * 60 * 1000; // 5 minutes

    // Clear expired cache to prevent memory leaks
    if (this._chartDataCache && cacheAge >= cacheMaxAge) {
      this._chartDataCache = undefined;
    }

    // Use cached data if available and fresh
    if (this._chartDataCache && cacheAge < cacheMaxAge) {
      this._renderChartFromCache();
      return;
    }

    this._chartRenderPending = true;
    const end = new Date();
    const start = new Date(end.getTime() - hoursToShow * 60 * 60 * 1000);

    try {
      // Fetch history for all entities in parallel
      const [productionHistory, gridHistory, loadHistory, batteryHistory] = await Promise.all([
        this._fetchHistory(this._config.production_entity, start, end),
        this._fetchHistory(this._config.grid_entity, start, end),
        this._fetchHistory(this._config.load_entity, start, end),
        this._fetchHistory(this._config.battery_entity, start, end),
      ]);

      // Process and render the chart
      this._drawStackedAreaChart(productionHistory, gridHistory, loadHistory, batteryHistory, hoursToShow);
      this._chartRenderPending = false;

      // Remove loading message
      const loadingMsg = this.querySelector('.loading-message');
      if (loadingMsg) loadingMsg.remove();
    } catch (error) {
      console.error('Error fetching chart data:', error);
      this._chartRenderPending = false;
      const svg = this.querySelector('.chart-svg');
      if (svg) {
        svg.innerHTML = `
          <text x="400" y="200" text-anchor="middle" fill="rgb(160, 160, 160)" font-size="14">
            Error loading chart data
          </text>
        `;
      }
    }
  }

  private _renderChartFromCache(): void {
    if (!this._chartDataCache) return;
    
    const svg = this.querySelector('.chart-svg');
    if (!svg) return;

    const dataPoints = this._chartDataCache.dataPoints;
    
    // Recalculate scaling (lightweight)
    const maxSupply = Math.max(...dataPoints.map(d => d.solar + d.batteryDischarge + d.gridImport), ...dataPoints.map(d => d.load));
    const maxDemand = Math.max(...dataPoints.map(d => d.batteryCharge + d.gridExport));
    const totalRange = maxSupply + maxDemand;
    const supplyRatio = totalRange > 0 ? maxSupply / totalRange : 0.5;
    const demandRatio = totalRange > 0 ? maxDemand / totalRange : 0.5;

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 150, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const supplyHeight = chartHeight * supplyRatio;
    const demandHeight = chartHeight * demandRatio;
    
    const supplyScale = maxSupply > 0 ? supplyHeight / (maxSupply * 1.1) : 1;
    const demandScale = maxDemand > 0 ? demandHeight / (maxDemand * 1.1) : 1;
    const zeroLineY = margin.top + supplyHeight;

    // Render chart paths
    const supplyPaths = this._createStackedPaths(dataPoints, chartWidth, supplyHeight, supplyScale, margin, 'supply', zeroLineY);
    const demandPaths = this._createStackedPaths(dataPoints, chartWidth, demandHeight, demandScale, margin, 'demand', zeroLineY);
    const loadLine = this._createLoadLine(dataPoints, chartWidth, supplyHeight, supplyScale, margin, zeroLineY);

    let chartContent = `
      <g opacity="0.1">
        ${this._createGridLines(chartWidth, chartHeight, margin, Math.max(maxSupply, maxDemand))}
      </g>
      <line x1="${margin.left}" y1="${zeroLineY}" x2="${margin.left + chartWidth}" y2="${zeroLineY}" stroke="rgb(160, 160, 160)" stroke-width="1" stroke-dasharray="4,4" />
      ${demandPaths}
      ${supplyPaths}
      ${this._createTimeLabels(chartWidth, chartHeight, margin, 12)}
      ${this._createYAxisLabels(supplyHeight, demandHeight, margin, maxSupply, maxDemand, zeroLineY)}
    `;

    svg.innerHTML = chartContent;
    
    // Update indicators with live values, then add load line on top
    this._updateChartIndicators();
    this._addLoadLineOnTop(svg, loadLine);

    const loadingMsg = this.querySelector('.loading-message');
    if (loadingMsg) loadingMsg.remove();
  }

  private _updateChartIndicators(): void {
    const svg = this.querySelector('.chart-svg');
    if (!svg || !this._chartDataCache || !this._liveChartValues) return;

    const dataPoints = this._chartDataCache.dataPoints;
    const maxSupply = Math.max(...dataPoints.map(d => d.solar + d.batteryDischarge + d.gridImport), ...dataPoints.map(d => d.load));
    const maxDemand = Math.max(...dataPoints.map(d => d.batteryCharge + d.gridExport));
    const totalRange = maxSupply + maxDemand;
    const supplyRatio = totalRange > 0 ? maxSupply / totalRange : 0.5;
    const demandRatio = totalRange > 0 ? maxDemand / totalRange : 0.5;

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 150, bottom: 40, left: 60 };
    const chartHeight = height - margin.top - margin.bottom;

    const supplyHeight = chartHeight * supplyRatio;
    const demandHeight = chartHeight * demandRatio;
    
    const supplyScale = maxSupply > 0 ? supplyHeight / (maxSupply * 1.1) : 1;
    const demandScale = maxDemand > 0 ? demandHeight / (maxDemand * 1.1) : 1;
    const zeroLineY = margin.top + supplyHeight;

    // Re-render indicators with current live values
    this._renderChartIndicators(svg, dataPoints, width - margin.left - margin.right, supplyHeight, demandHeight, supplyScale, demandScale, margin, {}, zeroLineY);
    
    // Add load line on top after indicators
    const loadLine = this._createLoadLine(dataPoints, width - margin.left - margin.right, supplyHeight, supplyScale, margin, zeroLineY);
    this._addLoadLineOnTop(svg, loadLine);
  }

  private async _fetchHistory(entityId: string, start: Date, end: Date): Promise<Array<{ state: string; last_changed: string }>> {
    if (!this._hass) return [];

    const url = `history/period/${start.toISOString()}?filter_entity_id=${entityId}&end_time=${end.toISOString()}&minimal_response&no_attributes`;
    
    try {
      const result = await this._hass.callApi('GET', url);
      return result[0] || [];
    } catch (error) {
      console.error(`Error fetching history for ${entityId}:`, error);
      return [];
    }
  }

  private _drawStackedAreaChart(
    productionHistory: Array<{ state: string; last_changed: string }>,
    gridHistory: Array<{ state: string; last_changed: string }>,
    loadHistory: Array<{ state: string; last_changed: string }>,
    batteryHistory: Array<{ state: string; last_changed: string }>,
    hoursToShow: number
  ): void {
    const svg = this.querySelector('.chart-svg');
    if (!svg) return;

    // Chart dimensions
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 150, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Collect 30-second raw data, then average into 5-minute visible ticks
    const rawPointsPerHour = 120; // 30-second intervals (2 per minute)
    const totalRawPoints = hoursToShow * rawPointsPerHour;
    const visiblePointsPerHour = 12; // 5-minute intervals
    const totalVisiblePoints = hoursToShow * visiblePointsPerHour;
    const rawPointsPerVisibleTick = 10; // 10 raw points (5 minutes of 30-second data)
    
    // Quantize to the nearest 5-minute interval on the clock
    const now = new Date();
    const endMinutes = Math.floor(now.getMinutes() / 5) * 5;
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), endMinutes, 0, 0);
    const start = new Date(end.getTime() - hoursToShow * 60 * 60 * 1000);

    // First, collect raw 30-second data points
    const rawDataPoints: Array<{
      time: Date;
      solar: number;
      batteryDischarge: number;
      batteryCharge: number;
      gridImport: number;
      gridExport: number;
      load: number;
    }> = [];

    for (let i = 0; i < totalRawPoints; i++) {
      // Each point is exactly 30 seconds apart
      const time = new Date(start.getTime() + i * 30 * 1000);
      
      const production = this._interpolateValue(productionHistory, time);
      const grid = this._interpolateValue(gridHistory, time);
      const load = this._interpolateValue(loadHistory, time);
      let battery = this._interpolateValue(batteryHistory, time);
      
      if (this._config?.invert_battery_data) {
        battery = -battery;
      }

      rawDataPoints.push({
        time,
        solar: Math.max(0, production),
        batteryDischarge: Math.max(0, battery),
        batteryCharge: Math.max(0, -battery),
        gridImport: Math.max(0, grid),
        gridExport: Math.max(0, -grid),
        load: Math.max(0, load),
      });
    }

    // Average into 5-minute visible data points
    const dataPoints: Array<{
      time: Date;
      solar: number;
      batteryDischarge: number;
      batteryCharge: number;
      gridImport: number;
      gridExport: number;
      load: number;
    }> = [];

    for (let i = 0; i < totalVisiblePoints; i++) {
      // Each visible point represents a 5-minute average
      const visibleTime = new Date(start.getTime() + (i + 1) * 5 * 60 * 1000);
      const startIdx = i * rawPointsPerVisibleTick;
      const endIdx = Math.min(startIdx + rawPointsPerVisibleTick, rawDataPoints.length);
      const windowSize = endIdx - startIdx;
      
      let solarSum = 0, batteryDischargeSum = 0, batteryChargeSum = 0;
      let gridImportSum = 0, gridExportSum = 0, loadSum = 0;
      
      for (let j = startIdx; j < endIdx; j++) {
        solarSum += rawDataPoints[j].solar;
        batteryDischargeSum += rawDataPoints[j].batteryDischarge;
        batteryChargeSum += rawDataPoints[j].batteryCharge;
        gridImportSum += rawDataPoints[j].gridImport;
        gridExportSum += rawDataPoints[j].gridExport;
        loadSum += rawDataPoints[j].load;
      }

      // Debug logging for first point
      if (i === 0) {
        console.log('Chart data sample (5-min avg of 30-sec data):', {
          time: visibleTime.toISOString(),
          windowSize,
          solar: solarSum / windowSize,
          'invert_battery_data': this._config?.invert_battery_data
        });
      }

      dataPoints.push({
        time: visibleTime,
        solar: solarSum / windowSize,
        batteryDischarge: batteryDischargeSum / windowSize,
        batteryCharge: batteryChargeSum / windowSize,
        gridImport: gridImportSum / windowSize,
        gridExport: gridExportSum / windowSize,
        load: loadSum / windowSize,
      });
    }

    // Clear raw data points to allow garbage collection
    rawDataPoints.length = 0;

    // Cache the processed data points (replacing any old cache completely)
    this._chartDataCache = {
      timestamp: Date.now(),
      dataPoints
    };

    // Find max values for scaling - use single consistent scale
    const maxSupply = Math.max(...dataPoints.map(d => d.solar + d.batteryDischarge + d.gridImport), ...dataPoints.map(d => d.load));
    const maxDemand = Math.max(...dataPoints.map(d => d.batteryCharge + d.gridExport));
    
    // Allocate chart space proportionally based on actual data ranges
    const totalRange = maxSupply + maxDemand;
    const supplyRatio = totalRange > 0 ? maxSupply / totalRange : 0.5;
    const demandRatio = totalRange > 0 ? maxDemand / totalRange : 0.5;
    
    // Single consistent scale (pixels per watt) - use the larger requirement
    const supplyScale = maxSupply > 0 ? (chartHeight * supplyRatio) / (maxSupply * 1.1) : 1;
    const demandScale = maxDemand > 0 ? (chartHeight * demandRatio) / (maxDemand * 1.1) : 1;
    const scale = Math.min(supplyScale, demandScale); // Use the smaller scale to ensure both fit
    
    // Calculate actual heights used with consistent scale
    const supplyHeight = maxSupply * scale * 1.1;
    const demandHeight = maxDemand * scale * 1.1;
    const zeroLineY = margin.top + supplyHeight; // Zero line positioned based on supply height needed

    // Create SVG paths for stacked areas using the same scale
    const supplyPaths = this._createStackedPaths(dataPoints, chartWidth, supplyHeight, scale, margin, 'supply', zeroLineY);
    const demandPaths = this._createStackedPaths(dataPoints, chartWidth, demandHeight, scale, margin, 'demand', zeroLineY);

    // Color scheme
    const colors = {
      solar: '#256028',
      batteryDischarge: '#104b79',
      batteryCharge: '#104b79',
      gridImport: '#7a211b',
      gridExport: '#7a6b1b',
      load: '#CCCCCC',
    };

    // Create load line (on positive/supply side)
    const loadLine = this._createLoadLine(dataPoints, chartWidth, supplyHeight, scale, margin, zeroLineY);

    // Build SVG content
    let svgContent = `
      <!-- Grid lines -->
      <g opacity="0.1">
        ${this._createGridLines(chartWidth, chartHeight, margin, Math.max(maxSupply, maxDemand))}
      </g>
      
      <!-- Zero line (dynamic position based on supply height) -->
      <line 
        x1="${margin.left}" 
        y1="${zeroLineY}" 
        x2="${margin.left + chartWidth}" 
        y2="${zeroLineY}" 
        stroke="rgb(160, 160, 160)" 
        stroke-width="1" 
        stroke-dasharray="4,4"
      />
      
      <!-- Demand areas (below zero line) -->
      ${demandPaths}
      
      <!-- Supply areas (above zero line) -->
      ${supplyPaths}
      
      <!-- Time axis labels -->
      ${this._createTimeLabels(chartWidth, chartHeight, margin, hoursToShow)}
      
      <!-- Y-axis labels -->
      ${this._createYAxisLabels(supplyHeight, demandHeight, margin, maxSupply, maxDemand, zeroLineY)}
      
      <!-- Floating indicators with current values -->
      ${this._createFloatingIndicators(dataPoints, chartWidth, chartHeight, scale, scale, margin, width)}
      
      <!-- Hidden icon sources for extraction -->
      ${this._createChartIconSources()}
    `;

    svg.innerHTML = svgContent;
    
    // Extract icon paths and render native SVG indicators, then add load line on top
    requestAnimationFrame(() => {
      this._extractChartIcons(dataPoints, chartWidth, supplyHeight, demandHeight, scale, scale, margin, zeroLineY);
      // Add load line after indicators so it's on top
      this._addLoadLineOnTop(svg, loadLine);
    });
  }

  private _interpolateValue(history: Array<{ state: string; last_changed: string }>, targetTime: Date): number {
    if (history.length === 0) return 0;

    // Find the closest data point
    let closestPoint = history[0];
    let minDiff = Math.abs(new Date(history[0].last_changed).getTime() - targetTime.getTime());

    for (const point of history) {
      const diff = Math.abs(new Date(point.last_changed).getTime() - targetTime.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closestPoint = point;
      }
    }

    return parseFloat(closestPoint.state) || 0;
  }

  private _createStackedPaths(
    dataPoints: Array<any>,
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
      // Stacked supply: solar (bottom) → battery discharge → grid import (top)
      const solarPath = this._createAreaPath(dataPoints, xStep, zeroLineY, yScale, margin, 
        d => d.solar, 0, 'down');
      
      const batteryPath = this._createAreaPath(dataPoints, xStep, zeroLineY, yScale, margin,
        d => d.batteryDischarge, d => d.solar, 'down');
      
      const gridPath = this._createAreaPath(dataPoints, xStep, zeroLineY, yScale, margin,
        d => d.gridImport, d => d.solar + d.batteryDischarge, 'down');

      return `
        ${gridPath ? `<path d="${gridPath}" fill="#c62828" opacity="0.8" />` : ''}
        ${batteryPath ? `<path d="${batteryPath}" fill="#1976d2" opacity="0.8" />` : ''}
        ${solarPath ? `<path d="${solarPath}" fill="#388e3c" opacity="0.85" />` : ''}
      `;
    } else {
      // Stacked demand: battery charge (bottom) → grid export (top)
      const batteryChargePath = this._createAreaPath(dataPoints, xStep, zeroLineY, yScale, margin,
        d => d.batteryCharge, 0, 'up');
      
      const gridExportPath = this._createAreaPath(dataPoints, xStep, zeroLineY, yScale, margin,
        d => d.gridExport, d => d.batteryCharge, 'up');

      return `
        ${gridExportPath ? `<path d="${gridExportPath}" fill="#f9a825" opacity="0.8" />` : ''}
        ${batteryChargePath ? `<path d="${batteryChargePath}" fill="#1976d2" opacity="0.8" />` : ''}
      `;
    }
  }

  private _createLoadLine(
    dataPoints: Array<any>,
    chartWidth: number,
    chartHeight: number,
    yScale: number,
    margin: { top: number; right: number; bottom: number; left: number },
    zeroLineY: number
  ): string {
    if (!dataPoints || dataPoints.length === 0) return '';

    const xStep = chartWidth / (dataPoints.length - 1);

    // Create line path showing load on the supply (positive) side
    const pathPoints = dataPoints.map((d, i) => {
      const x = margin.left + i * xStep;
      const y = zeroLineY - d.load * yScale; // Positive values go up from zero line
      return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');

    return `<path d="${pathPoints}" fill="none" stroke="#CCCCCC" stroke-width="3" opacity="0.9" />`;
  }

  private _createFloatingIndicators(
    dataPoints: Array<any>,
    chartWidth: number,
    chartHeight: number,
    supplyScale: number,
    demandScale: number,
    margin: { top: number; right: number; bottom: number; left: number },
    width: number
  ): string {
    // Indicators are now rendered via _extractChartIcons as native SVG
    // This method just returns empty string to avoid double rendering
    return '';
  }

  private _createChartIconSources(): string {
    const loadIcon = this._getIcon('load_icon', 'load_entity', 'mdi:home-lightning-bolt');
    const solarIcon = this._getIcon('production_icon', 'production_entity', 'mdi:solar-power');
    const batteryIcon = this._getIcon('battery_icon', 'battery_entity', 'mdi:battery');
    const gridIcon = this._getIcon('grid_icon', 'grid_entity', 'mdi:transmission-tower');

    return `
      <foreignObject id="chart-icon-source-load" x="-100" y="-100" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <ha-icon icon="${loadIcon}"></ha-icon>
        </div>
      </foreignObject>
      <foreignObject id="chart-icon-source-solar" x="-100" y="-100" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <ha-icon icon="${solarIcon}"></ha-icon>
        </div>
      </foreignObject>
      <foreignObject id="chart-icon-source-battery" x="-100" y="-100" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <ha-icon icon="${batteryIcon}"></ha-icon>
        </div>
      </foreignObject>
      <foreignObject id="chart-icon-source-grid" x="-100" y="-100" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <ha-icon icon="${gridIcon}"></ha-icon>
        </div>
      </foreignObject>
    `;
  }

  private async _extractChartIcons(
    dataPoints: Array<any>,
    chartWidth: number,
    supplyHeight: number,
    demandHeight: number,
    supplyScale: number,
    demandScale: number,
    margin: { top: number; right: number; bottom: number; left: number },
    zeroLineY: number
  ): Promise<void> {
    const svg = this.querySelector('.chart-svg');
    if (!svg || !dataPoints || dataPoints.length === 0) return;

    const iconTypes = ['load', 'solar', 'battery', 'grid'];
    const iconPaths: { [key: string]: string | null } = {};

    // Extract all icon paths
    for (const type of iconTypes) {
      const iconSourceFO = svg.querySelector(`#chart-icon-source-${type}`);
      if (!iconSourceFO) continue;

      const haIconDiv = iconSourceFO.querySelector('div');
      if (!haIconDiv) continue;

      const iconSource = haIconDiv.querySelector('ha-icon');
      if (!iconSource) continue;

      const iconName = iconSource.getAttribute('icon');
      if (!iconName) continue;

      // Check cache first
      if (this._iconCache.has(iconName)) {
        iconPaths[type] = this._iconCache.get(iconName) || null;
        continue;
      }

      // Extract from shadow DOM
      const pathData = await this._extractIconPath(iconSource, iconName);
      iconPaths[type] = pathData;
      if (pathData) {
        this._iconCache.set(iconName, pathData);
      }
    }

    // Render native SVG indicators
    this._renderChartIndicators(svg, dataPoints, chartWidth, supplyHeight, demandHeight, supplyScale, demandScale, margin, iconPaths, zeroLineY);
  }

  private async _extractIconPath(iconElement: Element, iconName: string, maxAttempts = 10): Promise<string | null> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const shadowRoot = iconElement.shadowRoot;
        if (!shadowRoot) {
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }

        let svgElement = shadowRoot.querySelector('svg');
        
        if (!svgElement) {
          const haSvgIcon = shadowRoot.querySelector('ha-svg-icon');
          if (haSvgIcon && haSvgIcon.shadowRoot) {
            svgElement = haSvgIcon.shadowRoot.querySelector('svg');
          }
        }

        if (!svgElement) {
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }

        const pathElement = svgElement.querySelector('path');
        if (!pathElement) {
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }

        const pathData = pathElement.getAttribute('d');
        if (pathData) {
          return pathData;
        }
      } catch (e) {
        console.error(`Failed to extract icon path for ${iconName} (attempt ${attempt + 1}):`, e);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return null;
  }

  private _renderChartIndicators(
    svg: Element,
    dataPoints: Array<any>,
    chartWidth: number,
    supplyHeight: number,
    demandHeight: number,
    supplyScale: number,
    demandScale: number,
    margin: { top: number; right: number; bottom: number; left: number },
    iconPaths: { [key: string]: string | null },
    zeroLineY: number
  ): void {
    // Get or create indicators group
    let indicatorsGroup = svg.querySelector('#chart-indicators') as SVGGElement | null;
    const isFirstRender = !indicatorsGroup;
    
    if (!indicatorsGroup) {
      indicatorsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      indicatorsGroup.setAttribute('id', 'chart-indicators');
      svg.appendChild(indicatorsGroup);
    }

    // Remove hidden icon sources only on first render
    if (isFirstRender) {
      const iconSources = svg.querySelectorAll('[id^="chart-icon-source-"]');
      iconSources.forEach(source => source.remove());
    }

    // Use live values for indicators if available, otherwise use last historical point
    let currentValues;
    if (this._liveChartValues) {
      const { grid, load, production, battery } = this._liveChartValues;
      currentValues = {
        load: Math.max(0, load),
        solar: Math.max(0, production),
        batteryDischarge: Math.max(0, battery),
        batteryCharge: Math.max(0, -battery),
        gridImport: Math.max(0, grid),
        gridExport: Math.max(0, -grid),
      };
    } else {
      currentValues = dataPoints[dataPoints.length - 1];
    }

    const rightX = margin.left + chartWidth;

    // Calculate Y positions using live values (relative to dynamic zero line)
    const loadY = zeroLineY - currentValues.load * supplyScale;
    const solarY = zeroLineY - currentValues.solar * supplyScale;
    const batteryDischargeY = zeroLineY - (currentValues.solar + currentValues.batteryDischarge) * supplyScale;
    const gridImportY = zeroLineY - (currentValues.solar + currentValues.batteryDischarge + currentValues.gridImport) * supplyScale;
    const batteryChargeY = zeroLineY + currentValues.batteryCharge * demandScale;
    const gridExportY = zeroLineY + (currentValues.batteryCharge + currentValues.gridExport) * demandScale;

    const formatValue = (value: number): string => {
      return `${Math.round(value)} W`;
    };

    // Helper to update or create indicator
    const updateIndicator = (id: string, y: number, color: string, iconType: string, value: string, prefix = '', shouldShow = true) => {
      let group = indicatorsGroup!.querySelector(`#${id}`) as SVGGElement | null;
      
      if (!shouldShow) {
        if (group) group.remove();
        return;
      }
      
      if (!group) {
        // Create new indicator group
        group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', id);
        
        // Icon
        const iconPath = iconPaths[iconType];
        if (iconPath) {
          const icon = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          icon.setAttribute('class', 'indicator-icon');
          icon.setAttribute('transform', 'translate(10, -8) scale(0.67)');
          
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', iconPath);
          path.setAttribute('fill', color);
          icon.appendChild(path);
          
          group.appendChild(icon);
        }

        // Text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'indicator-text');
        text.setAttribute('x', '28');
        text.setAttribute('y', '4');
        text.setAttribute('fill', color);
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', '600');
        group.appendChild(text);
        
        indicatorsGroup!.appendChild(group);
      }
      
      // Update position
      group.setAttribute('transform', `translate(${rightX + 10}, ${y})`);
      
      // Update text value
      const text = group.querySelector('.indicator-text');
      if (text) {
        text.textContent = `${prefix}${value}`;
      }
    };

    // Update all indicators (order matters for z-index)
    updateIndicator('indicator-solar', solarY, '#388e3c', 'solar', formatValue(currentValues.solar), '', currentValues.solar > 0);
    updateIndicator('indicator-battery-discharge', batteryDischargeY, '#1976d2', 'battery', formatValue(currentValues.batteryDischarge), '+', currentValues.batteryDischarge > 0);
    updateIndicator('indicator-grid-import', gridImportY, '#c62828', 'grid', formatValue(currentValues.gridImport), '', currentValues.gridImport > 0);
    updateIndicator('indicator-battery-charge', batteryChargeY, '#1976d2', 'battery', formatValue(currentValues.batteryCharge), '-', currentValues.batteryCharge > 0);
    updateIndicator('indicator-grid-export', gridExportY, '#f9a825', 'grid', formatValue(currentValues.gridExport), '', currentValues.gridExport > 0);
    
    // Load indicator LAST so it's on top
    updateIndicator('indicator-load', loadY, '#CCCCCC', 'load', formatValue(currentValues.load), '', true);
  }

  private _addLoadLineOnTop(svg: Element, loadLine: string): void {
    if (!loadLine) return;
    
    // Remove any existing load line
    const existingLoadLine = svg.querySelector('#load-line');
    if (existingLoadLine) {
      existingLoadLine.remove();
    }
    
    // Parse the load line path from the string
    const pathMatch = loadLine.match(/d="([^"]+)"/);
    if (!pathMatch) return;
    
    const pathData = pathMatch[1];
    
    // Create path element
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('id', 'load-line');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#CCCCCC');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('opacity', '0.9');
    
    // Append to SVG (will be on top)
    svg.appendChild(path);
  }

  private _createAreaPath(
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

  private _createGridLines(chartWidth: number, chartHeight: number, margin: { top: number; left: number }, maxValue: number): string {
    const lines: string[] = [];
    const numLines = 4;
    
    for (let i = 0; i <= numLines; i++) {
      const y = margin.top + (i * chartHeight / numLines);
      lines.push(`<line x1="${margin.left}" y1="${y}" x2="${margin.left + chartWidth}" y2="${y}" stroke="white" stroke-width="1" />`);
    }
    
    return lines.join('\n');
  }

  private _createTimeLabels(chartWidth: number, chartHeight: number, margin: { top: number; bottom: number; left: number }, hoursToShow: number): string {
    const labels: string[] = [];
    const numLabels = 6;
    const now = new Date();
    
    // Calculate quantized time intervals
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

  private _createYAxisLabels(
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

  private _createChartLegend(width: number, margin: { top: number; right: number }, colors: any): string {
    const legendItems = [
      { label: 'Solar', color: colors.solar },
      { label: 'Battery', color: colors.batteryDischarge },
      { label: 'Grid Import', color: colors.gridImport },
      { label: 'Grid Export', color: colors.gridExport },
      { label: 'Load', color: colors.load },
    ];

    const legendX = width - margin.right - 10;
    let legendY = margin.top;

    return legendItems.map((item, i) => {
      const y = legendY + (i * 20);
      return `
        <rect x="${legendX - 80}" y="${y - 10}" width="12" height="12" fill="${item.color}" opacity="0.8" />
        <text x="${legendX - 64}" y="${y}" fill="rgb(200, 200, 200)" font-size="11">${item.label}</text>
      `;
    }).join('\n');
  }

  private _updateSegmentVisibility(segment: Element, pixelWidth: number, hasValue: boolean): void {
    if (!segment || !hasValue) {
      segment?.setAttribute('data-width-px', '');
      return;
    }

    // Thresholds for responsive hiding
    const SHOW_LABEL_THRESHOLD = 80; // Show label if segment is at least 80px wide
    const SHOW_ICON_THRESHOLD = 40;  // Show icon if segment is at least 40px wide

    if (pixelWidth >= SHOW_LABEL_THRESHOLD) {
      segment.setAttribute('data-width-px', 'show-label');
    } else if (pixelWidth >= SHOW_ICON_THRESHOLD) {
      segment.setAttribute('data-width-px', 'show-icon');
    } else {
      segment.setAttribute('data-width-px', '');
    }
  }
}

// Register custom element
customElements.define("energy-flow-card", EnergyFlowCard);

// Register in card picker
declare global {
  interface Window {
    customCards: Array<{ type: string; name: string; description: string }>;
  }
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: "energy-flow-card",
  name: "Energy Flow Card",
  description: "A test energy-flow card."
});
