// Meter class: Fully self-contained meter with its own rendering and animation
class Meter {
  constructor(id, value, min, max, bidirectional, label, icon, invertView = false, showPlus = false, parentElement = null) {
    this.id = id;
    this._value = value;
    this.min = min;
    this.max = max;
    this.bidirectional = bidirectional;
    this.label = label;
    this.icon = icon;
    this._invertView = invertView;
    this.showPlus = showPlus;
    this.parentElement = parentElement;
    
    // Meter geometry constants
    this.radius = 50;
    this.boxWidth = 120;
    this.boxHeight = 135;
    this.boxRadius = 16;
    this.centerX = this.boxWidth / 2;
    this.centerY = this.radius + 25;
    this.offsetX = -this.centerX;
    this.offsetY = -this.centerY;
    
    // Needle animation state
    this.needleState = { target: 0, current: 0, ghost: 0 };
    this._lastAnimationTime = null;
    this._animationFrameId = null;
    
    // Calculate initial needle angle
    this._updateNeedleAngle();
  }
  
  get value() {
    return this._value;
  }
  
  set value(newValue) {
    if (this._value === newValue) return; // No change, skip update
    
    this._value = newValue;
    this._updateNeedleAngle();
    
    // Update value text immediately
    if (this.parentElement) {
      const valueText = this.parentElement.querySelector(`#value-${this.id}`);
      if (valueText) {
        valueText.textContent = this._formatValueText();
      }
      
      // Update dimming
      this.updateDimming();
    }
  }
  
  get invertView() {
    return this._invertView;
  }
  
  set invertView(newInvertView) {
    if (this._invertView === newInvertView) return; // No change, skip update
    
    this._invertView = newInvertView;
    this._updateNeedleAngle();
    
    // Update value text immediately (displayValue depends on invertView)
    if (this.parentElement) {
      const valueText = this.parentElement.querySelector(`#value-${this.id}`);
      if (valueText) {
        valueText.textContent = this._formatValueText();
      }
    }
  }
  
  get displayValue() {
    return this._invertView ? -this._value : this._value;
  }
  
  _formatValueText() {
    const displayValue = this.displayValue;
    const valueStr = displayValue.toFixed(0);
    
    if (displayValue < 0) {
      return valueStr + '\u00A0'; // Negative with non-breaking space
    } else if (displayValue > 0 && this.showPlus) {
      return '+' + valueStr + '\u00A0'; // Positive with + sign and non-breaking space
    } else {
      return valueStr; // Zero or positive without sign
    }
  }
  
  _updateNeedleAngle() {
    let percentage, angle;
    const displayValue = this.displayValue;
    
    if (this.bidirectional) {
      const range = this.max - this.min;
      percentage = Math.min(Math.max((displayValue - this.min) / range, 0), 1);
      angle = 180 - (percentage * 180);
    } else {
      percentage = Math.min(Math.max(displayValue / this.max, 0), 1);
      angle = 180 - (percentage * 180);
    }
    
    this.needleState.target = angle;
  }
  
  updateDimming() {
    if (!this.parentElement) return;
    
    const dimmer = this.parentElement.querySelector(`#dimmer-${this.id}`);
    if (dimmer) {
      const isZero = Math.abs(this.value) < 0.5;
      dimmer.setAttribute('opacity', isZero ? '0.3' : '0');
    }
  }
  
