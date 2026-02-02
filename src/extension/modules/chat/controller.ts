import type { ExtensionContext, WebviewView } from 'vscode';
import type { ApiKeyState, ChatDependencies } from './types.d.ts';
import { AgwViewProviderBase } from '../../core/controller/base.js';
import { onMessage } from '../../core/decorators/onMessage.js';
import template from './templates/index.js';

export class Controller extends AgwViewProviderBase {
  public static readonly viewType = 'chatView';

  private pendingReveal = false;

  public constructor(
    context: ExtensionContext,
    private readonly deps: ChatDependencies
  ) {
    super(context, Controller.viewType);
  }

  protected onResolve(webviewView: WebviewView): void {
    this.webviewView = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };
    const scriptUri = this.createScriptUri(
      webviewView.webview,
      '/dist/extension/modules/chat/web/chat-view.js'
    );
    this.logger.info(this.logId, 'script-uri', {
      scriptUri,
      human: 'Ruta del script del webview resuelta'
    });

    void this.deps.chatKitServer
      .getExternalBaseUri(webviewView.webview)
      .then((uri: import('vscode').Uri) => {
        this.renderHtml(webviewView, `${uri.toString()}/chatkit`, scriptUri);
      })
      .catch((error: unknown) => {
        this.logger.error(this.logId, 'api-base-uri-error', {
          human: 'No se pudo resolver la URL de ChatKit',
          message: error instanceof Error ? error.message : 'unknown'
        });
        this.renderHtml(webviewView, `http://localhost/invalid`, scriptUri);
      });
    this.revealIfPending();
  }

  protected onConnect(webviewView: WebviewView): void {
    const disposable = this.deps.apiKeyBroadcaster.onDidChange((state: ApiKeyState) => {
      this.logger.info(this.logId, 'api-key-state', { state });
      webviewView.webview.postMessage({
        type: state === 'present' ? 'api-key-present' : 'api-key-missing'
      });
    });
    this.registerDisposable(disposable);
  }

  @onMessage('webview-ready')
  protected handleReady(): void {
    const state = this.deps.apiKeyBroadcaster.getState();
    this.webviewView?.webview.postMessage({
      type: state === 'present' ? 'api-key-present' : 'api-key-missing'
    });
  }

  private revealIfPending(): void {
    if (!this.pendingReveal) {
      return;
    }
    this.pendingReveal = false;
    this.webviewView?.show?.(true);
  }

  private renderHtml(webviewView: WebviewView, apiUrl: string, scriptUri: string): void {
    const nonce = this.createNonce();
    const hasKey = this.deps.apiKeyBroadcaster.getState() === 'present';
    this.renderTemplate(webviewView, template.render, {
      nonce,
      scriptUri,
      apiUrl,
      apiOrigin: new URL(apiUrl).origin,
      cspSource: webviewView.webview.cspSource,
      hasKey
    });
  }

  public show(preserveFocus = true): void {
    if (this.webviewView?.show) {
      this.webviewView.show(preserveFocus);
      return;
    }
    this.pendingReveal = true;
  }
}
