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
        { name: "load_entity", label: "Load", required: true, selector: { entity: { domain: "sensor", device_class: "power" } } },
        { name: "load_name", selector: { entity_name: {} }, context: { entity: "load_entity" } },
        { name: "load_icon", selector: { icon: {} }, context: { icon_entity: "load_entity" } },
        { name: "production_entity", label: "Production", required: true, selector: { entity: { domain: "sensor", device_class: "power" } } },
        { name: "production_name", selector: { entity_name: {} }, context: { entity: "production_entity" } },
        { name: "production_icon", selector: { icon: {} }, context: { icon_entity: "production_entity" } },
        { name: "battery_entity", label: "Battery", required: true, selector: { entity: { domain: "sensor", device_class: "power" } } },
        { name: "battery_name", selector: { entity_name: {} }, context: { entity: "battery_entity" } },
        { name: "battery_icon", selector: { icon: {} }, context: { icon_entity: "battery_entity" } },
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

    this.innerHTML = `
      <ha-card>
        <style>
          .energy-flow-container {
            padding: 24px;
            position: relative;
            background: var(--card-background-color, #fff);
          }
          .node {
            text-align: center;
            padding: 12px;
            border-radius: 8px;
            background: var(--primary-background-color);
            border: 2px solid var(--divider-color);
            position: relative;
            z-index: 10;
          }
          .node-icon {
            font-size: 24px;
            margin-bottom: 8px;
            color: var(--primary-text-color);
          }
          .node-label {
            font-size: 12px;
            color: var(--secondary-text-color);
            margin-bottom: 4px;
          }
          .node-value {
            font-size: 18px;
            font-weight: 600;
            color: var(--primary-text-color);
          }
          .node-unit {
            font-size: 12px;
            color: var(--secondary-text-color);
            margin-left: 2px;
          }
          svg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
          }
          .flow-line {
            fill: none;
            stroke-width: 3;
            stroke-linecap: round;
          }
          .flow-positive { stroke: var(--success-color, #4caf50); }
          .flow-negative { stroke: var(--error-color, #f44336); }
          .flow-dot {
            r: 4;
          }
          @keyframes flow {
            0% { offset-distance: 0%; opacity: 1; }
            100% { offset-distance: 100%; opacity: 0; }
          }
          .animated-dot {
            animation: flow 2s linear infinite;
          }
        </style>
        <div class="energy-flow-container" style="height: 400px; display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; gap: 16px;">
          <svg id="flow-svg"></svg>
          
          <!-- Production/Solar (top center) -->
          <div class="node" style="grid-column: 2; grid-row: 1;" id="production-node">
            <ha-icon icon="${this._getIcon('production_icon', 'production_entity', 'mdi:solar-power')}" class="node-icon"></ha-icon>
            <div class="node-label">${this._getDisplayName('production_name', 'production_entity', 'Production')}</div>
            <div class="node-value">${Math.abs(production).toFixed(0)}<span class="node-unit">W</span></div>
          </div>

          <!-- Battery (left center) -->
          <div class="node" style="grid-column: 1; grid-row: 2;" id="battery-node">
            <ha-icon icon="${this._getIcon('battery_icon', 'battery_entity', 'mdi:battery')}" class="node-icon"></ha-icon>
            <div class="node-label">${this._getDisplayName('battery_name', 'battery_entity', 'Battery')}</div>
            <div class="node-value">${Math.abs(battery).toFixed(0)}<span class="node-unit">W</span></div>
          </div>

          <!-- Load (right center) -->
          <div class="node" style="grid-column: 3; grid-row: 2;" id="load-node">
            <ha-icon icon="${this._getIcon('load_icon', 'load_entity', 'mdi:home-lightning-bolt')}" class="node-icon"></ha-icon>
            <div class="node-label">${this._getDisplayName('load_name', 'load_entity', 'Load')}</div>
            <div class="node-value">${Math.abs(load).toFixed(0)}<span class="node-unit">W</span></div>
          </div>

          <!-- Grid (bottom center) -->
          <div class="node" style="grid-column: 2; grid-row: 3;" id="grid-node">
            <ha-icon icon="${this._getIcon('grid_icon', 'grid_entity', 'mdi:transmission-tower')}" class="node-icon"></ha-icon>
            <div class="node-label">${this._getDisplayName('grid_name', 'grid_entity', 'Grid')}</div>
            <div class="node-value">${Math.abs(grid).toFixed(0)}<span class="node-unit">W</span></div>
          </div>
        </div>
      </ha-card>
    `;

    // Store values for resize handler
    this._lastValues = { grid, production, load, battery };

    // Draw flow lines after DOM is ready
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

  _drawFlows(grid, production, load, battery) {
    const svg = this.querySelector('#flow-svg');
    if (!svg) return;

    const gridNode = this.querySelector('#grid-node');
    const productionNode = this.querySelector('#production-node');
    const loadNode = this.querySelector('#load-node');
    const batteryNode = this.querySelector('#battery-node');

    if (!gridNode || !productionNode || !loadNode || !batteryNode) return;

    const getCenter = (el) => {
      const rect = el.getBoundingClientRect();
      const containerRect = svg.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top
      };
    };

    const gridPos = getCenter(gridNode);
    const productionPos = getCenter(productionNode);
    const loadPos = getCenter(loadNode);
    const batteryPos = getCenter(batteryNode);

    svg.innerHTML = '';

    // Energy flow logic:
    // Sources: Production (solar), Grid (import), Battery (discharge)
    // Sinks: Load (always), Battery (charge), Grid (export)
    
    // Available energy sources
    let availableProduction = Math.max(0, production);
    let gridImport = Math.max(0, grid);
    let batteryDischarge = Math.max(0, battery);
    
    // Energy demands
    let remainingLoad = Math.abs(load);
    let batteryCharge = Math.max(0, -battery);
    let gridExport = Math.max(0, -grid);
    
    // Priority 1: Production serves load first
    if (availableProduction > 0 && remainingLoad > 0) {
      const toLoad = Math.min(availableProduction, remainingLoad);
      this._drawFlow(svg, productionPos, loadPos, toLoad, true);
      availableProduction -= toLoad;
      remainingLoad -= toLoad;
    }
    
    // Priority 2: Production charges battery (if excess and battery is charging)
    if (availableProduction > 0 && batteryCharge > 0) {
      const toBattery = Math.min(availableProduction, batteryCharge);
      this._drawFlow(svg, productionPos, batteryPos, toBattery, true);
      availableProduction -= toBattery;
      batteryCharge -= toBattery;
    }
    
    // Priority 3: Production exports to grid (if still excess)
    if (availableProduction > 0 && gridExport > 0) {
      const toGrid = Math.min(availableProduction, gridExport);
      this._drawFlow(svg, productionPos, gridPos, toGrid, true);
      availableProduction -= toGrid;
      gridExport -= toGrid;
    }
    
    // Priority 4: Battery discharge serves remaining load
    if (batteryDischarge > 0 && remainingLoad > 0) {
      const toLoad = Math.min(batteryDischarge, remainingLoad);
      this._drawFlow(svg, batteryPos, loadPos, toLoad, true);
      batteryDischarge -= toLoad;
      remainingLoad -= toLoad;
    }
    
    // Priority 5: Battery exports to grid (rare case)
    if (batteryDischarge > 0 && gridExport > 0) {
      const toGrid = Math.min(batteryDischarge, gridExport);
      this._drawFlow(svg, batteryPos, gridPos, toGrid, true);
      batteryDischarge -= toGrid;
      gridExport -= toGrid;
    }
    
    // Priority 6: Grid import serves remaining load
    if (gridImport > 0 && remainingLoad > 0) {
      const toLoad = Math.min(gridImport, remainingLoad);
      this._drawFlow(svg, gridPos, loadPos, toLoad, true);
      gridImport -= toLoad;
      remainingLoad -= toLoad;
    }
    
    // Priority 7: Grid charges battery (if importing and battery charging)
    if (gridImport > 0 && batteryCharge > 0) {
      const toBattery = Math.min(gridImport, batteryCharge);
      this._drawFlow(svg, gridPos, batteryPos, toBattery, true);
      gridImport -= toBattery;
      batteryCharge -= toBattery;
    }
  }

  _drawFlow(svg, from, to, power, isPositive) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    
    // Curved path
    const d = `M ${from.x},${from.y} Q ${midX},${midY} ${to.x},${to.y}`;
    path.setAttribute('d', d);
    path.setAttribute('class', `flow-line ${isPositive ? 'flow-positive' : 'flow-negative'}`);
    path.setAttribute('id', `path-${Math.random()}`);
    
    svg.appendChild(path);

    // Animate dots along path
    const numDots = Math.min(Math.max(Math.floor(power / 500), 1), 5);
    for (let i = 0; i < numDots; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', `flow-dot ${isPositive ? 'flow-positive' : 'flow-negative'}`);
      circle.setAttribute('r', '4');
      
      const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
      animateMotion.setAttribute('dur', '2s');
      animateMotion.setAttribute('repeatCount', 'indefinite');
      animateMotion.setAttribute('begin', `${i * 0.4}s`);
      
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
