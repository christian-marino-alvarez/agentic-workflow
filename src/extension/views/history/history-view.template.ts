import { ViewTemplate } from '../view-template.js';

export type HistoryViewTemplateParams = {
  nonce: string;
  scriptUri: string;
  cspSource: string;
};

export class HistoryViewTemplate {
  private readonly template: ViewTemplate;

  public constructor() {
    this.template = new ViewTemplate(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' __CSP_SOURCE__; script-src 'nonce-__NONCE__' __CSP_SOURCE__; img-src __CSP_SOURCE__ data:;" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>History</title>
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
    </style>
  </head>
  <body>
    <div id="loading" class="loading" hidden>Loading… [history]</div>
    <h3>History</h3>
    <p>Coming soon. TODO: Stats/History view.</p>
    <script nonce="__NONCE__" src="__SCRIPT_URI__" defer></script>
  </body>
</html>`);
  }

  public render(params: HistoryViewTemplateParams): string {
    return this.template.render({
      '__NONCE__': params.nonce,
      '__SCRIPT_URI__': params.scriptUri,
      '__CSP_SOURCE__': params.cspSource
    });
  }
}
