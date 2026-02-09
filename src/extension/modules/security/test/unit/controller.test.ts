import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExtensionContext, WebviewView } from 'vscode';

// Mock vscode
vi.mock('vscode', () => ({
  commands: { executeCommand: vi.fn() },
  window: {
    showInformationMessage: vi.fn(),
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(),
      show: vi.fn(),
      dispose: vi.fn(),
    })),
  },
  Uri: {
    file: vi.fn((p) => ({ fsPath: p, path: p, toString: () => p })),
    parse: vi.fn((p) => ({ fsPath: p, path: p, toString: () => p })),
  },
}));

import { SecurityController } from '../../background/background.js';

const mockApiKeyBroadcaster = { notify: vi.fn(), dispose: vi.fn(), onDidChange: vi.fn(() => ({ dispose: vi.fn() })) };
const mockSettingsStorage = {
  getConfig: vi.fn<() => any>(() => ({
    models: [] as any[],
    activeModelId: undefined as string | undefined,
    artifactsPath: undefined as string | undefined,
    environment: 'pro' as 'dev' | 'pro'
  })),
  getModels: vi.fn(() => []),
  setModels: vi.fn(),
  setActiveModelId: vi.fn(),
  setArtifactsPath: vi.fn(),
  getEnvironment: vi.fn(() => 'pro' as const),
  setEnvironment: vi.fn()
};

// Mock crypto
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid'
});

const mockContext = {
  extensionUri: { fsPath: '/mock', toString: () => '/mock' },
  secrets: { get: vi.fn(), store: vi.fn(), delete: vi.fn() },
  subscriptions: []
} as any;

const mockWebviewView = {
  webview: {
    options: {},
    cspSource: 'mock-csp',
    postMessage: vi.fn(),
    html: ''
  }
} as any;

describe('Security Controller', () => {
  let controller: SecurityController;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSettingsStorage.getConfig.mockReturnValue({ models: [], activeModelId: undefined, artifactsPath: undefined, environment: 'pro' });
    controller = new SecurityController(mockContext, mockApiKeyBroadcaster as any, mockSettingsStorage as any);
  });

  it('should refresh state when tab changes', async () => {
    (controller as any).webviewView = mockWebviewView;
    await (controller as any).handleSetTab({ tab: 'new' });
    expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
      type: 'state-update',
      tab: 'new'
    }));
  });

  it('should refresh state when model is edited', async () => {
    const models = [{ id: 'm1', provider: 'openai', name: 'Test' }];
    mockSettingsStorage.getConfig.mockReturnValue({ models, activeModelId: 'm1', artifactsPath: undefined, environment: 'pro' });
    (controller as any).webviewView = mockWebviewView;

    await (controller as any).handleEditModel({ data: 'm1' });
    expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
      type: 'state-update',
      tab: 'edit',
      editingModelId: 'm1'
    }));
  });

  it('should handle model creation and redirect', async () => {
    (controller as any).webviewView = mockWebviewView;
    const data = { name: 'New', provider: 'openai', modelId: 'gpt-4', environment: 'pro' };

    mockSettingsStorage.setModels.mockImplementation(async (models: any) => {
      mockSettingsStorage.getConfig.mockReturnValue({ models, activeModelId: undefined, artifactsPath: undefined, environment: 'pro' });
    });

    await (controller as any).handleCreate({ data });

    expect(mockSettingsStorage.setModels).toHaveBeenCalled();
    expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
      type: 'state-update',
      tab: 'list'
    }));
  });

  it('should handle model deletion', async () => {
    const models = [{ id: 'm1', provider: 'openai', name: 'To Delete' }];
    mockSettingsStorage.getConfig.mockReturnValue({ models, activeModelId: undefined, artifactsPath: undefined, environment: 'pro' });
    (controller as any).webviewView = mockWebviewView;

    mockSettingsStorage.setModels.mockImplementation(async (newModels: any) => {
      mockSettingsStorage.getConfig.mockReturnValue({ models: newModels, activeModelId: undefined, artifactsPath: undefined, environment: 'pro' });
    });

    await (controller as any).handleDeleteModel({ data: 'm1' });

    expect(mockSettingsStorage.setModels).toHaveBeenCalledWith([]);
    expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
      type: 'state-update',
      tab: 'list'
    }));
  });

  it('should handle model update', async () => {
    const models = [{ id: 'm1', provider: 'openai', name: 'Old Name', secretKeyId: 'key1' }];
    mockSettingsStorage.getConfig.mockReturnValue({ models, activeModelId: 'm1', artifactsPath: undefined, environment: 'pro' });
    (controller as any).webviewView = mockWebviewView;

    (controller as any).router.setEditingModel('m1', 'openai');

    const updateData = { name: 'New Name', provider: 'gemini', modelId: 'pro', environment: 'pro' };

    await (controller as any).handleUpdate({ data: updateData });

    expect(mockSettingsStorage.setModels).toHaveBeenCalled();
    expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
      type: 'state-update',
      tab: 'list'
    }));
  });
});