  startAnimation() {
    if (this._animationFrameId) return; // Already animating
    
    const animate = (timestamp) => {
      if (!this._lastAnimationTime) {
        this._lastAnimationTime = timestamp;
      }
      
      const deltaTime = timestamp - this._lastAnimationTime;
      this._lastAnimationTime = timestamp;
      
      if (!this.parentElement) {
        this._animationFrameId = null;
        return;
      }
      
      const needleLength = this.radius - 5;
      
      // Smoothly interpolate main needle (fast response)
      const mainLerpFactor = Math.min(deltaTime / 150, 1); // 150ms response time
      this.needleState.current += (this.needleState.target - this.needleState.current) * mainLerpFactor;
      
      // Ghost needle lags behind (slower response)
      const ghostLerpFactor = Math.min(deltaTime / 400, 1); // 400ms response time
      this.needleState.ghost += (this.needleState.current - this.needleState.ghost) * ghostLerpFactor;
      
      // Clamp ghost to maximum 10 degrees behind main needle
      const maxLag = 10;
      if (this.needleState.ghost < this.needleState.current - maxLag) {
        this.needleState.ghost = this.needleState.current - maxLag;
      } else if (this.needleState.ghost > this.needleState.current + maxLag) {
        this.needleState.ghost = this.needleState.current + maxLag;
      }
      
      // Update main needle
      const needle = this.parentElement.querySelector(`#needle-${this.id}`);
      if (needle) {
        const needleRad = (this.needleState.current * Math.PI) / 180;
        const needleX = this.centerX + needleLength * Math.cos(needleRad);
        const needleY = this.centerY - needleLength * Math.sin(needleRad);
        needle.setAttribute('x2', needleX);
        needle.setAttribute('y2', needleY);
      }
      
      // Update ghost needle
      const ghostNeedle = this.parentElement.querySelector(`#ghost-needle-${this.id}`);
      if (ghostNeedle) {
        const ghostRad = (this.needleState.ghost * Math.PI) / 180;
        const ghostX = this.centerX + needleLength * Math.cos(ghostRad);
        const ghostY = this.centerY - needleLength * Math.sin(ghostRad);
        ghostNeedle.setAttribute('x2', ghostX);
        ghostNeedle.setAttribute('y2', ghostY);
      }
      
      this._animationFrameId = requestAnimationFrame(animate);
    };
    
    this._animationFrameId = requestAnimationFrame(animate);
  }
  
