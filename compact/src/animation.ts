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

  private lastTickTime = 0;

  private loadBarElement?: HTMLElement;
  private batteryBarElement?: HTMLElement;

  // 30fps is sufficient and friendlier to WKWebView.
  private readonly minFrameMs = 1000 / 30;
  // Ignore tiny flows to avoid flicker/ghost animation.
  private readonly minAnimatedWatts = 10;

  getAnimationSpeed(watts: number): number {
    if (watts <= this.minAnimatedWatts) return 0;
    const referenceWatts = 100;
    const referenceSpeed = 2.5; // % per second at 100W
    return (watts / referenceWatts) * referenceSpeed;
  }

  setLoadSpeed(watts: number): void {
    this.loadSpeed = this.getAnimationSpeed(watts);
    this.stopIfIdle();
  }

  setBatteryAnimation(watts: number, direction: 'up' | 'down' | 'none'): void {
    this.batterySpeed = this.getAnimationSpeed(Math.abs(watts));

    if (direction !== this.batteryDirection) {
      if (direction === 'up') this.batteryPosition = 100;
      else if (direction === 'down') this.batteryPosition = -100;
    }

    this.batteryDirection = direction;
    this.stopIfIdle();
  }

  start(shadowRoot: ShadowRoot | null): void {
    if (this.animationFrameId !== null) return;
    if (!shadowRoot) return;

    // Don’t start a hot loop if idle.
    if (!this.hasWork()) return;

    this.loadBarElement = shadowRoot.querySelector(
      '.compact-row:not(#battery-row) .bar-container'
    ) as HTMLElement;

    this.batteryBarElement = shadowRoot.querySelector(
      '#battery-row .bar-container'
    ) as HTMLElement;

    this.lastTickTime = performance.now();

    const animate = (currentTime: number) => {
      if (!this.hasWork()) {
        this.stop();
        return;
      }

      const elapsedMs = currentTime - this.lastTickTime;

      // Throttle to ~30fps; if not enough time has passed, schedule next tick.
      if (elapsedMs < this.minFrameMs) {
        this.animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = elapsedMs / 1000;
      this.lastTickTime = currentTime;

      if (this.loadSpeed > 0 && this.loadBarElement) {
        this.loadPosition += this.loadSpeed * deltaTime;
        if (this.loadPosition > 100) this.loadPosition = -100;
        this.loadBarElement.style.setProperty('--gradient-x', `${this.loadPosition}%`);
      }

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

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.loadBarElement = undefined;
    this.batteryBarElement = undefined;
  }

  isRunning(): boolean {
    return this.animationFrameId !== null;
  }

  private hasWork(): boolean {
    const loadActive = this.loadSpeed > 0;
    const batteryActive = this.batterySpeed > 0 && this.batteryDirection !== 'none';
    return loadActive || batteryActive;
  }

  private stopIfIdle(): void {
    if (this.animationFrameId === null) return;
    if (!this.hasWork()) this.stop();
  }
}
