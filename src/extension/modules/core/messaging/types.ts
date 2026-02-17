
/**
 * Configuration for an LLM Model.
 */
export interface LLMModelConfig {
  id: string; // UUID
  name: string; // e.g. "GPT-4 Turbo Dev"
  provider: 'openai' | 'anthropic' | 'gemini' | 'custom';
  apiConfig: {
    apiKey?: string; // Stored in SecretStorage, never returned fully to UI
    endpoint?: string;
    modelName: string; // e.g. "gpt-4-turbo"
  };
}

/**
 * Global Application Settings.
 */
export interface AppSettings {
  language: 'es' | 'en';
  theme: 'system' | 'light' | 'dark';
  activeModelId: string;
  models: LLMModelConfig[]; // List of registered models
}

// --- Messages ---

export const SETTINGS_GET_REQUEST = 'SETTINGS_GET_REQUEST';
export type SettingsGetRequest = {
  command: typeof SETTINGS_GET_REQUEST;
  data: undefined;
};

export const SETTINGS_GET_RESPONSE = 'SETTINGS_GET_RESPONSE';
export type SettingsGetResponse = {
  command: typeof SETTINGS_GET_RESPONSE;
  data: AppSettings;
};

export const SETTINGS_UPDATE_REQUEST = 'SETTINGS_UPDATE_REQUEST';
export type SettingsUpdateRequest = {
  command: typeof SETTINGS_UPDATE_REQUEST;
  data: Partial<AppSettings>;
};

export const SETTINGS_UPDATE_RESPONSE = 'SETTINGS_UPDATE_RESPONSE';
export type SettingsUpdateResponse = {
  command: typeof SETTINGS_UPDATE_RESPONSE;
  data: { success: boolean, error?: string };
};

export const MODEL_ADD_REQUEST = 'MODEL_ADD_REQUEST';
export type ModelAddRequest = {
  command: typeof MODEL_ADD_REQUEST;
  data: Omit<LLMModelConfig, 'id'> & { id?: string }; // ID is optional on creation
};

export const MODEL_ADD_RESPONSE = 'MODEL_ADD_RESPONSE';
export type ModelAddResponse = {
  command: typeof MODEL_ADD_RESPONSE;
  data: { success: boolean, modelId?: string, error?: string };
};

export const MODEL_SELECT_REQUEST = 'MODEL_SELECT_REQUEST';
export type ModelSelectRequest = {
  command: typeof MODEL_SELECT_REQUEST;
  data: { modelId: string };
};

export const MODEL_SELECT_RESPONSE = 'MODEL_SELECT_RESPONSE';
export type ModelSelectResponse = {
  command: typeof MODEL_SELECT_RESPONSE;
  data: { success: boolean, error?: string };
};

export const SETTINGS_CHANGED_EVENT = 'SETTINGS_CHANGED_EVENT';
export type SettingsChangedEvent = {
  command: typeof SETTINGS_CHANGED_EVENT;
  data: AppSettings;
};
