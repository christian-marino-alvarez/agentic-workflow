import type { ExtensionContext } from 'vscode';
import { ChatKitLocalServer } from './modules/chatkit-server/index.js';
import { ModuleRouter, Setup, Chat, History, Workflow } from './index.js';

export function activate(context: ExtensionContext): void {
  const chatKitServer = new ChatKitLocalServer(context);
  void chatKitServer.start();
  context.subscriptions.push(chatKitServer);

  const router = new ModuleRouter(context);
  const setupDomain = router.register(Setup);
  const chatDomain = router.register(Chat, {
    chatKitServer,
    apiKeyBroadcaster: setupDomain.apiKeyBroadcaster
  });
  router.register(History);
  router.register(Workflow);
  router.connectChat(setupDomain.apiKeyBroadcaster, chatDomain.view);
  context.subscriptions.push(router);
}

export function deactivate(): void {}
