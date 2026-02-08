import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsStorage } from '../src/extension/modules/setup/background/settings-storage.js';
import type { Memento } from 'vscode';

describe('SettingsStorage', () => {
  let mockMemento: Memento;
  let storage: SettingsStorage;

  beforeEach(() => {
    const data = new Map<string, any>();
    mockMemento = {
      get: vi.fn((key: string, defaultValue?: any) => data.get(key) ?? defaultValue),
      update: vi.fn((key: string, value: any) => {
        data.set(key, value);
        return Promise.resolve();
      }),
      keys: vi.fn(() => Array.from(data.keys())),
    } as any;

    storage = new SettingsStorage(mockMemento);
  });

  it('should return empty models when storage is empty', () => {
    const config = storage.getConfig();
    expect(config.models).toEqual([]);
    expect(config.activeModelId).toBeUndefined();
  });

  it('should save and retrieve models correctly', async () => {
    const models: any[] = [
      {
        id: 'test-openai',
        provider: 'openai',
        name: 'GPT-4',
        model: 'gpt-4',
        apiKey: 'sk-123',
        secretKeyId: 'openai-key'
      }
    ];

    await storage.setModels(models);
    const retrievedModels = storage.getModels();

    expect(retrievedModels).toHaveLength(1);
    expect(retrievedModels[0].provider).toBe('openai');
    expect(retrievedModels[0].id).toBe('test-openai');
  });

  it('should handle invalid data in storage by returning default config', async () => {
    // Insertamos basura en el mock
    await mockMemento.update('agentic-workflow.models', [{ invalid: 'data' }]);

    const config = storage.getConfig();
    expect(config.models).toEqual([]); // El schema filtra o falla y getConfig retorna default
  });

  it('should save and retrieve activeModelId', async () => {
    await storage.setActiveModelId('my-model');
    expect(storage.getActiveModelId()).toBe('my-model');
  });

  it('should save and retrieve artifactsPath', async () => {
    await storage.setArtifactsPath('/path/to/artifacts');
    expect(storage.getArtifactsPath()).toBe('/path/to/artifacts');
  });
});
