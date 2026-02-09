import { EncryptionHelper, type EncryptedPayload } from '../../../../shared/security/encryption.js';

export class BridgeClient {
  private readonly sessionKey: string;
  private readonly bridgeToken: string;
  private readonly bridgeUrl: string;

  constructor(
    sessionKey?: string,
    bridgeToken?: string,
    bridgeUrl?: string
  ) {
    this.sessionKey = sessionKey || process.env.AGW_SESSION_KEY || '';
    this.bridgeToken = bridgeToken || process.env.AGW_BRIDGE_TOKEN || '';
    this.bridgeUrl = bridgeUrl || `http://127.0.0.1:${process.env.AGW_BRIDGE_PORT}`;
  }

  public async getSecret(secretKeyId: string): Promise<string> {
    if (!this.sessionKey || !this.bridgeToken) {
      throw new Error('Security bridge not initialized (missing keys/token).');
    }

    const payload = EncryptionHelper.encrypt(secretKeyId, this.sessionKey);

    const response = await fetch(`${this.bridgeUrl}/secrets/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.bridgeToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Bridge Error: ${error.message || response.statusText}`);
    }

    const encryptedResult = await response.json() as EncryptedPayload;
    return EncryptionHelper.decrypt(encryptedResult, this.sessionKey);
  }

  public isReady(): boolean {
    return Boolean(this.sessionKey && this.bridgeToken && process.env.AGW_BRIDGE_PORT);
  }
}
