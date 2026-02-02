import type { ExtensionContext, WebviewView } from 'vscode';
import { commands, window } from 'vscode';
import type { ApiKeyBroadcaster } from './state/index.js';
import { CONTEXT_HAS_KEY, OPENAI_KEY_SECRET } from './constants.js';
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
    void this.context.secrets.get(OPENAI_KEY_SECRET).then((value) => {
      const hasKey = Boolean(value?.trim());
      void commands.executeCommand('setContext', CONTEXT_HAS_KEY, hasKey);
      this.apiKeyBroadcaster.notify(hasKey ? 'present' : 'missing');
    });
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
    this.logger.info(this.logId, 'script-uri', {
      scriptUri,
      human: 'Ruta del script del webview resuelta'
    });
    this.renderHtml(webviewView, scriptUri);
    this.readyTimeout = setTimeout(() => {
      this.logger.warn(this.logId, 'webview-ready-timeout', {
        hasWebview: Boolean(this.webviewView),
        uri: this.webviewView?.webview?.cspSource
      });
    }, 5000);
  }

  @onMessage('webview-ready')
  protected async handleReady(): Promise<void> {
    if (this.readyTimeout) {
      clearTimeout(this.readyTimeout);
      this.readyTimeout = undefined;
    }
    this.logger.info(this.logId, 'webview-ready', {
      human: 'Webview listo y sincronizando estado de la clave'
    });
    const value = await this.context.secrets.get(OPENAI_KEY_SECRET);
    const state = value?.trim() ? 'present' : 'missing';
    this.postMessage({
      type: state === 'present' ? 'api-key-present' : 'api-key-missing'
    });
    void commands.executeCommand('setContext', CONTEXT_HAS_KEY, state === 'present');
    this.apiKeyBroadcaster.notify(state);
  }

  @onMessage('set-api-key')
  protected async handleSetApiKey(): Promise<void> {
    this.logger.info(this.logId, 'set-api-key', { human: 'Solicitando API key al usuario' });
    const value = await window.showInputBox({
      prompt: 'OpenAI API key',
      password: true,
      ignoreFocusOut: true
    });
    if (!value?.trim()) {
      return;
    }
    await this.context.secrets.store(OPENAI_KEY_SECRET, value.trim());
    this.postMessage({ type: 'api-key-saved' });
    this.postMessage({ type: 'api-key-present' });
    this.logger.info(this.logId, 'api-key-saved', { human: 'API key guardada correctamente' });
    void commands.executeCommand('setContext', CONTEXT_HAS_KEY, true);
    this.apiKeyBroadcaster.notify('present');
    setTimeout(() => {
      this.apiKeyBroadcaster.notify('present');
    }, 3500);
  }

  @onMessage('clear-api-key')
  protected async handleClearApiKey(): Promise<void> {
    this.logger.info(this.logId, 'clear-api-key', { human: 'API key eliminada' });
    await this.context.secrets.delete(OPENAI_KEY_SECRET);
    this.postMessage({ type: 'api-key-missing' });
    this.apiKeyBroadcaster.notify('missing');
    void commands.executeCommand('setContext', CONTEXT_HAS_KEY, false);
  }

  @onMessage('go-chat')
  protected async handleGoChat(): Promise<void> {
    this.logger.info(this.logId, 'go-chat', { human: 'Ir a chat solicitado' });
    await commands.executeCommand('setContext', CONTEXT_HAS_KEY, true);
    this.apiKeyBroadcaster.notify('present');
    this.logger.info(this.logId, 'go-chat-requested', { human: 'Notificado router para abrir chat' });
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
