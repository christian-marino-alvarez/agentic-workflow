/**
 * Origin of a message.
 */
export const MessageOrigin = {
  View: 'view',
  Server: 'server'
} as const;

/**
 * Scopes for the different layers.
 */
export const LayerScope = {
  Backend: 'backend',
  View: 'view',
  Background: 'background'
} as const;
