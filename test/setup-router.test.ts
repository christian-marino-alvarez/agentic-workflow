import { describe, it, expect, vi } from 'vitest';
import { SetupRouter } from '../src/extension/modules/setup/background/router.js';

describe('SetupRouter', () => {
  it('should initialize with new tab', () => {
    const router = new SetupRouter();
    expect(router.getState().tab).toBe('new');
  });

  it('should switch tabs correctly', () => {
    const router = new SetupRouter();
    router.setTab('new');
    expect(router.getState().tab).toBe('new');
    expect(router.getState().selectedProvider).toBe('openai');
  });

  it('should set provider for new mode', () => {
    const router = new SetupRouter();
    router.setProvider('gemini', 'new');
    expect(router.getState().selectedProvider).toBe('gemini');
  });

  it('should set editing model and switch to edit tab', () => {
    const router = new SetupRouter();
    router.setEditingModel('model-1', 'gemini');
    const state = router.getState();
    expect(state.tab).toBe('edit');
    expect(state.editingModelId).toBe('model-1');
  });

});
