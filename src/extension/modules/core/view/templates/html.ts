import * as vscode from 'vscode';

/**
 * Generates the HTML content for the Webview.
 * This acts as the bootloader for the Lit/React application.
 */
export function getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri, viewTagName: string, scriptPath: string): string {
  const mainViewScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, scriptPath));
  const excludeCodiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'codicons', 'codicon.css'));

  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${webview.cspSource}; connect-src ${webview.cspSource} https: http:; img-src ${webview.cspSource} https: http: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-RANDOM' 'unsafe-eval' ${webview.cspSource};">
      <title>Agentic Workflow</title>
      <link href="${excludeCodiconsUri}" rel="stylesheet" />
      <style>
        body { margin: 0; padding: 0; }
      </style>
    </head>
    <body style="background: transparent;">
      <${viewTagName}></${viewTagName}>
      <script nonce="RANDOM">
        console.log('[Webview] Booting...');
        window.addEventListener('error', (e) => {
            console.error('[Webview] Global Error:', e.message, e.filename, e.lineno);
        });
      </script>
      <script type="module" src="${mainViewScriptUri}"></script>
    </body>
    </html>`;
}
