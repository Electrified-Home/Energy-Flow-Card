(function() {
  "use strict";
  function calculateEnergyFlows(sensors) {
    const productionFlow = Math.max(0, sensors.production);
    const gridFlow = sensors.grid;
    const batteryFlow = sensors.battery;
    const loadDemand = Math.max(0, sensors.load);
    const flows = {
      productionToLoad: 0,
      productionToBattery: 0,
      productionToGrid: 0,
      gridToLoad: 0,
      gridToBattery: 0,
      batteryToLoad: 0
    };
    let remainingProduction = productionFlow;
    let remainingLoad = loadDemand;
    if (remainingProduction > 0 && remainingLoad > 0) {
      flows.productionToLoad = Math.min(remainingProduction, remainingLoad);
      remainingProduction -= flows.productionToLoad;
      remainingLoad -= flows.productionToLoad;
    }
    if (batteryFlow < 0 && remainingProduction > 0) {
      flows.productionToBattery = Math.min(remainingProduction, Math.abs(batteryFlow));
      remainingProduction -= flows.productionToBattery;
    }
    if (batteryFlow > 0 && remainingLoad > 0) {
      flows.batteryToLoad = Math.min(batteryFlow, remainingLoad);
      remainingLoad -= flows.batteryToLoad;
    }
    if (remainingLoad > 0 && gridFlow > 0) {
      flows.gridToLoad = Math.min(gridFlow, remainingLoad);
      remainingLoad -= flows.gridToLoad;
    }
    if (batteryFlow < 0 && gridFlow > 10) {
      const batteryNeed = Math.abs(batteryFlow) - flows.productionToBattery;
      if (batteryNeed > 1) {
        flows.gridToBattery = Math.min(gridFlow - flows.gridToLoad, batteryNeed);
      }
    }
    if (gridFlow < -10) {
      flows.productionToGrid = Math.abs(gridFlow);
    }
    return flows;
  }
  function handleAction(hass, fireEvent, actionConfig, entityId) {
    if (!hass) return;
    const config = actionConfig || { action: "more-info" };
    const action = config.action || "more-info";
    switch (action) {
      case "more-info":
        const entityToShow = config.entity || entityId;
        if (entityToShow) {
          fireEvent("hass-more-info", { entityId: entityToShow });
        }
        break;
      case "navigate":
        if (config.path) {
          history.pushState(null, "", config.path);
          fireEvent("location-changed", { replace: false });
        }
        break;
      case "url":
        if (config.path) {
          window.open(config.path);
        }
        break;
      case "toggle":
        if (entityId) {
          hass.callService("homeassistant", "toggle", { entity_id: entityId });
        }
        break;
      case "call-service":
        if (config.service) {
          const [domain, service] = config.service.split(".");
          hass.callService(domain, service, config.service_data || {}, config.target);
        }
        break;
    }
  }
  function updateSegmentVisibility(segment, pixelWidth, hasValue) {
    if (!segment || !hasValue) {
      segment?.setAttribute("data-width-px", "");
      return;
    }
    const SHOW_LABEL_THRESHOLD = 80;
    const SHOW_ICON_THRESHOLD = 40;
    if (pixelWidth >= SHOW_LABEL_THRESHOLD) {
      segment.setAttribute("data-width-px", "show-label");
    } else if (pixelWidth >= SHOW_ICON_THRESHOLD) {
      segment.setAttribute("data-width-px", "show-icon");
    } else {
      segment.setAttribute("data-width-px", "");
    }
  }
  class CompactRenderer {
    // Dark yellow (export)
    constructor(container, config, hass, viewMode, getIconCallback, handleActionCallback) {
      this.productionColor = "#256028";
      this.batteryColor = "#104b79";
      this.gridColor = "#7a211b";
      this.returnColor = "#7a6b1b";
      this.container = container;
      this.config = config;
      this.hass = hass;
      this.viewMode = viewMode;
      this.getIconCallback = getIconCallback;
      this.handleActionCallback = handleActionCallback;
    }
    /**
     * Render or update the compact view
     */
    render(data) {
      if (!this.container.querySelector(".compact-view") || this.lastViewMode !== this.viewMode) {
        this.initializeStructure();
        this.attachEventHandlers();
        this.lastViewMode = this.viewMode;
      }
      this.updateSegments(data);
    }
    /**
     * Update the view mode
     */
    setViewMode(viewMode) {
      if (this.viewMode !== viewMode) {
        this.viewMode = viewMode;
        this.lastViewMode = void 0;
      }
    }
    /**
     * Initialize the HTML structure
     */
    initializeStructure() {
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
            gap: ${this.viewMode === "compact-battery" ? "12px" : "0"};
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
              <div id="grid-segment" class="bar-segment" style="background: ${this.gridColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback("grid", "mdi:transmission-tower")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="battery-segment" class="bar-segment" style="background: ${this.batteryColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback("battery", "mdi:battery")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="production-segment" class="bar-segment" style="background: ${this.productionColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback("production", "mdi:solar-power")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
            </div>
            <div class="row-value">
              <ha-icon class="row-icon" icon="${this.getIconCallback("load", "mdi:home-lightning-bolt")}"></ha-icon>
              <div class="row-text">
                <span id="load-value-text">0</span><span class="row-unit">W</span>
              </div>
            </div>
          </div>
          ${this.viewMode === "compact-battery" ? `
          <!-- Battery Row -->
          <div class="compact-row" id="battery-row">
            <div class="row-value" id="battery-soc-left" style="display: none;">
              <ha-icon class="row-icon" icon="${this.getIconCallback("battery", "mdi:battery")}"></ha-icon>
              <div class="row-text">
                <span id="battery-soc-text-left">--</span><span class="row-unit">%</span>
              </div>
            </div>
            <div class="bar-container">
              <!-- Color order: red, yellow, blue, green (left to right) -->
              <div id="battery-grid-segment" class="bar-segment" style="background: ${this.gridColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback("grid", "mdi:transmission-tower")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="battery-load-segment" class="bar-segment" style="background: ${this.batteryColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback("load", "mdi:home")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="battery-production-segment" class="bar-segment" style="background: ${this.productionColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback("production", "mdi:solar-power")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
            </div>
            <div class="row-value" id="battery-soc-right">
              <ha-icon class="row-icon" icon="${this.getIconCallback("battery", "mdi:battery")}"></ha-icon>
              <div class="row-text">
                <span id="battery-soc-text-right">--</span><span class="row-unit">%</span>
              </div>
            </div>
          </div>
          ` : ""}
        </div>
      </ha-card>
    `;
    }
    /**
     * Attach click event handlers
     */
    attachEventHandlers() {
      requestAnimationFrame(() => {
        const productionSeg = this.container.querySelector("#production-segment");
        const batterySeg = this.container.querySelector("#battery-segment");
        const gridSeg = this.container.querySelector("#grid-segment");
        const loadValues = this.container.querySelectorAll(".row-value");
        const loadValue = loadValues[0];
        if (productionSeg) {
          productionSeg.addEventListener("click", () => {
            this.handleActionCallback(this.config.production?.tap, this.config.production?.entity);
          });
        }
        if (batterySeg) {
          batterySeg.addEventListener("click", () => {
            this.handleActionCallback(this.config.battery?.tap, this.config.battery?.entity);
          });
        }
        if (gridSeg) {
          gridSeg.addEventListener("click", () => {
            this.handleActionCallback(this.config.grid?.tap, this.config.grid?.entity);
          });
        }
        if (loadValue) {
          loadValue.addEventListener("click", () => {
            this.handleActionCallback(this.config.load.tap, this.config.load.entity);
          });
        }
        if (this.viewMode === "compact-battery") {
          const batteryProdSeg = this.container.querySelector("#battery-production-segment");
          const batteryLoadSeg = this.container.querySelector("#battery-load-segment");
          const batteryGridSeg = this.container.querySelector("#battery-grid-segment");
          const batterySocLeft = this.container.querySelector("#battery-soc-left");
          const batterySocRight = this.container.querySelector("#battery-soc-right");
          if (batteryProdSeg) {
            batteryProdSeg.addEventListener("click", () => {
              this.handleActionCallback(this.config.production?.tap, this.config.production?.entity);
            });
          }
          if (batteryLoadSeg) {
            batteryLoadSeg.addEventListener("click", () => {
              this.handleActionCallback(this.config.load.tap, this.config.load.entity);
            });
          }
          if (batteryGridSeg) {
            batteryGridSeg.addEventListener("click", () => {
              this.handleActionCallback(this.config.grid?.tap, this.config.grid?.entity);
            });
          }
          if (batterySocLeft) {
            batterySocLeft.addEventListener("click", () => {
              this.handleActionCallback(this.config.battery?.tap, this.config.battery?.entity);
            });
          }
          if (batterySocRight) {
            batterySocRight.addEventListener("click", () => {
              this.handleActionCallback(this.config.battery?.tap, this.config.battery?.entity);
            });
          }
        }
      });
    }
    /**
     * Update segment widths and labels
     */
    updateSegments(data) {
      const { load, flows, battery, batterySoc } = data;
      const productionValue = flows.productionToLoad;
      const batteryToLoad = flows.batteryToLoad;
      const gridToLoad = flows.gridToLoad;
      const total = load || 1;
      const productionPercent = productionValue / total * 100;
      const batteryPercent = batteryToLoad / total * 100;
      const gridPercent = gridToLoad / total * 100;
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
      let batteryGridWatts = 0;
      let batteryLoadWatts = 0;
      let batteryProdWatts = 0;
      let visualBatteryGridPercent = 0;
      let visualBatteryLoadPercent = 0;
      let visualBatteryProdPercent = 0;
      if (this.viewMode === "compact-battery") {
        if (battery < 0) {
          const batteryCharging = Math.abs(battery);
          const batteryTotal = batteryCharging || 1;
          batteryGridWatts = flows.gridToBattery;
          batteryProdWatts = flows.productionToBattery;
          const batteryGridPercent = flows.gridToBattery / batteryTotal * 100;
          const batteryProdPercent = flows.productionToBattery / batteryTotal * 100;
          const chargeSum = batteryGridPercent + batteryProdPercent;
          if (chargeSum > 0) {
            const scale = 100 / chargeSum;
            visualBatteryGridPercent = batteryGridPercent * scale;
            visualBatteryProdPercent = batteryProdPercent * scale;
          }
        } else if (battery > 0) {
          const batteryTotal = battery || 1;
          const batteryToGrid = battery - flows.batteryToLoad;
          batteryLoadWatts = flows.batteryToLoad;
          batteryGridWatts = batteryToGrid;
          const batteryLoadPercent = flows.batteryToLoad / batteryTotal * 100;
          const batteryGridPercent = batteryToGrid / batteryTotal * 100;
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
        if (this.viewMode === "compact-battery") {
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
     * Update the load bar segments
     */
    updateLoadBar(visualProductionPercent, visualBatteryPercent, visualGridPercent, productionPercent, batteryPercent, gridPercent, productionValue, batteryToLoad, gridToLoad, load) {
      const productionSegment = this.container.querySelector("#production-segment");
      const batterySegment = this.container.querySelector("#battery-segment");
      const gridSegment = this.container.querySelector("#grid-segment");
      const loadValueText = this.container.querySelector("#load-value-text");
      const barContainer = this.container.querySelector(".bar-container");
      if (productionSegment) {
        productionSegment.style.width = `${visualProductionPercent}%`;
        const label = productionSegment.querySelector(".bar-segment-label");
        if (label && productionValue > 0) {
          label.textContent = `${Math.round(productionPercent)}%`;
        }
        const widthPx = visualProductionPercent / 100 * (barContainer?.clientWidth || 0);
        updateSegmentVisibility(productionSegment, widthPx, productionValue > 0);
      }
      if (batterySegment) {
        batterySegment.style.width = `${visualBatteryPercent}%`;
        const label = batterySegment.querySelector(".bar-segment-label");
        if (label && batteryToLoad > 0) {
          label.textContent = `${Math.round(batteryPercent)}%`;
        }
        const widthPx = visualBatteryPercent / 100 * (barContainer?.clientWidth || 0);
        updateSegmentVisibility(batterySegment, widthPx, batteryToLoad > 0);
      }
      if (gridSegment) {
        gridSegment.style.width = `${visualGridPercent}%`;
        const label = gridSegment.querySelector(".bar-segment-label");
        if (label && gridToLoad > 0) {
          label.textContent = `${Math.round(gridPercent)}%`;
        }
        const widthPx = visualGridPercent / 100 * (barContainer?.clientWidth || 0);
        updateSegmentVisibility(gridSegment, widthPx, gridToLoad > 0);
      }
      if (loadValueText) {
        loadValueText.textContent = String(Math.round(load));
      }
    }
    /**
     * Update the battery bar segments
     */
    updateBatteryBar(visualBatteryGridPercent, visualBatteryLoadPercent, visualBatteryProdPercent, batteryGridWatts, batteryLoadWatts, batteryProdWatts, battery, batterySoc) {
      const batteryGridSegment = this.container.querySelector("#battery-grid-segment");
      const batteryLoadSegment = this.container.querySelector("#battery-load-segment");
      const batteryProdSegment = this.container.querySelector("#battery-production-segment");
      const batterySocLeft = this.container.querySelector("#battery-soc-left");
      const batterySocRight = this.container.querySelector("#battery-soc-right");
      const batterySocTextLeft = this.container.querySelector("#battery-soc-text-left");
      const batterySocTextRight = this.container.querySelector("#battery-soc-text-right");
      const batteryBarContainers = this.container.querySelectorAll(".bar-container");
      const batteryBarContainer = batteryBarContainers[1];
      let gridIsImport = false;
      if (battery < 0) {
        gridIsImport = true;
        if (batterySocLeft) batterySocLeft.style.display = "none";
        if (batterySocRight) batterySocRight.style.display = "flex";
        if (batterySocTextRight && batterySoc !== null) {
          batterySocTextRight.textContent = batterySoc.toFixed(1);
        }
      } else if (battery > 0) {
        gridIsImport = false;
        if (batterySocLeft) batterySocLeft.style.display = "flex";
        if (batterySocRight) batterySocRight.style.display = "none";
        if (batterySocTextLeft && batterySoc !== null) {
          batterySocTextLeft.textContent = batterySoc.toFixed(1);
        }
      } else {
        if (batterySocLeft) batterySocLeft.style.display = "none";
        if (batterySocRight) batterySocRight.style.display = "flex";
        if (batterySocTextRight && batterySoc !== null) {
          batterySocTextRight.textContent = batterySoc.toFixed(1);
        }
      }
      if (batteryGridSegment) {
        const gridColorToUse = gridIsImport ? this.gridColor : this.returnColor;
        batteryGridSegment.style.width = `${visualBatteryGridPercent}%`;
        batteryGridSegment.style.background = gridColorToUse;
        const label = batteryGridSegment.querySelector(".bar-segment-label");
        if (label && batteryGridWatts > 0) {
          label.textContent = `${Math.round(batteryGridWatts)}W`;
        }
        const pixelWidth = visualBatteryGridPercent / 100 * (batteryBarContainer?.offsetWidth || 0);
        updateSegmentVisibility(batteryGridSegment, pixelWidth, batteryGridWatts > 0);
      }
      if (batteryLoadSegment) {
        batteryLoadSegment.style.width = `${visualBatteryLoadPercent}%`;
        const label = batteryLoadSegment.querySelector(".bar-segment-label");
        if (label && batteryLoadWatts > 0) {
          label.textContent = `${Math.round(batteryLoadWatts)}W`;
        }
        const pixelWidth = visualBatteryLoadPercent / 100 * (batteryBarContainer?.offsetWidth || 0);
        updateSegmentVisibility(batteryLoadSegment, pixelWidth, batteryLoadWatts > 0);
      }
      if (batteryProdSegment) {
        batteryProdSegment.style.width = `${visualBatteryProdPercent}%`;
        const label = batteryProdSegment.querySelector(".bar-segment-label");
        if (label && batteryProdWatts > 0) {
          label.textContent = `${Math.round(batteryProdWatts)}W`;
        }
        const pixelWidth = visualBatteryProdPercent / 100 * (batteryBarContainer?.offsetWidth || 0);
        updateSegmentVisibility(batteryProdSegment, pixelWidth, batteryProdWatts > 0);
      }
    }
  }
  class Meter {
    constructor(id, value, min, max, bidirectional, label, icon, units, invertView = false, showPlus = false, tapAction, entityId, fireEventCallback) {
      this.id = id;
      this._value = value;
      this.min = min;
      this.max = max;
      this.bidirectional = bidirectional;
      this.label = label;
      this.icon = icon;
      this.units = units;
      this._invertView = invertView;
      this.showPlus = showPlus;
      this.tapAction = tapAction;
      this.entityId = entityId;
      this.fireEventCallback = fireEventCallback;
      this.element = null;
      this.radius = 50;
      this.boxWidth = 120;
      this.boxHeight = 135;
      this.boxRadius = 16;
      this.centerX = this.boxWidth / 2;
      this.centerY = this.radius + 25;
      this.offsetX = -this.centerX;
      this.offsetY = -this.centerY;
      this.needleState = { target: 0, current: 0, ghost: 0 };
      this._lastAnimationTime = null;
      this._animationFrameId = null;
      this._updateNeedleAngle();
    }
    get value() {
      return this._value;
    }
    set value(newValue) {
      if (this._value === newValue) return;
      this._value = newValue;
      this._updateNeedleAngle();
      if (this.element) {
        const valueText = this.element.querySelector(`#value-${this.id}`);
        if (valueText) {
          valueText.textContent = this._formatValueText();
        }
        this.updateDimming();
      }
    }
    get invertView() {
      return this._invertView;
    }
    set invertView(newInvertView) {
      if (this._invertView === newInvertView) return;
      this._invertView = newInvertView;
      this._updateNeedleAngle();
      if (this.element) {
        const valueText = this.element.querySelector(`#value-${this.id}`);
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
        return valueStr + " ";
      } else if (displayValue > 0 && this.showPlus) {
        return "+" + valueStr + " ";
      } else {
        return valueStr;
      }
    }
    _updateNeedleAngle() {
      let percentage;
      let angle;
      const displayValue = this.displayValue;
      if (this.bidirectional) {
        const range = this.max - this.min;
        percentage = Math.min(Math.max((displayValue - this.min) / range, 0), 1);
        angle = 180 - percentage * 180;
      } else {
        percentage = Math.min(Math.max(displayValue / this.max, 0), 1);
        angle = 180 - percentage * 180;
      }
      this.needleState.target = angle;
    }
    updateDimming() {
      if (!this.element) return;
      const dimmer = this.element.querySelector(`#dimmer-${this.id}`);
      if (dimmer) {
        const isZero = Math.abs(this.value) < 0.5;
        dimmer.setAttribute("opacity", isZero ? "0.3" : "0");
      }
    }
    startAnimation() {
      if (this._animationFrameId) return;
      const animate = (timestamp) => {
        if (!this._lastAnimationTime) {
          this._lastAnimationTime = timestamp;
        }
        const deltaTime = timestamp - this._lastAnimationTime;
        this._lastAnimationTime = timestamp;
        if (!this.element) {
          this._animationFrameId = null;
          return;
        }
        const needleLength = this.radius - 5;
        const mainLerpFactor = Math.min(deltaTime / 150, 1);
        this.needleState.current += (this.needleState.target - this.needleState.current) * mainLerpFactor;
        const ghostLerpFactor = Math.min(deltaTime / 400, 1);
        this.needleState.ghost += (this.needleState.current - this.needleState.ghost) * ghostLerpFactor;
        const maxLag = 10;
        if (this.needleState.ghost < this.needleState.current - maxLag) {
          this.needleState.ghost = this.needleState.current - maxLag;
        } else if (this.needleState.ghost > this.needleState.current + maxLag) {
          this.needleState.ghost = this.needleState.current + maxLag;
        }
        const needle = this.element.querySelector(`#needle-${this.id}`);
        if (needle) {
          const needleRad = this.needleState.current * Math.PI / 180;
          const needleX = this.centerX + needleLength * Math.cos(needleRad);
          const needleY = this.centerY - needleLength * Math.sin(needleRad);
          needle.setAttribute("x2", String(needleX));
          needle.setAttribute("y2", String(needleY));
        }
        const ghostNeedle = this.element.querySelector(`#ghost-needle-${this.id}`);
        if (ghostNeedle) {
          const ghostRad = this.needleState.ghost * Math.PI / 180;
          const ghostX = this.centerX + needleLength * Math.cos(ghostRad);
          const ghostY = this.centerY - needleLength * Math.sin(ghostRad);
          ghostNeedle.setAttribute("x2", String(ghostX));
          ghostNeedle.setAttribute("y2", String(ghostY));
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
    /**
     * Handle tap action when meter is clicked
     */
    _handleTapAction() {
      if (!this.fireEventCallback) return;
      const config = this.tapAction || { action: "more-info" };
      const action = config.action || "more-info";
      switch (action) {
        case "more-info":
          const entityId = config.entity || this.entityId;
          if (entityId) {
            this.fireEventCallback("hass-more-info", { entityId });
          }
          break;
        case "navigate":
          if (config.path) {
            history.pushState(null, "", config.path);
            this.fireEventCallback("location-changed", { replace: false });
          }
          break;
        case "url":
          if (config.path) {
            window.open(config.path);
          }
          break;
        case "toggle":
          if (this.entityId) {
            this.fireEventCallback("call-service", {
              domain: "homeassistant",
              service: "toggle",
              service_data: { entity_id: this.entityId }
            });
          }
          break;
        case "call-service":
          if (config.service) {
            const [domain, service] = config.service.split(".");
            this.fireEventCallback("call-service", {
              domain,
              service,
              service_data: config.service_data || {},
              target: config.target
            });
          }
          break;
      }
    }
    /**
     * Create and return the SVG element for this meter
     */
    /**
     * Create and return the SVG element for this meter
     */
    createElement() {
      const displayValue = this.displayValue;
      let percentage;
      let angle;
      if (this.bidirectional) {
        const range = this.max - this.min;
        percentage = Math.min(Math.max((displayValue - this.min) / range, 0), 1);
        angle = 180 - percentage * 180;
      } else {
        percentage = Math.min(Math.max(displayValue / this.max, 0), 1);
        angle = 180 - percentage * 180;
      }
      this.needleState.target = angle;
      this.needleState.current = angle;
      this.needleState.ghost = angle;
      const ticks = this.bidirectional ? [this.min, 0, this.max] : [0, this.max / 2, this.max];
      const tickMarks = ticks.map((tickValue) => {
        const tickPercentage = this.bidirectional ? (tickValue - this.min) / (this.max - this.min) : tickValue / this.max;
        const tickAngle = 180 - tickPercentage * 180;
        const tickRad = tickAngle * Math.PI / 180;
        const tickStartR = this.radius;
        const tickEndR = this.radius - 8;
        const x1 = this.centerX + tickStartR * Math.cos(tickRad);
        const y1 = this.centerY - tickStartR * Math.sin(tickRad);
        const x2 = this.centerX + tickEndR * Math.cos(tickRad);
        const y2 = this.centerY - tickEndR * Math.sin(tickRad);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgb(160, 160, 160)" stroke-width="2" />`;
      }).join("");
      const zeroPercentage = this.bidirectional ? (0 - this.min) / (this.max - this.min) : 0;
      const zeroAngle = 180 - zeroPercentage * 180;
      const zeroRad = zeroAngle * Math.PI / 180;
      const zeroX1 = this.centerX;
      const zeroY1 = this.centerY;
      const zeroX2 = this.centerX + this.radius * Math.cos(zeroRad);
      const zeroY2 = this.centerY - this.radius * Math.sin(zeroRad);
      const zeroLine = `<line x1="${zeroX1}" y1="${zeroY1}" x2="${zeroX2}" y2="${zeroY2}" stroke="rgb(100, 100, 100)" stroke-width="2" />`;
      const needleRad = angle * Math.PI / 180;
      const needleLength = this.radius - 5;
      const needleX = this.centerX + needleLength * Math.cos(needleRad);
      const needleY = this.centerY - needleLength * Math.sin(needleRad);
      const clipHeight = this.centerY + 5;
      const valueY = this.centerY + this.radius * 0.5;
      const unitsY = this.centerY + this.radius * 0.7;
      const svgMarkup = `
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
        
        <text x="${this.centerX}" y="15" text-anchor="middle" font-size="12" fill="rgb(255, 255, 255)" font-weight="500">${this.label}</text>
        
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
        
        <text id="value-${this.id}" x="${this.centerX}" y="${valueY}" text-anchor="middle" font-size="16" fill="rgb(255, 255, 255)" font-weight="600">${this._formatValueText()}</text>
        
        <text x="${this.centerX}" y="${unitsY}" text-anchor="middle" font-size="8" fill="rgb(160, 160, 160)" font-weight="400" letter-spacing="0.5">${this.units}</text>
        
        <rect id="dimmer-${this.id}" x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="black" opacity="0" pointer-events="none" style="transition: opacity 0.8s ease-in-out;" />
      </g>
    `;
      const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      container.innerHTML = svgMarkup;
      const element = container.firstElementChild;
      this.element = element;
      if (!this.tapAction || this.tapAction.action !== "none") {
        element.style.cursor = "pointer";
        element.addEventListener("click", (e) => {
          this._handleTapAction();
          e.stopPropagation();
        });
        element.addEventListener("mouseenter", () => {
          element.style.filter = "brightness(1.1)";
        });
        element.addEventListener("mouseleave", () => {
          element.style.filter = "";
        });
      }
      return element;
    }
  }
  class FlowLine {
    constructor(group, flowId, from, to, power, color, speedMultiplier, dotsPerFlow) {
      this.group = group;
      this.flowId = flowId;
      this.speedMultiplier = speedMultiplier;
      this.dotsPerFlow = dotsPerFlow;
      this.dots = [];
      this.dotStates = [];
      this.pathLength = 0;
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      this.pathData = `M ${from.x},${from.y} Q ${midX},${midY} ${to.x},${to.y}`;
      const { opacity, strokeWidth, dotRadius } = this.calculateStyles(power);
      const velocity = this.calculateVelocity(power);
      this.glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      this.glowPath.setAttribute("d", this.pathData);
      this.glowPath.setAttribute("class", "flow-line");
      this.glowPath.setAttribute("stroke", color);
      this.glowPath.setAttribute("stroke-opacity", String(opacity * 0.5));
      this.glowPath.setAttribute("stroke-width", String(strokeWidth * 2));
      this.glowPath.setAttribute("fill", "none");
      this.glowPath.setAttribute("stroke-linecap", "round");
      this.glowPath.setAttribute("style", "transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;");
      this.glowPath.id = `glow-${flowId}`;
      this.group.appendChild(this.glowPath);
      this.mainPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      this.mainPath.setAttribute("d", this.pathData);
      this.mainPath.setAttribute("class", "flow-line");
      this.mainPath.setAttribute("stroke", color);
      this.mainPath.setAttribute("stroke-opacity", String(opacity));
      this.mainPath.setAttribute("stroke-width", String(strokeWidth));
      this.mainPath.setAttribute("fill", "none");
      this.mainPath.setAttribute("stroke-linecap", "round");
      this.mainPath.setAttribute("style", "transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;");
      this.mainPath.id = `path-${flowId}`;
      this.group.appendChild(this.mainPath);
      this.pathLength = this.mainPath.getTotalLength();
      for (let i = 0; i < this.dotsPerFlow; i++) {
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("class", "flow-dot");
        dot.setAttribute("id", `dot-${flowId}-${i}`);
        dot.setAttribute("r", String(dotRadius));
        dot.setAttribute("fill", color);
        dot.setAttribute("opacity", String(opacity));
        dot.setAttribute("style", "transition: opacity 0.5s ease-out, r 0.5s ease-out;");
        this.group.appendChild(dot);
        this.dots.push(dot);
        const progress = i / this.dotsPerFlow;
        this.dotStates.push({ progress, velocity });
        const point = this.mainPath.getPointAtLength(progress * this.pathLength);
        dot.setAttribute("cx", String(point.x));
        dot.setAttribute("cy", String(point.y));
      }
    }
    calculateStyles(power) {
      let opacity;
      if (power <= 100) {
        opacity = 0.25;
      } else if (power <= 200) {
        opacity = 0.25 + (power - 100) / 100 * 0.75;
      } else {
        opacity = 1;
      }
      const minWidth = 2;
      const maxWidth = 23.76;
      const maxPower = 1e4;
      let strokeWidth;
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
    calculateVelocity(power) {
      const baseSpeed = 40 * (power / 1e3) * this.speedMultiplier;
      return this.pathLength > 0 ? baseSpeed / this.pathLength : 0;
    }
    update(power, color) {
      const { opacity, strokeWidth, dotRadius } = this.calculateStyles(power);
      const velocity = this.calculateVelocity(power);
      this.glowPath.setAttribute("stroke", color);
      this.glowPath.setAttribute("stroke-opacity", String(opacity * 0.5));
      this.glowPath.setAttribute("stroke-width", String(strokeWidth * 2));
      this.mainPath.setAttribute("stroke", color);
      this.mainPath.setAttribute("stroke-opacity", String(opacity));
      this.mainPath.setAttribute("stroke-width", String(strokeWidth));
      this.dots.forEach((dot, i) => {
        dot.setAttribute("r", String(dotRadius));
        dot.setAttribute("opacity", String(opacity));
        dot.setAttribute("fill", color);
        this.dotStates[i].velocity = velocity;
      });
    }
    animate(deltaTime) {
      this.dotStates.forEach((state, i) => {
        if (state.velocity > 0) {
          state.progress += state.velocity * (deltaTime / 1e3);
          if (state.progress >= 1) {
            state.progress = state.progress % 1;
          }
          try {
            if (this.pathLength > 0) {
              const point = this.mainPath.getPointAtLength(state.progress * this.pathLength);
              this.dots[i].setAttribute("cx", String(point.x));
              this.dots[i].setAttribute("cy", String(point.y));
            }
          } catch (_e) {
          }
        }
      });
    }
    fadeOut(callback) {
      this.glowPath.setAttribute("stroke-opacity", "0");
      this.mainPath.setAttribute("stroke-opacity", "0");
      this.dots.forEach((dot) => dot.setAttribute("opacity", "0"));
      setTimeout(callback, 500);
    }
  }
  class FlowRenderer {
    constructor(container, positions) {
      this.container = container;
      this.positions = positions;
      this.flowLines = /* @__PURE__ */ new Map();
      this.animationFrameId = null;
      this.lastAnimationTime = null;
      this.speedMultiplier = 0.8;
      this.dotsPerFlow = 3;
      this.animate = () => {
        const now = performance.now();
        const deltaTime = this.lastAnimationTime ? now - this.lastAnimationTime : 0;
        this.lastAnimationTime = now;
        this.flowLines.forEach((flowLine) => {
          flowLine.animate(deltaTime);
        });
        this.animationFrameId = requestAnimationFrame(this.animate);
      };
    }
    /**
     * Update flows based on current power values
     */
    updateFlows(flows) {
      const flowLayer = this.container.querySelector("#flow-layer");
      if (!flowLayer) return;
      const threshold = 0;
      const batteryThreshold = 10;
      this.updateOrCreateFlow(flowLayer, "production-to-load", this.positions.production, this.positions.load, flows.productionToLoad, "#4caf50", threshold);
      this.updateOrCreateFlow(flowLayer, "production-to-battery", this.positions.production, this.positions.battery, flows.productionToBattery, "#4caf50", threshold);
      this.updateOrCreateFlow(flowLayer, "battery-to-load", this.positions.battery, this.positions.load, flows.batteryToLoad, "#2196f3", batteryThreshold);
      this.updateOrCreateFlow(flowLayer, "grid-to-load", this.positions.grid, this.positions.load, flows.gridToLoad, "#f44336", threshold);
      this.updateOrCreateFlow(flowLayer, "grid-to-battery", this.positions.grid, this.positions.battery, flows.gridToBattery, "#f44336", threshold);
      this.updateOrCreateFlow(flowLayer, "production-to-grid", this.positions.production, this.positions.grid, flows.productionToGrid, "#ffeb3b", threshold);
    }
    /**
     * Start animation loop
     */
    start() {
      if (this.animationFrameId) return;
      this.lastAnimationTime = performance.now();
      this.animate();
    }
    /**
     * Stop animation loop
     */
    stop() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
        this.lastAnimationTime = null;
      }
    }
    /**
     * Clear all flows
     */
    clear() {
      this.stop();
      this.flowLines.clear();
      const flowLayer = this.container.querySelector("#flow-layer");
      if (flowLayer) {
        flowLayer.innerHTML = "";
      }
    }
    updateOrCreateFlow(flowLayer, flowId, from, to, power, color, threshold) {
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
    drawFlow(flowLayer, flowId, from, to, power, color) {
      const flowGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      flowGroup.setAttribute("id", flowId);
      flowLayer.appendChild(flowGroup);
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
    removeFlow(flowLayer, flowId) {
      const flow = flowLayer.querySelector(`#${flowId}`);
      if (flow) {
        flow.remove();
        this.flowLines.delete(flowId);
      }
    }
    fadeOutFlow(flowLayer, flowId) {
      const flowLine = this.flowLines.get(flowId);
      if (!flowLine) return;
      flowLine.fadeOut(() => {
        this.removeFlow(flowLayer, flowId);
      });
    }
  }
  class DefaultRenderer {
    constructor(container, config, hass, getDisplayNameCallback, getIconCallback, fireEventCallback) {
      this.container = container;
      this.config = config;
      this.hass = hass;
      this.getDisplayNameCallback = getDisplayNameCallback;
      this.getIconCallback = getIconCallback;
      this.fireEventCallback = fireEventCallback;
      this.meters = /* @__PURE__ */ new Map();
      this.iconsExtracted = false;
      this.iconExtractionTimeouts = /* @__PURE__ */ new Set();
      this.iconCache = /* @__PURE__ */ new Map();
      this.canvasWidth = 500;
      this.canvasHeight = 470;
      const offsetX = 5;
      const offsetY = 3;
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
    render(data) {
      const { grid, load, production, battery, flows } = data;
      const gridMin = this.config.grid?.min ?? -5e3;
      const gridMax = this.config.grid?.max ?? 5e3;
      const loadMax = this.config.load.max ?? 5e3;
      const productionMax = this.config.production?.max ?? 5e3;
      const batteryMin = this.config.battery?.min ?? -5e3;
      const batteryMax = this.config.battery?.max ?? 5e3;
      if (!this.container.querySelector(".energy-flow-svg")) {
        this.iconsExtracted = false;
        this.initializeStructure(
          grid,
          load,
          production,
          battery,
          gridMin,
          gridMax,
          loadMax,
          productionMax,
          batteryMin,
          batteryMax
        );
        if (!this.iconsExtracted) {
          requestAnimationFrame(() => {
            this.extractIconPaths();
          });
        }
      } else {
        const productionMeter = this.meters.get("production");
        const batteryMeter = this.meters.get("battery");
        const gridMeter = this.meters.get("grid");
        const loadMeter = this.meters.get("load");
        if (productionMeter) productionMeter.value = production;
        if (batteryMeter) {
          batteryMeter.invertView = this.config.battery?.invert?.view ?? false;
          batteryMeter.value = battery;
        }
        if (gridMeter) gridMeter.value = grid;
        if (loadMeter) loadMeter.value = load;
        if (!this.flowRenderer) {
          const svg = this.container.querySelector(".energy-flow-svg");
          if (svg) {
            this.flowRenderer = new FlowRenderer(svg, this.meterPositions);
            this.flowRenderer.start();
          }
        }
      }
      if (this.flowRenderer) {
        this.flowRenderer.updateFlows(flows);
      }
    }
    /**
     * Stop animations and clean up
     */
    stop() {
      if (this.flowRenderer) {
        this.flowRenderer.stop();
      }
      this.meters.forEach((meter) => meter.stopAnimation());
      this.iconExtractionTimeouts.forEach((id) => clearTimeout(id));
      this.iconExtractionTimeouts.clear();
    }
    /**
     * Clear all flows and stop animation
     */
    clear() {
      this.stop();
      if (this.flowRenderer) {
        this.flowRenderer.clear();
      }
    }
    /**
     * Initialize the HTML structure and create Meter instances
     */
    initializeStructure(grid, load, production, battery, gridMin, gridMax, loadMax, productionMax, batteryMin, batteryMax) {
      const productionMeter = new Meter(
        "production",
        production,
        0,
        productionMax,
        false,
        this.getDisplayNameCallback("production", "Production"),
        this.getIconCallback("production", "mdi:solar-power"),
        "WATTS",
        false,
        false,
        this.config.production?.tap,
        this.config.production?.entity,
        this.fireEventCallback
      );
      const batteryMeter = new Meter(
        "battery",
        battery,
        batteryMin,
        batteryMax,
        true,
        this.getDisplayNameCallback("battery", "Battery"),
        this.getIconCallback("battery", "mdi:battery"),
        "WATTS",
        this.config.battery?.invert?.view,
        this.config.battery?.showPlus,
        this.config.battery?.tap,
        this.config.battery?.entity,
        this.fireEventCallback
      );
      const gridMeter = new Meter(
        "grid",
        grid,
        gridMin,
        gridMax,
        true,
        this.getDisplayNameCallback("grid", "Grid"),
        this.getIconCallback("grid", "mdi:transmission-tower"),
        "WATTS",
        false,
        false,
        this.config.grid?.tap,
        this.config.grid?.entity,
        this.fireEventCallback
      );
      const loadMeter = new Meter(
        "load",
        load,
        0,
        loadMax,
        false,
        this.getDisplayNameCallback("load", "Load"),
        this.getIconCallback("load", "mdi:home-lightning-bolt"),
        "WATTS",
        false,
        false,
        this.config.load.tap,
        this.config.load.entity,
        this.fireEventCallback
      );
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
      requestAnimationFrame(() => {
        const productionContainer = this.container.querySelector("#production-meter");
        const batteryContainer = this.container.querySelector("#battery-meter");
        const gridContainer = this.container.querySelector("#grid-meter");
        const loadContainer = this.container.querySelector("#load-meter");
        if (productionContainer) productionContainer.appendChild(productionMeter.createElement());
        if (batteryContainer) batteryContainer.appendChild(batteryMeter.createElement());
        if (gridContainer) gridContainer.appendChild(gridMeter.createElement());
        if (loadContainer) loadContainer.appendChild(loadMeter.createElement());
        this.meters.set("production", productionMeter);
        this.meters.set("battery", batteryMeter);
        this.meters.set("grid", gridMeter);
        this.meters.set("load", loadMeter);
        productionMeter.startAnimation();
        batteryMeter.startAnimation();
        gridMeter.startAnimation();
        loadMeter.startAnimation();
        productionMeter.updateDimming();
        batteryMeter.updateDimming();
        gridMeter.updateDimming();
        loadMeter.updateDimming();
        const svg = this.container.querySelector(".energy-flow-svg");
        if (svg && !this.flowRenderer) {
          this.flowRenderer = new FlowRenderer(svg, this.meterPositions);
          this.flowRenderer.start();
        }
      });
    }
    /**
     * Create SVG filter definitions
     */
    createMeterDefs() {
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
    extractIconPaths() {
      const meterIds = ["production", "battery", "grid", "load"];
      meterIds.forEach(async (meterId) => {
        const iconContainer = this.container.querySelector(`#icon-${meterId}`);
        const iconSource = this.container.querySelector(`#ha-icon-${meterId}`);
        if (iconContainer && iconSource) {
          const iconName = iconSource.getAttribute("icon") || "unknown";
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
    async extractIconPath(iconElement, iconName, maxAttempts = 10) {
      return new Promise((resolve) => {
        const attemptExtraction = (attempt = 1, max = maxAttempts) => {
          const delay = attempt === 1 ? 0 : 100 * attempt;
          const timeoutId = window.setTimeout(async () => {
            try {
              const shadowRoot = iconElement.shadowRoot;
              if (!shadowRoot) {
                if (attempt < max) {
                  attemptExtraction(attempt + 1, max);
                } else {
                  resolve(null);
                }
                return;
              }
              const svg = shadowRoot.querySelector("svg");
              if (!svg) {
                if (attempt < max) {
                  attemptExtraction(attempt + 1, max);
                } else {
                  resolve(null);
                }
                return;
              }
              const path = svg.querySelector("path");
              if (path) {
                const pathData = path.getAttribute("d");
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
    renderIconPath(container, pathData) {
      container.innerHTML = "";
      if (pathData) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("fill", "rgb(160, 160, 160)");
        path.setAttribute("transform", "scale(1)");
        container.appendChild(path);
      } else {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", "12");
        circle.setAttribute("cy", "12");
        circle.setAttribute("r", "8");
        circle.setAttribute("fill", "rgb(160, 160, 160)");
        container.appendChild(circle);
      }
    }
  }
  function createGridLines(chartWidth, chartHeight, margin) {
    const lines = [];
    const numLines = 4;
    for (let i = 0; i <= numLines; i++) {
      const y = margin.top + i * chartHeight / numLines;
      lines.push(`<line x1="${margin.left}" y1="${y}" x2="${margin.left + chartWidth}" y2="${y}" stroke="white" stroke-width="1" />`);
    }
    return lines.join("\n");
  }
  function createTimeLabels(chartWidth, chartHeight, margin, hoursToShow) {
    const labels = [];
    const numLabels = 6;
    const now = /* @__PURE__ */ new Date();
    for (let i = 0; i <= numLabels; i++) {
      const hoursAgo = hoursToShow - i * hoursToShow / numLabels;
      const time = new Date(now.getTime() - hoursAgo * 60 * 60 * 1e3);
      const currentMinutes = time.getMinutes();
      const quantizedMinutes = currentMinutes < 15 ? 0 : currentMinutes < 45 ? 30 : 0;
      const hourAdjust = currentMinutes >= 45 ? 1 : 0;
      time.setMinutes(quantizedMinutes);
      time.setSeconds(0);
      time.setMilliseconds(0);
      if (hourAdjust) {
        time.setHours(time.getHours() + hourAdjust);
      }
      const x = margin.left + i * chartWidth / numLabels;
      const y = margin.top + chartHeight + 20;
      const hours = time.getHours();
      const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? "PM" : "AM";
      labels.push(`
      <text x="${x}" y="${y}" text-anchor="middle" fill="rgb(160, 160, 160)" font-size="11">
        ${hours12} ${ampm}
      </text>
    `);
    }
    return labels.join("\n");
  }
  function createYAxisLabels(supplyHeight, demandHeight, margin, maxSupply, maxDemand, zeroLineY) {
    const labels = [];
    labels.push(`<text x="${margin.left - 10}" y="${margin.top + 5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">${Math.round(maxSupply)}W</text>`);
    labels.push(`<text x="${margin.left - 10}" y="${zeroLineY + 5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">0</text>`);
    labels.push(`<text x="${margin.left - 10}" y="${zeroLineY + demandHeight + 5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">-${Math.round(maxDemand)}W</text>`);
    return labels.join("\n");
  }
  function createAreaPath(dataPoints, xStep, centerY, yScale, margin, valueGetter, baseValueGetter, direction) {
    const points = [];
    const basePoints = [];
    let hasData = false;
    dataPoints.forEach((d, i) => {
      const x = margin.left + i * xStep;
      const value = valueGetter(d);
      const baseValue = typeof baseValueGetter === "function" ? baseValueGetter(d) : baseValueGetter;
      if (value > 0) hasData = true;
      const yOffset = direction === "down" ? -(value + baseValue) * yScale : (value + baseValue) * yScale;
      const baseYOffset = direction === "down" ? -baseValue * yScale : baseValue * yScale;
      points.push({ x, y: centerY + yOffset });
      basePoints.push({ x, y: centerY + baseYOffset });
    });
    if (!hasData) return null;
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    for (let i = basePoints.length - 1; i >= 0; i--) {
      path += ` L ${basePoints[i].x} ${basePoints[i].y}`;
    }
    path += " Z";
    return path;
  }
  function createLoadLine(dataPoints, chartWidth, chartHeight, yScale, margin, zeroLineY) {
    if (!dataPoints || dataPoints.length === 0) return "";
    const xStep = dataPoints.length > 1 ? chartWidth / (dataPoints.length - 1) : 0;
    const pathPoints = dataPoints.map((d, i) => {
      const x = margin.left + i * xStep;
      const y = zeroLineY - d.load * yScale;
      return `${i === 0 ? "M" : "L"} ${x},${y}`;
    }).join(" ");
    return `<path d="${pathPoints}" fill="none" stroke="#CCCCCC" stroke-width="3" opacity="0.9" />`;
  }
  class ChartRenderer {
    constructor(hass, config, fireEvent) {
      this.iconCache = /* @__PURE__ */ new Map();
      this.chartRenderPending = false;
      this.lastIndicatorUpdate = 0;
      this.hass = hass;
      this.config = config;
      this.fireEvent = fireEvent;
    }
    /**
     * Update live chart values for indicators
     */
    updateLiveValues(values) {
      this.liveChartValues = values;
    }
    /**
     * Render chart view (main entry point)
     */
    render(container) {
      if (!container.querySelector(".chart-view")) {
        this.initializeChartStructure(container);
      } else if (this.liveChartValues) {
        this.throttledUpdateChartIndicators(container);
      }
    }
    /**
     * Initialize chart HTML structure
     */
    initializeChartStructure(container) {
      container.innerHTML = `
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
      const svg = container.querySelector(".chart-svg");
      if (svg) {
        setTimeout(() => {
          this.fetchAndRenderChart(svg, 12);
        }, 100);
      }
    }
    /**
     * Throttle chart indicator updates
     */
    throttledUpdateChartIndicators(container) {
      if (this.indicatorUpdateTimeout) {
        clearTimeout(this.indicatorUpdateTimeout);
        this.indicatorUpdateTimeout = void 0;
      }
      const now = Date.now();
      const timeSinceLastUpdate = now - this.lastIndicatorUpdate;
      const minUpdateInterval = 250;
      if (timeSinceLastUpdate >= minUpdateInterval) {
        const svg = container.querySelector(".chart-svg");
        if (svg) this.updateChartIndicators(svg);
        this.lastIndicatorUpdate = now;
      } else {
        const delay = minUpdateInterval - timeSinceLastUpdate;
        this.indicatorUpdateTimeout = window.setTimeout(() => {
          const svg = container.querySelector(".chart-svg");
          if (svg) this.updateChartIndicators(svg);
          this.lastIndicatorUpdate = Date.now();
          this.indicatorUpdateTimeout = void 0;
        }, delay);
      }
    }
    /**
     * Cleanup resources
     */
    cleanup() {
      if (this.indicatorUpdateTimeout) {
        clearTimeout(this.indicatorUpdateTimeout);
        this.indicatorUpdateTimeout = void 0;
      }
      this.chartDataCache = void 0;
    }
    /**
     * Get icon name from config or use default
     */
    getIcon(iconConfigKey, entityConfigKey, fallback) {
      const configIcon = this.config[iconConfigKey];
      if (configIcon) return configIcon;
      const entityId = this.config[entityConfigKey];
      if (entityId && this.hass.states[entityId]) {
        const entityIcon = this.hass.states[entityId].attributes.icon;
        if (entityIcon) return entityIcon;
      }
      return fallback;
    }
    /**
     * Fetch and render chart, using cache if available
     */
    async fetchAndRenderChart(svgElement, hoursToShow = 12) {
      if (this.chartRenderPending) return;
      const now = Date.now();
      const cacheAge = this.chartDataCache ? now - this.chartDataCache.timestamp : Infinity;
      const cacheMaxAge = 5 * 60 * 1e3;
      if (this.chartDataCache && cacheAge >= cacheMaxAge) {
        this.chartDataCache = void 0;
      }
      if (this.chartDataCache && cacheAge < cacheMaxAge) {
        requestAnimationFrame(() => {
          this.renderChartFromCache(svgElement);
        });
        return;
      }
      this.chartRenderPending = true;
      const end = /* @__PURE__ */ new Date();
      const start = new Date(end.getTime() - hoursToShow * 60 * 60 * 1e3);
      try {
        const [productionHistory, gridHistory, loadHistory, batteryHistory] = await Promise.all([
          this.fetchHistory(this.config.production_entity, start, end),
          this.fetchHistory(this.config.grid_entity, start, end),
          this.fetchHistory(this.config.load_entity, start, end),
          this.fetchHistory(this.config.battery_entity, start, end)
        ]);
        const processChart = () => {
          this.drawStackedAreaChart(svgElement, productionHistory, gridHistory, loadHistory, batteryHistory, hoursToShow);
          this.chartRenderPending = false;
        };
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(processChart, { timeout: 2e3 });
        } else {
          setTimeout(processChart, 0);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
        this.chartRenderPending = false;
        svgElement.innerHTML = `
        <text x="400" y="200" text-anchor="middle" fill="rgb(160, 160, 160)" font-size="14">
          Error loading chart data
        </text>
      `;
      }
    }
    /**
     * Fetch history from Home Assistant
     */
    async fetchHistory(entityId, start, end) {
      const url = `history/period/${start.toISOString()}?filter_entity_id=${entityId}&end_time=${end.toISOString()}&minimal_response&no_attributes`;
      const response = await this.hass.callApi("GET", url);
      return response && response.length > 0 ? response[0] : [];
    }
    /**
     * Render chart from cached data
     */
    renderChartFromCache(svgElement) {
      if (!this.chartDataCache) return;
      const dataPoints = this.chartDataCache.dataPoints;
      const maxSupply = Math.max(...dataPoints.map((d) => d.solar + d.batteryDischarge + d.gridImport), ...dataPoints.map((d) => d.load));
      const maxDemand = Math.max(...dataPoints.map((d) => d.batteryCharge + d.gridExport));
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
      const supplyPaths = this.createStackedPaths(dataPoints, chartWidth, supplyHeight, supplyScale, margin, "supply", zeroLineY);
      const demandPaths = this.createStackedPaths(dataPoints, chartWidth, demandHeight, demandScale, margin, "demand", zeroLineY);
      const loadLine = createLoadLine(dataPoints, chartWidth, supplyHeight, supplyScale, margin, zeroLineY);
      const chartContent = `
      <g opacity="0.1">
        ${createGridLines(chartWidth, chartHeight, margin)}
      </g>
      <line x1="${margin.left}" y1="${zeroLineY}" x2="${margin.left + chartWidth}" y2="${zeroLineY}" stroke="rgb(160, 160, 160)" stroke-width="1" stroke-dasharray="4,4" />
      ${demandPaths}
      ${supplyPaths}
      ${createTimeLabels(chartWidth, chartHeight, margin, 12)}
      ${createYAxisLabels(supplyHeight, demandHeight, margin, maxSupply, maxDemand, zeroLineY)}
    `;
      svgElement.innerHTML = chartContent;
      this.updateChartIndicators(svgElement);
      this.addLoadLineOnTop(svgElement, loadLine);
    }
    /**
     * Draw stacked area chart from history data
     */
    async drawStackedAreaChart(svgElement, productionHistory, gridHistory, loadHistory, batteryHistory, hoursToShow) {
      const width = 800;
      const height = 400;
      const margin = { top: 20, right: 150, bottom: 40, left: 60 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;
      const rawPointsPerHour = 120;
      const totalRawPoints = hoursToShow * rawPointsPerHour;
      const visiblePointsPerHour = 12;
      const totalVisiblePoints = hoursToShow * visiblePointsPerHour;
      const rawPointsPerVisibleTick = 10;
      const now = /* @__PURE__ */ new Date();
      const endMinutes = Math.floor(now.getMinutes() / 5) * 5;
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), endMinutes, 0, 0);
      const start = new Date(end.getTime() - hoursToShow * 60 * 60 * 1e3);
      const chunkSize = 240;
      const rawDataPoints = [];
      for (let chunkStart = 0; chunkStart < totalRawPoints; chunkStart += chunkSize) {
        const chunkEnd = Math.min(chunkStart + chunkSize, totalRawPoints);
        if (chunkStart > 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
        for (let i = chunkStart; i < chunkEnd; i++) {
          const time = new Date(start.getTime() + i * 30 * 1e3);
          const production = this.interpolateValue(productionHistory, time);
          const grid = this.interpolateValue(gridHistory, time);
          const load = this.interpolateValue(loadHistory, time);
          let battery = this.interpolateValue(batteryHistory, time);
          if (this.config.invert_battery_data) {
            battery = -battery;
          }
          rawDataPoints.push({
            time,
            solar: Math.max(0, production),
            batteryDischarge: Math.max(0, battery),
            batteryCharge: Math.max(0, -battery),
            gridImport: Math.max(0, grid),
            gridExport: Math.max(0, -grid),
            load: Math.max(0, load)
          });
        }
      }
      const dataPoints = [];
      for (let i = 0; i < totalVisiblePoints; i++) {
        const visibleTime = new Date(start.getTime() + (i + 1) * 5 * 60 * 1e3);
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
        dataPoints.push({
          time: visibleTime,
          solar: solarSum / windowSize,
          batteryDischarge: batteryDischargeSum / windowSize,
          batteryCharge: batteryChargeSum / windowSize,
          gridImport: gridImportSum / windowSize,
          gridExport: gridExportSum / windowSize,
          load: loadSum / windowSize
        });
      }
      this.chartDataCache = {
        timestamp: Date.now(),
        dataPoints
      };
      const maxSupply = Math.max(...dataPoints.map((d) => d.solar + d.batteryDischarge + d.gridImport), ...dataPoints.map((d) => d.load));
      const maxDemand = Math.max(...dataPoints.map((d) => d.batteryCharge + d.gridExport));
      const totalRange = maxSupply + maxDemand;
      const supplyRatio = totalRange > 0 ? maxSupply / totalRange : 0.5;
      const demandRatio = totalRange > 0 ? maxDemand / totalRange : 0.5;
      const supplyScale = maxSupply > 0 ? chartHeight * supplyRatio / (maxSupply * 1.1) : 1;
      const demandScale = maxDemand > 0 ? chartHeight * demandRatio / (maxDemand * 1.1) : 1;
      const scale = Math.min(supplyScale, demandScale);
      const supplyHeight = maxSupply * scale * 1.1;
      const demandHeight = maxDemand * scale * 1.1;
      const zeroLineY = margin.top + supplyHeight;
      const supplyPaths = this.createStackedPaths(dataPoints, chartWidth, supplyHeight, scale, margin, "supply", zeroLineY);
      const demandPaths = this.createStackedPaths(dataPoints, chartWidth, demandHeight, scale, margin, "demand", zeroLineY);
      const loadLine = createLoadLine(dataPoints, chartWidth, supplyHeight, scale, margin, zeroLineY);
      const svgContent = `
      <g opacity="0.1">
        ${createGridLines(chartWidth, chartHeight, margin)}
      </g>
      <line x1="${margin.left}" y1="${zeroLineY}" x2="${margin.left + chartWidth}" y2="${zeroLineY}" stroke="rgb(160, 160, 160)" stroke-width="1" stroke-dasharray="4,4" />
      ${demandPaths}
      ${supplyPaths}
      ${createTimeLabels(chartWidth, chartHeight, margin, hoursToShow)}
      ${createYAxisLabels(supplyHeight, demandHeight, margin, maxSupply, maxDemand, zeroLineY)}
      ${this.createChartIconSources()}
    `;
      svgElement.innerHTML = svgContent;
      this.attachChartAreaClickHandlers(svgElement);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.extractChartIcons(svgElement, dataPoints, chartWidth, supplyHeight, demandHeight, scale, scale, margin, zeroLineY);
            requestAnimationFrame(() => {
              this.addLoadLineOnTop(svgElement, loadLine);
            });
          });
        });
      });
    }
    /**
     * Interpolate value from history at specific time
     */
    interpolateValue(history2, targetTime) {
      if (history2.length === 0) return 0;
      let closestPoint = history2[0];
      let minDiff = Math.abs(new Date(history2[0].last_changed).getTime() - targetTime.getTime());
      for (const point of history2) {
        const diff = Math.abs(new Date(point.last_changed).getTime() - targetTime.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          closestPoint = point;
        }
      }
      return parseFloat(closestPoint.state) || 0;
    }
    /**
     * Create stacked area paths for supply or demand
     */
    createStackedPaths(dataPoints, chartWidth, chartHeight, yScale, margin, type, zeroLineY) {
      const totalPoints = dataPoints.length;
      const xStep = chartWidth / (totalPoints - 1);
      if (type === "supply") {
        const solarPath = createAreaPath(
          dataPoints,
          xStep,
          zeroLineY,
          yScale,
          margin,
          (d) => d.solar,
          0,
          "down"
        );
        const batteryPath = createAreaPath(
          dataPoints,
          xStep,
          zeroLineY,
          yScale,
          margin,
          (d) => d.batteryDischarge,
          (d) => d.solar,
          "down"
        );
        const gridPath = createAreaPath(
          dataPoints,
          xStep,
          zeroLineY,
          yScale,
          margin,
          (d) => d.gridImport,
          (d) => d.solar + d.batteryDischarge,
          "down"
        );
        return `
        ${gridPath ? `<path id="chart-area-grid-import" d="${gridPath}" fill="#c62828" opacity="0.8" style="cursor: pointer;" />` : ""}
        ${batteryPath ? `<path id="chart-area-battery-discharge" d="${batteryPath}" fill="#1976d2" opacity="0.8" style="cursor: pointer;" />` : ""}
        ${solarPath ? `<path id="chart-area-solar" d="${solarPath}" fill="#388e3c" opacity="0.85" style="cursor: pointer;" />` : ""}
      `;
      } else {
        const batteryChargePath = createAreaPath(
          dataPoints,
          xStep,
          zeroLineY,
          yScale,
          margin,
          (d) => d.batteryCharge,
          0,
          "up"
        );
        const gridExportPath = createAreaPath(
          dataPoints,
          xStep,
          zeroLineY,
          yScale,
          margin,
          (d) => d.gridExport,
          (d) => d.batteryCharge,
          "up"
        );
        return `
        ${gridExportPath ? `<path id="chart-area-grid-export" d="${gridExportPath}" fill="#f9a825" opacity="0.8" style="cursor: pointer;" />` : ""}
        ${batteryChargePath ? `<path id="chart-area-battery-charge" d="${batteryChargePath}" fill="#1976d2" opacity="0.8" style="cursor: pointer;" />` : ""}
      `;
      }
    }
    /**
     * Create hidden icon sources for extraction
     */
    createChartIconSources() {
      const loadIcon = this.getIcon("load_icon", "load_entity", "mdi:home-lightning-bolt");
      const solarIcon = this.getIcon("production_icon", "production_entity", "mdi:solar-power");
      const batteryIcon = this.getIcon("battery_icon", "battery_entity", "mdi:battery");
      const gridIcon = this.getIcon("grid_icon", "grid_entity", "mdi:transmission-tower");
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
    /**
     * Extract icon paths from Home Assistant icons
     */
    async extractChartIcons(svgElement, dataPoints, chartWidth, supplyHeight, demandHeight, supplyScale, demandScale, margin, zeroLineY) {
      if (dataPoints.length === 0) return;
      const iconTypes = ["load", "solar", "battery", "grid"];
      const iconPaths = {};
      for (const type of iconTypes) {
        const iconSourceFO = svgElement.querySelector(`#chart-icon-source-${type}`);
        if (!iconSourceFO) continue;
        const haIconDiv = iconSourceFO.querySelector("div");
        if (!haIconDiv) continue;
        const iconSource = haIconDiv.querySelector("ha-icon");
        if (!iconSource) continue;
        const iconName = iconSource.getAttribute("icon");
        if (!iconName) continue;
        if (this.iconCache.has(iconName)) {
          iconPaths[type] = this.iconCache.get(iconName) || null;
          continue;
        }
        const pathData = await this.extractIconPath(iconSource, iconName);
        iconPaths[type] = pathData;
        if (pathData) {
          this.iconCache.set(iconName, pathData);
        }
      }
      this.renderChartIndicators(svgElement, dataPoints, chartWidth, supplyHeight, demandHeight, supplyScale, demandScale, margin, iconPaths, zeroLineY);
    }
    /**
     * Extract single icon path from shadow DOM
     */
    async extractIconPath(iconElement, iconName, maxAttempts = 10) {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const shadowRoot = iconElement.shadowRoot;
          if (!shadowRoot) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            continue;
          }
          let svgElement = shadowRoot.querySelector("svg");
          if (!svgElement) {
            const haSvgIcon = shadowRoot.querySelector("ha-svg-icon");
            if (haSvgIcon && haSvgIcon.shadowRoot) {
              svgElement = haSvgIcon.shadowRoot.querySelector("svg");
            }
          }
          if (!svgElement) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            continue;
          }
          const pathElement = svgElement.querySelector("path");
          if (!pathElement) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            continue;
          }
          const pathData = pathElement.getAttribute("d");
          if (pathData) {
            return pathData;
          }
        } catch (e) {
          console.error(`Failed to extract icon path for ${iconName} (attempt ${attempt + 1}):`, e);
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return null;
    }
    /**
     * Render chart indicators with native SVG
     */
    renderChartIndicators(svgElement, dataPoints, chartWidth, supplyHeight, demandHeight, supplyScale, demandScale, margin, iconPaths, zeroLineY) {
      let indicatorsGroup = svgElement.querySelector("#chart-indicators");
      const isFirstRender = !indicatorsGroup;
      if (!indicatorsGroup) {
        indicatorsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        indicatorsGroup.setAttribute("id", "chart-indicators");
        svgElement.appendChild(indicatorsGroup);
      }
      if (isFirstRender) {
        const iconSources = svgElement.querySelectorAll('[id^="chart-icon-source-"]');
        iconSources.forEach((source) => source.remove());
      }
      let currentValues;
      if (this.liveChartValues) {
        const { grid, load, production, battery } = this.liveChartValues;
        currentValues = {
          load: Math.max(0, load),
          solar: Math.max(0, production),
          batteryDischarge: Math.max(0, battery),
          batteryCharge: Math.max(0, -battery),
          gridImport: Math.max(0, grid),
          gridExport: Math.max(0, -grid)
        };
      } else {
        currentValues = dataPoints[dataPoints.length - 1];
      }
      const rightX = margin.left + chartWidth;
      const loadY = zeroLineY - currentValues.load * supplyScale;
      const solarY = zeroLineY - currentValues.solar * supplyScale;
      const batteryDischargeY = zeroLineY - (currentValues.solar + currentValues.batteryDischarge) * supplyScale;
      const gridImportY = zeroLineY - (currentValues.solar + currentValues.batteryDischarge + currentValues.gridImport) * supplyScale;
      const batteryChargeY = zeroLineY + currentValues.batteryCharge * demandScale;
      const gridExportY = zeroLineY + (currentValues.batteryCharge + currentValues.gridExport) * demandScale;
      const formatValue = (value) => {
        return `${Math.round(value)} W`;
      };
      const updateIndicator = (id, y, color, iconType, value, prefix = "", shouldShow = true, entity, tapAction) => {
        let group = indicatorsGroup.querySelector(`#${id}`);
        if (!shouldShow) {
          if (group) group.remove();
          return;
        }
        if (!group) {
          group = document.createElementNS("http://www.w3.org/2000/svg", "g");
          group.setAttribute("id", id);
          group.style.cursor = "pointer";
          const iconPath = iconPaths[iconType];
          if (iconPath) {
            const icon = document.createElementNS("http://www.w3.org/2000/svg", "g");
            icon.setAttribute("class", "indicator-icon");
            icon.setAttribute("transform", "translate(10, -8) scale(0.67)");
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", iconPath);
            path.setAttribute("fill", color);
            icon.appendChild(path);
            group.appendChild(icon);
          }
          const text2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
          text2.setAttribute("class", "indicator-text");
          text2.setAttribute("x", "28");
          text2.setAttribute("y", "4");
          text2.setAttribute("fill", color);
          text2.setAttribute("font-size", "12");
          text2.setAttribute("font-weight", "600");
          group.appendChild(text2);
          if (entity && tapAction) {
            group.addEventListener("click", () => {
              handleAction(this.hass, this.fireEvent, tapAction, entity);
            });
          }
          indicatorsGroup.appendChild(group);
        }
        group.setAttribute("transform", `translate(${rightX + 10}, ${y})`);
        const text = group.querySelector(".indicator-text");
        if (text) {
          text.textContent = `${prefix}${value}`;
        }
      };
      updateIndicator("indicator-solar", solarY, "#388e3c", "solar", formatValue(currentValues.solar), "", currentValues.solar > 0, this.config.production_entity, this.config.production_tap_action);
      updateIndicator("indicator-battery-discharge", batteryDischargeY, "#1976d2", "battery", formatValue(currentValues.batteryDischarge), "+", currentValues.batteryDischarge > 0, this.config.battery_entity, this.config.battery_tap_action);
      updateIndicator("indicator-grid-import", gridImportY, "#c62828", "grid", formatValue(currentValues.gridImport), "", currentValues.gridImport > 0, this.config.grid_entity, this.config.grid_tap_action);
      updateIndicator("indicator-battery-charge", batteryChargeY, "#1976d2", "battery", formatValue(currentValues.batteryCharge), "-", currentValues.batteryCharge > 0, this.config.battery_entity, this.config.battery_tap_action);
      updateIndicator("indicator-grid-export", gridExportY, "#f9a825", "grid", formatValue(currentValues.gridExport), "", currentValues.gridExport > 0, this.config.grid_entity, this.config.grid_tap_action);
      updateIndicator("indicator-load", loadY, "#CCCCCC", "load", formatValue(currentValues.load), "", true, this.config.load_entity, this.config.load_tap_action);
    }
    /**
     * Update chart indicators with throttling
     */
    updateChartIndicators(svgElement) {
      if (!this.chartDataCache || !svgElement) return;
      const dataPoints = this.chartDataCache.dataPoints;
      const maxSupply = Math.max(...dataPoints.map((d) => d.solar + d.batteryDischarge + d.gridImport), ...dataPoints.map((d) => d.load));
      const maxDemand = Math.max(...dataPoints.map((d) => d.batteryCharge + d.gridExport));
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
      const iconPaths = {};
      ["load", "solar", "battery", "grid"].forEach((type) => {
        const iconName = this.getIcon(`${type}_icon`, `${type}_entity`, "");
        if (this.iconCache.has(iconName)) {
          iconPaths[type] = this.iconCache.get(iconName) || null;
        }
      });
      this.renderChartIndicators(svgElement, dataPoints, chartWidth, supplyHeight, demandHeight, supplyScale, demandScale, margin, iconPaths, zeroLineY);
    }
    /**
     * Add load line on top of chart
     */
    addLoadLineOnTop(svgElement, loadLine) {
      if (!loadLine) return;
      const existingLoadLine = svgElement.querySelector("#load-line");
      if (existingLoadLine) {
        existingLoadLine.remove();
      }
      const pathMatch = loadLine.match(/d="([^"]+)"/);
      if (!pathMatch) return;
      const pathData = pathMatch[1];
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("id", "load-line");
      path.setAttribute("d", pathData);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#CCCCCC");
      path.setAttribute("stroke-width", "3");
      path.setAttribute("opacity", "0.9");
      path.style.cursor = "pointer";
      path.addEventListener("click", () => {
        handleAction(this.hass, this.fireEvent, this.config.load_tap_action, this.config.load_entity);
      });
      svgElement.appendChild(path);
    }
    /**
     * Attach click handlers to chart areas
     */
    attachChartAreaClickHandlers(svgElement) {
      const solarArea = svgElement.querySelector("#chart-area-solar");
      if (solarArea) {
        solarArea.addEventListener("click", () => {
          handleAction(this.hass, this.fireEvent, this.config.production_tap_action, this.config.production_entity);
        });
      }
      const batteryDischargeArea = svgElement.querySelector("#chart-area-battery-discharge");
      if (batteryDischargeArea) {
        batteryDischargeArea.addEventListener("click", () => {
          handleAction(this.hass, this.fireEvent, this.config.battery_tap_action, this.config.battery_entity);
        });
      }
      const batteryChargeArea = svgElement.querySelector("#chart-area-battery-charge");
      if (batteryChargeArea) {
        batteryChargeArea.addEventListener("click", () => {
          handleAction(this.hass, this.fireEvent, this.config.battery_tap_action, this.config.battery_entity);
        });
      }
      const gridImportArea = svgElement.querySelector("#chart-area-grid-import");
      if (gridImportArea) {
        gridImportArea.addEventListener("click", () => {
          handleAction(this.hass, this.fireEvent, this.config.grid_tap_action, this.config.grid_entity);
        });
      }
      const gridExportArea = svgElement.querySelector("#chart-area-grid-export");
      if (gridExportArea) {
        gridExportArea.addEventListener("click", () => {
          handleAction(this.hass, this.fireEvent, this.config.grid_tap_action, this.config.grid_entity);
        });
      }
    }
    /**
     * Clear cache (e.g., when data becomes stale)
     */
    clearCache() {
      this.chartDataCache = void 0;
    }
  }
  class EnergyFlowCard extends HTMLElement {
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
          { name: "view_mode", label: "View Mode", selector: { select: { options: [{ value: "default", label: "Default" }, { value: "compact", label: "Compact Bar" }, { value: "compact-battery", label: "Compact with Battery" }, { value: "chart", label: "Chart" }] } } },
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
      this._resizeObserver = new ResizeObserver(() => {
      });
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
      if (this._defaultRenderer) {
        this._defaultRenderer.stop();
      }
      if (this._chartRenderer) {
        this._chartRenderer.cleanup();
      }
    }
    setConfig(config) {
      this._config = this._normalizeConfig(config);
      this._renderSafely("setConfig");
    }
    set hass(hass) {
      this._hass = hass;
      this._renderSafely("hass update");
    }
    _renderSafely(context) {
      try {
        this._render();
      } catch (error) {
        console.error("[EnergyFlowCard] render failed during", context, error);
        this.innerHTML = `
        <ha-card>
          <div style="padding:16px;">
            Energy Flow Card failed to render. Check browser console for details.
          </div>
        </ha-card>
      `;
      }
    }
    _render() {
      if (!this._config || !this._hass) return;
      if (!this._config.load) return;
      const gridState = this._getEntityState(this._config.grid?.entity);
      const loadState = this._getEntityState(this._config.load.entity);
      const productionState = this._getEntityState(this._config.production?.entity);
      const batteryState = this._getEntityState(this._config.battery?.entity);
      const grid = parseFloat(gridState?.state ?? "0") || 0;
      const load = parseFloat(loadState?.state ?? "0") || 0;
      const production = parseFloat(productionState?.state ?? "0") || 0;
      let battery = parseFloat(batteryState?.state ?? "0") || 0;
      if (this._config.battery?.invert?.data) {
        battery = -battery;
      }
      const viewMode = this._config.mode || "default";
      if (this._lastViewMode === "chart" && viewMode !== "chart" && this._chartRenderer) {
        this._chartRenderer.cleanup();
      }
      if (viewMode === "compact" || viewMode === "compact-battery") {
        this._renderCompactView(grid, load, production, battery, viewMode);
        this._lastViewMode = viewMode;
        return;
      }
      if (viewMode === "chart") {
        if (!this._chartRenderer) {
          const chartConfig = {
            production_entity: this._config.production?.entity || "",
            grid_entity: this._config.grid?.entity || "",
            load_entity: this._config.load.entity,
            battery_entity: this._config.battery?.entity || "",
            invert_battery_data: this._config.battery?.invert?.data,
            production_icon: this._config.production?.icon,
            grid_icon: this._config.grid?.icon,
            load_icon: this._config.load.icon,
            battery_icon: this._config.battery?.icon,
            production_tap_action: this._config.production?.tap,
            grid_tap_action: this._config.grid?.tap,
            load_tap_action: this._config.load.tap,
            battery_tap_action: this._config.battery?.tap
          };
          this._chartRenderer = new ChartRenderer(this._hass, chartConfig, this._fireEvent.bind(this));
        }
        this._chartRenderer.updateLiveValues({ grid, load, production, battery });
        this._chartRenderer.render(this);
        this._lastViewMode = viewMode;
        return;
      }
      if (!this._defaultRenderer) {
        this._defaultRenderer = new DefaultRenderer(
          this,
          this._config,
          this._hass,
          this._getDisplayName.bind(this),
          this._getIcon.bind(this),
          this._fireEvent.bind(this)
        );
      }
      const flows = this._calculateFlows(grid, production, load, battery);
      this._defaultRenderer.render({ grid, load, production, battery, flows });
      this._lastViewMode = viewMode;
    }
    _getEntityState(entityId) {
      if (!entityId) return void 0;
      return this._hass?.states?.[entityId];
    }
    _getEntityConfigByType(type) {
      return this._config?.[type];
    }
    _getDisplayName(type, fallback) {
      const entityConfig = this._getEntityConfigByType(type);
      if (!entityConfig) return fallback;
      if (entityConfig.name) {
        return entityConfig.name;
      }
      if (entityConfig.entity) {
        const entityState = this._getEntityState(entityConfig.entity);
        if (entityState?.attributes?.friendly_name) {
          return entityState.attributes.friendly_name;
        }
      }
      return fallback;
    }
    _getIcon(type, fallback) {
      const entityConfig = this._getEntityConfigByType(type);
      if (!entityConfig) return fallback;
      if (entityConfig.icon) {
        return entityConfig.icon;
      }
      if (entityConfig.entity) {
        const entityState = this._getEntityState(entityConfig.entity);
        if (entityState?.attributes?.icon) {
          return entityState.attributes.icon;
        }
      }
      return fallback;
    }
    _handleAction(actionConfig, entityId) {
      if (!this._hass) return;
      const config = actionConfig || { action: "more-info" };
      const action = config.action || "more-info";
      switch (action) {
        case "more-info":
          const entityToShow = config.entity || entityId;
          this._fireEvent("hass-more-info", { entityId: entityToShow });
          break;
        case "navigate":
          if (config.navigation_path) {
            history.pushState(null, "", config.navigation_path);
            this._fireEvent("location-changed", { replace: config.navigation_replace || false });
          }
          break;
        case "url":
          if (config.url_path) {
            window.open(config.url_path);
          }
          break;
        case "toggle":
          this._hass.callService("homeassistant", "toggle", { entity_id: entityId });
          break;
        case "perform-action":
          if (config.perform_action) {
            const [domain, service] = config.perform_action.split(".");
            this._hass.callService(domain, service, config.data || {}, config.target);
          }
          break;
        case "assist":
          this._fireEvent("show-dialog", {
            dialogTag: "ha-voice-command-dialog",
            dialogParams: {
              pipeline_id: config.pipeline_id || "last_used",
              start_listening: config.start_listening
            }
          });
          break;
      }
    }
    _fireEvent(type, detail = {}) {
      if (type === "call-service" && this._hass) {
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
    /**
     * Calculate energy flows between meters based on sensor readings.
     * Uses the tested calculateEnergyFlows function.
     */
    _calculateFlows(grid, production, load, battery) {
      return calculateEnergyFlows({ grid, production, load, battery });
    }
    _renderCompactView(grid, load, production, battery, viewMode) {
      if (!this._config || !this._hass) return;
      if (!this._compactRenderer) {
        this._compactRenderer = new CompactRenderer(
          this,
          this._config,
          this._hass,
          viewMode,
          (type, fallback) => this._getIcon(type, fallback),
          (action, entity) => this._handleAction(action, entity)
        );
      } else {
        this._compactRenderer.setViewMode(viewMode);
      }
      const flows = this._calculateFlows(grid, production, load, battery);
      let batterySoc = null;
      if (this._config.battery?.soc_entity) {
        const socState = this._getEntityState(this._config.battery.soc_entity);
        batterySoc = parseFloat(socState?.state ?? "0") || 0;
      }
      this._compactRenderer.render({
        grid,
        load,
        production,
        battery,
        flows,
        batterySoc
      });
    }
    _normalizeConfig(config) {
      if (config.load) {
        return config;
      }
      const normalizeEntity = (prefix) => {
        const entityId = config[`${prefix}_entity`];
        if (!entityId) return void 0;
        const normalized = { entity: entityId };
        const name = config[`${prefix}_name`];
        const icon = config[`${prefix}_icon`];
        const min = config[`${prefix}_min`];
        const max = config[`${prefix}_max`];
        const tap = config[`${prefix}_tap_action`];
        const hold = config[`${prefix}_hold_action`];
        if (name !== void 0) normalized.name = name;
        if (icon !== void 0) normalized.icon = icon;
        if (min !== void 0) normalized.min = min;
        if (max !== void 0) normalized.max = max;
        if (tap !== void 0) normalized.tap = tap;
        if (hold !== void 0) normalized.hold = hold;
        return normalized;
      };
      const load = normalizeEntity("load");
      const grid = normalizeEntity("grid");
      const production = normalizeEntity("production");
      const batteryEntity = normalizeEntity("battery");
      if (batteryEntity) {
        const soc = config["battery_soc_entity"];
        const invertData = config["invert_battery_data"];
        const invertView = config["invert_battery_view"];
        const showPlus = config["show_plus"];
        if (soc !== void 0) batteryEntity.soc_entity = soc;
        if (invertData !== void 0 || invertView !== void 0) {
          batteryEntity.invert = {
            data: invertData !== void 0 ? invertData : batteryEntity.invert?.data,
            view: invertView !== void 0 ? invertView : batteryEntity.invert?.view
          };
        }
        if (showPlus !== void 0) batteryEntity.showPlus = showPlus;
      }
      const mode = config.view_mode || config.mode;
      if (!load) {
        return config;
      }
      return {
        mode,
        load,
        grid,
        production,
        battery: batteryEntity
      };
    }
  }
  const CARD_TAG = "energy-flow-card";
  if (!customElements.get(CARD_TAG)) {
    customElements.define(CARD_TAG, EnergyFlowCard);
    console.info("[EnergyFlowCard] defined custom element");
  } else {
    console.info("[EnergyFlowCard] custom element already defined");
  }
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "custom:energy-flow-card",
    name: "Energy Flow Card",
    description: "A test energy-flow card."
  });
})();
//# sourceMappingURL=energy-flow-card.js.map
