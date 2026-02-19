import * as path from 'path';
import * as vscode from 'vscode';
import { Background, ViewHtml, Message } from '../../core/index.js';
import { Auth } from '../../auth/background/index.js';

import { NAME } from '../constants.js';

/**
 * Concrete implementation of Background acting as the App Shell.
 */
import { SettingsBackground } from '../../settings/background/index.js';
import { RuntimeBackground } from '../../runtime/background/index.js';
import { ChatBackground } from '../../chat/background/index.js';

/**
 * Concrete implementation of Background acting as the App Shell.
 */
export class AppBackground extends Background {
  private settingsBg: SettingsBackground;

  constructor(context: vscode.ExtensionContext, appVersion: string) {
    super(NAME, context.extensionUri, `${NAME}-view`);
    this.appVersion = appVersion;
    this.log('Initialized');

    // Initialize domain-specific backgrounds
    this.settingsBg = new SettingsBackground(context);
    new RuntimeBackground(context); // Starts Sidecar 2 on port 3001
    new ChatBackground(context); // Connects to 'chat-view' (Task 4)

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
  public override async listen(message: Message): Promise<any> {
    // Delegate to Settings Background
    // If it handles the message, it returns a response.
    const settingsResponse = await this.settingsBg.listen(message);
    if (settingsResponse) {
      return settingsResponse;
    }

    // App Shell logic (if any)
  }

  /**
   * Override to set the panel description based on OAuth session state.
   * Uses webviewView.description to add "🔒 Secure" next to the title.
   */
  public override resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): void {
    super.resolveWebviewView(webviewView, context, token);

    // Share webview reference with Settings module for title/badge updates only.
    // Do NOT call settingsBg.resolveWebviewView — it would attach a second
    // messenger listener, causing every message to be processed twice.
    this.settingsBg.setWebviewViewRef(webviewView);

    // After webview is ready, check OAuth session and set title
    setTimeout(async () => {
      try {
        const auth = Auth.getInstance();
        const sessions = await auth.getSessions(['openid', 'email', 'profile']);
        if (sessions && sessions.length > 0) {
          webviewView.title = '🔒 Secure';
          webviewView.description = undefined;
          webviewView.badge = undefined; // Ensure no badge is shown
          this.log('Panel title set — OAuth session active');
        } else {
          webviewView.title = undefined;
          webviewView.description = undefined;
          webviewView.badge = undefined;
        }
      } catch {
        // Auth not initialized yet — no title override
      }
    }, 500);
  }

  protected getHtmlForWebview(webview: vscode.Webview): string {
    const scriptPath = 'dist/extension/modules/app/view/index.js';
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath, this.appVersion);
  }
}
