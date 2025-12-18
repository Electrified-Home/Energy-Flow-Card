import { LitElement } from 'lit';
import type { HomeAssistant } from '../types/HASS';
import { HassObservable } from '../utils/HassObservable';

/**
 * Base class for Home Assistant custom cards.
 * Provides automatic hass state management with efficient entity subscriptions.
 * 
 * Usage:
 * ```typescript
 * class MyCard extends HassCardBase {
 *   protected setupSubscriptions(): void {
 *     this.subscribe('sensor.solar_power', (state) => {
 *       console.log('Solar changed:', state);
 *       this.requestUpdate();
 *     });
 *   }
 * 
 *   protected onHassUpdate(hass: HomeAssistant): void {
 *     // Called on every hass update (use sparingly)
 *   }
 * }
 * ```
 */
export abstract class HassCardBase extends LitElement {
  protected _hassObservable = new HassObservable();

  /**
   * Home Assistant state setter.
   * Automatically updates observable and triggers onHassUpdate.
   */
  set hass(hass: HomeAssistant) {
    this._hassObservable.updateHass(hass);
    this.onHassUpdate(hass);
  }

  get hass(): HomeAssistant | undefined {
    return this._hassObservable.hass;
  }

  /**
   * Called when card is connected to DOM.
   * Sets up entity subscriptions.
   */
  connectedCallback(): void {
    super.connectedCallback();
    this.setupSubscriptions();
  }

  /**
   * Called when card is disconnected from DOM.
   * Unsubscribes from all entities (but retains hass for reconnection).
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._hassObservable.unsubscribeAll();
  }

  /**
   * Reset subscriptions and set them up again.
   * Call this when config changes to update which entities are watched.
   * 
   * Example:
   * ```typescript
   * setConfig(config: MyConfig): void {
   *   this._config = config;
   *   this.resetSubscriptions();
   * }
   * ```
   */
  protected resetSubscriptions(): void {
    this._hassObservable.unsubscribeAll();
    this.setupSubscriptions();
  }

  /**
   * Subscribe to entity state changes.
   * Callback fires immediately with current value (if available)
   * and then on every subsequent change.
   * 
   * Subscriptions are automatically cleaned up on disconnect.
   * 
   * @param entityId - Entity to watch (e.g., 'sensor.solar_power')
   * @param callback - Called when entity state changes
   */
  protected subscribe(entityId: string, callback: (state: string) => void): void {
    this._hassObservable.subscribe(entityId, callback);
  }

  /**
   * Get current state of an entity without subscribing.
   */
  protected getState(entityId: string): string | undefined {
    return this._hassObservable.getState(entityId);
  }

  /**
   * Check if an entity exists in current hass state.
   */
  protected hasEntity(entityId: string): boolean {
    return this._hassObservable.hasEntity(entityId);
  }

  /**
   * Override this to set up entity subscriptions.
   * Called when card connects to DOM and when config changes.
   * Should check if config exists before subscribing.
   * 
   * Example:
   * ```typescript
   * protected setupSubscriptions(): void {
   *   if (!this.config) return;
   *   this.subscribe('sensor.solar_power', () => this.requestUpdate());
   *   this.subscribe('sensor.grid_power', () => this.requestUpdate());
   * }
   * ```
   */
  protected abstract setupSubscriptions(): void;

  /**
   * Override this to handle hass updates.
   * Called on EVERY hass state change (entire HA instance).
   * Use sparingly—prefer subscribe() for specific entities.
   * 
   * @param _hass - Full Home Assistant state object
   */
  protected onHassUpdate(_hass: HomeAssistant): void {
    // Optional override
  }
}
