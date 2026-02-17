import * as path from 'path';
import * as vscode from 'vscode';
import { Background, ViewHtml, Message } from '../../core/index.js';

import { NAME } from '../constants.js';

/**
 * Concrete implementation of Background acting as the App Shell.
 */
export class AppBackground extends Background {

  constructor(context: vscode.ExtensionContext) {
    super(NAME, context.extensionUri, `${NAME}-view`);
    this.log('Initialized');

    // --- Sidecar ---

    if (process.env.VSCODE_TEST_MODE === 'true') {
      this.log('TEST MODE: Skipping sidecar spawn');
    } else {
      const scriptPath = path.join(context.extensionUri.fsPath, 'dist-backend/extension/modules/app/backend/index.js');
      this.runBackend(scriptPath, 3000).catch(err => {
        this.log('FATAL: Failed to run backend sidecar', err);
      });
    }
  }

  /**
   * Handle incoming messages from the View layer.
   */
  public override async listen(message: Message): Promise<void> {
    // App Shell logic (if any)
  }

  protected getHtmlForWebview(webview: vscode.Webview): string {
    const scriptPath = 'dist/extension/modules/app/view/index.js';
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath);
  }
}
