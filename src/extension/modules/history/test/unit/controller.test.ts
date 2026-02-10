import { describe, it, expect, vi } from 'vitest';
import { Controller } from '../../background/index.js';

describe('History Controller', () => {
  it('should be instantiable', () => {
    const context = {
      subscriptions: [],
      extensionUri: { path: '/test' },
      globalState: { get: vi.fn(), update: vi.fn() }
    } as any;

    // We mock window.registerWebviewViewProvider in vitest if needed
    // but the constructor calls register() which uses window
    vi.mock('vscode', () => ({
      window: {
        registerWebviewViewProvider: vi.fn().mockReturnValue({ dispose: vi.fn() }),
        createOutputChannel: vi.fn().mockReturnValue({ appendLine: vi.fn() })
      }
    }));

    const controller = new Controller(context);
    expect(controller).toBeDefined();
    expect((controller as any).viewId).toBe('historyView');
  });
});
