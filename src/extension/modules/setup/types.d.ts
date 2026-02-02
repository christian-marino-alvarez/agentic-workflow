import type { ApiKeyBroadcaster } from './state/api-key-state.js';
import type { Controller } from './controller.js';
import type { ModuleRegistration } from '../router/index.js';

export type ApiKeyState = 'missing' | 'present';

export type TemplateParams = {
  nonce: string;
  scriptUri: string;
  cspSource: string;
};

export type SetupDomain = {
  view: Controller;
  apiKeyBroadcaster: ApiKeyBroadcaster;
};

export type SetupModule = ModuleRegistration<SetupDomain>;
