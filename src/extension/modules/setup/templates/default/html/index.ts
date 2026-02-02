import type { TemplateParams } from '../../../types.d.ts';

export function renderTemplate(params: TemplateParams): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${params.cspSource}; script-src 'nonce-${params.nonce}' ${params.cspSource}; img-src ${params.cspSource} https: data:;" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Setup</title>
  </head>
  <body>
    <agw-setup-view data-script-uri="${params.scriptUri}" data-nonce="${params.nonce}"></agw-setup-view>
    <script nonce="${params.nonce}" src="${params.scriptUri}" type="module"></script>
    <noscript>JavaScript disabled: key setup requires scripts.</noscript>
  </body>
</html>`;
}
