import type { ModelConfig, ProviderType, EnrichedModel, CreateActionData } from '../types.js';

/**
 * SecurityEngine contains pure domain logic for the security module.
 * This class is agnostic of VS Code and can be easily ported or tested.
 */
export class SecurityEngine {
  /**
   * Creates a new ModelConfig object with default parameters.
   */
  public createModel(data: CreateActionData): ModelConfig {
    return {
      id: crypto.randomUUID(),
      name: data.name,
      provider: data.provider as any, // Cast to any to satisfy the complex ModelConfig union
      modelId: data.modelId,
      secretKeyId: `agw.key.${data.environment ?? 'pro'}.${Date.now()}`,
      parameters: { temperature: 0.7, maxTokens: 2048 },
      baseUrl: data.baseUrl,
      environment: data.environment ?? 'pro'
    } as ModelConfig;
  }

  /**
   * Enriches a list of models with their API key status.
   */
  public enrichModels(models: ModelConfig[], keys: Record<string, boolean>): EnrichedModel[] {
    return models.map(m => ({
      ...m,
      hasApiKey: keys[m.secretKeyId] || false
    }));
  }

  /**
   * Updates a model in the list while maintaining the Rest of the configuration.
   */
  public updateModelInList(models: ModelConfig[], modelId: string, updates: Partial<ModelConfig>): ModelConfig[] {
    return models.map(m => (m.id === modelId ? { ...m, ...updates } : m)) as ModelConfig[];
  }
}