  stopAnimation() {
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
      this._lastAnimationTime = null;
    }
  }
  
  createSVG() {
    const displayValue = this.displayValue;
    
    // Calculate percentage and angle for needle
    let percentage, angle;
    if (this.bidirectional) {
      const range = this.max - this.min;
      percentage = Math.min(Math.max((displayValue - this.min) / range, 0), 1);
      angle = 180 - (percentage * 180);
    } else {
      percentage = Math.min(Math.max(displayValue / this.max, 0), 1);
      angle = 180 - (percentage * 180);
    }
    
    // Initialize needle state
    this.needleState.target = angle;
    this.needleState.current = angle;
    this.needleState.ghost = angle;
    
    // Generate tick marks
    const ticks = this.bidirectional ? [this.min, 0, this.max] : [0, this.max/2, this.max];
    const tickMarks = ticks.map((tickValue) => {
      const tickPercentage = this.bidirectional 
        ? (tickValue - this.min) / (this.max - this.min)
        : tickValue / this.max;
      const tickAngle = 180 - (tickPercentage * 180);
      const tickRad = (tickAngle * Math.PI) / 180;
      const tickStartR = this.radius;
      const tickEndR = this.radius - 8;
      
      const x1 = this.centerX + tickStartR * Math.cos(tickRad);
      const y1 = this.centerY - tickStartR * Math.sin(tickRad);
      const x2 = this.centerX + tickEndR * Math.cos(tickRad);
      const y2 = this.centerY - tickEndR * Math.sin(tickRad);
      
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgb(160, 160, 160)" stroke-width="2" />`;
    }).join('');
    
    // Zero line
    const zeroPercentage = this.bidirectional ? (0 - this.min) / (this.max - this.min) : 0;
    const zeroAngle = 180 - (zeroPercentage * 180);
    const zeroRad = (zeroAngle * Math.PI) / 180;
    const zeroX1 = this.centerX;
    const zeroY1 = this.centerY;
    const zeroX2 = this.centerX + this.radius * Math.cos(zeroRad);
    const zeroY2 = this.centerY - this.radius * Math.sin(zeroRad);
    const zeroLine = `<line x1="${zeroX1}" y1="${zeroY1}" x2="${zeroX2}" y2="${zeroY2}" stroke="rgb(100, 100, 100)" stroke-width="2" />`;
    
    // Needle position
    const needleRad = (angle * Math.PI) / 180;
    const needleLength = this.radius - 5;
    const needleX = this.centerX + needleLength * Math.cos(needleRad);
    const needleY = this.centerY - needleLength * Math.sin(needleRad);
    
    const clipHeight = this.centerY + 5;
    const valueY = this.centerY + (this.radius * 0.5);
    const unitsY = this.centerY + (this.radius * 0.7);
    const fontSize = 16;
    const unitsFontSize = 8;
    const labelFontSize = 12;
    
    return `
      <g transform="translate(${this.offsetX}, ${this.offsetY})">
        <defs>
          <clipPath id="clip-${this.id}-local">
            <rect x="0" y="0" width="${this.boxWidth}" height="${clipHeight + 2}" />
          </clipPath>
        </defs>
        
        <rect x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="rgb(40, 40, 40)" filter="url(#drop-shadow)" />
        
        <g clip-path="url(#clip-${this.id}-local)">
          <circle cx="${this.centerX}" cy="${this.centerY}" r="${this.radius}" fill="rgb(70, 70, 70)" />
          ${zeroLine}
        </g>
        
        ${tickMarks}
        
        <circle cx="${this.centerX}" cy="${this.centerY}" r="${this.radius}" fill="none" stroke="rgb(160, 160, 160)" stroke-width="2" />
        
        <text x="${this.centerX}" y="15" text-anchor="middle" font-size="${labelFontSize}" fill="rgb(255, 255, 255)" font-weight="500">${this.label}</text>
        
        <!-- Icon rendered via foreignObject (for extraction source) -->
        <foreignObject id="icon-source-${this.id}" x="${this.centerX - 18}" y="${this.centerY - 42}" width="36" height="36">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width: 36px; height: 36px;">
            <ha-icon icon="${this.icon}" style="--mdc-icon-size: 36px; color: rgb(160, 160, 160);"></ha-icon>
          </div>
        </foreignObject>
        
        <!-- Icon rendered as native SVG path (populated after extraction, will overlay) -->
        <g id="icon-display-${this.id}" transform="translate(${this.centerX - 18}, ${this.centerY - 42}) scale(1.5)">
          <!-- Path will be inserted here by _extractIconPaths -->
        </g>
        
        <line id="ghost-needle-${this.id}" x1="${this.centerX}" y1="${this.centerY}" x2="${needleX}" y2="${needleY}" stroke="rgb(255, 255, 255)" stroke-width="4" stroke-linecap="round" opacity="0.3" />
        
        <line id="needle-${this.id}" x1="${this.centerX}" y1="${this.centerY}" x2="${needleX}" y2="${needleY}" stroke="rgb(255, 255, 255)" stroke-width="4" stroke-linecap="round" />
        
        <circle cx="${this.centerX}" cy="${this.centerY}" r="5" fill="rgb(255, 255, 255)" />
        
        <text id="value-${this.id}" x="${this.centerX}" y="${valueY}" text-anchor="middle" font-size="${fontSize}" fill="rgb(255, 255, 255)" font-weight="600">${this._formatValueText()}</text>
        
        <text x="${this.centerX}" y="${unitsY}" text-anchor="middle" font-size="${unitsFontSize}" fill="rgb(160, 160, 160)" font-weight="400" letter-spacing="0.5">WATTS</text>
        
        <rect id="dimmer-${this.id}" x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="black" opacity="0" pointer-events="none" style="transition: opacity 0.8s ease-in-out;" />
      </g>
    `;
  }
}

