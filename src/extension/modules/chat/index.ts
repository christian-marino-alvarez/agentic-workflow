import type { ExtensionContext } from 'vscode';
import { Controller } from './controller.js';
import type { ChatDomain, ChatDependencies, ChatModule } from './types.d.ts';

export function createChatDomain(
  context: ExtensionContext,
  deps: ChatDependencies
): ChatDomain {
  const view = new Controller(context, deps);
  return { view };
}

export const Chat: ChatModule = {
  register: createChatDomain
};

export { Controller } from './controller.js';
export { default as template } from './templates/index.js';
export type { ChatDomain, TemplateParams, ChatDependencies } from './types.d.ts';
