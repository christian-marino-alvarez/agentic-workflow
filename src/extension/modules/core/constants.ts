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

import { ModelCapabilities } from './types.js';

/**
 * Heuristic mapping to detect capabilities based on the model ID/name string.
 */
export const MODEL_CAPABILITY_MAP: Record<string, Omit<ModelCapabilities, 'streaming'>> = {
  // OpenAI Models
  'gpt-4o': { vision: true, tools: true, code: true },
  'gpt-4-turbo': { vision: true, tools: true, code: true },
  'gpt-4': { vision: false, tools: true, code: true },
  'gpt-3.5-turbo': { vision: false, tools: true, code: false },

  // Anthropic Models
  'claude-3-5-sonnet': { vision: true, tools: true, code: true },
  'claude-3-opus': { vision: true, tools: true, code: true },
  'claude-3-sonnet': { vision: true, tools: true, code: true },
  'claude-3-haiku': { vision: true, tools: true, code: true },

  // Google Models
  'gemini-1.5-pro': { vision: true, tools: true, code: true },
  'gemini-1.5-flash': { vision: true, tools: true, code: true },
  'gemini-1.0-pro': { vision: false, tools: true, code: false },

  // Default Fallback
  'default': { vision: false, tools: false, code: false }
};
