/**
 * Animation controller for compact card bar gradients
 */

export class AnimationController {
  private animationFrameId: number | null = null;
  private loadPosition = 0;
  private batteryPosition = 0;
  private loadSpeed = 0;
  private batterySpeed = 0;
  private batteryDirection: 'up' | 'down' | 'none' = 'none';
  private lastAnimationTime = 0;
  
  private loadBarElement?: HTMLElement;
  private batteryBarElement?: HTMLElement;

  /**
   * Calculate animation speed based on power flow
   * Higher power = faster animation
   */
  getAnimationSpeed(watts: number): number {
    if (watts <= 0) return 0;
    const referenceWatts = 100;
    const referenceSpeed = 2.5; // % per second at 100W
    return (watts / referenceWatts) * referenceSpeed;
  }

  /**
   * Update load bar animation speed
   */
  setLoadSpeed(watts: number): void {
    this.loadSpeed = this.getAnimationSpeed(watts);
  }

  /**
   * Update battery bar animation speed and direction
   */
  setBatteryAnimation(watts: number, direction: 'up' | 'down' | 'none'): void {
    this.batterySpeed = this.getAnimationSpeed(Math.abs(watts));
    
    // Reset position when direction changes
    if (direction !== this.batteryDirection) {
      if (direction === 'up') {
        this.batteryPosition = 100; // Start from bottom for charging
      } else if (direction === 'down') {
        this.batteryPosition = -100; // Start from top for discharging
      }
    }
    
    this.batteryDirection = direction;
  }

  /**
   * Start the animation loop
   */
  start(shadowRoot: ShadowRoot | null): void {
    if (this.animationFrameId !== null) return;
    if (!shadowRoot) return;

    this.loadBarElement = shadowRoot.querySelector('.compact-row:not(#battery-row) .bar-container') as HTMLElement;
    this.batteryBarElement = shadowRoot.querySelector('#battery-row .bar-container') as HTMLElement;
    
    this.lastAnimationTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - this.lastAnimationTime) / 1000;
      this.lastAnimationTime = currentTime;

      // Update load bar horizontal gradient
      if (this.loadSpeed > 0 && this.loadBarElement) {
        this.loadPosition += this.loadSpeed * deltaTime;
        if (this.loadPosition > 100) this.loadPosition = -100;
        this.loadBarElement.style.setProperty('--gradient-x', `${this.loadPosition}%`);
      }

      // Update battery bar vertical gradient
      if (this.batterySpeed > 0 && this.batteryDirection !== 'none' && this.batteryBarElement) {
        if (this.batteryDirection === 'up') {
          this.batteryPosition -= this.batterySpeed * deltaTime;
          if (this.batteryPosition < -100) this.batteryPosition = 100;
        } else {
          this.batteryPosition += this.batterySpeed * deltaTime;
          if (this.batteryPosition > 100) this.batteryPosition = -100;
        }
        this.batteryBarElement.style.setProperty('--gradient-y', `${this.batteryPosition}%`);
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Stop the animation loop
   */
  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.loadBarElement = undefined;
    this.batteryBarElement = undefined;
  }

  /**
   * Check if animation is running
   */
  isRunning(): boolean {
    return this.animationFrameId !== null;
  }
}
