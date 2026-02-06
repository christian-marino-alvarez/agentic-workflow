import type { ApiKeyBroadcaster } from './state/api-key-state.js';
import type { Controller } from './controller.js';
import type { SettingsStorage } from './settings-storage.js';
import type { ModuleRegistration } from '../router/index.js';
import type { ModelConfig, ProviderType, ExtensionConfig } from '../../providers/index.js';

export type ApiKeyState = 'missing' | 'present';

export type TemplateParams = {
  nonce: string;
  scriptUri: string;
  cspSource: string;
};

export type SetupDomain = {
  view: Controller;
  apiKeyBroadcaster: ApiKeyBroadcaster;
  settingsStorage: SettingsStorage;
};

export type SetupModule = ModuleRegistration<SetupDomain>;

export type { ModelConfig, ProviderType, ExtensionConfig };
