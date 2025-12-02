customElements.define("energy-flow-card", class extends HTMLElement {
  constructor() {
    super();
    this._resizeObserver = null;
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
  }

  disconnectedCallback() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
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

    this.innerHTML = `
      <ha-card>
        <style>
          .energy-flow-container {
            padding: 32px;
            position: relative;
            background: var(--card-background-color, #fff);
            display: flex;
            align-items: center;
            gap: 32px;
          }
          .sources-column {
            display: flex;
            flex-direction: column;
            gap: 24px;
            flex: 0 0 180px;
          }
          .hub-column {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
          }
          .meter {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            position: relative;
          }
          .meter.hub {
            transform: scale(1.4);
          }
          .meter-label {
            font-size: 12px;
            font-weight: 500;
            color: var(--primary-text-color);
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .meter-label ha-icon {
            --mdc-icon-size: 16px;
          }
          .meter.hub .meter-label {
            font-size: 14px;
          }
          .meter.hub .meter-label ha-icon {
            --mdc-icon-size: 20px;
          }
          .meter-value {
            font-size: 18px;
            font-weight: 600;
            color: var(--primary-text-color);
            margin-top: 4px;
          }
          .meter.hub .meter-value {
            font-size: 24px;
          }
          .meter-unit {
            font-size: 12px;
            color: var(--secondary-text-color);
            margin-left: 4px;
          }
          .analog-meter {
            position: relative;
            width: 140px;
            height: 120px;
            overflow: visible;
          }
          .meter.hub .analog-meter {
            width: 180px;
            height: 150px;
            overflow: visible;
          }
          .meter-circle-background {
            fill: var(--divider-color);
            opacity: 0.3;
          }
          .meter-circle-outline {
            fill: none;
            stroke: var(--secondary-text-color);
            stroke-width: 2;
            opacity: 0.6;
          }
          .meter-value-text {
            fill: var(--primary-text-color);
            font-size: 16px;
            font-weight: 600;
          }
          .meter-units-text {
            fill: var(--secondary-text-color);
            font-size: 8px;
            font-weight: 400;
            letter-spacing: 0.5px;
            opacity: 0.6;
          }
          .meter.hub .meter-value-text {
            font-size: 20px;
          }
          .meter.hub .meter-units-text {
            font-size: 10px;
          }
          .meter-needle-line {
            stroke: var(--primary-text-color);
            stroke-width: 2;
            stroke-linecap: round;
          }
          .meter-pivot-dot {
            fill: var(--primary-text-color);
          }
          .meter-tick {
            stroke: var(--secondary-text-color);
            stroke-width: 1;
            opacity: 0.5;
          }
          .meter-tick-label {
            fill: var(--secondary-text-color);
            font-size: 9px;
            text-anchor: middle;
          }
          svg.flow-lines {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
          }
          .flow-line {
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            opacity: 0.6;
          }
          .flow-positive { stroke: var(--success-color, #4caf50); }
          .flow-negative { stroke: var(--error-color, #f44336); }
          .flow-dot {
            r: 3;
          }
        </style>
        <div class="energy-flow-container" style="height: 500px;">
          <svg class="flow-lines" id="flow-svg"></svg>
          
          <!-- Sources Column (Left) -->
          <div class="sources-column">
            <!-- Production Meter (top) -->
            <div class="meter" id="production-meter">
              <div class="meter-label">
                <ha-icon icon="${this._getIcon('production_icon', 'production_entity', 'mdi:solar-power')}"></ha-icon>
                ${this._getDisplayName('production_name', 'production_entity', 'Production')}
              </div>
              ${this._createAnalogMeter('production', production, 0, productionMax, false, false)}
            </div>
            
            <!-- Grid Meter (middle) -->
            <div class="meter" id="grid-meter">
              <div class="meter-label">
                <ha-icon icon="${this._getIcon('grid_icon', 'grid_entity', 'mdi:transmission-tower')}"></ha-icon>
                ${this._getDisplayName('grid_name', 'grid_entity', 'Grid')}
              </div>
              ${this._createAnalogMeter('grid', grid, gridMin, gridMax, true, false)}
            </div>
            
            <!-- Battery Meter (bottom) -->
            <div class="meter" id="battery-meter">
              <div class="meter-label">
                <ha-icon icon="${this._getIcon('battery_icon', 'battery_entity', 'mdi:battery')}"></ha-icon>
                ${this._getDisplayName('battery_name', 'battery_entity', 'Battery')}
              </div>
              ${this._createAnalogMeter('battery', battery, batteryMin, batteryMax, true, false)}
            </div>
          </div>
          
          <!-- Hub Column (Right) - Load Meter -->
          <div class="hub-column">
            <div class="meter hub" id="load-meter">
              <div class="meter-label">
                <ha-icon icon="${this._getIcon('load_icon', 'load_entity', 'mdi:home-lightning-bolt')}"></ha-icon>
                ${this._getDisplayName('load_name', 'load_entity', 'Load')}
              </div>
              ${this._createAnalogMeter('load', load, 0, loadMax, false, true)}
            </div>
          </div>
        </div>
      </ha-card>
    `;

    // Store values for resize handler and draw flows
    this._lastValues = { grid, production, load, battery };
    requestAnimationFrame(() => this._drawFlows(grid, production, load, battery));
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

  _createAnalogMeter(id, value, min, max, bidirectional, isHub) {
    // Classic volt-meter style: full semicircle (180°) on top half
    const width = isHub ? 180 : 140;
    const height = isHub ? 120 : 100; // Only show top portion
    const radius = isHub ? 65 : 50;
    const centerX = width / 2;
    const centerY = radius + 10; // Circle center (will be partially off-canvas)
    const fullHeight = radius * 2 + 20; // Full height to show complete circle
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
    const svg = this.querySelector('#flow-svg');
    if (!svg) return;

    const productionMeter = this.querySelector('#production-meter');
    const gridMeter = this.querySelector('#grid-meter');
    const batteryMeter = this.querySelector('#battery-meter');
    const loadMeter = this.querySelector('#load-meter');

    if (!productionMeter || !gridMeter || !batteryMeter || !loadMeter) return;

    const getCenter = (el) => {
      const rect = el.getBoundingClientRect();
      const containerRect = svg.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top
      };
    };

    const productionPos = getCenter(productionMeter);
    const gridPos = getCenter(gridMeter);
    const batteryPos = getCenter(batteryMeter);
    const loadPos = getCenter(loadMeter);

    svg.innerHTML = '';

    // Energy flow logic (simplified for now - just show active flows)
    if (production > 100) {
      this._drawFlow(svg, productionPos, loadPos, production, true);
    }
    
    if (grid > 100) {
      this._drawFlow(svg, gridPos, loadPos, grid, true);
    } else if (grid < -100) {
      this._drawFlow(svg, loadPos, gridPos, Math.abs(grid), false);
    }
    
    if (battery > 100) {
      this._drawFlow(svg, batteryPos, loadPos, battery, true);
    } else if (battery < -100) {
      this._drawFlow(svg, loadPos, batteryPos, Math.abs(battery), false);
    }
  }

  _drawFlow(svg, from, to, power, isPositive) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const controlX = (from.x + to.x) / 2;
    const controlY = (from.y + to.y) / 2;
    
    const d = `M ${from.x},${from.y} Q ${controlX},${controlY} ${to.x},${to.y}`;
    path.setAttribute('d', d);
    path.setAttribute('class', `flow-line ${isPositive ? 'flow-positive' : 'flow-negative'}`);
    path.setAttribute('id', `path-${Math.random()}`);
    
    svg.appendChild(path);

    // Animate dots
    const numDots = Math.min(Math.max(Math.floor(power / 1000), 1), 3);
    for (let i = 0; i < numDots; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', `flow-dot ${isPositive ? 'flow-positive' : 'flow-negative'}`);
      circle.setAttribute('r', '3');
      
      const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
      animateMotion.setAttribute('dur', '2s');
      animateMotion.setAttribute('repeatCount', 'indefinite');
      animateMotion.setAttribute('begin', `${i * 0.6}s`);
      
      const mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
      mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${path.id}`);
      
      animateMotion.appendChild(mpath);
      circle.appendChild(animateMotion);
      svg.appendChild(circle);
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
