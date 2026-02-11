import type {
  ExtensionContext,
  WebviewView,
} from 'vscode';
import { AgwViewProviderBase } from './controller.js';
import { ViewLogger } from '../logging/logger.js';
import { html } from 'lit';
import template from '../../modules/chat/web/templates/index.js'; // Fallback or initial template
import { Uri } from 'vscode';

/**
 * Interface for modules that want to receive the shared WebviewView.
 */
export interface IMainViewDelegate {
  resolveWebviewView(webviewView: WebviewView): void;
}

/**
 * AgwMainViewProvider acts as the single entry point for VS Code's WebviewView.
 * It multiplexes the resolved webview to all registered module delegates.
 */
export class AgwMainViewProvider extends AgwViewProviderBase {
  public static readonly viewId = 'agw.mainView';
  private static instance: AgwMainViewProvider;
  private delegates: Set<IMainViewDelegate> = new Set();

  public constructor(context: ExtensionContext) {
    // Note: We pass the viewId here, but we'll ensure child modules don't re-register it.
    super(context, AgwMainViewProvider.viewId);
    AgwMainViewProvider.instance = this;
  }

  public static getInstance(context?: ExtensionContext): AgwMainViewProvider {
    if (!AgwMainViewProvider.instance && context) {
      AgwMainViewProvider.instance = new AgwMainViewProvider(context);
    }
    return AgwMainViewProvider.instance;
  }

  /**
   * Registers a module delegate to receive the webview once resolved.
   */
  public registerDelegate(delegate: IMainViewDelegate): void {
    this.delegates.add(delegate);
    // If the webview is already resolved, notify the delegate immediately
    if (this.webviewView) {
      delegate.resolveWebviewView(this.webviewView);
    }
  }

  protected onResolve(webviewView: WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };

    // Render the Unified Shell entry point
    this.renderUnifiedHtml(webviewView);

    // Notify all delegates so they can bind their message handlers to the SAME webview
    this.delegates.forEach(delegate => {
      try {
        delegate.resolveWebviewView(webviewView);
      } catch (error) {
        this.logger.error(this.logId, 'delegate-resolve-failed', {
          error: error instanceof Error ? error.message : 'unknown'
        });
      }
    });

    // Handle visibility changes for re-sync
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        // Here we could trigger a global state sync if needed
      }
    });
  }

  private renderUnifiedHtml(webviewView: WebviewView): void {
    const nonce = this.createNonce();

    // The script for the unified shell (bundled view.js for the shell)
    const scriptUri = webviewView.webview.asWebviewUri(
      Uri.joinPath(this.context.extensionUri, 'dist', 'extension', 'modules', 'core', 'web', 'main-view.js')
    );

    this.renderTemplate(webviewView, (props: any) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${props.cspSource} 'unsafe-inline'; script-src 'nonce-${props.nonce}' ${props.cspSource} https://cdn.jsdelivr.net; font-src ${props.cspSource}; img-src ${props.cspSource} https:; connect-src ${props.cspSource} https: http:;">
        <title>Agentic Workflow</title>
        <style>
          body { padding: 0; margin: 0; overflow: hidden; }
        </style>
      </head>
      <body>
        <agw-main-view></agw-main-view>
        <script type="module" nonce="${props.nonce}" src="${props.scriptUri}"></script>
      </body>
      </html>
    `, {
      nonce,
      scriptUri: scriptUri.toString(),
      cspSource: webviewView.webview.cspSource
    });
  }
}
