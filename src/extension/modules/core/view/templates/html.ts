import * as vscode from 'vscode';

/**
 * Generates the HTML content for the Webview.
 * This acts as the bootloader for the Lit/React application.
 */
export function getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri, viewTagName: string, scriptPath: string, version: string = '0.0.0'): string {
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
        body { margin: 0; padding: 0; display: flex; flex-direction: column; height: 100vh; }
        ${viewTagName} { flex: 1; overflow: hidden; }
        .global-footer {
          padding: 4px 10px;
          display: flex;
          justify-content: flex-end;
          font-size: 10px;
          color: var(--vscode-descriptionForeground);
          background-color: var(--vscode-sideBar-background);
          border-top: 1px solid var(--vscode-sideBarSectionHeader-border);
          opacity: 0.7;
          flex-shrink: 0;
        }
      </style>
    </head>
    <body style="background: transparent;">
      <${viewTagName} appVersion="${version}"></${viewTagName}>
      <script nonce="RANDOM">
        console.log('[Webview] Booting...');
        console.log('[Webview] Version: ${version}');
        console.log('[Webview] Codicon URI: ${excludeCodiconsUri}');
        window.addEventListener('error', (e) => {
            console.error('[Webview] Global Error:', e.message, e.filename, e.lineno);
        });
      </script>
      <script type="module" src="${mainViewScriptUri}"></script>
    </body>
    </html>`;
}
