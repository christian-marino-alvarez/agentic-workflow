import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgwBackendClient, type BackendClientConfig } from '../../background/backend-client.js';

const VALID_HEX_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// Mock EncryptionHelper
vi.mock('../../../../shared/security/encryption.js', () => ({
  EncryptionHelper: {
    encrypt: vi.fn((text) => ({ data: `enc_${text}`, iv: '0123456789ab', tag: '0123456789abcdef0123456789abcdef' })),
    decrypt: vi.fn((payload) => payload.data.replace('enc_', ''))
  }
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Polyfill/Mock for TextDecoderStream and TransformStream if needed
// In modern Node (v18+) they should be global, but vitest might need help
if (typeof TextDecoderStream === 'undefined') {
  (global as any).TextDecoderStream = class {
    readable = {};
    writable = {};
  };
}

class TestClient extends AgwBackendClient {
  public async testPost<T>(path: string, body: any) {
    return this.post<T>(path, body);
  }

  public async testGetSecret(id: string) {
    return this.getSecret(id);
  }

  public async testStream(path: string, body: any, onData: any, onError: any) {
    return this.stream(path, body, onData, onError);
  }
}

describe('AgwBackendClient', () => {
  const config: BackendClientConfig = {
    baseUrl: 'http://api.test',
    bridgePort: 9999,
    bridgeToken: 'valid-token',
    sessionKey: VALID_HEX_KEY
  };

  let client: TestClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new TestClient(config);
  });

  describe('post', () => {
    it('should send post request with correct headers and body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' })
      });

      const result = await client.testPost('/test', { foo: 'bar' });

      expect(mockFetch).toHaveBeenCalledWith('http://api.test/test', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foo: 'bar' })
      }));
      expect(result).toEqual({ status: 'ok' });
    });

    it('should throw error on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Error'
      });

      await expect(client.testPost('/test', {})).rejects.toThrow('Backend POST /test failed (500): Internal Error');
    });
  });

  describe('getSecret', () => {
    it('should use bridge to get decrypted secret', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'enc_secret-value', iv: 'iv', tag: 'tag' })
      });

      const secret = await client.testGetSecret('my-secret');

      expect(mockFetch).toHaveBeenCalledWith('http://127.0.0.1:9999/secrets/query', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        }
      }));
      expect(secret).toBe('secret-value');
    });
  });

  describe('stream', () => {
    it('should parse fragmented SSE events correctly', async () => {
      const chunks = [
        'data: {"id": "1", "text": "Hello"}\n\n',
        'data: {"id": "2"',
        ', "text": " World"}\n\n',
        'data: [DONE]\n\n'
      ];

      const readable = new ReadableStream({
        start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        }
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: readable
      });

      const onData = vi.fn();
      const onError = vi.fn();

      await client.testStream('/stream', { input: 'hi' }, onData, onError);

      expect(onData).toHaveBeenCalledTimes(2);
      expect(onData).toHaveBeenNthCalledWith(1, { id: '1', text: 'Hello' });
      expect(onData).toHaveBeenNthCalledWith(2, { id: '2', text: ' World' });
      expect(onError).not.toHaveBeenCalled();
    });
  });
});
