import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Auth } from '../background/index.js';
import { SECRET_KEYS } from '../constants.js';

// ─── VS Code Mock ──────────────────────────────────────────────────────────
// Use vi.hoisted so these are available inside vi.mock factory
const { mockSecrets, mockConfig, mockFire } = vi.hoisted(() => {
  const mockFire = vi.fn();
  return {
    mockSecrets: {
      get: vi.fn(),
      store: vi.fn(),
      delete: vi.fn(),
      onDidChange: vi.fn(),
    },
    mockConfig: {
      get: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
    },
    mockFire,
  };
});

vi.mock('vscode', () => {
  const fire = mockFire;
  class EventEmitter {
    event = vi.fn();
    fire = fire;
  }
  return {
    workspace: { getConfiguration: vi.fn(() => mockConfig) },
    ConfigurationTarget: { Global: 1 },
    EventEmitter,
    Uri: { parse: vi.fn((s: string) => ({ toString: () => s })) },
    env: { openExternal: vi.fn() },
    authentication: {
      registerAuthenticationProvider: vi.fn(() => ({ dispose: vi.fn() })),
      getSession: vi.fn(),
    },
  };
});

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeContext() {
  return {
    secrets: mockSecrets,
    extensionUri: { fsPath: '/' },
    subscriptions: [],
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('Auth Background — Google OAuth', () => {
  let auth: Auth;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig.get.mockReturnValue('');
    mockSecrets.get.mockResolvedValue(null); // no stored session
    auth = Auth.getInstance(makeContext() as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Reset singleton
    (Auth as any).instance = undefined;
  });

  // ── saveGoogleCredentials ──────────────────────────────────────────────

  describe('saveGoogleCredentials', () => {
    it('saves clientId and clientSecret to VS Code global settings', async () => {
      await auth.saveGoogleCredentials('my-client-id', 'my-client-secret');

      expect(mockConfig.update).toHaveBeenCalledWith(
        'agenticWorkflow.googleClientId',
        'my-client-id',
        1
      );
      expect(mockConfig.update).toHaveBeenCalledWith(
        'agenticWorkflow.googleClientSecret',
        'my-client-secret',
        1
      );
    });

    it('calls update twice (once per key)', async () => {
      await auth.saveGoogleCredentials('id', 'secret');
      expect(mockConfig.update).toHaveBeenCalledTimes(2);
    });
  });

  // ── removeGoogleCredentials ────────────────────────────────────────────

  describe('removeGoogleCredentials', () => {
    it('deletes all three SecretStorage keys', async () => {
      await auth.removeGoogleCredentials();

      expect(mockSecrets.delete).toHaveBeenCalledWith(SECRET_KEYS.ACCESS_TOKEN);
      expect(mockSecrets.delete).toHaveBeenCalledWith(SECRET_KEYS.REFRESH_TOKEN);
      expect(mockSecrets.delete).toHaveBeenCalledWith(SECRET_KEYS.ACCOUNT_INFO);
    });

    it('fires onDidChangeSessions with empty arrays', async () => {
      await auth.removeGoogleCredentials();

      expect(mockFire).toHaveBeenCalledWith({
        added: [],
        removed: [],
        changed: [],
      });
    });

    it('clears in-memory sessions', async () => {
      (auth as any)._sessions = [{ id: 'session-1', accessToken: 'tok' }];

      await auth.removeGoogleCredentials();

      expect((auth as any)._sessions).toHaveLength(0);
    });
  });

  // ── getGoogleClientId / getGoogleClientSecret ──────────────────────────

  describe('getGoogleClientId', () => {
    it('returns the configured client ID from settings', () => {
      mockConfig.get.mockReturnValue('test-client-id');
      const id = (auth as any).getGoogleClientId();
      expect(id).toBe('test-client-id');
    });

    it('returns empty string when not configured', () => {
      mockConfig.get.mockReturnValue('');
      const id = (auth as any).getGoogleClientId();
      expect(id).toBe('');
    });
  });

  describe('getGoogleClientSecret', () => {
    it('returns the configured client secret from settings', () => {
      mockConfig.get.mockReturnValue('test-secret');
      const secret = (auth as any).getGoogleClientSecret();
      expect(secret).toBe('test-secret');
    });
  });

  // ── exchangeCodeForTokens ──────────────────────────────────────────────

  describe('exchangeCodeForTokens', () => {
    it('sends client_id, client_secret, code, and code_verifier in POST body', async () => {
      mockConfig.get
        .mockReturnValueOnce('client-id-123')    // googleClientId
        .mockReturnValueOnce('client-secret-xyz'); // googleClientSecret

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'acc-tok',
          refresh_token: 'ref-tok',
          expires_in: 3600,
        }),
      } as Response);

      await (auth as any).exchangeCodeForTokens(
        'auth-code-abc',
        'verifier-xyz',
        'http://localhost:12345/callback'
      );

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [url, opts] = fetchSpy.mock.calls[0];
      expect(url).toBe('https://oauth2.googleapis.com/token');

      const body = new URLSearchParams(opts!.body as string);
      expect(body.get('client_id')).toBe('client-id-123');
      expect(body.get('client_secret')).toBe('client-secret-xyz');
      expect(body.get('code')).toBe('auth-code-abc');
      expect(body.get('code_verifier')).toBe('verifier-xyz');
      expect(body.get('grant_type')).toBe('authorization_code');
      expect(body.get('redirect_uri')).toBe('http://localhost:12345/callback');
    });

    it('throws on non-ok response with error body', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: 'invalid_client', error_description: 'Bad client' }),
      } as any);

      await expect(
        (auth as any).exchangeCodeForTokens('bad-code', 'verifier', 'http://localhost/cb')
      ).rejects.toThrow();
    });

    it('returns token object with access_token and refresh_token on success', async () => {
      mockConfig.get.mockReturnValue('some-value');

      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-access',
          refresh_token: 'new-refresh',
          expires_in: 3600,
        }),
      } as Response);

      const tokens = await (auth as any).exchangeCodeForTokens('code', 'verifier', 'http://localhost/cb');

      expect(tokens.access_token).toBe('new-access');
      expect(tokens.refresh_token).toBe('new-refresh');
    });
  });

  // ── refreshAccessToken ─────────────────────────────────────────────────

  describe('refreshAccessToken', () => {
    it('sends client_id, client_secret, and refresh_token in POST body', async () => {
      mockConfig.get
        .mockReturnValueOnce('client-id-123')
        .mockReturnValueOnce('client-secret-xyz');

      // refreshAccessToken reads refresh token from SecretStorage
      mockSecrets.get.mockResolvedValue('stored-refresh-token');

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-acc-tok',
          expires_in: 3600,
        }),
      } as Response);

      await (auth as any).refreshAccessToken();

      const [url, opts] = fetchSpy.mock.calls[0];
      expect(url).toBe('https://oauth2.googleapis.com/token');

      const body = new URLSearchParams(opts!.body as string);
      expect(body.get('client_id')).toBe('client-id-123');
      expect(body.get('client_secret')).toBe('client-secret-xyz');
      expect(body.get('refresh_token')).toBe('stored-refresh-token');
      expect(body.get('grant_type')).toBe('refresh_token');
    });

    it('returns null when refresh fails (does not throw)', async () => {
      mockSecrets.get.mockResolvedValue('expired-refresh-token');

      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'invalid_grant' }),
      } as any);

      const result = await (auth as any).refreshAccessToken();
      expect(result).toBeNull();
    });
  });

  // ── getSessions ────────────────────────────────────────────────────────

  describe('getSessions', () => {
    it('returns empty array when no stored tokens exist', async () => {
      mockSecrets.get.mockResolvedValue(null);
      const sessions = await auth.getSessions(['openid']);
      expect(sessions).toEqual([]);
    });

    it('returns in-memory sessions when they exist', async () => {
      const fakeSession = {
        id: 'sess-1',
        accessToken: 'tok',
        account: { id: 'user@gmail.com', label: 'Test User' },
        scopes: ['openid'],
      };
      (auth as any)._sessions = [fakeSession];

      const sessions = await auth.getSessions(['openid']);
      expect(sessions).toHaveLength(1);
      expect(sessions[0].accessToken).toBe('tok');
    });
  });
});
