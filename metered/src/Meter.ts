/** Needle animation state for meters */
export interface NeedleState {
  /** Target angle in degrees */
  target: number;
  /** Current angle in degrees */
  current: number;
  /** Ghost needle angle (lags behind current) */
  ghost: number;
}

/** Action configuration (imported from Config types) */
import type { ActionConfig } from '../../shared/src/types/Config.js';

/**
 * Meter class: Fully self-contained gauge meter with rendering and animation
 */
export class Meter {
  id: string;
  private _value: number;
  min: number;
  max: number;
  bidirectional: boolean;
  label: string;
  icon: string;
  units: string;
  private _invertView: boolean;
  showPlus: boolean;
  
  // Tap action configuration
  private tapAction: ActionConfig | undefined;
  private entityId: string | undefined;
  private fireEventCallback: ((event: string, detail?: any) => void) | undefined;
  
  // DOM element this meter owns
  element: SVGGElement | null;

  // Meter geometry constants
  radius: number;
  boxWidth: number;
  boxHeight: number;
  boxRadius: number;
  centerX: number;
  centerY: number;
  offsetX: number;
  offsetY: number;

  // Needle animation state
  needleState: NeedleState;
  private _lastAnimationTime: number | null;
  private _animationFrameId: number | null;
  
  // Cached needle references
  private _needle: SVGLineElement | null;
  private _ghostNeedle: SVGLineElement | null;

