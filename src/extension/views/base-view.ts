import type { ExtensionContext, Webview } from 'vscode';

export abstract class BaseView {
  public constructor(protected readonly context: ExtensionContext) {}

  protected createNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let value = '';
    for (let i = 0; i < 32; i += 1) {
      value += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return value;
  }

  protected createScriptUri(webview: Webview, scriptPath: string): string {
    return webview
      .asWebviewUri(
        this.context.extensionUri.with({
          path: `${this.context.extensionUri.path}${scriptPath}`
        })
      )
      .toString();
  }

  protected createWebviewUri(webview: Webview, relativePath: string): string {
    return webview
      .asWebviewUri(
        this.context.extensionUri.with({
          path: `${this.context.extensionUri.path}${relativePath}`
        })
      )
      .toString();
  }
}
