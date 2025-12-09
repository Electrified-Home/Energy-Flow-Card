/**
 * Home Assistant type definitions
 */

/** Home Assistant entity state */
export interface HassEntity {
  state: string;
  attributes: {
    friendly_name?: string;
    icon?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/** Home Assistant instance */
export interface HomeAssistant {
  states: {
    [entity_id: string]: HassEntity;
  };
  [key: string]: any;
}
