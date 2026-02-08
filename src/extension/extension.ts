import type { ExtensionContext } from 'vscode';
import { commands } from 'vscode';
import { ChatKitLocalServer } from './modules/chatkit-server/index.js';
import { ModuleRouter, Setup, Chat, History, Workflow, AgentPoc, OPENAI_KEY_SECRET, CONTEXT_HAS_KEY } from './index.js';

export async function activate(context: ExtensionContext): Promise<void> {
  // Set initial context before anything else to wake up views
  const hasKey = Boolean((await context.secrets.get(OPENAI_KEY_SECRET))?.trim());
  console.log('[Extension] Initial hasKey state:', hasKey);
  void commands.executeCommand('setContext', CONTEXT_HAS_KEY, hasKey);

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
  router.register(AgentPoc);
  router.connectChat(setupDomain.apiKeyBroadcaster, chatDomain.view);
  context.subscriptions.push(router);
}

export function deactivate(): void { }
