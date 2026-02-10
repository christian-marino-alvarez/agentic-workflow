import type { Memento } from 'vscode';
import { ExtensionConfigSchema, type ModelConfig, type ExtensionConfig } from '../../../providers/index.js';

/**
 * Claves utilizadas para la persistencia en GlobalState
 */
const STORAGE_KEYS = {
  MODELS: 'agentic-workflow.models',
  ACTIVE_MODEL: 'agentic-workflow.activeModelId',
  ARTIFACTS_PATH: 'agentic-workflow.artifactsPath',
  ENVIRONMENT: 'agentic-workflow.environment',
} as const;

import { EventEmitter } from 'vscode';

/**
 * SettingsStorage (Facade)
 * 
 * Centraliza y valida el acceso a la persistencia de configuración de la extensión.
 * Implementa el patrón Facade para desacoplar el negocio de vscode.Memento.
 */
export class SettingsStorage {
  private static readonly _onConfigUpdated = new EventEmitter<void>();
  public static readonly onConfigUpdated = SettingsStorage._onConfigUpdated.event;

  constructor(private readonly globalState: Memento) { }

  /**
   * Obtiene la configuración completa e integrada
   */
  public getConfig(): ExtensionConfig {
    const models = this.globalState.get<any[]>(STORAGE_KEYS.MODELS, []);
    const activeModelId = this.globalState.get<string>(STORAGE_KEYS.ACTIVE_MODEL);
    const artifactsPath = this.globalState.get<string>(STORAGE_KEYS.ARTIFACTS_PATH);
    const environment = this.globalState.get<string>(STORAGE_KEYS.ENVIRONMENT);

    const rawConfig = {
      models,
      activeModelId,
      artifactsPath,
      environment,
    };

    const result = ExtensionConfigSchema.safeParse(rawConfig);

    if (!result.success) {
      console.error('[SettingsStorage] Invalid configuration found in storage:', result.error);
      // Intentamos retornar al menos lo que haya, pero filtrando modelos inválidos
      const validModels = Array.isArray(models)
        ? models.filter(m => {
          // Validación mínima de modelo para evitar crash o inconsistencias
          return m && typeof m === 'object' && m.id && m.provider;
        })
        : [];

      return {
        models: validModels,
        activeModelId,
        artifactsPath,
        environment,
      } as any;
    }

    return result.data;
  }

  /**
   * Obtiene la lista de modelos validados
   */
  public getModels(): ModelConfig[] {
    return this.getConfig().models;
  }

  /**
   * Actualiza la lista de modelos
   */
  public async setModels(models: ModelConfig[]): Promise<void> {
    await this.globalState.update(STORAGE_KEYS.MODELS, models);
    SettingsStorage._onConfigUpdated.fire();
  }

  /**
   * Obtiene el modelo activo
   */
  public getActiveModelId(): string | undefined {
    return this.getConfig().activeModelId;
  }

  /**
   * Establece el modelo activo
   */
  public async setActiveModelId(id: string): Promise<void> {
    await this.globalState.update(STORAGE_KEYS.ACTIVE_MODEL, id);
    SettingsStorage._onConfigUpdated.fire();
  }

  /**
   * Obtiene la ruta de artifacts
   */
  public getArtifactsPath(): string | undefined {
    return this.getConfig().artifactsPath;
  }

  /**
   * Establece la ruta de artifacts
   */
  public async setArtifactsPath(path: string): Promise<void> {
    await this.globalState.update(STORAGE_KEYS.ARTIFACTS_PATH, path);
  }

  /**
   * Obtiene el entorno activo (dev | pro)
   */
  public getEnvironment(): 'dev' | 'pro' {
    return this.getConfig().environment || 'pro';
  }

  /**
   * Establece el entorno activo
   */
  public async setEnvironment(env: 'dev' | 'pro'): Promise<void> {
    await this.globalState.update(STORAGE_KEYS.ENVIRONMENT, env);
    SettingsStorage._onConfigUpdated.fire();
  }
}
