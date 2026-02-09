import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export interface EncryptedPayload {
  iv: string;
  tag: string;
  data: string;
}

/**
 * EncryptionHelper
 * Implementa cifrado simétrico AES-256-GCM para asegurar el transporte de secretos.
 */
export class EncryptionHelper {
  private static readonly ALGORITHM = 'aes-256-gcm';

  /**
   * Cifra un texto plano usando la clave de sesión proporcionada.
   */
  public static encrypt(text: string, sessionKey: string): EncryptedPayload {
    const key = Buffer.from(sessionKey, 'hex');
    const iv = randomBytes(12); // GCM recomienda 12 bytes para IV
    const cipher = createCipheriv(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag().toString('hex');

    return {
      iv: iv.toString('hex'),
      tag,
      data: encrypted,
    };
  }

  /**
   * Descifra un payload cifrado usando la clave de sesión proporcionada.
   */
  public static decrypt(payload: EncryptedPayload, sessionKey: string): string {
    const key = Buffer.from(sessionKey, 'hex');
    const iv = Buffer.from(payload.iv, 'hex');
    const tag = Buffer.from(payload.tag, 'hex');
    const decipher = createDecipheriv(this.ALGORITHM, key, iv);

    decipher.setAuthTag(tag);

    let decrypted = decipher.update(payload.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
