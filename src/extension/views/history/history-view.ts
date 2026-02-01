import type { ExtensionContext, WebviewView } from 'vscode';
import { BaseView } from '../base-view.js';
import { HistoryViewTemplate } from './history-view.template.js';
import { ViewLogger } from '../logging/view-logger.js';

export class HistoryView extends BaseView {
  public static readonly viewType = 'historyView';

  private readonly template: HistoryViewTemplate;
  private readonly logger: ViewLogger;

  public constructor(context: ExtensionContext) {
    super(context);
    this.template = new HistoryViewTemplate();
    this.logger = ViewLogger.getInstance();
  }

  public resolveWebviewView(webviewView: WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true
    };
    this.logger.info('historyView', 'resolveWebviewView');
    const scriptUri = this.createScriptUri(
      webviewView.webview,
      '/dist/extension/views/history/web/history-view.js'
    );
    this.logger.info('historyView', 'script-uri', { scriptUri });
    this.renderHtml(webviewView, scriptUri);

    webviewView.webview.onDidReceiveMessage((message) => {
      if (message?.type === 'log') {
        this.logger.fromWebview('historyView', message);
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
