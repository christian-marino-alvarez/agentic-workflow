export const NAME = 'llm';

export const COMMANDS = {
  RUN: 'run',
  STREAM: 'stream',
};

export const MESSAGES = {
  LLM_REQUEST: 'LLM_REQUEST',
  LLM_RESPONSE: 'LLM_RESPONSE',
};

export const SIDECAR_BASE_URL = 'http://127.0.0.1:3000/llm';

export const API_ENDPOINTS = {
  RUN: '/run',
  STREAM: '/stream',
  MODELS: '/models',
};

export const DEFAULT_MODELS = {
  GEMINI: 'gemini-2.5-flash',
  CLAUDE: 'claude-sonnet-4-20250514',
};

/**
 * Represents a model available from a provider API.
 */
export interface ProviderModel {
  id: string;
  displayName: string;
}

/**
 * Claude models (Anthropic has no list-models endpoint).
 */
export const CLAUDE_MODELS: ProviderModel[] = [
  { id: 'claude-sonnet-4-20250514', displayName: 'Claude Sonnet 4' },
  { id: 'claude-3-5-sonnet-20241022', displayName: 'Claude 3.5 Sonnet' },
  { id: 'claude-3-5-haiku-20241022', displayName: 'Claude 3.5 Haiku' },
  { id: 'claude-3-opus-20240229', displayName: 'Claude 3 Opus' },
];
