import * as vscode from 'vscode';

/**
 * Generates the HTML content for the Webview.
 * This acts as the bootloader for the Lit/React application.
 */
export function getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri, viewTagName: string): string {
  const mainViewScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'dist', 'extension', 'modules', 'app', 'view', 'index.js'));

  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Agentic Workflow</title>
      <style>
        body { margin: 0; padding: 0; }
      </style>
    </head>
    <body style="background: transparent;">
      <${viewTagName}></${viewTagName}>
      <script type="module" src="${mainViewScriptUri}"></script>
    </body>
    </html>`;
}
