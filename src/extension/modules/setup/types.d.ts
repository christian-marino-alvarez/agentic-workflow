import type { ApiKeyBroadcaster } from './background/state/api-key-state.js';
import type { Controller } from './background/index.js';
import type { SettingsStorage } from './background/settings-storage.js';
import type { ModuleRegistration } from '../router/index.js';
import type { ModelConfig, ProviderType, ExtensionConfig } from '../../providers/index.js';
import { Tab, ApiKeyStatus, ViewMode, MessageType } from './constants.js';

export type Tab = typeof Tab[keyof typeof Tab];
export type ApiKeyState = typeof ApiKeyStatus[keyof typeof ApiKeyStatus];
export type ViewMode = typeof ViewMode[keyof typeof ViewMode];
export type MessageType = typeof MessageType[keyof typeof MessageType];

export type TemplateParams = {
  nonce: string;
  scriptUri: string;
  cspSource: string;
};

export type SetupViewState = {
  tab: Tab;
  selectedProvider: string;
  editSelectedProvider: string;
  editingModelId?: string;
};

export type SetupDomain = {
  view: Controller;
  apiKeyBroadcaster: ApiKeyBroadcaster;
  settingsStorage: SettingsStorage;
};

export type SetupModule = ModuleRegistration<SetupDomain>;

export type EnrichedModel = ModelConfig & {
  hasApiKey: boolean;
};

export type CreateActionData = {
  name: string;
  provider: ProviderType;
  modelId: string;
  apiKey?: string;
  baseUrl?: string;
};

export type UpdateActionData = CreateActionData;

export type StateUpdateMessage = {
  type: 'state-update';
  tab: Tab;
  models: EnrichedModel[];
  activeModelId: string | undefined;
  editingModelId?: string;
  provider: string;
};

export type { ModelConfig, ProviderType, ExtensionConfig };
