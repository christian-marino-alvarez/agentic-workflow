import type { Controller } from './controller.js';
import type { ChatKitLocalServer } from '../chatkit-server/index.js';
import type { ApiKeyBroadcaster } from '../setup/state/index.js';
import type { ModuleRegistration } from '../router/index.js';

export type ChatDomain = {
  view: Controller;
};

export type TemplateParams = {
  nonce: string;
  scriptUri: string;
  apiUrl: string;
  apiOrigin: string;
  cspSource: string;
  hasKey: boolean;
};

export type ChatDependencies = {
  chatKitServer: ChatKitLocalServer;
  apiKeyBroadcaster: ApiKeyBroadcaster;
};

export type ChatModule = ModuleRegistration<ChatDomain, [ChatDependencies]>;

export type ApiKeyState = 'missing' | 'present';
