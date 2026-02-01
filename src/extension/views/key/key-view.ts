import type { ExtensionContext, WebviewView } from 'vscode';
import { commands, window } from 'vscode';
import type { ApiKeyBroadcaster } from '../api-key-state.js';
import { BaseView } from '../base-view.js';
import { KeyViewTemplate } from './key-view.template.js';
import { ViewLogger } from '../logging/view-logger.js';

export class KeyView extends BaseView {
  public static readonly viewType = 'keyView';

  private readonly template: KeyViewTemplate;
  private readonly logger: ViewLogger;

  public constructor(
    context: ExtensionContext,
    private readonly apiKeyBroadcaster: ApiKeyBroadcaster
  ) {
    super(context);
    this.template = new KeyViewTemplate();
    this.logger = ViewLogger.getInstance();
  }

  public resolveWebviewView(webviewView: WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };
    this.logger.info('keyView', 'resolveWebviewView');
    const scriptUri = this.createScriptUri(
      webviewView.webview,
      '/dist/extension/views/key/web/key-view.js'
    );
    this.logger.info('keyView', 'script-uri', { scriptUri });
    this.renderHtml(webviewView, scriptUri);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      if (message?.type === 'log') {
        this.logger.fromWebview('keyView', message);
        return;
      }
      if (message?.type === 'set-api-key') {
        this.logger.info('keyView', 'set-api-key');
        await window.showInputBox({
          prompt: 'OpenAI API key',
          password: true,
          ignoreFocusOut: true
        })
        .then(async (value) => {
          if (!value?.trim()) {
            return;
          }
          await this.context.secrets.store('agenticWorkflow.openaiApiKey', value.trim());
          webviewView.webview.postMessage({ type: 'api-key-saved' });
          this.apiKeyBroadcaster.notify('present');
          this.logger.info('keyView', 'api-key-saved');
          void commands.executeCommand('setContext', 'agenticWorkflow.hasKey', true);
          void commands.executeCommand('workbench.view.extension.main');
          void commands.executeCommand('workbench.action.focusView', 'chatView');
        });
        return;
      }

      if (message?.type === 'clear-api-key') {
        this.logger.info('keyView', 'clear-api-key');
        await this.context.secrets.delete('agenticWorkflow.openaiApiKey');
        webviewView.webview.postMessage({ type: 'api-key-missing' });
        this.apiKeyBroadcaster.notify('missing');
        void commands.executeCommand('setContext', 'agenticWorkflow.hasKey', false);
        return;
      }

      if (message?.type === 'webview-ready') {
        this.logger.info('keyView', 'webview-ready');
        const value = await this.context.secrets.get('agenticWorkflow.openaiApiKey');
        const state = value?.trim() ? 'present' : 'missing';
        webviewView.webview.postMessage({
          type: state === 'present' ? 'api-key-present' : 'api-key-missing'
        });
        this.apiKeyBroadcaster.notify(state);
        void commands.executeCommand('setContext', 'agenticWorkflow.hasKey', state === 'present');
      }
    });
  }

  private renderHtml(webviewView: WebviewView, scriptUri: string): void {
    const nonce = this.createNonce();
    webviewView.webview.html = this.template.render({
      nonce,
      scriptUri,
      cspSource: webviewView.webview.cspSource
    });
  }
}

export function registerKeyView(
  context: ExtensionContext,
  apiKeyBroadcaster: ApiKeyBroadcaster
): void {
  const provider = new KeyView(context, apiKeyBroadcaster);
  context.subscriptions.push(
    window.registerWebviewViewProvider(KeyView.viewType, provider)
  );
}