// Main card class
class EnergyFlowCard extends HTMLElement {
  constructor() {
    super();
    this._resizeObserver = null;
    this._animationFrameId = null;
    this._flowDots = new Map(); // Store dot states: flowId -> array of { progress: 0-1, velocity: units/sec }
    this._lastAnimationTime = null;
    this._iconCache = new Map(); // Cache extracted icon paths: icon -> SVG path data
    this._iconsExtracted = false; // Track if we've extracted icon paths yet
    
    // Meter instances
    this._meters = new Map(); // id -> Meter instance
    
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
        { name: "grid_entity", label: "Grid", required: true, selector: { entity: { domain: "sensor", device_class: "power" } } },
        { name: "grid_name", selector: { entity_name: {} }, context: { entity: "grid_entity" } },
        { name: "grid_icon", selector: { icon: {} }, context: { icon_entity: "grid_entity" } },
        { name: "grid_min", label: "Grid Min (W)", selector: { number: { mode: "box" } } },
        { name: "grid_max", label: "Grid Max (W)", selector: { number: { mode: "box" } } },
        { name: "load_entity", label: "Load", required: true, selector: { entity: { domain: "sensor", device_class: "power" } } },
        { name: "load_name", selector: { entity_name: {} }, context: { entity: "load_entity" } },
        { name: "load_icon", selector: { icon: {} }, context: { icon_entity: "load_entity" } },
        { name: "load_max", label: "Load Max (W)", selector: { number: { mode: "box" } } },
        { name: "production_entity", label: "Production", required: true, selector: { entity: { domain: "sensor", device_class: "power" } } },
        { name: "production_name", selector: { entity_name: {} }, context: { entity: "production_entity" } },
        { name: "production_icon", selector: { icon: {} }, context: { icon_entity: "production_entity" } },
        { name: "production_max", label: "Production Max (W)", selector: { number: { mode: "box" } } },
        { name: "battery_entity", label: "Battery", required: true, selector: { entity: { domain: "sensor", device_class: "power" } } },
        { name: "battery_name", selector: { entity_name: {} }, context: { entity: "battery_entity" } },
        { name: "battery_icon", selector: { icon: {} }, context: { icon_entity: "battery_entity" } },
        { name: "battery_min", label: "Battery Min (W)", selector: { number: { mode: "box" } } },
        { name: "battery_max", label: "Battery Max (W)", selector: { number: { mode: "box" } } },
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
        requestAnimationFrame(() => {
          this._drawFlows(
            this._lastValues.grid,
            this._lastValues.production,
            this._lastValues.load,
            this._lastValues.battery
          );
        });
      }
    });
    
    // Observe the container, not the card itself
    if (this.parentElement) {
      this._resizeObserver.observe(this.parentElement);
    }
    this._resizeObserver.observe(this);
    
    // Start flow animation loop
    this._startFlowAnimationLoop();
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
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
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
    const grid = parseFloat(gridState?.state) || 0;
    const load = parseFloat(loadState?.state) || 0;
    const production = parseFloat(productionState?.state) || 0;
    let battery = parseFloat(batteryState?.state) || 0;
    
    // Invert battery data if configured (affects interpretation)
    if (this._config.invert_battery_data) {
      battery = -battery;
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
      
      // Create meter instances
      const productionMeter = new Meter('production', production, 0, productionMax, false, 
        this._getDisplayName('production_name', 'production_entity', 'Production'),
        this._getIcon('production_icon', 'production_entity', 'mdi:solar-power'));
      const batteryMeter = new Meter('battery', battery, batteryMin, batteryMax, true,
        this._getDisplayName('battery_name', 'battery_entity', 'Battery'),
        this._getIcon('battery_icon', 'battery_entity', 'mdi:battery'),
        this._config.invert_battery_view,
        this._config.show_plus);
      const gridMeter = new Meter('grid', grid, gridMin, gridMax, true,
        this._getDisplayName('grid_name', 'grid_entity', 'Grid'),
        this._getIcon('grid_icon', 'grid_entity', 'mdi:transmission-tower'));
      const loadMeter = new Meter('load', load, 0, loadMax, false,
        this._getDisplayName('load_name', 'load_entity', 'Load'),
        this._getIcon('load_icon', 'load_entity', 'mdi:home-lightning-bolt'));
      
      this.innerHTML = `
        <ha-card>
          <style>
            :host {
              display: block;
              height: 100%;
              min-height: 0;
              min-width: 0;
            }
            ha-card {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              min-height: 0;
              min-width: 0;
              padding: 8px;
              box-sizing: border-box;
              overflow: hidden;
              position: relative;
            }
            .svg-wrapper {
              width: 100%;
              height: 100%;
              max-width: 100%;
              max-height: 100%;
              aspect-ratio: ${this._canvasWidth} / ${this._canvasHeight};
              display: flex;
              align-items: center;
              justify-content: center;
            }
            svg.energy-flow-svg {
              display: block;
              width: 100%;
              height: 100%;
              max-width: 100%;
              max-height: 100%;
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
            <g id="production-meter" class="meter-group" transform="translate(${this._meterPositions.production.x}, ${this._meterPositions.production.y})">
              ${productionMeter.createSVG()}
            </g>
            
            <!-- Battery Meter (middle left, offset right) -->
            <g id="battery-meter" class="meter-group" transform="translate(${this._meterPositions.battery.x}, ${this._meterPositions.battery.y})">
              ${batteryMeter.createSVG()}
            </g>
            
            <!-- Grid Meter (bottom left) -->
            <g id="grid-meter" class="meter-group" transform="translate(${this._meterPositions.grid.x}, ${this._meterPositions.grid.y})">
              ${gridMeter.createSVG()}
            </g>
            
            <!-- Load Meter (right, 2x size) -->
            <g id="load-meter" class="meter-group" transform="translate(${this._meterPositions.load.x}, ${this._meterPositions.load.y}) scale(2)">
              ${loadMeter.createSVG()}
            </g>
          </svg>
          </div>
        </ha-card>
      `;
      
      // Store meter instances with reference to their parent elements
      requestAnimationFrame(() => {
        productionMeter.parentElement = this.querySelector('#production-meter');
        batteryMeter.parentElement = this.querySelector('#battery-meter');
        gridMeter.parentElement = this.querySelector('#grid-meter');
        loadMeter.parentElement = this.querySelector('#load-meter');
        
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
        batteryMeter.invertView = this._config.invert_battery_view;
        batteryMeter.value = battery;
      }
      if (gridMeter) gridMeter.value = grid;
      if (loadMeter) loadMeter.value = load;
    }

    // Store values for resize handler and draw flows
    this._lastValues = { grid, production, load, battery };
    
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

  _getEntityState(entityId) {
    return this._hass?.states?.[entityId];
  }

  _getDisplayName(configKey, entityKey, fallback) {
    // Check if custom name is set in config
    if (this._config[configKey]) {
      return this._config[configKey];
    }
    // Fall back to entity friendly name
    const entityId = this._config[entityKey];
    const entityState = this._getEntityState(entityId);
    if (entityState?.attributes?.friendly_name) {
      return entityState.attributes.friendly_name;
    }
    // Fall back to default label
    return fallback;
  }

  _getIcon(configKey, entityKey, fallback) {
    // Check if custom icon is set in config
    if (this._config[configKey]) {
      return this._config[configKey];
    }
    // Fall back to entity icon
    const entityId = this._config[entityKey];
    const entityState = this._getEntityState(entityId);
    if (entityState?.attributes?.icon) {
      return entityState.attributes.icon;
    }
    // Fall back to default icon
    return fallback;
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

  _drawFlows(grid, production, load, battery) {
    const flowLayer = this.querySelector('#flow-layer');
    if (!flowLayer) return;

    // Use stored meter positions
    const productionPos = this._meterPositions.production;
    const batteryPos = this._meterPositions.battery;
    const gridPos = this._meterPositions.grid;
    const loadPos = this._meterPositions.load;

    // Energy flow calculation with balancing
    // Positive values: production generating, grid importing, battery discharging
    // Negative values: grid exporting, battery charging
    
    const productionFlow = Math.max(0, production);
    const gridFlow = grid; // positive = import, negative = export
    const batteryFlow = battery; // positive = discharge, negative = charge
    const loadDemand = Math.max(0, load);
    
    // Calculate actual flows between meters
    let productionToLoad = 0;
    let productionToBattery = 0;
    let productionToGrid = 0;
    let gridToLoad = 0;
    let gridToBattery = 0;
    let batteryToLoad = 0;
    
    // Start with production distribution
    let remainingProduction = productionFlow;
    let remainingLoad = loadDemand;
    
    // 1. Production first goes to load
    if (remainingProduction > 0 && remainingLoad > 0) {
      productionToLoad = Math.min(remainingProduction, remainingLoad);
      remainingProduction -= productionToLoad;
      remainingLoad -= productionToLoad;
    }
    
    // 2. If battery is charging (negative battery value), production can charge it
    if (remainingProduction > 0 && batteryFlow < 0) {
      productionToBattery = Math.min(remainingProduction, Math.abs(batteryFlow));
      remainingProduction -= productionToBattery;
    }
    
    // 3. Remaining production goes to grid (export)
    if (remainingProduction > 0) {
      productionToGrid = remainingProduction;
    }
    
    // 4. If battery is discharging, it goes to load
    if (batteryFlow > 0 && remainingLoad > 0) {
      batteryToLoad = Math.min(batteryFlow, remainingLoad);
      remainingLoad -= batteryToLoad;
    }
    
    // 5. If load still needs power, import from grid
    if (remainingLoad > 0 && gridFlow > 0) {
      gridToLoad = Math.min(gridFlow, remainingLoad);
      remainingLoad -= gridToLoad;
    }
    
    // 6. If battery is charging and not fully covered by production, grid must supply the rest
    if (batteryFlow < 0 && gridFlow > 0) {
      const batteryNeed = Math.abs(batteryFlow) - productionToBattery;
      if (batteryNeed > 0) {
        gridToBattery = Math.min(gridFlow - gridToLoad, batteryNeed);
      }
    }
    
    // Calculate energy balance overflow (if production + grid > load, excess must be going to battery)
    const batteryOverflow = productionFlow + Math.max(0, gridFlow) - loadDemand;
    if (batteryOverflow > 0) {
      // Constrain grid-to-battery flow by the energy balance
      gridToBattery = Math.max(gridToBattery, batteryOverflow - productionToBattery);
    }
    
    // Define all possible flows with colors
    // Green: Good (production to load/battery, battery to load)
    // Yellow: Warning (exporting to grid, grid charging battery)
    // Red: Bad (importing from grid to load)
    const threshold = 0;
    const batteryToLoadThreshold = 10;
    const flows = [
      { id: 'production-to-load', from: productionPos, to: loadPos, power: productionToLoad, color: '#4caf50', threshold },
      { id: 'production-to-battery', from: productionPos, to: batteryPos, power: productionToBattery, color: '#4caf50', threshold },
      { id: 'battery-to-load', from: batteryPos, to: loadPos, power: batteryToLoad, color: '#4caf50', threshold: batteryToLoadThreshold },
      { id: 'grid-to-load', from: gridPos, to: loadPos, power: gridToLoad, color: '#f44336', threshold },
      { id: 'grid-to-battery', from: gridPos, to: batteryPos, power: gridToBattery, color: '#ffeb3b', threshold },
      { id: 'production-to-grid', from: productionPos, to: gridPos, power: productionToGrid, color: '#ffeb3b', threshold }
    ];
    
    // Update or create flows
    flows.forEach(flow => {
      if (flow.power > flow.threshold) {
        this._updateOrCreateFlow(flowLayer, flow.id, flow.from, flow.to, flow.power, flow.color);
      } else {
        this._fadeOutFlow(flowLayer, flow.id);
      }
    });
  }

  _startFlowAnimationLoop() {
    const animate = (timestamp) => {
      if (!this._lastAnimationTime) {
        this._lastAnimationTime = timestamp;
      }
      
      const deltaTime = timestamp - this._lastAnimationTime;
      this._lastAnimationTime = timestamp;
      
      // Update all flow dots
      this._flowDots.forEach((dotStates, flowId) => {
        const path = this.querySelector(`#path-${flowId}`);
        
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
                  dot.setAttribute('cx', point.x);
                  dot.setAttribute('cy', point.y);
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

  _updateOrCreateFlow(flowLayer, flowId, from, to, power, color) {
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
      glowPath.setAttribute('stroke-opacity', opacity * 0.5);
      glowPath.setAttribute('stroke-width', strokeWidth * 2);
      glowPath.setAttribute('style', 'transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;');
      glowPath.id = `glow-${flowId}`;
      flowGroup.appendChild(glowPath);
      
      // Create main path on top
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'flow-line');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-opacity', opacity);
      path.setAttribute('stroke-width', strokeWidth);
      path.setAttribute('style', 'transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;');
      path.id = `path-${flowId}`;
      flowGroup.appendChild(path);
      
      // Create multiple dots with staggered starting positions
      const dotStates = [];
      for (let i = 0; i < this._dotsPerFlow; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'flow-dot');
        circle.setAttribute('id', `dot-${flowId}-${i}`);
        circle.setAttribute('r', dotRadius);
        circle.setAttribute('fill', color);
        circle.setAttribute('opacity', opacity);
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
        glowPath.setAttribute('stroke-opacity', opacity * 0.5);
        glowPath.setAttribute('stroke-width', strokeWidth * 2);
        
        // Update main path
        path.setAttribute('d', d);
        path.setAttribute('stroke-opacity', opacity);
        path.setAttribute('stroke-width', strokeWidth);
      }
      
      // Update all dots' appearance and velocity
      const dotStates = this._flowDots.get(flowId);
      if (dotStates) {
        dotStates.forEach((dotState, dotIndex) => {
          const dot = flowGroup.querySelector(`#dot-${flowId}-${dotIndex}`);
          if (dot) {
            dot.setAttribute('r', dotRadius);
            dot.setAttribute('opacity', opacity);
            dot.setAttribute('fill', color);
          }
          
          // Update velocity (preserves progress)
          dotState.velocity = velocity;
        });
      }
    }
  }

  _removeFlow(flowLayer, flowId) {
    const flowGroup = flowLayer.querySelector(`#${flowId}`);
    if (flowGroup) {
      flowGroup.remove();
    }
    
    // Remove dot state
    this._flowDots.delete(flowId);
  }

  _fadeOutFlow(flowLayer, flowId) {
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
        iconSourceFO.style.display = 'none';
        return;
      }
      
      // Try multiple times with increasing delays
      const attemptExtraction = (attempt = 0, maxAttempts = 10) => {
        const delay = attempt * 100; // 0ms, 100ms, 200ms, 300ms, etc.
        
        setTimeout(() => {
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
              iconSourceFO.style.display = 'none';
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
      };
      
      // Start extraction attempts
      attemptExtraction();
    });
    
    this._iconsExtracted = true;
  }

  _renderIconPath(container, pathData) {
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

  _drawFlow(flowLayer, from, to, power, isPositive) {
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
}

// Register custom element
customElements.define("energy-flow-card", EnergyFlowCard);

// Register in card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: "energy-flow-card",
  name: "Energy Flow Card",
  description: "A test energy-flow card."
});
