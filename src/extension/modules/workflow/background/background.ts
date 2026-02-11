import type { ExtensionContext, WebviewView } from 'vscode';
import { AgwViewProviderBase } from '../../../core/background/index.js';
import { onMessage } from '../../../core/decorators/onMessage.js';
import template from '../web/templates/index.js';

export class Controller extends AgwViewProviderBase {
  public static readonly viewType = 'workflowView';

  public constructor(context: ExtensionContext) {
    super(context, Controller.viewType, undefined, { skipRegistration: true });
  }

  protected onResolve(webviewView: WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };
    const scriptUri = this.createScriptUri(
      webviewView.webview,
      '/dist/extension/modules/workflow/web/view.js'
    );
    this.logger.info(this.logId, 'script-uri', {
      scriptUri,
      human: 'Ruta del script del webview resuelta'
    });
    this.renderHtml(webviewView, scriptUri);
  }

  @onMessage('webview-ready')
  protected handleReady(): void {
    this.logger.info(this.logId, 'webview-ready', {
      human: 'Vista de workflows lista'
    });
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
