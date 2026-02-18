import * as vscode from 'vscode';
import { ConfigurationService } from '../../core/backend/config-service.js';
import { SecretStorageService } from '../../core/backend/secret-service.js';
import { LLMModelConfig } from '../types.js';
import { randomUUID } from 'crypto';

import { NAME, PROVIDERS, AUTH_TYPES, PROVIDER_URLS, PROVIDER_HEADERS } from '../constants.js';

export class Settings {
  public readonly moduleName = NAME;
  private readonly configService: ConfigurationService;
  private readonly secretService: SecretStorageService;
  private models: LLMModelConfig[] = [];

  constructor(context: vscode.ExtensionContext) {
    this.configService = new ConfigurationService('agenticWorkflow');
    this.secretService = new SecretStorageService(context.secrets);
    this.loadModels();
  }

  private async loadModels() {
    this.models = this.configService.get<LLMModelConfig[]>('models', []) || [];
    // Load secrets for each model
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
    await this.loadModels(); // Ensure fresh state

    if (!model.id) {
      model.id = randomUUID();
    }

    const existingIndex = this.models.findIndex(m => m.id === model.id);

    // Handle Secret
    if (model.apiKey) {
      await this.secretService.store(`model.${model.id}.apiKey`, model.apiKey);
      // Don't store key in config
      model.apiKey = undefined;
    } else if (existingIndex >= 0) {
      // Keep existing key if not provided during update
      // We don't have the key in memory here necessarily if it wasn't reloaded, 
      // but loadModels handles loading it.
    }

    if (existingIndex >= 0) {
      // Merge existing model with new data
      this.models[existingIndex] = { ...this.models[existingIndex], ...model };
    } else {
      this.models.push(model);
    }

    // Store metadata (excluding apiKey)
    await this.configService.update('models', this.models, vscode.ConfigurationTarget.Global);
    await this.loadModels(); // Reload to populate apiKey from secrets for in-memory use
    return model.id;
  }

  async deleteModel(id: string): Promise<void> {
    await this.loadModels(); // Ensure fresh state
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

  async verifyConnection(model: LLMModelConfig): Promise<{ success: boolean; message?: string }> {
    try {
      if (model.authType === AUTH_TYPES.OAUTH && model.provider === PROVIDERS.GEMINI) {
        // Use the registered Google OAuth provider
        const sessionPromise = vscode.authentication.getSession(
          'agw-google-oauth',
          ['openid', 'email', 'profile'],
          { createIfNone: true }
        );
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('OAuth authentication timed out. Complete the Google sign-in in your browser.')), 120_000)
        );
        const session = await Promise.race([sessionPromise, timeoutPromise]);

        if (!session) {
          return { success: false, message: 'OAuth authentication was cancelled' };
        }

        // Validate the access token via Google's tokeninfo endpoint
        const tokenInfoRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?access_token=${session.accessToken}`
        );

        if (!tokenInfoRes.ok) {
          return { success: false, message: `OAuth token invalid: ${tokenInfoRes.statusText}` };
        }

        return {
          success: true,
          message: `Authenticated as ${session.account.label}`
        };
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
}
