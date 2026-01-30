import type {
  ExtensionContext,
  WebviewView,
  WebviewViewProvider
} from 'vscode';
import { window } from 'vscode';

const baseHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-__NONCE__';" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agent Chat</title>
  </head>
  <body>
    <main>
      <h3>Agent Chat</h3>
      <p id="state">Loading…</p>
    </main>
    <script nonce="__NONCE__">
      const state = { message: 'Hello world' };
      const el = document.getElementById('state');
      if (el) {
        el.textContent = state.message;
      }
    </script>
  </body>
</html>`;

function createNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let value = '';
  for (let i = 0; i < 32; i += 1) {
    value += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return value;
}

function renderHtml(): string {
  const nonce = createNonce();
  return baseHtml.replace('__NONCE__', nonce);
}

export class MainChatView implements WebviewViewProvider {
  public static readonly viewType = 'mainView';

  public constructor(private readonly context: ExtensionContext) {}

  public resolveWebviewView(webviewView: WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true
    };
    webviewView.webview.html = renderHtml();
  }
}

export function registerMainChatView(context: ExtensionContext): void {
  const provider = new MainChatView(context);
  context.subscriptions.push(
    window.registerWebviewViewProvider(MainChatView.viewType, provider)
  );
}
