import { describe, it, expect, vi } from 'vitest';
import { SecurityEngine } from '../../runtime/index.js';

// Mock crypto
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid'
});

describe('SecurityEngine (Runtime)', () => {
  const engine = new SecurityEngine();

  it('should create a valid model config', () => {
    const data = {
      name: 'Test Model',
      provider: 'openai' as any,
      modelId: 'gpt-4',
      baseUrl: 'https://api.openai.com',
      environment: 'pro' as const
    };

    const model = engine.createModel(data);

    expect(model.id).toBe('test-uuid');
    expect(model.name).toBe('Test Model');
    expect(model.provider).toBe('openai');
    expect(model.parameters.temperature).toBe(0.7);
  });

  it('should enrich models with key presence', () => {
    const models = [
      { id: '1', secretKeyId: 'key-1' } as any,
      { id: '2', secretKeyId: 'key-2' } as any
    ];
    const keys = { 'key-1': true, 'key-2': false };

    const enriched = engine.enrichModels(models, keys);

    expect(enriched[0].hasApiKey).toBe(true);
    expect(enriched[1].hasApiKey).toBe(false);
  });

  it('should update a model in the list', () => {
    const models = [
      { id: '1', name: 'Old' } as any,
      { id: '2', name: 'Static' } as any
    ];

    const updated = engine.updateModelInList(models, '1', { name: 'New' });

    expect(updated[0].name).toBe('New');
    expect(updated[1].name).toBe('Static');
  });
});
