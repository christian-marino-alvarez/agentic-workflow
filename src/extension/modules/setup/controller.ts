import type { ExtensionContext, WebviewView } from 'vscode';
import { commands, window } from 'vscode';
import type { ApiKeyBroadcaster } from './state/index.js';
import { CONTEXT_HAS_KEY, LLM_PROVIDER_SECRET, OPENAI_KEY_SECRET } from './constants.js';
import template from './templates/index.js';
import { AgwViewProviderBase } from '../../core/controller/base.js';
import { onMessage } from '../../core/decorators/onMessage.js';

export class Controller extends AgwViewProviderBase {
  public static readonly viewType = 'keyView';

  private readyTimeout?: ReturnType<typeof setTimeout>;

  public constructor(
    context: ExtensionContext,
    private readonly apiKeyBroadcaster: ApiKeyBroadcaster
  ) {
    super(context, Controller.viewType);
    void this.syncInitialState();
  }

  protected onResolve(webviewView: WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };
    const scriptUri = this.createScriptUri(
      webviewView.webview,
      '/dist/extension/modules/setup/web/setup-view.js'
    );
    this.renderHtml(webviewView, scriptUri);
  }

  @onMessage('webview-ready')
  protected async handleReady(): Promise<void> {
    await this.syncInitialState();
  }

  @onMessage('get-initial-state')
  protected async handleGetInitialState(): Promise<void> {
    await this.syncInitialState();
  }

  private async syncInitialState(): Promise<void> {
    const openaiKey = await this.context.secrets.get(OPENAI_KEY_SECRET);
    const hasKey = Boolean(openaiKey?.trim());

    const state = {
      openaiKeyPresent: hasKey
    };

    void this.postMessage({ type: 'state-update', ...state });
    void commands.executeCommand('setContext', CONTEXT_HAS_KEY, hasKey);
    this.apiKeyBroadcaster.notify(hasKey ? 'present' : 'missing');
  }

  @onMessage('set-api-key')
  protected async handleSetApiKey(): Promise<void> {
    const value = await window.showInputBox({
      prompt: `OpenAI API key`,
      password: true,
      ignoreFocusOut: true
    });

    if (!value?.trim()) {
      return;
    }

    await this.context.secrets.store(OPENAI_KEY_SECRET, value.trim());
    await this.context.secrets.store(LLM_PROVIDER_SECRET, 'openai');

    await this.syncInitialState();
  }

  @onMessage('clear-api-key')
  protected async handleClearApiKey(): Promise<void> {
    await this.context.secrets.delete(OPENAI_KEY_SECRET);
    await this.syncInitialState();
  }

  @onMessage('go-chat')
  protected async handleGoChat(): Promise<void> {
    setTimeout(() => {
      void commands.executeCommand('workbench.view.extension.main');
      void commands.executeCommand('chatView.focus');
    }, 100);
  }

  private renderHtml(webviewView: WebviewView, scriptUri: string): void {
    const nonce = this.createNonce();
    this.renderTemplate(webviewView, template.render, {
      nonce,
      scriptUri,
      cspSource: webviewView.webview.cspSource
    });
  }
}
