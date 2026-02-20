import { PROVIDERS, AUTH_TYPES } from './constants.js';
import { ModelCapabilities } from '../core/types.js';

export interface LLMModelConfig {
  id: string;
  name: string;
  provider: (typeof PROVIDERS)[keyof typeof PROVIDERS];
  baseUrl?: string;
  authType: (typeof AUTH_TYPES)[keyof typeof AUTH_TYPES];
  apiKey?: string; // In-memory only, stored in secrets
  maxTokens?: number;
  temperature?: number;
  modelName: string;
  capabilities?: ModelCapabilities;
}
