import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Background, ViewHtml, Message, MessageOrigin } from '../../core/index.js';
import { ConfigurationService } from '../../core/backend/config-service.js';
import { SecretStorageService } from '../../core/backend/secret-service.js';
import { LLMModelConfig } from '../types.js';
import { randomUUID } from 'crypto';
import { MODEL_CAPABILITY_MAP } from '../../core/constants.js';
import { ModelCapabilities } from '../../core/types.js';
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
  private discoveredModels: Record<string, Array<{ id: string; displayName: string }>> = {};

  constructor(context: vscode.ExtensionContext) {
    super('settings', context.extensionUri, 'settings-view');
    this.configService = new ConfigurationService('agenticWorkflow');
    this.secretService = new SecretStorageService(context.secrets);
    this.loadModels();
    // Restore discovered models cache from settings
    this.discoveredModels = this.configService.get<Record<string, Array<{ id: string; displayName: string }>>>('discoveredModelsCache') || {};
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

  async verifyConnection(model: LLMModelConfig): Promise<{ success: boolean; message?: string; capabilities?: ModelCapabilities }> {
    try {
      if (model.authType === AUTH_TYPES.OAUTH && model.provider === PROVIDERS.GEMINI) {
        const result = await this.verifyOAuthConnection();
        if (result.success) {
          const caps = this.detectCapabilities(model.modelName);
          await this.persistCapabilities(model.id, caps);
          return { ...result, capabilities: caps };
        }
        return result;
      }
      if (model.authType === AUTH_TYPES.OAUTH && model.provider === PROVIDERS.CODEX) {
        const result = await this.verifyOpenAIOAuthConnection();
        if (result.success) {
          const caps = this.detectCapabilities(model.modelName);
          await this.persistCapabilities(model.id, caps);
          return { ...result, capabilities: caps };
        }
        return result;
      }

      const key = model.apiKey;
      if (!key) {
        return { success: false, message: 'Missing API Key' };
      }

      const { url, options } = this.getVerificationRequest(model.provider, key);
      const res = await fetch(url, options);

      if (res.ok) {
        const caps = this.detectCapabilities(model.modelName);
        await this.persistCapabilities(model.id, caps);
        return { success: true, message: 'Connection Successful', capabilities: caps };
      }

      return { success: false, message: `Error: ${res.statusText}` };
    } catch (error: any) {
      console.error('Connection verification failed:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Detect model capabilities using heuristic name matching.
   */
  private detectCapabilities(modelName: string): ModelCapabilities {
    const lowerName = modelName.toLowerCase();
    for (const [pattern, caps] of Object.entries(MODEL_CAPABILITY_MAP)) {
      if (lowerName.includes(pattern.toLowerCase())) {
        return { ...caps, streaming: true };
      }
    }
    return { vision: false, tools: false, code: false, streaming: true };
  }

  /**
   * Persist detected capabilities to the model's config entry.
   */
  private async persistCapabilities(modelId: string, capabilities: ModelCapabilities): Promise<void> {
    await this.loadModels();
    const idx = this.models.findIndex(m => m.id === modelId);
    if (idx >= 0) {
      this.models[idx].capabilities = capabilities;
      await this.configService.update('models', this.models, vscode.ConfigurationTarget.Global);
      this.log(`Capabilities detected for model ${modelId}:`, JSON.stringify(capabilities));
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
      case MESSAGES.REMOVE_OPENAI_CREDENTIALS:
        return this.handleRemoveOpenAICredentials();
      case MESSAGES.OPEN_EXTERNAL:
        return this.handleOpenExternal(data);
      case MESSAGES.GET_ROLES:
      case MESSAGES.REFRESH_ROLES:
        return this.handleGetRoles();
      case MESSAGES.SAVE_BINDING:
        return this.handleSaveBinding(data);
      case MESSAGES.GET_BINDING:
        return this.handleGetBinding();
      case MESSAGES.SAVE_DISABLED_ROLES:
        return this.handleSaveDisabledRoles(data);
      case MESSAGES.GET_DISABLED_ROLES:
        return this.handleGetDisabledRoles();
      case MESSAGES.SAVE_ROLE_CONFIG:
        return this.handleSaveRoleConfig(data);
      case MESSAGES.LIST_AVAILABLE_MODELS:
        return this.handleListAvailableModels(data);
    }
  }

  // ─── Handlers ───────────────────────────────────────────

  private async handleGetRequest() {
    const models = await this.getModels();
    const activeModelId = await this.getActiveModelId();

    // Resolve credentials for all models
    for (const model of models) {
      // Resolve API keys from SecretStorage (they are cleared from config on save)
      if (!model.apiKey) {
        try {
          const storedKey = await this.secretService.get(`model.${model.id}.apiKey`);
          if (storedKey) {
            model.apiKey = storedKey;
          }
        } catch (e: any) {
          this.log(`Failed to resolve API key for model ${model.name}: ${e.message}`);
        }
      }

      // Resolve OAuth access tokens for OAuth-based models (if still no key)
      if (model.authType === AUTH_TYPES.OAUTH && !model.apiKey) {
        try {
          const auth = Auth.getInstance();
          const sessions = await auth.getSessions(['openid', 'email', 'profile']);
          if (sessions && sessions.length > 0) {
            model.apiKey = sessions[0].accessToken;
          }
        } catch (e: any) {
          this.log(`Failed to resolve OAuth token for model ${model.name}: ${e.message}`);
        }
      }
    }

    return { success: true, models, activeModelId, discoveredModels: this.discoveredModels };
  }

  private async handleSaveRequest(data: any) {
    const id = await this.saveModel(data);
    return { success: true, id };
  }

  private async handleDeleteRequest(data: any) {
    await this.deleteModel(data);
    return { success: true };
  }

  private async handleTestConnectionRequest(data: any) {
    // View sends partial data (provider, authType, apiKey).
    // Enrich with full model for capability detection.
    await this.loadModels();
    const storedModel = this.models.find(m => m.provider === data.provider);
    const fullModel = storedModel ? { ...storedModel, ...data } : data;
    const result = await this.verifyConnection(fullModel);

    // Persist API key on successful test so Factory can find it
    if (result.success && fullModel.id && data.apiKey) {
      await this.secretService.store(`model.${fullModel.id}.apiKey`, data.apiKey);
      this.log('API key persisted on successful test connection');
    }

    // Discover available models from provider after successful connection
    if (result.success && data.apiKey && data.provider) {
      this.discoverAvailableModels(data.provider, data.apiKey);
    }

    return result;
  }

  /**
   * Discover available models from a provider's API via the sidecar.
   */
  private async discoverAvailableModels(provider: string, apiKey: string): Promise<void> {
    try {
      const url = `http://127.0.0.1:3000/llm/models?provider=${encodeURIComponent(provider)}&apiKey=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url);
      const data = await res.json() as any;
      if (data.success && data.models) {
        this.discoveredModels[provider] = data.models;
        this.log(`Discovered ${data.models.length} models for provider ${provider}`);
        // Persist to settings so cache survives restarts
        await this.configService.update('discoveredModelsCache', this.discoveredModels, vscode.ConfigurationTarget.Global);
      }
    } catch (e: any) {
      this.log(`Failed to discover models for ${provider}: ${e.message}`);
    }
  }

  /**
   * Handler for LIST_AVAILABLE_MODELS message.
   * Returns discovered models for a specific provider.
   * Auto-triggers discovery if cache is empty.
   */
  private async handleListAvailableModels(data: any) {
    const provider = data?.provider;
    if (!provider) {
      return { success: true, models: [] };
    }

    // If cache is empty, trigger discovery
    if (!this.discoveredModels[provider]) {
      const models = this.configService.get<LLMModelConfig[]>('models') || [];
      const providerModel = models.find(m => m.provider === provider);

      if (providerModel) {
        // Resolve API key from SecretStorage (keys are NOT stored in config)
        let apiKey = providerModel.apiKey;
        if (!apiKey) {
          try {
            apiKey = await this.secretService.get(`model.${providerModel.id}.apiKey`) || undefined;
          } catch (_) { /* ignore */ }
        }
        // Try OAuth if still no key
        if (!apiKey && providerModel.authType === AUTH_TYPES.OAUTH) {
          try {
            const auth = Auth.getInstance();
            const sessions = await auth.getSessions(['openid', 'email', 'profile']);
            if (sessions && sessions.length > 0) {
              apiKey = sessions[0].accessToken;
            }
          } catch (_) { /* ignore */ }
        }

        if (apiKey) {
          await this.discoverAvailableModels(provider, apiKey);
        }
      }
    }

    if (this.discoveredModels[provider]) {
      return { success: true, models: this.discoveredModels[provider] };
    }
    return { success: true, models: [] };
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
        let model: { provider?: string; id?: string } | undefined;
        let capabilities: Record<string, boolean> | undefined;

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
            if (parsed.data.model) {
              model = parsed.data.model;
            }
            if (parsed.data.capabilities) {
              capabilities = parsed.data.capabilities;
            }
          }
        } catch (err) {
          console.warn(`Failed to parse frontmatter for role ${roleName}`, err);
        }

        roles.push({ name: roleName, icon, description, model, capabilities });
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

  private async handleSaveDisabledRoles(data: any) {
    if (!Array.isArray(data)) { return { success: false }; }
    await this.configService.update('disabledRoles', data, vscode.ConfigurationTarget.Global);
    return { success: true };
  }

  private async handleGetDisabledRoles() {
    const disabledRoles = this.configService.get<string[]>('disabledRoles', []);
    return { success: true, disabledRoles };
  }

  /**
   * Save model and capabilities config to a role's markdown YAML frontmatter.
   * Also updates the VS Code settings bindings for consistency.
   */
  private async handleSaveRoleConfig(data: any) {
    if (!data?.role) {
      return { success: false, error: 'Missing role name' };
    }

    const { role, model, capabilities } = data;

    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        return { success: false, error: 'No workspace open' };
      }

      const rootPath = workspaceFolders[0].uri.fsPath;
      const filePath = path.join(rootPath, '.agent', 'rules', 'roles', `${role}.md`);

      const content = await fs.readFile(filePath, 'utf8');
      const parsed = matter(content);

      // Update frontmatter fields
      if (model !== undefined) {
        parsed.data.model = model;
      }
      if (capabilities !== undefined) {
        parsed.data.capabilities = capabilities;
      }

      // Write back with updated frontmatter
      const updated = matter.stringify(parsed.content, parsed.data);
      await fs.writeFile(filePath, updated, 'utf8');

      // Also persist binding in VS Code settings for quick access
      if (model?.id) {
        const bindings = this.configService.get<Record<string, string>>('roleBindings') ?? {};
        bindings[role] = model.id;
        await this.configService.update('roleBindings', bindings, vscode.ConfigurationTarget.Global);
      }

      this.log(`Role config saved for ${role}`);

      // Notify Chat module to refresh its agent list
      try {
        this.messenger.emit({
          id: randomUUID(),
          from: 'settings::background',
          to: 'chat::background',
          timestamp: Date.now(),
          origin: MessageOrigin.Server,
          payload: { command: 'ROLES_CHANGED', data: {} }
        });
      } catch (_) { /* Chat module may not be active */ }

      return { success: true };
    } catch (error: any) {
      this.log(`Error saving role config for ${role}:`, error.message);
      return { success: false, error: error.message };
    }
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
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath, this.appVersion);
  }
}