  constructor(
    id: string,
    value: number,
    min: number,
    max: number,
    bidirectional: boolean,
    label: string,
    icon: string,
    units: string,
    invertView = false,
    showPlus = false,
    tapAction?: ActionConfig,
    entityId?: string,
    fireEventCallback?: (event: string, detail?: any) => void
  ) {
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
    this._needle = null;
    this._ghostNeedle = null;

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

  get value(): number {
    return this._value;
  }

  set value(newValue: number) {
    if (this._value === newValue) return; // No change, skip update

    this._value = newValue;
    this._updateNeedleAngle();

    // Update value text immediately
    if (this.element) {
      const valueText = this.element.querySelector(`#value-${this.id}`);
      if (valueText) {
        valueText.textContent = this._formatValueText();
      }

      // Update dimming
      this.updateDimming();
    }
  }

  get invertView(): boolean {
    return this._invertView;
  }

  set invertView(newInvertView: boolean) {
    if (this._invertView === newInvertView) return; // No change, skip update

    this._invertView = newInvertView;
    this._updateNeedleAngle();

    // Update value text immediately (displayValue depends on invertView)
    if (this.element) {
      const valueText = this.element.querySelector(`#value-${this.id}`);
      if (valueText) {
        valueText.textContent = this._formatValueText();
      }
    }
  }

  get displayValue(): number {
    return this._invertView ? -this._value : this._value;
  }

  _formatValueText(): string {
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

  _updateNeedleAngle(): void {
    let percentage: number;
    let angle: number;
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

  updateDimming(): void {
    if (!this.element) return;

    const dimmer = this.element.querySelector(`#dimmer-${this.id}`);
    if (dimmer) {
      const isZero = Math.abs(this.value) < 0.5;
      dimmer.setAttribute('opacity', isZero ? '0.3' : '0');
    }
  }

  startAnimation(): void {
    if (this._animationFrameId) return; // Already animating

    const animate = (timestamp: number) => {
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

      // Cache needle references on first frame
      if (!this._needle && this.element) {
        this._needle = this.element.querySelector(`#needle-${this.id}`);
        this._ghostNeedle = this.element.querySelector(`#ghost-needle-${this.id}`);
      }
      
      // Update main needle
      if (this._needle) {
        const needleRad = (this.needleState.current * Math.PI) / 180;
        const needleX = this.centerX + needleLength * Math.cos(needleRad);
        const needleY = this.centerY - needleLength * Math.sin(needleRad);
        this._needle.setAttribute('x2', String(needleX));
        this._needle.setAttribute('y2', String(needleY));
      }

      // Update ghost needle
      if (this._ghostNeedle) {
        const ghostRad = (this.needleState.ghost * Math.PI) / 180;
        const ghostX = this.centerX + needleLength * Math.cos(ghostRad);
        const ghostY = this.centerY - needleLength * Math.sin(ghostRad);
        this._ghostNeedle.setAttribute('x2', String(ghostX));
        this._ghostNeedle.setAttribute('y2', String(ghostY));
      }

      this._animationFrameId = requestAnimationFrame(animate);
    };

    this._animationFrameId = requestAnimationFrame(animate);
  }

  stopAnimation(): void {
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
      this._lastAnimationTime = null;
    }
    this._needle = null;
    this._ghostNeedle = null;
  }

  /**
   * Handle tap action when meter is clicked
   */
  private _handleTapAction(): void {
    if (!this.fireEventCallback) return;

    // Default to more-info if no tap action configured
    const config = this.tapAction || { action: 'more-info' as const };
    const action = config.action || 'more-info';

    switch (action) {
      case 'more-info':
        const entityId = config.entity || this.entityId;
        if (entityId) {
          this.fireEventCallback('hass-more-info', { entityId });
        }
        break;

      case 'navigate':
        if (config.path) {
          history.pushState(null, '', config.path);
          this.fireEventCallback('location-changed', { replace: false });
        }
        break;

      case 'url':
        if (config.path) {
          window.open(config.path);
        }
        break;

      case 'toggle':
        if (this.entityId) {
          this.fireEventCallback('call-service', {
            domain: 'homeassistant',
            service: 'toggle',
            service_data: { entity_id: this.entityId }
          });
        }
        break;

      case 'call-service':
        if (config.service) {
          const [domain, service] = config.service.split('.');
          this.fireEventCallback('call-service', {
            domain,
            service,
            service_data: config.service_data || {},
            target: config.target
          });
        }
        break;

      case 'none':
        // Do nothing
        break;
    }
  }

  /**
   * Create and return the SVG element for this meter
   */
  /**
   * Create and return the SVG element for this meter
   */
  createElement(): SVGGElement {
    const displayValue = this.displayValue;

    // Calculate percentage and angle for needle
    let percentage: number;
    let angle: number;
    if (this.bidirectional) {
      const range = this.max - this.min;
      percentage = Math.min(Math.max((displayValue - this.min) / range, 0), 1);
      angle = 180 - percentage * 180;
    } else {
      percentage = Math.min(Math.max(displayValue / this.max, 0), 1);
      angle = 180 - percentage * 180;
    }

    // Initialize needle state
    this.needleState.target = angle;
    this.needleState.current = angle;
    this.needleState.ghost = angle;

    // Generate tick marks
    const ticks = this.bidirectional ? [this.min, 0, this.max] : [0, this.max / 2, this.max];
    const tickMarks = ticks
      .map((tickValue) => {
        const tickPercentage = this.bidirectional
          ? (tickValue - this.min) / (this.max - this.min)
          : tickValue / this.max;
        const tickAngle = 180 - tickPercentage * 180;
        const tickRad = (tickAngle * Math.PI) / 180;
        const tickStartR = this.radius;
        const tickEndR = this.radius - 8;

        const x1 = this.centerX + tickStartR * Math.cos(tickRad);
        const y1 = this.centerY - tickStartR * Math.sin(tickRad);
        const x2 = this.centerX + tickEndR * Math.cos(tickRad);
        const y2 = this.centerY - tickEndR * Math.sin(tickRad);

        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgb(160, 160, 160)" stroke-width="2" />`;
      })
      .join('');

    // Zero line
    const zeroPercentage = this.bidirectional ? (0 - this.min) / (this.max - this.min) : 0;
    const zeroAngle = 180 - zeroPercentage * 180;
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

    // Create element from markup using a temporary container
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    container.innerHTML = svgMarkup;
    const element = container.firstElementChild as SVGGElement;

    // Store reference to owned element
    this.element = element;

    // Attach click handler (defaults to more-info if no action configured)
    // Only skip if explicitly set to 'none'
    if (!this.tapAction || this.tapAction.action !== 'none') {
      element.style.cursor = 'pointer';
      element.addEventListener('click', (e) => {
        this._handleTapAction();
        e.stopPropagation();
      });
      
      // Add hover effect
      element.addEventListener('mouseenter', () => {
        element.style.filter = 'brightness(1.1)';
      });
      element.addEventListener('mouseleave', () => {
        element.style.filter = '';
      });
    }

    return element;
  }
}
