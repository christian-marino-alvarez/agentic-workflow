import type { TemplateParams } from '../../../types.d.ts';

export function renderTemplate(params: TemplateParams): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${params.cspSource} data: https:; style-src 'unsafe-inline' ${params.cspSource} https://cdn.platform.openai.com; script-src 'nonce-${params.nonce}' ${params.cspSource} https://cdn.platform.openai.com; connect-src ${params.apiOrigin};" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chat</title>
    <script src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js" async></script>
  </head>
  <body data-api-url="${params.apiUrl}" data-has-key="${params.hasKey ? 'true' : 'false'}">
    <agw-chat-view></agw-chat-view>
    <script nonce="${params.nonce}" src="${params.scriptUri}" type="module"></script>
  </body>
</html>`;
}
