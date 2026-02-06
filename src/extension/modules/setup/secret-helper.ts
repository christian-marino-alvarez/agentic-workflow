import type { ExtensionContext } from 'vscode';
import type { ModelConfig } from '../../providers/index.js';

/**
 * Helper para gestionar secretos (API Keys) de forma segura en VS Code.
 */
export class SecretHelper {
  constructor(private readonly context: ExtensionContext) { }

  /**
   * Recupera un secreto por su ID.
   */
  async getSecret(secretKeyId: string): Promise<string | undefined> {
    return await this.context.secrets.get(secretKeyId);
  }

  /**
   * Almacena un secreto.
   */
  async storeSecret(secretKeyId: string, value: string): Promise<void> {
    await this.context.secrets.store(secretKeyId, value.trim());
  }

  /**
   * Elimina un secreto.
   */
  async deleteSecret(secretKeyId: string): Promise<void> {
    await this.context.secrets.delete(secretKeyId);
  }

  /**
   * Valida si la configuración tiene el secreto correspondiente presente.
   */
  async isSecretPresent(secretKeyId: string): Promise<boolean> {
    const secret = await this.getSecret(secretKeyId);
    return !!secret && secret.length > 0;
  }

  /**
   * Valida una configuración completa de modelo.
   */
  async validateConfigSecrets(config: ModelConfig): Promise<boolean> {
    return await this.isSecretPresent(config.secretKeyId);
  }
}
