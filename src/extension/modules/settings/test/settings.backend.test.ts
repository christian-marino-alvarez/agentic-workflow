import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// No jsdom environment here - use default Node
import { Settings as SettingsBackend } from '../backend/index.js';
import { PROVIDERS, AUTH_TYPES, PROVIDER_URLS, SCOPES, MESSAGES } from '../constants.js';

// Mock vscode module
const mockSecrets = {
  get: vi.fn(),
  store: vi.fn(),
  'delete': vi.fn(),
  onDidChange: vi.fn()
};

const mockConfig = {
  get: vi.fn(),
  update: vi.fn()
};

const mockAuthentication = {
  getSession: vi.fn()
};

vi.mock('vscode', () => ({
  default: {
    ExtensionContext: {},
    SecretStorage: {},
    ConfigurationTarget: { Global: 1 },
    Uri: { parse: vi.fn() },
    workspace: {
      getConfiguration: vi.fn(() => mockConfig)
    },
    authentication: {
      getSession: (...args: any[]) => mockAuthentication.getSession(...args)
    },
    EventEmitter: vi.fn(() => ({ event: vi.fn(), fire: vi.fn() }))
  },
  Uri: { parse: vi.fn() },
  workspace: {
    getConfiguration: vi.fn(() => mockConfig)
  },
  authentication: {
    getSession: (...args: any[]) => mockAuthentication.getSession(...args)
  },
  EventEmitter: vi.fn(() => ({ event: vi.fn(), fire: vi.fn() })),
  ConfigurationTarget: { Global: 1 }
}));

describe('Settings Module Backend', () => {
  let context: any;
  let settings: SettingsBackend;

  beforeEach(() => {
    vi.clearAllMocks();

    context = {
      secrets: mockSecrets,
      extensionUri: { fsPath: '/' },
      subscriptions: []
    };

    // Reset config mock defaults
    mockConfig.get.mockReturnValue([]);
    mockConfig.update.mockResolvedValue(undefined);

    settings = new SettingsBackend(context);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saveModel stores API key in secrets and config in settings', async () => {
    const model = {
      id: 'test-id',
      name: 'Test Model',
      provider: PROVIDERS.CODEX,
      authType: AUTH_TYPES.API_KEY,
      apiKey: 'secret-key',
      modelName: 'codex',
    };

    await settings.saveModel(model as any);

    // Verify Secret Storage
    expect(mockSecrets.store).toHaveBeenCalledWith('model.test-id.apiKey', 'secret-key');

    // Verify Config Storage (Should NOT contain key)
    expect(mockConfig.update).toHaveBeenCalledWith('models', expect.arrayContaining([
      expect.objectContaining({
        id: 'test-id',
        apiKey: undefined // Key should be stripped
      })
    ]), 1);
  });

  it('loadModels retrieves key from secrets', async () => {
    // Setup initial state
    const model = {
      id: 'test-id',
      name: 'Test Model',
      provider: PROVIDERS.CODEX,
      authType: AUTH_TYPES.API_KEY,
    };

    mockConfig.get.mockReturnValue([model]);
    mockSecrets.get.mockResolvedValue('secret-key');

    // Refresh settings to trigger load
    const loadedModels = await settings.getModels();

    expect(loadedModels).toHaveLength(1);
    expect(loadedModels[0].apiKey).toBe('secret-key');
    expect(mockSecrets.get).toHaveBeenCalledWith('model.test-id.apiKey');
  });

  it('verifyConnection handles API Key success', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      statusText: 'OK'
    } as Response);

    const model = {
      id: 'test',
      name: 'test',
      provider: PROVIDERS.CODEX,
      authType: AUTH_TYPES.API_KEY,
      apiKey: 'valid-key',
      modelName: 'codex'
    };

    const result = await settings.verifyConnection(model as any);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Connection Successful');

    // Check if called with correct URL string
    expect(fetchSpy).toHaveBeenCalledWith(
      PROVIDER_URLS.CODEX, // Fixed: Use property directly
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer valid-key'
        })
      })
    );
  });

  it('verifyConnection handles OAuth success', async () => {
    const model = {
      id: 'test',
      name: 'test',
      provider: PROVIDERS.GEMINI,
      authType: AUTH_TYPES.OAUTH,
      modelName: 'gemini-pro'
    };

    mockAuthentication.getSession.mockResolvedValue({
      accessToken: 'oauth-token',
      account: { id: 'user@gmail.com', label: 'Test User' }
    });

    // Mock the token validation fetch
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      statusText: 'OK'
    } as Response);

    const result = await settings.verifyConnection(model as any);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Authenticated as Test User');
    expect(mockAuthentication.getSession).toHaveBeenCalledWith(
      'agw-google-oauth',
      expect.arrayContaining(['openid', 'email', 'profile']),
      { createIfNone: true }
    );
    expect(fetchSpy).toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  it('verifyConnection handles failure', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      statusText: 'Unauthorized'
    } as Response);

    const model = {
      id: 'test',
      name: 'test',
      provider: PROVIDERS.CODEX,
      authType: AUTH_TYPES.API_KEY,
      apiKey: 'invalid-key',
      modelName: 'codex'
    };

    const result = await settings.verifyConnection(model as any);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Error');
  });
});
