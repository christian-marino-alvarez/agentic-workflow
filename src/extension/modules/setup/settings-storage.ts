import type { Memento } from 'vscode';
import { ExtensionConfigSchema, type ModelConfig, type ExtensionConfig } from '../../providers/index.js';

/**
 * Claves utilizadas para la persistencia en GlobalState
 */
const STORAGE_KEYS = {
  MODELS: 'agentic-workflow.models',
  ACTIVE_MODEL: 'agentic-workflow.activeModelId',
  ARTIFACTS_PATH: 'agentic-workflow.artifactsPath',
} as const;

/**
 * SettingsStorage (Facade)
 * 
 * Centraliza y valida el acceso a la persistencia de configuración de la extensión.
 * Implementa el patrón Facade para desacoplar el negocio de vscode.Memento.
 */
export class SettingsStorage {
  constructor(private readonly globalState: Memento) { }

  /**
   * Obtiene la configuración completa e integrada
   */
  public getConfig(): ExtensionConfig {
    const models = this.globalState.get<any[]>(STORAGE_KEYS.MODELS, []);
    const activeModelId = this.globalState.get<string>(STORAGE_KEYS.ACTIVE_MODEL);
    const artifactsPath = this.globalState.get<string>(STORAGE_KEYS.ARTIFACTS_PATH);

    const rawConfig = {
      models,
      activeModelId,
      artifactsPath,
    };

    const result = ExtensionConfigSchema.safeParse(rawConfig);

    if (!result.success) {
      // Si los datos están corruptos, retornamos el default del esquema
      // y podríamos loguear el error de validación en el futuro.
      console.error('[SettingsStorage] Invalid configuration found in storage:', result.error);
      return ExtensionConfigSchema.parse({});
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
}
