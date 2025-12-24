/**
 * Animation controller for compact card bar gradients.
 * Uses WAAPI playbackRate to change speed without restarting and avoid rAF churn.
 */
type BatteryDirection = 'up' | 'down' | 'none';

export class AnimationController {
  private loadOverlays: HTMLElement[] = [];
  private batteryOverlays: HTMLElement[] = [];
  private loadAnimations: Animation[] = [];
  private batteryAnimations: Animation[] = [];
  private loadSpeed = 0;
  private batterySpeed = 0;
  private batteryDirection: BatteryDirection = 'none';
  private initialized = false;

  // Ignore tiny flows to avoid flicker/ghost animation.
  private readonly minAnimatedWatts = 8;
  private readonly batteryIdleEpsilon = 18; // treat tiny battery trickle as idle to avoid ghost shimmer
  private readonly referenceWatts = 100;
  private readonly referenceSpeed = 2.5; // % per second at reference watts
  private readonly baseDurationMs = 20_000; // ms for 200% travel
  private readonly activeOpacity = 0.75;
  private readonly waapiSupported = typeof Element !== 'undefined' && !!Element.prototype.animate;

  getAnimationSpeed(watts: number): number {
    if (watts <= this.minAnimatedWatts) return 0;
    return (watts / this.referenceWatts) * this.referenceSpeed;
  }

  setLoadSpeed(watts: number): void {
    this.loadSpeed = this.getAnimationSpeed(watts);
    this.applyLoadAnimation();
  }

  setBatteryAnimation(watts: number, direction: BatteryDirection): void {
    const magnitude = Math.abs(watts);
    if (magnitude < this.batteryIdleEpsilon) {
      this.batterySpeed = 0;
      this.batteryDirection = 'none';
    } else {
      this.batterySpeed = this.getAnimationSpeed(magnitude);
      this.batteryDirection = direction;
    }
    this.applyBatteryAnimation();
  }

  start(shadowRoot: ShadowRoot | null): void {
    if (!shadowRoot) return;

    const loadNodes = typeof (shadowRoot as any).querySelectorAll === 'function'
      ? (shadowRoot as any).querySelectorAll('.load-shine')
      : [typeof (shadowRoot as any).querySelector === 'function'
          ? (shadowRoot as any).querySelector('.load-shine')
          : null];

    const batteryNodes = typeof (shadowRoot as any).querySelectorAll === 'function'
      ? (shadowRoot as any).querySelectorAll('.battery-shine')
      : [typeof (shadowRoot as any).querySelector === 'function'
          ? (shadowRoot as any).querySelector('.battery-shine')
          : null];

    const loadAttached = this.attachOverlays('load', loadNodes, 'x');
    const batteryAttached = this.attachOverlays('battery', batteryNodes, 'y');

    // Only mark running when we actually have overlays to animate. This lets us retry
    // after the first data-render instead of getting stuck in an uninitialized state.
    this.initialized = loadAttached || batteryAttached;
    if (this.initialized) this.applyPlaybackStates();
  }

  stop(): void {
    this.cancelAnimations('load');
    this.cancelAnimations('battery');
    this.initialized = false;
  }

  isRunning(): boolean {
    return this.initialized;
  }

