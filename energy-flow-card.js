customElements.define("energy-flow-card", class extends HTMLElement {
  constructor() {
    super();
    this._resizeObserver = null;
    this._animationFrameId = null;
    this._flowDots = new Map(); // Store dot states: flowId -> array of { progress: 0-1, velocity: units/sec }
    this._lastAnimationTime = null;
    
    // Animation speed multiplier (higher = faster dots)
    this._speedMultiplier = 1.0;
    
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
        { name: "invert_battery", label: "Invert Battery Power", selector: { boolean: {} } }
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
    
    // Start animation loop
    this._startAnimationLoop();
  }

  disconnectedCallback() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    
    // Stop animation loop
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
    
    // Invert battery if configured
    if (this._config.invert_battery) {
      battery = -battery;
    }

    // Get min/max values with defaults
    const gridMin = this._config.grid_min ?? -5000;
    const gridMax = this._config.grid_max ?? 5000;
    const loadMax = this._config.load_max ?? 5000;
    const productionMax = this._config.production_max ?? 5000;
    const batteryMin = this._config.battery_min ?? -5000;
    const batteryMax = this._config.battery_max ?? 5000;

    // Only do full render if structure doesn't exist
    if (!this.querySelector('.energy-flow-svg')) {
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
            .meter-group {
              transition: filter 0.8s ease-in-out;
            }
            .meter-group.zero {
              filter: brightness(0.7);
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
              ${this._createSVGMeter('production', production, 0, productionMax, false, this._getDisplayName('production_name', 'production_entity', 'Production'))}
            </g>
            
            <!-- Battery Meter (middle left, offset right) -->
            <g id="battery-meter" class="meter-group" transform="translate(${this._meterPositions.battery.x}, ${this._meterPositions.battery.y})">
              ${this._createSVGMeter('battery', battery, batteryMin, batteryMax, true, this._getDisplayName('battery_name', 'battery_entity', 'Battery'))}
            </g>
            
            <!-- Grid Meter (bottom left) -->
            <g id="grid-meter" class="meter-group" transform="translate(${this._meterPositions.grid.x}, ${this._meterPositions.grid.y})">
              ${this._createSVGMeter('grid', grid, gridMin, gridMax, true, this._getDisplayName('grid_name', 'grid_entity', 'Grid'))}
            </g>
            
            <!-- Load Meter (right, 2x size) -->
            <g id="load-meter" class="meter-group" transform="translate(${this._meterPositions.load.x}, ${this._meterPositions.load.y}) scale(2)">
              ${this._createSVGMeter('load', load, 0, loadMax, false, this._getDisplayName('load_name', 'load_entity', 'Load'))}
            </g>
          </svg>
          </div>
        </ha-card>
      `;
    } else {
      // Update existing meters
      this._updateMeter('production', production, 0, productionMax, false, this._getDisplayName('production_name', 'production_entity', 'Production'));
      this._updateMeter('battery', battery, batteryMin, batteryMax, true, this._getDisplayName('battery_name', 'battery_entity', 'Battery'));
      this._updateMeter('grid', grid, gridMin, gridMax, true, this._getDisplayName('grid_name', 'grid_entity', 'Grid'));
      this._updateMeter('load', load, 0, loadMax, false, this._getDisplayName('load_name', 'load_entity', 'Load'));
      
      // Update meter dimming based on zero values
      this._updateMeterDimming('production', production);
      this._updateMeterDimming('battery', battery);
      this._updateMeterDimming('grid', grid);
      this._updateMeterDimming('load', load);
    }

    // Store values for resize handler and draw flows
    this._lastValues = { grid, production, load, battery };
    
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
    return ``;
  }

  _createSVGMeter(id, value, min, max, bidirectional, label) {
    const radius = 50;
    const boxWidth = 120;
    const boxHeight = 135;
    const boxRadius = 16;
    const centerX = boxWidth / 2;
    const centerY = radius + 25;
    
    // Offset to center the circle at origin (0,0)
    const offsetX = -centerX;
    const offsetY = -centerY;
    
    // Calculate percentage and angle for needle
    let percentage, angle;
    
    if (bidirectional) {
      const range = max - min;
      percentage = (value - min) / range;
      angle = 180 - (percentage * 180);
    } else {
      percentage = Math.min(Math.max(value / max, 0), 1);
      angle = 180 - (percentage * 180);
    }
    
    // Generate tick marks
    const ticks = bidirectional ? [min, 0, max] : [0, max/2, max];
    const tickMarks = ticks.map((tickValue) => {
      const tickPercentage = bidirectional 
        ? (tickValue - min) / (max - min)
        : tickValue / max;
      const tickAngle = 180 - (tickPercentage * 180);
      const tickRad = (tickAngle * Math.PI) / 180;
      const tickStartR = radius;
      const tickEndR = radius - 8;
      
      const x1 = centerX + tickStartR * Math.cos(tickRad);
      const y1 = centerY - tickStartR * Math.sin(tickRad);
      const x2 = centerX + tickEndR * Math.cos(tickRad);
      const y2 = centerY - tickEndR * Math.sin(tickRad);
      
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgb(160, 160, 160)" stroke-width="2" />`;
    }).join('');
    
    // Zero line (always present)
    const zeroPercentage = bidirectional ? (0 - min) / (max - min) : 0;
    const zeroAngle = 180 - (zeroPercentage * 180);
    const zeroRad = (zeroAngle * Math.PI) / 180;
    const zeroX1 = centerX;
    const zeroY1 = centerY;
    const zeroX2 = centerX + radius * Math.cos(zeroRad);
    const zeroY2 = centerY - radius * Math.sin(zeroRad);
    const zeroLine = `<line x1="${zeroX1}" y1="${zeroY1}" x2="${zeroX2}" y2="${zeroY2}" stroke="rgb(100, 100, 100)" stroke-width="2" />`;
    
    // Needle position
    const needleRad = (angle * Math.PI) / 180;
    const needleLength = radius - 5;
    const needleX = centerX + needleLength * Math.cos(needleRad);
    const needleY = centerY - needleLength * Math.sin(needleRad);
    
    const clipHeight = centerY + 5;
    const valueY = centerY + (radius * 0.5);
    const unitsY = centerY + (radius * 0.7);
    const fontSize = 16;
    const unitsFontSize = 8;
    const labelFontSize = 12;
    
    return `
      <g transform="translate(${offsetX}, ${offsetY})">
        <defs>
          <clipPath id="clip-${id}-local">
            <rect x="0" y="0" width="${boxWidth}" height="${clipHeight + 2}" />
          </clipPath>
        </defs>
        
        <rect x="0" y="0" width="${boxWidth}" height="${boxHeight}" rx="${boxRadius}" ry="${boxRadius}" fill="rgb(40, 40, 40)" />
        
        <g clip-path="url(#clip-${id}-local)">
          <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="rgb(70, 70, 70)" />
          ${zeroLine}
        </g>
        
        ${tickMarks}
        
        <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="rgb(160, 160, 160)" stroke-width="2" />
        
        <text x="${centerX}" y="15" text-anchor="middle" font-size="${labelFontSize}" fill="rgb(255, 255, 255)" font-weight="500">${label}</text>
        
        <line id="needle-${id}" x1="${centerX}" y1="${centerY}" x2="${needleX}" y2="${needleY}" stroke="rgb(255, 255, 255)" stroke-width="2" stroke-linecap="round" />
        
        <circle cx="${centerX}" cy="${centerY}" r="3" fill="rgb(255, 255, 255)" />
        
        <text id="value-${id}" x="${centerX}" y="${valueY}" text-anchor="middle" font-size="${fontSize}" fill="rgb(255, 255, 255)" font-weight="600">${value.toFixed(0)}${value < 0 ? '\u00A0' : ''}</text>
        
        <text x="${centerX}" y="${unitsY}" text-anchor="middle" font-size="${unitsFontSize}" fill="rgb(160, 160, 160)" font-weight="400" letter-spacing="0.5">WATTS</text>
      </g>
    `;
  }

  _updateMeter(id, value, min, max, bidirectional, label) {
    const radius = 50;
    const boxWidth = 120;
    const centerX = boxWidth / 2;
    const centerY = radius + 25;
    
    // Calculate percentage and angle for needle
    let percentage, angle;
    
    if (bidirectional) {
      const range = max - min;
      percentage = (value - min) / range;
      angle = 180 - (percentage * 180);
    } else {
      percentage = Math.min(Math.max(value / max, 0), 1);
      angle = 180 - (percentage * 180);
    }
    
    // Needle position
    const needleRad = (angle * Math.PI) / 180;
    const needleLength = radius - 5;
    const needleX = centerX + needleLength * Math.cos(needleRad);
    const needleY = centerY - needleLength * Math.sin(needleRad);
    
    // Update needle
    const needle = this.querySelector(`#needle-${id}`);
    if (needle) {
      needle.setAttribute('x2', needleX);
      needle.setAttribute('y2', needleY);
    }
    
    // Update value text
    const valueText = this.querySelector(`#value-${id}`);
    if (valueText) {
      valueText.textContent = value.toFixed(0) + (value < 0 ? '\u00A0' : '');
    }
  }

  _updateMeterDimming(id, value) {
    const meterGroup = this.querySelector(`#${id}-meter`);
    if (meterGroup) {
      // Consider value at zero if it's within ±0.5W
      const isZero = Math.abs(value) < 0.5;
      meterGroup.classList.toggle('zero', isZero);
    }
  }

  _createAnalogMeter(id, value, min, max, bidirectional, isHub, label, icon) {
    // Classic volt-meter style: full semicircle (180°) on top half
    const radius = isHub ? 65 : 50;
    const padding = 5; // Minimal padding
    const labelHeight = 20; // Space for label at top
    const width = (radius * 2) + (padding * 2);
    const centerX = radius + padding;
    const centerY = radius + padding + labelHeight; // Offset circle down to make room for label
    const fullHeight = radius * 2 + (padding * 2) + labelHeight;
    const startAngle = 180;  // degrees (left side, 9 o'clock)
    const endAngle = 0;      // degrees (right side, 3 o'clock)
    const totalAngle = 180;  // Full semicircle
    
    // Calculate percentage and angle for needle
    let percentage, angle, isNegative;
    
    if (bidirectional) {
      // Bidirectional meter (grid, battery): min on left, 0 at top, max on right
      const range = max - min;
      percentage = (value - min) / range;
      angle = startAngle - (percentage * totalAngle); // 180° down to 0°
      isNegative = value < 0;
    } else {
      // Unidirectional meter (production, load): 0 on left, max on right
      percentage = Math.min(Math.max(value / max, 0), 1);
      angle = startAngle - (percentage * totalAngle); // 180° down to 0°
      isNegative = false;
    }
    
    // Generate only 3 tick marks: min, zero/mid, max
    const ticks = bidirectional ? [min, 0, max] : [0, max/2, max];
    
    const tickMarks = ticks.map((tickValue) => {
      const tickPercentage = bidirectional 
        ? (tickValue - min) / (max - min)
        : tickValue / max;
      const tickAngle = startAngle - (tickPercentage * totalAngle);
      const tickRad = (tickAngle * Math.PI) / 180;
      const tickStartR = radius;
      const tickEndR = radius - 8;
      
      const x1 = centerX + tickStartR * Math.cos(tickRad);
      const y1 = centerY - tickStartR * Math.sin(tickRad);
      const x2 = centerX + tickEndR * Math.cos(tickRad);
      const y2 = centerY - tickEndR * Math.sin(tickRad);
      
      return `<line class="meter-tick" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
    }).join('');
    
    // Needle position
    const needleRad = (angle * Math.PI) / 180;
    const needleLength = radius - 5;
    const needleX = centerX + needleLength * Math.cos(needleRad);
    const needleY = centerY - needleLength * Math.sin(needleRad);
    
    // Background: full circle (gray)
    const circleRadius = radius;
    
    // Clip height: just under the center point
    const clipHeight = centerY + 5;
    
    // Text positioning in lower half (relative to circle size)
    const valueY = centerY + (radius * 0.5); // Value number position
    const unitsY = centerY + (radius * 0.7); // "WATTS" below the value
    const fontSize = isHub ? 20 : 16;
    const unitsFontSize = isHub ? 10 : 8;
    
    // Label positioning above the meter
    const labelY = 8; // Near top edge
    const labelFontSize = isHub ? 14 : 12;
    
    return `
      <svg class="analog-meter" viewBox="0 0 ${width} ${fullHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="clip-${id}">
            <rect x="0" y="0" width="${width}" height="${clipHeight}" />
          </clipPath>
        </defs>
        
        <!-- Clipped content (background fill only) -->
        <g clip-path="url(#clip-${id})">
          <circle class="meter-circle-background" cx="${centerX}" cy="${centerY}" r="${circleRadius}" />
        </g>
        
        <!-- Unclipped full circle outline -->
        <circle class="meter-circle-outline" cx="${centerX}" cy="${centerY}" r="${circleRadius}" />
        
        <!-- Label at top -->
        <text class="meter-label-text" x="${centerX}" y="${labelY}" text-anchor="middle" font-size="${labelFontSize}" dominant-baseline="hanging">${label}</text>
        
        <!-- Tick marks (no labels) -->
        ${tickMarks}
        
        <!-- Needle -->
        <line class="meter-needle meter-needle-line" 
              x1="${centerX}" y1="${centerY}" 
              x2="${needleX}" y2="${needleY}" />
        
        <!-- Pivot dot -->
        <circle class="meter-pivot-dot" cx="${centerX}" cy="${centerY}" r="3" />
        
        <!-- Value number -->
        <text class="meter-value-text" x="${centerX}" y="${valueY}" text-anchor="middle" font-size="${fontSize}">${value.toFixed(0)}</text>
        
        <!-- Units label -->
        <text class="meter-units-text" x="${centerX}" y="${unitsY}" text-anchor="middle" font-size="${unitsFontSize}">WATTS</text>
      </svg>
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
    
    // 6. If grid is importing and battery charging, grid can charge battery
    if (gridFlow > 0 && batteryFlow < 0) {
      const batteryNeed = Math.abs(batteryFlow) - productionToBattery;
      if (batteryNeed > 0) {
        gridToBattery = Math.min(gridFlow - gridToLoad, batteryNeed);
      }
    }
    
    // Define all possible flows with colors
    // Green: Good (production to load/battery, battery to load)
    // Yellow: Warning (exporting to grid, grid charging battery)
    // Red: Bad (importing from grid to load)
    const threshold = 100;
    const flows = [
      { id: 'production-to-load', from: productionPos, to: loadPos, power: productionToLoad, color: '#4caf50' },
      { id: 'production-to-battery', from: productionPos, to: batteryPos, power: productionToBattery, color: '#4caf50' },
      { id: 'battery-to-load', from: batteryPos, to: loadPos, power: batteryToLoad, color: '#4caf50' },
      { id: 'grid-to-load', from: gridPos, to: loadPos, power: gridToLoad, color: '#f44336' },
      { id: 'grid-to-battery', from: gridPos, to: batteryPos, power: gridToBattery, color: '#ffeb3b' },
      { id: 'production-to-grid', from: productionPos, to: gridPos, power: productionToGrid, color: '#ffeb3b' }
    ];
    
    // Update or create flows
    flows.forEach(flow => {
      if (flow.power > threshold) {
        this._updateOrCreateFlow(flowLayer, flow.id, flow.from, flow.to, flow.power, flow.color);
      } else {
        this._removeFlow(flowLayer, flow.id);
      }
    });
  }

  _startAnimationLoop() {
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
    // Opacity: 0-100W = 50%, 100-200W = 50% to 100%
    let opacity;
    if (power <= 100) {
      opacity = 0.5;
    } else if (power <= 200) {
      opacity = 0.5 + ((power - 100) / 100) * 0.5; // 0.5 to 1.0
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
    const baseDotRadius = 1.5;
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
      
      // Create path with d attribute set immediately (reuse d from velocity calculation)
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'flow-line');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-opacity', opacity);
      path.setAttribute('stroke-width', strokeWidth);
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
        flowGroup.appendChild(circle);
        
        // Stagger dots evenly along the path
        const startProgress = i / this._dotsPerFlow;
        dotStates.push({ progress: startProgress, velocity });
      }
      
      // Initialize dot states array
      this._flowDots.set(flowId, dotStates);
    } else {
      // Update existing flow
      const path = flowGroup.querySelector('path');
      if (path) {
        const controlX = (from.x + to.x) / 2;
        const controlY = (from.y + to.y) / 2;
        const d = `M ${from.x},${from.y} Q ${controlX},${controlY} ${to.x},${to.y}`;
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
});

// Register in card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: "energy-flow-card",
  name: "Energy Flow Card",
  description: "A test energy-flow card."
});
