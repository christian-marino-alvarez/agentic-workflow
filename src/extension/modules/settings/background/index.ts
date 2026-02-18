import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Background, ViewHtml, Message } from '../../core/index.js';
import { ConfigurationService } from '../../core/backend/config-service.js';
import { SecretStorageService } from '../../core/backend/secret-service.js';
import { LLMModelConfig } from '../types.js';
import { randomUUID } from 'crypto';
import {
  NAME, MESSAGES, PROVIDERS, AUTH_TYPES,
  PROVIDER_URLS, PROVIDER_HEADERS
} from '../constants.js';
import { Auth } from '../../auth/background/index.js';
import {
  GOOGLE_TOKENINFO_URL, GOOGLE_SCOPES,
  OPENAI_SCOPES, OPENAI_CLIENT_ID_KEY
} from '../../auth/constants.js';
import matter from 'gray-matter';

/**
 * Settings Background - Controls the Settings View
 * and manages LLM model configuration (CRUD + verification).
 */
export class SettingsBackground extends Background {
  private readonly configService: ConfigurationService;
  private readonly secretService: SecretStorageService;
  private models: LLMModelConfig[] = [];

  constructor(context: vscode.ExtensionContext) {
    super('settings', context.extensionUri, 'settings-view');
    this.configService = new ConfigurationService('agenticWorkflow');
    this.secretService = new SecretStorageService(context.secrets);
    this.loadModels();
    this.log('SettingsBackground initialized');
  }

  // ─── Model CRUD ─────────────────────────────────────────

  private async loadModels(): Promise<void> {
    this.models = this.configService.get<LLMModelConfig[]>('models', []) || [];
    for (const model of this.models) {
      if (model.id) {
        const key = await this.secretService.get(`model.${model.id}.apiKey`);
        if (key) {
          model.apiKey = key;
        }
      }
    }
  }

  async getModels(): Promise<LLMModelConfig[]> {
    await this.loadModels();
    return this.models;
  }

  async saveModel(model: LLMModelConfig): Promise<string> {
    await this.loadModels();

    if (!model.id) {
      model.id = randomUUID();
    }

    const existingIndex = this.models.findIndex(m => m.id === model.id);

    if (model.apiKey) {
      await this.secretService.store(`model.${model.id}.apiKey`, model.apiKey);
      model.apiKey = undefined;
    }

    if (existingIndex >= 0) {
      this.models[existingIndex] = { ...this.models[existingIndex], ...model };
    } else {
      this.models.push(model);
    }

    await this.configService.update('models', this.models, vscode.ConfigurationTarget.Global);
    await this.loadModels();
    return model.id;
  }

  async deleteModel(id: string): Promise<void> {
    await this.loadModels();
    this.models = this.models.filter(m => m.id !== id);
    await this.configService.update('models', this.models, vscode.ConfigurationTarget.Global);
    await this.secretService.delete(`model.${id}.apiKey`);
  }

  private _activeModelId: string | undefined;

  async setActiveModel(id: string): Promise<void> {
    this._activeModelId = id;
    await this.configService.update('activeModelId', id, vscode.ConfigurationTarget.Global);
  }

  async getActiveModelId(): Promise<string | undefined> {
    if (this._activeModelId !== undefined) {
      return this._activeModelId;
    }
    this._activeModelId = this.configService.get<string>('activeModelId');
    return this._activeModelId;
  }

  // ─── Connection Verification ─────────────────────────────

  async verifyConnection(model: LLMModelConfig): Promise<{ success: boolean; message?: string }> {
    try {
      if (model.authType === AUTH_TYPES.OAUTH && model.provider === PROVIDERS.GEMINI) {
        return await this.verifyOAuthConnection();
      }
      if (model.authType === AUTH_TYPES.OAUTH && model.provider === PROVIDERS.CODEX) {
        return await this.verifyOpenAIOAuthConnection();
      }

      const key = model.apiKey;
      if (!key) {
        return { success: false, message: 'Missing API Key' };
      }

      const { url, options } = this.getVerificationRequest(model.provider, key);
      const res = await fetch(url, options);
      return { success: res.ok, message: res.ok ? 'Connection Successful' : `Error: ${res.statusText}` };
    } catch (error: any) {
      console.error('Connection verification failed:', error);
      return { success: false, message: error.message };
    }
  }

  private getVerificationRequest(provider: string, key: string): { url: string; options: RequestInit } {
    switch (provider) {
      case PROVIDERS.CODEX:
        return {
          url: PROVIDER_URLS.CODEX,
          options: {
            headers: { [PROVIDER_HEADERS.CODEX.AUTH_KEY]: `${PROVIDER_HEADERS.CODEX.AUTH_PREFIX} ${key}` }
          }
        };
      case PROVIDERS.GEMINI:
        return {
          url: `${PROVIDER_URLS.GEMINI}?key=${key}`,
          options: {}
        };
      case PROVIDERS.CLAUDE:
        return {
          url: PROVIDER_URLS.CLAUDE,
          options: {
            headers: {
              [PROVIDER_HEADERS.CLAUDE.API_KEY]: key,
              [PROVIDER_HEADERS.CLAUDE.VERSION_KEY]: PROVIDER_HEADERS.CLAUDE.VERSION_VALUE
            }
          }
        };
      default:
        throw new Error('Unknown provider');
    }
  }

