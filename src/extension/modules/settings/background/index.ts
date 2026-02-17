import * as vscode from 'vscode';
import { Background, ViewHtml, Message } from '../../core/index.js';
import { MESSAGES } from '../constants.js';
import { Settings } from '../backend/index.js';

/**
 * Settings Background - Controls the Settings View.
 * NOTE: Currently unused — Settings is handled by AppBackground.
 * Kept for potential future standalone module use.
 */
export class SettingsBackground extends Background {
  private readonly settings: Settings;

  constructor(context: vscode.ExtensionContext) {
    super('settings', context.extensionUri, 'settings-view');
    this.log('SettingsBackground initialized');
    this.settings = new Settings(context);
  }

  /**
   * Handle incoming messages from the View layer.
   */
  public override async listen(message: Message): Promise<any> {
    const { command, data } = message.payload;

    switch (command) {
      case MESSAGES.GET_REQUEST: {
        const models = await this.settings.getModels();
        const activeModelId = await this.settings.getActiveModelId();
        return { success: true, models, activeModelId };
      }

      case MESSAGES.SAVE_REQUEST: {
        await this.settings.saveModel(data);
        return { success: true };
      }

      case MESSAGES.DELETE_REQUEST: {
        await this.settings.deleteModel(data);
        return { success: true };
      }

      case MESSAGES.SELECT_REQUEST: {
        await this.settings.setActiveModel(data);
        const activeId = await this.settings.getActiveModelId();
        return { success: true, activeId };
      }
    }
  }

  protected getHtmlForWebview(webview: vscode.Webview): string {
    const scriptPath = 'dist/extension/modules/settings/view/index.js';
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath);
  }
}
