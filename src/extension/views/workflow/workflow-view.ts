import type { ExtensionContext, WebviewView } from 'vscode';
import { BaseView } from '../base-view.js';
import { WorkflowViewTemplate } from './workflow-view.template.js';
import { ViewLogger } from '../logging/view-logger.js';

export class WorkflowView extends BaseView {
  public static readonly viewType = 'workflowView';

  private readonly template: WorkflowViewTemplate;
  private readonly logger: ViewLogger;

  public constructor(context: ExtensionContext) {
    super(context);
    this.template = new WorkflowViewTemplate();
    this.logger = ViewLogger.getInstance();
  }

  public resolveWebviewView(webviewView: WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true
    };
    this.logger.info('workflowView', 'resolveWebviewView');
    const scriptUri = this.createScriptUri(
      webviewView.webview,
      '/dist/extension/views/workflow/web/workflow-view.js'
    );
    this.logger.info('workflowView', 'script-uri', { scriptUri });
    this.renderHtml(webviewView, scriptUri);

    webviewView.webview.onDidReceiveMessage((message) => {
      if (message?.type === 'log') {
        this.logger.fromWebview('workflowView', message);
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
