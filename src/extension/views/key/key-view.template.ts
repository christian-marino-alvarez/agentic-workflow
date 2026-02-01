import { ViewTemplate } from '../view-template.js';

export type KeyViewTemplateParams = {
  nonce: string;
  scriptUri: string;
  cspSource: string;
};

export class KeyViewTemplate {
  private readonly template: ViewTemplate;

  public constructor() {
    this.template = new ViewTemplate(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' __CSP_SOURCE__; script-src 'nonce-__NONCE__' __CSP_SOURCE__ https://unpkg.com; img-src __CSP_SOURCE__ https: data:;" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>API Key</title>
    <style>
      :root {
        color-scheme: light dark;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      body {
        margin: 0;
        padding: 16px;
      }
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
        opacity: 0.7;
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
    </style>
  </head>
  <body>
    <agw-setup-view data-script-uri="__SCRIPT_URI__" data-nonce="__NONCE__"></agw-setup-view>
    <script nonce="__NONCE__" src="__SCRIPT_URI__" type="module"></script>
    <noscript>JavaScript disabled: key setup requires scripts.</noscript>
  </body>
</html>`);
  }

  public render(params: KeyViewTemplateParams): string {
    return this.template.render({
      '__NONCE__': params.nonce,
      '__SCRIPT_URI__': params.scriptUri,
      '__CSP_SOURCE__': params.cspSource
    });
  }
}
