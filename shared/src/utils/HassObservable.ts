import type { HomeAssistant } from '../types/HASS';

/**
 * Lightweight observable wrapper for Home Assistant state changes.
 * Tracks entity state changes and notifies subscribers only when their watched entities actually change.
 * 
 * Usage:
 * ```typescript
 * const observable = new HassObservable();
 * 
 * // In card's hass setter
 * set hass(hass: HomeAssistant) {
 *   observable.updateHass(hass);
 * }
 * 
 * // Subscribe to specific entities
 * const unsubscribe = observable.subscribe('sensor.solar_power', (state) => {
 *   console.log('Solar power changed to:', state);
 * });
 * 
 * // Selective cleanup
 * unsubscribe();
 * 
 * // Or clear all at once
 * observable.unsubscribeAll();
 * ```
 */
export class HassObservable {
  private prevHass?: HomeAssistant;
  private currentHass?: HomeAssistant;
  private subscriptions = new Map<string, Set<(state: string) => void>>();

  /**
   * Get the current Home Assistant state object.
   */
  get hass(): HomeAssistant | undefined {
    return this.currentHass;
  }

  /**
   * Update with new hass object from Home Assistant.
   * Compares subscribed entity states and fires callbacks for changed values.
   */
  updateHass(hass: HomeAssistant): void {
    this.prevHass = this.currentHass;
    this.currentHass = hass;
    
    // Check only subscribed entities for changes
    for (const entityId of this.subscriptions.keys()) {
      const oldState = this.prevHass?.states?.[entityId]?.state;
      const newState = this.currentHass?.states?.[entityId]?.state;
      
      // Dispatch if state changed
      if (newState !== undefined && newState !== oldState) {
        this.dispatch(entityId, newState);
      }
    }
  }

  /**
   * Dispatch state change to all subscribers of an entity.
   */
  private dispatch(entityId: string, state: string): void {
    const callbacks = this.subscriptions.get(entityId);
    if (!callbacks) return;
    
    callbacks.forEach(cb => {
      try {
        cb(state);
      } catch (error) {
        console.error(`[HassObservable] Error in callback for ${entityId}:`, error);
      }
    });
  }

  /**
   * Subscribe to state changes for a specific entity.
   * The callback fires immediately with the current value (if available)
   * and then on every subsequent change.
   * 
   * @param entityId - The entity ID to watch (e.g., 'sensor.solar_power')
   * @param callback - Function to call when the entity state changes
   * @returns Disposer function to unsubscribe
   */
  subscribe(entityId: string, callback: (state: string) => void): () => void {
    // Add to subscriptions
    if (!this.subscriptions.has(entityId)) {
      this.subscriptions.set(entityId, new Set());
    }
    this.subscriptions.get(entityId)!.add(callback);
    
    // Immediately fire with current value if available
    const currentState = this.currentHass?.states?.[entityId]?.state;
    if (currentState !== undefined) {
      try {
        callback(currentState);
      } catch (error) {
        console.error(`[HassObservable] Error in initial callback for ${entityId}:`, error);
      }
    }
    
    // Return disposer function
    return () => {
      const callbacks = this.subscriptions.get(entityId);
      if (callbacks) {
        callbacks.delete(callback);
        // Clean up empty subscription sets
        if (callbacks.size === 0) {
          this.subscriptions.delete(entityId);
        }
      }
    };
  }

  /**
   * Get the current state of an entity without subscribing.
   */
  getState(entityId: string): string | undefined {
    return this.currentHass?.states?.[entityId]?.state;
  }

  /**
   * Check if an entity exists in the current hass state.
   */
  hasEntity(entityId: string): boolean {
    return this.currentHass?.states?.[entityId] !== undefined;
  }

  /**
   * Remove all subscriptions.
   * Hass references are retained for potential reconnection.
   */
  unsubscribeAll(): void {
    this.subscriptions.clear();
  }

  /**
   * Get the number of active subscriptions (for debugging).
   */
  get subscriptionCount(): number {
    let count = 0;
    this.subscriptions.forEach((callbacks) => {
      count += callbacks.size;
    });
    return count;
  }
}
