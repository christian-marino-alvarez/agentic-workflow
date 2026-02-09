import { describe, it, expect, vi } from 'vitest';

describe('resolveWorkspaceRoot with failing homedir', () => {
  it('returns error when homedir is unavailable', async () => {
    vi.resetModules();
    vi.doMock('node:os', () => ({
      homedir: () => {
        throw new Error('homedir failed');
      }
    }));
    vi.doMock('node:fs', () => ({
      default: {
        existsSync: () => false,
        readFileSync: () => ''
      },
      existsSync: () => false,
      readFileSync: () => ''
    }));

    const { resolveWorkspaceRoot } = await import('../../task-resolver.js');
    expect(() => resolveWorkspaceRoot()).toThrow('No se encontró ".agent/"');
  });
});