  // ─── Message Routing ───────────────────────────────────

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
      case MESSAGES.SAVE_OPENAI_CLIENT_ID:
        return this.handleSaveOpenAIClientId(data);
      case MESSAGES.GET_OPENAI_CREDENTIALS:
        return this.handleGetOpenAICredentials();
      case MESSAGES.REMOVE_OPENAI_CREDENTIALS:
        return this.handleRemoveOpenAICredentials();
      case 'OPEN_EXTERNAL':
        return this.handleOpenExternal(data);
      case MESSAGES.GET_ROLES:
      case MESSAGES.REFRESH_ROLES:
        return this.handleGetRoles();
      case MESSAGES.SAVE_BINDING:
        return this.handleSaveBinding(data);
      case MESSAGES.GET_BINDING:
        return this.handleGetBinding();
    }
  }

  // ─── Handlers ───────────────────────────────────────────

  private async handleGetRequest() {
    const models = await this.getModels();
    const activeModelId = await this.getActiveModelId();
    return { success: true, models, activeModelId };
  }

  private async handleSaveRequest(data: any) {
    const id = await this.saveModel(data);
    return { success: true, id };
  }

  private async handleDeleteRequest(data: any) {
    await this.deleteModel(data);
    return { success: true };
  }

  private async handleSelectRequest(data: any) {
    await this.setActiveModel(data);
    const activeId = await this.getActiveModelId();
    return { success: true, activeId };
  }

  private async handleTestConnectionRequest(data: any) {
    return await this.verifyConnection(data);
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
    const auth = Auth.getInstance();
    await auth.removeGoogleCredentials();
    return { success: true };
  }

  private async handleOpenExternal(data: any) {
    await vscode.env.openExternal(vscode.Uri.parse(data.url));
    return { success: true };
  }

  // ─── Role Discovery ────────────────────────────────────

  private async handleGetRoles() {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        return { success: true, roles: [] };
      }

      const rootPath = workspaceFolders[0].uri.fsPath;
      const rolesPath = path.join(rootPath, '.agent', 'rules', 'roles');

      // Ensure directory exists
      try {
        await fs.access(rolesPath);
      } catch {
        // If not exists, return empty
        return { success: true, roles: [] };
      }

      const files = await fs.readdir(rolesPath);
      const roles = [];

      for (const file of files) {
        if (!file.endsWith('.md')) { continue; }

        const roleName = file.replace('.md', '');
        let icon: string | undefined;
        let description: string | undefined;

        try {
          const filePath = path.join(rolesPath, file);
          const content = await fs.readFile(filePath, 'utf8');
          const parsed = matter(content);
          if (parsed.data) {
            if (parsed.data.icon) {
              icon = parsed.data.icon;
            }
            if (parsed.data.description) {
              description = parsed.data.description;
            }
          }
        } catch (err) {
          console.warn(`Failed to parse frontmatter for role ${roleName}`, err);
        }

        roles.push({ name: roleName, icon, description });
      }

      return { success: true, roles };
    } catch (error: any) {
      this.log('Error discovering roles:', error.message, error.stack);
      return { success: false, error: error.message };
    }
  }

  private async handleSaveBinding(data: any) {
    if (!data) { return { success: false }; }
    await this.configService.update('roleBindings', data, vscode.ConfigurationTarget.Global);
    return { success: true };
  }

  private async handleGetBinding() {
    const bindings = this.configService.get('roleBindings', {});
    return { success: true, bindings };
  }

  // ─── OAuth Verification ────────────────────────────────

  private static isLoggingIn = false;

  private async verifyOAuthConnection(): Promise<{ success: boolean; message: string }> {
    if (SettingsBackground.isLoggingIn) {
      return { success: false, message: 'Login flow already in progress. Please check your browser.' };
    }

    try {
      const auth = Auth.getInstance();
      const sessions = await auth.getSessions(['openid', 'email', 'profile']);

      let session: vscode.AuthenticationSession;

      if (!sessions || sessions.length === 0) {
        this.log('No active Google session. Initiating login...');
        SettingsBackground.isLoggingIn = true;
        try {
          session = await auth.createSession(GOOGLE_SCOPES);
          return { success: true, message: `Authenticated as ${session.account.label}` };
        } catch (e: any) {
          return { success: false, message: `Login failed: ${e.message}` };
        } finally {
          SettingsBackground.isLoggingIn = false;
        }
      } else {
        session = sessions[0];
      }

      this.log('Validating token for session...');
      const tokenInfoRes = await fetch(
        `${GOOGLE_TOKENINFO_URL}?access_token=${session.accessToken}`
      );

      if (!tokenInfoRes.ok) {
        this.log(`Token validation failed: ${tokenInfoRes.status} ${tokenInfoRes.statusText}`);
        this.log('Access token invalid, attempting refresh...');
        const newToken = await auth.refreshAccessToken();

        if (!newToken) {
          this.log('Refresh failed. Token expired. Initiating re-login...');
          await auth.removeSession(session.id);

          SettingsBackground.isLoggingIn = true;
          try {
            session = await auth.createSession(GOOGLE_SCOPES);
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

  // ─── OpenAI OAuth ──────────────────────────────────────

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

  private async verifyOpenAIOAuthConnection(): Promise<{ success: boolean; message: string }> {
    if (SettingsBackground.isLoggingIn) {
      return { success: false, message: 'Login flow already in progress. Please check your browser.' };
    }

    try {
      const auth = Auth.getInstance();
      const sessions = await auth.getOpenAISessions();

      let session: vscode.AuthenticationSession;

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

      this.log('Validating OpenAI token for session...');
      const modelsRes = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${session.accessToken}` },
      });

      if (!modelsRes.ok) {
        this.log(`OpenAI token validation failed: ${modelsRes.status}`);
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

  // ─── Webview ───────────────────────────────────────────

  public setWebviewViewRef(webviewView: vscode.WebviewView): void {
    this._webviewView = webviewView;
    this.log('SettingsBackground attached to shared Main View (ref only)');
  }

  protected getHtmlForWebview(webview: vscode.Webview): string {
    const scriptPath = 'dist/extension/modules/settings/view/index.js';
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath);
  }
}
