import type { ExtensionContext } from 'vscode';
import { commands, window } from 'vscode';
import type { ApiKeyBroadcaster } from '../views/api-key-state.js';

const OPENAI_KEY_SECRET = 'agenticWorkflow.openaiApiKey';

export function registerOpenAIKeyCommand(
  context: ExtensionContext,
  apiKeyBroadcaster: ApiKeyBroadcaster
): void {
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
    void window.showInformationMessage('OpenAI API key saved in SecretStorage.');
    void commands.executeCommand('setContext', 'agenticWorkflow.hasKey', true);
    apiKeyBroadcaster.notify('present');
  });

  const clearDisposable = commands.registerCommand('agenticWorkflow.clearOpenAIKey', async () => {
    await context.secrets.delete(OPENAI_KEY_SECRET);
    void window.showInformationMessage('OpenAI API key cleared from SecretStorage.');
    void commands.executeCommand('setContext', 'agenticWorkflow.hasKey', false);
    apiKeyBroadcaster.notify('missing');
  });

  context.subscriptions.push(disposable, clearDisposable);
}
