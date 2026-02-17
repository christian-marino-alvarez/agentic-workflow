import * as path from 'path';
import * as vscode from 'vscode';
import { Background, ViewHtml, Message } from '../../core/index.js';
import { Settings } from '../../settings/backend/index.js';
import { MESSAGES } from '../../settings/constants.js';

import { NAME } from '../constants.js';

/**
 * Concrete implementation of Background acting as the App Shell.
 */
export class AppBackground extends Background {
  private readonly settings: Settings;

  constructor(context: vscode.ExtensionContext) {
    super(NAME, context.extensionUri, `${NAME}-view`);
    this.log('Initialized');

    // Initialize services
    this.settings = new Settings(context);

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
    const { command, data } = message.payload;

    switch (command) {
      case MESSAGES.GET_REQUEST: {
        const models = await this.settings.getModels();
        const activeModelId = await this.settings.getActiveModelId();
        return { success: true, models, activeModelId } as any;
      }

      case MESSAGES.SAVE_REQUEST: {
        await this.settings.saveModel(data);
        return { success: true } as any;
      }

      case MESSAGES.DELETE_REQUEST: {
        await this.settings.deleteModel(data);
        return { success: true } as any;
      }

      case MESSAGES.SELECT_REQUEST: {
        await this.settings.setActiveModel(data);
        const activeId = await this.settings.getActiveModelId();
        return { success: true, activeId } as any;
      }
    }
  }

  protected getHtmlForWebview(webview: vscode.Webview): string {
    const scriptPath = 'dist/extension/modules/app/view/index.js';
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath);
  }
}
