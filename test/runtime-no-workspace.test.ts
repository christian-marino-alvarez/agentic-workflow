import { describe, it, expect, vi } from 'vitest';
import { Runtime } from '../src/runtime/runtime.js';

vi.mock('../src/runtime/task-resolver.js', () => ({
  resolveTaskPath: vi.fn().mockResolvedValue({
    resolvedPath: '/abs/path',
    workspaceRoot: null
  }),
  ensureInitTaskFile: vi.fn().mockResolvedValue({ taskPath: '/abs/path', created: false })
}));

describe('Runtime updateInit no workspace', () => {
  it('throws correct error when workspace resolution fails', async () => {
    const runtime = new Runtime();
    const params = {
      taskPath: 'task.md',
      agent: 'agent',
      command: '/init',
      constitutionPaths: [],
      language: 'en',
      languageConfirmed: true,
      strategy: 'short',
      traceabilityVerified: true,
      traceabilityTool: 'tool',
      traceabilityResponse: 'response',
      traceabilityTimestamp: 'ts',
      runtimeStarted: true,
      taskId: 'id',
      taskPathValue: 'path',
      breakGlass: true
    };

    await expect(runtime.updateInit(params)).rejects.toThrow('No se pudo resolver workspaceRoot para write guard.');
  });
});
