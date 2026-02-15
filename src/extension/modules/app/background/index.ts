import * as path from 'path';
import * as vscode from 'vscode';
import { Background, ViewHtml, Message } from '../../core/index.js';

/**
 * Concrete implementation of Background acting as the App Shell.
 */
export class AppBackground extends Background {
  constructor(extensionUri: vscode.Uri) {
    super('main', extensionUri, 'main-view');
    this.log('Initialized');

    // Spawn the new AppServer sidecar
    // Spawn the new AppServer sidecar
    console.log('[DEBUG] extensionUri:', extensionUri);
    console.log('[DEBUG] extensionUri.fsPath:', extensionUri?.fsPath);
    if (!extensionUri?.fsPath) {
      console.error('[FATAL] extensionUri.fsPath is missing!');
    }

    if (process.env.VSCODE_TEST_MODE === 'true') {
      this.log('TEST MODE: Skipping sidecar spawn');
    } else {
      const scriptPath = path.join(extensionUri.fsPath, 'dist-backend/extension/modules/app/backend/index.js');
      this.spawnSidecar(scriptPath, 3000).catch(err => {
        this.log('FATAL: Failed to spawn sidecar', err);
      });
    }

    // Handle incoming messages
    this.onMessage((message: Message) => {
      this.log(`Received Message: ${message.payload.command}`, message.payload.data);

      if (message.payload.command === 'ping') {
        this.log('Forwarding to sidecar...');
        this.sendMessage('app::backend', 'ping', message.payload.data);
      }

      if (message.payload.command === 'ping::response') {
        this.log('Forwarding response to View...', message.payload.data);
        this.sendMessage('view', 'ping::response', message.payload.data);
      }
    });
  }

  protected getHtmlForWebview(webview: vscode.Webview): string {
    const scriptPath = 'dist/extension/modules/app/view/index.js';
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath);
  }
}
