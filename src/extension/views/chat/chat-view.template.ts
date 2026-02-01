import { ViewTemplate } from '../view-template.js';

export type ChatViewTemplateParams = {
  nonce: string;
  scriptUri: string;
  apiUrl: string;
  apiOrigin: string;
  cspSource: string;
};

export class ChatViewTemplate {
  private readonly template: ViewTemplate;

  public constructor() {
    this.template = new ViewTemplate(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src __CSP_SOURCE__ data: https:; style-src 'unsafe-inline' __CSP_SOURCE__ https://cdn.platform.openai.com; script-src 'nonce-__NONCE__' __CSP_SOURCE__ https://cdn.platform.openai.com; connect-src __API_ORIGIN__;" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agent Chat</title>
    <script src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js" async></script>
    <style>
      :root {
        color-scheme: light dark;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      body {
        margin: 0;
        padding: 0 12px 16px;
      }
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
        opacity: 0.7;
      }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin: 12px 0;
      }
      button {
        border: 1px solid var(--vscode-button-border, transparent);
        background: var(--vscode-button-background, #0e639c);
        color: var(--vscode-button-foreground, #ffffff);
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
      }
      button:hover {
        background: var(--vscode-button-hoverBackground, #1177bb);
      }
      #status {
        font-size: 12px;
        opacity: 0.7;
      }
      #chatkit {
        display: block;
        height: calc(100vh - 90px);
        min-height: 420px;
      }
    </style>
  </head>
  <body data-api-url="__API_URL__">
    <div id="loading" class="loading" hidden>Loading… [chat]</div>
    <header>
      <div>
        <strong>Agent Chat</strong>
        <div id="status">Loading…</div>
      </div>
      <button id="testButton" type="button">Test</button>
    </header>
    <openai-chatkit id="chatkit"></openai-chatkit>
    <script nonce="__NONCE__" src="__SCRIPT_URI__" defer></script>
  </body>
</html>`);
  }

  public render(params: ChatViewTemplateParams): string {
    return this.template.render({
      '__NONCE__': params.nonce,
      '__SCRIPT_URI__': params.scriptUri,
      '__API_URL__': params.apiUrl,
      '__API_ORIGIN__': params.apiOrigin,
      '__CSP_SOURCE__': params.cspSource
    });
  }
}
