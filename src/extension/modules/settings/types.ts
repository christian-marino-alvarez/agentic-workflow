export interface LLMModelConfig {
  id: string;
  name: string;
  provider: 'gemini' | 'codex' | 'claude';
  baseUrl?: string;
  apiKey?: string; // In-memory only, stored in secrets
  maxTokens?: number;
  temperature?: number;
  modelName: string;
}