  private attachOverlays(
    kind: 'load' | 'battery',
    overlays: Iterable<Element | null>,
    axis: 'x' | 'y'
  ): boolean {
    const currentOverlays = kind === 'load' ? this.loadOverlays : this.batteryOverlays;
    const overlayArr = Array.from(overlays).filter((node): node is HTMLElement => node instanceof HTMLElement);

    // Reuse existing overlays if the nodes are identical to avoid restarting animations.
    const unchanged =
      currentOverlays.length === overlayArr.length &&
      currentOverlays.every((node, idx) => node === overlayArr[idx]);
    if (unchanged) return overlayArr.length > 0;

    this.cancelAnimations(kind);
    if (overlayArr.length === 0) return false;

    const animations: Animation[] = [];
    overlayArr.forEach((overlay, index) => {
      if (this.waapiSupported) {
        const animation = overlay.animate(
          axis === 'x'
            ? [{ transform: 'translateX(-100%)' }, { transform: 'translateX(100%)' }]
            : [{ transform: 'translateY(-100%)' }, { transform: 'translateY(100%)' }],
          {
            duration: this.baseDurationMs,
            easing: 'linear',
            iterations: Number.POSITIVE_INFINITY,
            fill: 'both'
          }
        );

        // Phase-shift each overlay so sweeps are staggered, reducing idle gaps without speeding up.
        if (animation.effect?.getComputedTiming) {
          const offset = (index / overlayArr.length) * this.baseDurationMs;
          animation.currentTime = offset;
        }

        animation.pause();
        animations.push(animation);
      } else {
        const fallbackClass = axis === 'x' ? 'shine-fallback-horizontal' : 'shine-fallback-vertical';
        overlay.classList.add(fallbackClass);
        overlay.style.animationPlayState = 'paused';
        overlay.style.animationDelay = `-${(index / overlayArr.length) * this.baseDurationMs}ms`;
      }
    });

    if (kind === 'load') {
      this.loadOverlays = overlayArr;
      this.loadAnimations = animations;
    } else {
      this.batteryOverlays = overlayArr;
      this.batteryAnimations = animations;
    }

    return true;
  }

  private cancelAnimations(kind: 'load' | 'battery'): void {
    const animations = kind === 'load' ? this.loadAnimations : this.batteryAnimations;
    const overlays = kind === 'load' ? this.loadOverlays : this.batteryOverlays;

    animations.forEach((animation) => animation.cancel());
    overlays.forEach((overlay) => {
      overlay.classList.remove('shine-fallback-horizontal', 'shine-fallback-vertical');
      overlay.style.animationPlayState = '';
      overlay.style.animationDirection = '';
      overlay.style.animationDelay = '';
    });

    if (kind === 'load') {
      this.loadAnimations = [];
      this.loadOverlays = [];
    } else {
      this.batteryAnimations = [];
      this.batteryOverlays = [];
    }
  }

  private applyPlaybackStates(): void {
    this.applyLoadAnimation();
    this.applyBatteryAnimation();
  }

  private applyLoadAnimation(): void {
    const active = this.loadSpeed > 0;
    const opacity = active ? `${this.activeOpacity}` : "0";

    if (this.waapiSupported) {
      if (this.loadAnimations.length === 0) return;
      if (!active) {
        this.loadAnimations.forEach((anim) => anim.pause());
      } else {
        const rate = this.getPlaybackRate(this.loadSpeed);
        this.loadAnimations.forEach((anim) => {
          anim.playbackRate = rate;
          if (anim.playState !== 'running') anim.play();
        });
      }
    }

    if (this.loadOverlays.length) {
      this.loadOverlays.forEach((overlay) => {
        overlay.style.animationPlayState = active ? 'running' : 'paused';
        overlay.style.opacity = opacity;
      });
    }
  }

  private applyBatteryAnimation(): void {
    const active = this.batterySpeed > 0 && this.batteryDirection !== 'none';
    const opacity = active ? `${this.activeOpacity}` : "0";

    if (this.waapiSupported) {
      if (this.batteryAnimations.length === 0) return;
      if (!active) {
        this.batteryAnimations.forEach((anim) => anim.pause());
      } else {
        const playbackRate = this.getPlaybackRate(this.batterySpeed);
        const isReverse = this.batteryDirection === 'up';

        this.batteryAnimations.forEach((anim) => {
          // Keep playbackRate positive for endless looping; flip direction via timing.
          anim.playbackRate = playbackRate;

          if (anim.effect?.updateTiming) {
            anim.effect.updateTiming({ direction: isReverse ? 'reverse' : 'normal' });
          }

          if (anim.playState !== 'running') {
            try {
              anim.play();
            } catch (_err) {
              anim.pause();
            }
          }
        });
      }
    }

    if (this.batteryOverlays.length) {
      this.batteryOverlays.forEach((overlay) => {
        overlay.style.animationDirection = this.batteryDirection === 'up' ? 'reverse' : 'normal';
        overlay.style.animationPlayState = active ? 'running' : 'paused';
        overlay.style.opacity = opacity;
      });
    }
  }

  private getPlaybackRate(speed: number): number {
    if (speed <= 0) return 0;

    // Slow overall velocity to ~1/3 of prior, then ease it down another 25%.
    return speed / (this.referenceSpeed * 3.75);
  }
}
