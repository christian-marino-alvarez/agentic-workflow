import type { ExtensionContext } from 'vscode';
import {
  ChatView,
  HistoryView,
  KeyView,
  WorkflowView,
  registerViewRegistry,
  ApiKeyBroadcaster
} from './views/index.js';
import { commands } from 'vscode';
import { ChatKitLocalServer, registerOpenAIKeyCommand } from './chatkit/index.js';

export function activate(context: ExtensionContext): void {
  const chatKitServer = new ChatKitLocalServer(context);
  void chatKitServer.start();
  context.subscriptions.push(chatKitServer);
  const apiKeyBroadcaster = new ApiKeyBroadcaster();
  context.subscriptions.push(apiKeyBroadcaster);
  registerOpenAIKeyCommand(context, apiKeyBroadcaster);

  void context.secrets.get('agenticWorkflow.openaiApiKey').then((value) => {
    const hasKey = Boolean(value?.trim());
    void commands.executeCommand('setContext', 'agenticWorkflow.hasKey', hasKey);
    apiKeyBroadcaster.notify(hasKey ? 'present' : 'missing');
  });

  registerViewRegistry(context, [
    {
      id: 'chatView',
      factory: (ctx) => new ChatView(ctx, chatKitServer, apiKeyBroadcaster)
    },
    {
      id: 'historyView',
      factory: (ctx) => new HistoryView(ctx)
    },
    {
      id: 'workflowView',
      factory: (ctx) => new WorkflowView(ctx)
    },
    {
      id: 'keyView',
      factory: (ctx) => new KeyView(ctx, apiKeyBroadcaster)
    }
  ]);
}

export function deactivate(): void {}
