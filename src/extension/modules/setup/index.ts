import type { ExtensionContext } from 'vscode';
import { ApiKeyBroadcaster } from './state/index.js';
import { registerOpenAIKeyCommand } from './commands/index.js';
import { Controller } from './controller.js';
import { SettingsStorage } from './settings-storage.js';
import type { SetupDomain, SetupModule } from './types.d.ts';

export function createSetupDomain(context: ExtensionContext): SetupDomain {
  const apiKeyBroadcaster = new ApiKeyBroadcaster();
  const settingsStorage = new SettingsStorage(context.globalState);
  const view = new Controller(context, apiKeyBroadcaster);
  const commandDisposable = registerOpenAIKeyCommand(context, apiKeyBroadcaster);
  context.subscriptions.push(apiKeyBroadcaster, commandDisposable);
  return { view, apiKeyBroadcaster, settingsStorage };
}

export const Setup: SetupModule = {
  register: createSetupDomain
};

export { Controller } from './controller.js';
export { default as template } from './templates/index.js';
export { ApiKeyBroadcaster } from './state/index.js';
export type { ApiKeyState, SetupDomain, TemplateParams } from './types.d.ts';
export { OPENAI_KEY_SECRET, CONTEXT_HAS_KEY } from './constants.js';
