import { ExtensionContext, commands } from 'vscode';
import { ChatSidecarManager } from './modules/chat/index.js';
import { ModuleRouter, Security, Chat, History, Workflow, AgentPoc, OPENAI_KEY_SECRET, CONTEXT_HAS_KEY } from './index.js';
import { AgwMainViewProvider } from './core/background/main-view-provider.js';
import type { SecurityDomain, ChatDomain } from './index.js';

export async function activate(context: ExtensionContext): Promise<void> {
  // Set initial context before anything else to wake up views
  const hasKey = Boolean((await context.secrets.get(OPENAI_KEY_SECRET))?.trim());
  console.log('[Extension] Initial hasKey state:', hasKey);
  void commands.executeCommand('setContext', CONTEXT_HAS_KEY, hasKey);

  const router = new ModuleRouter(context);
  const securityDomain = (await router.register(Security)) as SecurityDomain;

  const chatSidecarManager = new ChatSidecarManager(context);
  // Inyectar claves del puente en el servidor si están disponibles
  if (securityDomain.bridge) {
    console.log('[Extension] Security bridge ready on port:', securityDomain.bridge.port);
    chatSidecarManager.setBridgeConfig(securityDomain.bridge);
  }

  void chatSidecarManager.start();
  context.subscriptions.push(chatSidecarManager);

  // --- REGISTRO DEL MAIN VIEW PROVIDER (Unified Shell) ---
  const mainViewProvider = AgwMainViewProvider.getInstance(context);
  mainViewProvider.registerDelegate(securityDomain.view);

  const chatDomain = (await router.register(Chat, {
    chatSidecarManager,
    apiKeyBroadcaster: securityDomain.apiKeyBroadcaster
  })) as ChatDomain;
  mainViewProvider.registerDelegate(chatDomain.view);

  const historyDomain = await router.register(History) as any;
  mainViewProvider.registerDelegate(historyDomain.view);

  const workflowDomain = await router.register(Workflow) as any;
  mainViewProvider.registerDelegate(workflowDomain.view);

  await router.register(AgentPoc);

  router.connectChat(securityDomain.apiKeyBroadcaster, chatDomain.view);
  context.subscriptions.push(router);
}

export function deactivate(): void { }
