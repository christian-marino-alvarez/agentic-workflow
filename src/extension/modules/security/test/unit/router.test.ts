import { describe, it, expect, vi } from 'vitest';
import { SecurityRouter } from '../../background/router.js';

describe('SecurityRouter', () => {
  it('should initialize with new tab', () => {
    const router = new SecurityRouter();
    expect(router.getState().tab).toBe('new');
  });

  it('should switch tabs correctly', () => {
    const router = new SecurityRouter();
    router.setTab('new');
    expect(router.getState().tab).toBe('new');
    expect(router.getState().selectedProvider).toBe('openai');
  });

  it('should set provider for new mode', () => {
    const router = new SecurityRouter();
    router.setProvider('gemini', 'new');
    expect(router.getState().selectedProvider).toBe('gemini');
  });

  it('should set editing model and switch to edit tab', () => {
    const router = new SecurityRouter();
    router.setEditingModel('model-1', 'gemini');
    const state = router.getState();
    expect(state.tab).toBe('edit');
    expect(state.editingModelId).toBe('model-1');
  });

});
