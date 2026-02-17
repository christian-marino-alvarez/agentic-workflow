import * as vscode from 'vscode';
import { ConfigurationService } from '../../core/backend/config-service.js';
import { SecretStorageService } from '../../core/backend/secret-service.js';
import { LLMModelConfig } from '../types.js';
import { randomUUID } from 'crypto';

import { NAME } from '../constants.js';

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

  async saveModel(model: LLMModelConfig): Promise<void> {
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
      // If the user didn't provide a new key, we assume they want to keep the old one.
      // However, we need to be careful not to overwrite the undefined key in config.
      // TODO: Fetch existing key to preserve it? Or simply don't overwrite the secret?
      // The secret is separate. We just don't touch it.
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
}
