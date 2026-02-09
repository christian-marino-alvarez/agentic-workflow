import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EncryptionHelper } from '../../../../../shared/security/encryption.js';
import { BridgeServer } from '../../background/bridge-server.js';
import { BridgeClient } from '../../backend/bridge-client.js';

describe('Security Infrastructure', () => {
  const sessionKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64 chars hex (32 bytes)
  const bridgeToken = 'test-bridge-token';

  describe('EncryptionHelper', () => {
    it('should encrypt and decrypt correctly', () => {
      const text = 'hello world';
      const encrypted = EncryptionHelper.encrypt(text, sessionKey);

      expect(encrypted.data).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.tag).toBeDefined();

      const decrypted = EncryptionHelper.decrypt(encrypted, sessionKey);
      expect(decrypted).toBe(text);
    });

    it('should fail with wrong key', () => {
      const text = 'hello world';
      const encrypted = EncryptionHelper.encrypt(text, sessionKey);
      const wrongKey = '1123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdee';

      expect(() => EncryptionHelper.decrypt(encrypted, wrongKey)).toThrow();
    });
  });

  describe('Bridge Communication', () => {
    let server: BridgeServer;
    let client: BridgeClient;
    const mockSecretHelper = {
      getSecret: vi.fn(async (id) => id === 'exist' ? 'secret-value' : undefined)
    } as any;

    beforeEach(async () => {
      // constructor(secretHelper: SecretHelper, sessionKey: string, bridgeToken: string)
      server = new BridgeServer(mockSecretHelper, sessionKey, bridgeToken);
      const port = await server.start();
      client = new BridgeClient(sessionKey, bridgeToken, `http://127.0.0.1:${port}`);
    });

    afterEach(() => {
      server.stop();
    });

    it('should retrieve a known secret', async () => {
      const value = await client.getSecret('exist');
      expect(value).toBe('secret-value');
      expect(mockSecretHelper.getSecret).toHaveBeenCalledWith('exist');
    });

    it('should throw for unknown secret', async () => {
      await expect(client.getSecret('non-exist')).rejects.toThrow('Secret not found');
    });

    it('should fail with unauthorized token', async () => {
      // Using a manually constructed client with port from the main one
      const currentPort = (server as any).port;
      const badClient = new BridgeClient(sessionKey, 'wrong-token', `http://127.0.0.1:${currentPort}`);
      await expect(badClient.getSecret('exist')).rejects.toThrow('Unauthorized bridge access');
    });
  });
});
