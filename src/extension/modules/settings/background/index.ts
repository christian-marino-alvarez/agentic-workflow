import * as vscode from 'vscode';
import { Background, ViewHtml, Message } from '../../core/index.js';
import { MESSAGES, PROVIDERS } from '../constants.js';
import { Settings } from '../backend/index.js';
import { Auth } from '../../auth/background/index.js';
import {
  GOOGLE_TOKENINFO_URL, GOOGLE_SCOPES,
  OPENAI_SCOPES, OPENAI_CLIENT_ID_KEY
} from '../../auth/constants.js';

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
      case MESSAGES.GET_REQUEST:
        return this.handleGetRequest();
      case MESSAGES.SAVE_REQUEST:
        return this.handleSaveRequest(data);
      case MESSAGES.DELETE_REQUEST:
        return this.handleDeleteRequest(data);
      case MESSAGES.SELECT_REQUEST:
        return this.handleSelectRequest(data);
      case MESSAGES.TEST_CONNECTION_REQUEST:
        return this.handleTestConnectionRequest(data);
      case MESSAGES.SAVE_GOOGLE_CLIENT_ID:
        return this.handleSaveGoogleClientId(data);
      case MESSAGES.GET_GOOGLE_CREDENTIALS:
        return this.handleGetGoogleCredentials();
      case MESSAGES.REMOVE_GOOGLE_CREDENTIALS:
        return this.handleRemoveGoogleCredentials();
      // OpenAI OAuth
      case MESSAGES.SAVE_OPENAI_CLIENT_ID:
        return this.handleSaveOpenAIClientId(data);
      case MESSAGES.GET_OPENAI_CREDENTIALS:
        return this.handleGetOpenAICredentials();
      case MESSAGES.REMOVE_OPENAI_CREDENTIALS:
        return this.handleRemoveOpenAICredentials();
      case 'OPEN_EXTERNAL':
        return this.handleOpenExternal(data);
    }
  }

  // --- Handlers ---

  private async handleGetRequest() {
    const models = await this.settings.getModels();
    const activeModelId = await this.settings.getActiveModelId();
    return { success: true, models, activeModelId };
  }

  private async handleSaveRequest(data: any) {
    const id = await this.settings.saveModel(data);
    return { success: true, id };
  }

  private async handleDeleteRequest(data: any) {
    await this.settings.deleteModel(data);
    return { success: true };
  }

  private async handleSelectRequest(data: any) {
    await this.settings.setActiveModel(data);
    const activeId = await this.settings.getActiveModelId();
    return { success: true, activeId };
  }

  private async handleTestConnectionRequest(data: any) {
    // OAuth models MUST be verified in the Extension Host (Background),
    // because the sidecar Backend has no access to vscode.authentication.
    if (data?.authType === 'oauth') {
      if (data?.provider === PROVIDERS.GEMINI) {
        return await this.verifyOAuthConnection();
      }
      if (data?.provider === PROVIDERS.CODEX) {
        return await this.verifyOpenAIOAuthConnection();
      }
    }
    // API key models: delegate to the sidecar Backend
    return await this.settings.verifyConnection(data);
  }

  private async handleSaveGoogleClientId(data: any) {
    const auth = Auth.getInstance();
    await auth.saveGoogleCredentials(data.clientId, data.clientSecret);
    return { success: true };
  }

  private async handleGetGoogleCredentials() {
    const config = vscode.workspace.getConfiguration();
    const clientId = config.get<string>('agenticWorkflow.googleClientId', '');
    const clientSecret = config.get<string>('agenticWorkflow.googleClientSecret', '');
    return { clientId, clientSecret, configured: !!(clientId && clientSecret) };
  }

  private async handleRemoveGoogleCredentials() {
    const config = vscode.workspace.getConfiguration();
    await config.update('agenticWorkflow.googleClientId', undefined, vscode.ConfigurationTarget.Global);
    await config.update('agenticWorkflow.googleClientSecret', undefined, vscode.ConfigurationTarget.Global);
    // Also remove cached tokens from SecretStorage
    const auth = Auth.getInstance();
    await auth.removeGoogleCredentials();
    return { success: true };
  }

  private async handleOpenExternal(data: any) {
    await vscode.env.openExternal(vscode.Uri.parse(data.url));
    return { success: true };
  }

  private static isLoggingIn = false;

  /**
   * Verify OAuth connection in the Extension Host.
   * The sidecar Backend cannot use vscode.authentication — this must run here.
   */
  private async verifyOAuthConnection(): Promise<{ success: boolean; message: string }> {
    if (SettingsBackground.isLoggingIn) {
      return { success: false, message: 'Login flow already in progress. Please check your browser.' };
    }

    try {
      const auth = Auth.getInstance();
      const sessions = await auth.getSessions(['openid', 'email', 'profile']);

      let session: vscode.AuthenticationSession;

      // 1. No session? Start login flow.
      if (!sessions || sessions.length === 0) {
        this.log('No active Google session. Initiating login...');
        SettingsBackground.isLoggingIn = true;
        try {
          session = await auth.createSession(GOOGLE_SCOPES);
          // Session created successfully means we have valid tokens.
          // Return immediately to avoid redundant validation/refresh logic.
          return { success: true, message: `Authenticated as ${session.account.label}` };
        } catch (e: any) {
          return { success: false, message: `Login failed: ${e.message}` };
        } finally {
          SettingsBackground.isLoggingIn = false;
        }
      } else {
        session = sessions[0];
      }

      // 2. Validate token
      this.log(`Validating token for session: ${session.id.substring(0, 8)}...`);
      const tokenInfoRes = await fetch(
        `${GOOGLE_TOKENINFO_URL}?access_token=${session.accessToken}`
      );

      if (!tokenInfoRes.ok) {
        this.log(`Token validation failed: ${tokenInfoRes.status} ${tokenInfoRes.statusText}`);

        // 3. Try Refresh
        this.log('Access token invalid, attempting refresh...');
        const newToken = await auth.refreshAccessToken();

        if (!newToken) {
          this.log('Refresh failed. Token expired. Initiating re-login...');
          // remove old session and re-login
          await auth.removeSession(session.id);

          SettingsBackground.isLoggingIn = true;
          try {
            session = await auth.createSession(GOOGLE_SCOPES);
            // Session created successfully means we have new tokens
            return { success: true, message: `Authenticated as ${session.account.label} (re-login)` };
          } catch (e: any) {
            return { success: false, message: `Re-login failed: ${e.message}` };
          } finally {
            SettingsBackground.isLoggingIn = false;
          }
        }

        this.log('Token refreshed successfully.');
        return { success: true, message: `Authenticated as ${session.account.label} (token refreshed)` };
      }

      this.log('Token validation successful.');
      return { success: true, message: `Authenticated as ${session.account.label}` };
    } catch (error: any) {
      this.log('OAuth verification error:', error.message);
      return { success: false, message: error.message };
    }
  }

  // ─── OpenAI OAuth Handlers ──────────────────────────────

  private async handleSaveOpenAIClientId(data: any) {
    const auth = Auth.getInstance();
    await auth.saveOpenAICredentials(data.clientId);
    return { success: true };
  }

  private async handleGetOpenAICredentials() {
    const config = vscode.workspace.getConfiguration();
    const clientId = config.get<string>(OPENAI_CLIENT_ID_KEY, '');
    return { clientId, configured: !!clientId };
  }

  private async handleRemoveOpenAICredentials() {
    const config = vscode.workspace.getConfiguration();
    await config.update(OPENAI_CLIENT_ID_KEY, undefined, vscode.ConfigurationTarget.Global);
    const auth = Auth.getInstance();
    await auth.removeOpenAICredentials();
    return { success: true };
  }

  /**
   * Verify OpenAI OAuth connection in the Extension Host.
   * Mirrors verifyOAuthConnection but for the OpenAI provider.
   */
  private async verifyOpenAIOAuthConnection(): Promise<{ success: boolean; message: string }> {
    if (SettingsBackground.isLoggingIn) {
      return { success: false, message: 'Login flow already in progress. Please check your browser.' };
    }

    try {
      const auth = Auth.getInstance();
      const sessions = await auth.getOpenAISessions();

      let session: vscode.AuthenticationSession;

      // 1. No session? Start login flow.
      if (!sessions || sessions.length === 0) {
        this.log('No active OpenAI session. Initiating login...');
        SettingsBackground.isLoggingIn = true;
        try {
          session = await auth.createOpenAISession(OPENAI_SCOPES);
          return { success: true, message: `Authenticated as ${session.account.label}` };
        } catch (e: any) {
          return { success: false, message: `Login failed: ${e.message}` };
        } finally {
          SettingsBackground.isLoggingIn = false;
        }
      } else {
        session = sessions[0];
      }

      // 2. Validate by calling /v1/models with the token
      this.log(`Validating OpenAI token for session: ${session.id.substring(0, 8)}...`);
      const modelsRes = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${session.accessToken}` },
      });

      if (!modelsRes.ok) {
        this.log(`OpenAI token validation failed: ${modelsRes.status}`);

        // 3. Try Refresh
        this.log('OpenAI access token invalid, attempting refresh...');
        const newToken = await auth.refreshOpenAIAccessToken();

        if (!newToken) {
          this.log('OpenAI refresh failed. Initiating re-login...');
          await auth.removeOpenAISession(session.id);

          SettingsBackground.isLoggingIn = true;
          try {
            session = await auth.createOpenAISession(OPENAI_SCOPES);
            return { success: true, message: `Authenticated as ${session.account.label} (re-login)` };
          } catch (e: any) {
            return { success: false, message: `Re-login failed: ${e.message}` };
          } finally {
            SettingsBackground.isLoggingIn = false;
          }
        }

        this.log('OpenAI token refreshed successfully.');
        return { success: true, message: `Authenticated as ${session.account.label} (token refreshed)` };
      }

      this.log('OpenAI token validation successful.');
      return { success: true, message: `Authenticated as ${session.account.label}` };
    } catch (error: any) {
      this.log('OpenAI OAuth verification error:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Store a reference to the shared App Webview for title/badge updates.
   * IMPORTANT: Do NOT call resolveWebviewView or setWebview here —
   * that would attach a second messenger listener to the same webview,
   * causing every message to be processed twice.
   */
  public setWebviewViewRef(webviewView: vscode.WebviewView): void {
    this._webviewView = webviewView;
    this.log('SettingsBackground attached to shared Main View (ref only)');
  }

  // Helper method if needed to generate HTML for standalone use
  protected getHtmlForWebview(webview: vscode.Webview): string {
    const scriptPath = 'dist/extension/modules/settings/view/index.js';
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath);
  }
}
