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
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${params.cspSource}; script-src 'nonce-${params.nonce}' ${params.cspSource}; img-src ${params.cspSource} https: data:;" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chat</title>
  </head>
  <body>
    <agw-chat-view></agw-chat-view>
    <script nonce="${params.nonce}" src="${params.scriptUri}" type="module"></script>
  </body>
</html>`;
}
