export type TemplateParams = {
  nonce: string;
  scriptUri: string;
  cspSource: string;
};

export function renderShell(params: TemplateParams): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src https://cdn.platform.openai.com https://*.openai.com; child-src https://cdn.platform.openai.com https://*.openai.com; style-src 'unsafe-inline' ${params.cspSource} https://cdn.platform.openai.com; script-src 'nonce-${params.nonce}' ${params.cspSource} https://cdn.platform.openai.com; img-src ${params.cspSource} https: data:; font-src ${params.cspSource} https://cdn.platform.openai.com data:; connect-src ${params.cspSource} http://localhost:* https://api.openai.com https://cdn.platform.openai.com https://*.openai.com;" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script nonce="${params.nonce}" src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"></script>
  </head>
  <body>
    <agw-chat-view></agw-chat-view>
    <script nonce="${params.nonce}" src="${params.scriptUri}" type="module"></script>
  </body>
</html>`;
}
