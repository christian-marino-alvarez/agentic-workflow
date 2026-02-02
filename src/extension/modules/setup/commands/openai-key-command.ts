import type { ExtensionContext } from 'vscode';
import { commands, window } from 'vscode';
import type { ApiKeyBroadcaster } from '../state/api-key-state.js';
import { CONTEXT_HAS_KEY, OPENAI_KEY_SECRET } from '../constants.js';

export function registerOpenAIKeyCommand(
  context: ExtensionContext,
  apiKeyBroadcaster: ApiKeyBroadcaster
) {
  const disposable = commands.registerCommand('agenticWorkflow.setOpenAIKey', async () => {
    const value = await window.showInputBox({
      prompt: 'OpenAI API key',
      password: true,
      ignoreFocusOut: true
    });
    if (!value?.trim()) {
      return;
    }
    await context.secrets.store(OPENAI_KEY_SECRET, value.trim());
    apiKeyBroadcaster.notify('present');
    void commands.executeCommand('setContext', CONTEXT_HAS_KEY, true);
  });

  const clearDisposable = commands.registerCommand(
    'agenticWorkflow.clearOpenAIKey',
    async () => {
      await context.secrets.delete(OPENAI_KEY_SECRET);
      apiKeyBroadcaster.notify('missing');
      void commands.executeCommand('setContext', CONTEXT_HAS_KEY, false);
    }
  );

  context.subscriptions.push(disposable, clearDisposable);
  return disposable;
}
