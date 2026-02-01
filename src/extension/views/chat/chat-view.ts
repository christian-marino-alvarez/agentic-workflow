import type { ExtensionContext, WebviewView } from 'vscode';
import { window } from 'vscode';
import type { ChatKitLocalServer } from '../../chatkit/index.js';
import type { ApiKeyBroadcaster, ApiKeyState } from '../api-key-state.js';
import { BaseView } from '../base-view.js';
import { ChatViewTemplate } from './chat-view.template.js';
import { ViewLogger } from '../logging/view-logger.js';

export class ChatView extends BaseView {
  public static readonly viewType = 'chatView';

  private readonly template: ChatViewTemplate;
  private readonly logger: ViewLogger;

  public constructor(
    context: ExtensionContext,
    private readonly chatKitServer: ChatKitLocalServer,
    private readonly apiKeyBroadcaster: ApiKeyBroadcaster
  ) {
    super(context);
    this.template = new ChatViewTemplate();
    this.logger = ViewLogger.getInstance();
  }

  public resolveWebviewView(webviewView: WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };
    this.logger.info('chatView', 'resolveWebviewView');

    const scriptUri = this.createScriptUri(
      webviewView.webview,
      '/dist/extension/views/chat/web/chat-view.js'
    );
    this.logger.info('chatView', 'script-uri', { scriptUri });

    void this.chatKitServer
      .getExternalBaseUri(webviewView.webview)
      .then((uri) => {
        this.logger.info('chatView', 'api-base-uri', { uri: uri.toString() });
        void this.renderHtml(webviewView, `${uri.toString()}/chatkit`, scriptUri);
      })
      .catch((error) => {
        this.logger.error('chatView', 'api-base-uri-error', { message: error?.message });
        void this.renderHtml(
          webviewView,
          `http://localhost/invalid?error=${encodeURIComponent(
            error?.message ?? 'chatkit'
          )}`,
          scriptUri
        );
      });

    webviewView.webview.onDidReceiveMessage(async (message) => {
      if (message?.type === 'log') {
        this.logger.fromWebview('chatView', message);
        return;
      }
      if (message?.type === 'webview-ready') {
        this.logger.info('chatView', 'webview-ready');
        const value = await this.context.secrets.get('agenticWorkflow.openaiApiKey');
        webviewView.webview.postMessage({
          type: value?.trim() ? 'api-key-present' : 'api-key-missing'
        });
      }
    });

    const disposable = this.apiKeyBroadcaster.onDidChange((state: ApiKeyState) => {
      this.logger.info('chatView', 'api-key-state', { state });
      webviewView.webview.postMessage({
        type: state === 'present' ? 'api-key-present' : 'api-key-missing'
      });
    });
    this.context.subscriptions.push(disposable);
  }
  private async renderHtml(
    webviewView: WebviewView,
    apiUrl: string,
    scriptUri: string
  ): Promise<void> {
    const nonce = this.createNonce();
    const html = this.template.render({
      nonce,
      scriptUri,
      apiUrl,
      apiOrigin: new URL(apiUrl).origin,
      cspSource: webviewView.webview.cspSource
    });
    webviewView.webview.html = html;
  }
}

export function registerChatView(
  context: ExtensionContext,
  chatKitServer: ChatKitLocalServer,
  apiKeyBroadcaster: ApiKeyBroadcaster
): void {
  const provider = new ChatView(context, chatKitServer, apiKeyBroadcaster);
  context.subscriptions.push(
    window.registerWebviewViewProvider(ChatView.viewType, provider)
  );
}
