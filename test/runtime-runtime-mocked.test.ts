import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';

function buildResolverMock(options: { workspaceRoot: string | null; warning?: string }) {
  return {
    collectWorkspaceCandidates: () => [],
    findWorkspaceRoot: async () => null,
    resolveTaskPath: async () => ({ resolvedPath: '/tmp/task.md', workspaceRoot: options.workspaceRoot }),
    ensureInitTaskFile: async () => ({ taskPath: '/tmp/task.md', created: false, warning: options.warning }),
    resolveNextPhase: async () => 'phase-1-research',
    resolveWorkflowsRootForTask: () => '/tmp/.agent/workflows',
    resolveWorkspaceRoot: () => options.workspaceRoot ?? '/tmp',
    updateTaskPhase: async () => ({ updatedAt: new Date().toISOString() })
  };
}

describe('Runtime mocked branches', () => {
  it('logs warning when init returns warning', async () => {
    vi.resetModules();
    vi.doMock('../src/runtime/task-resolver.js', () => buildResolverMock({ workspaceRoot: '/tmp', warning: 'warn' }));
    vi.doMock('../src/runtime/task-loader.js', () => ({
      loadTask: async () => ({ id: 't', title: 't', owner: 'architect-agent', phase: 'phase-0-acceptance-criteria', strategy: 'long' })
    }));
    vi.doMock('../src/runtime/write-guard.js', () => ({
      RuntimeWriteGuard: class {
        async writeFile() {}
        async appendFile() {}
        async mkdir() {}
      }
    }));

    const { Runtime } = await import('../src/runtime/runtime.js');
    const runtime = new Runtime();
    const result = await runtime.run({ taskPath: 'task.md', agent: 'architect-agent' });
    expect(result.status).toBe('ok');
  });

  it('throws when workspaceRoot is missing for write guard', async () => {
    vi.resetModules();
    vi.doMock('../src/runtime/task-resolver.js', () => buildResolverMock({ workspaceRoot: null }));
    vi.doMock('../src/runtime/task-loader.js', () => ({
      loadTask: async () => ({ id: 't', title: 't', owner: 'architect-agent', phase: 'phase-0-acceptance-criteria', strategy: 'long' })
    }));

    const { Runtime } = await import('../src/runtime/runtime.js');
    const runtime = new Runtime();
    await expect(runtime.run({ taskPath: 'task.md', agent: 'architect-agent' })).rejects.toThrow('workspaceRoot');
  });

  it('formats non-Error exceptions from init creation', async () => {
    vi.resetModules();
    vi.doMock('../src/runtime/task-resolver.js', () => ({
      ...buildResolverMock({ workspaceRoot: '/tmp' }),
      ensureInitTaskFile: async () => {
        throw 'init failed';
      }
    }));
    vi.doMock('../src/runtime/task-loader.js', () => ({
      loadTask: async () => ({ id: 't', title: 't', owner: 'architect-agent', phase: 'phase-0-acceptance-criteria', strategy: 'long' })
    }));
    vi.doMock('../src/runtime/write-guard.js', () => ({
      RuntimeWriteGuard: class {
        async writeFile() {}
        async appendFile() {}
        async mkdir() {}
      }
    }));

    const { Runtime } = await import('../src/runtime/runtime.js');
    const runtime = new Runtime();
    await expect(runtime.run({ taskPath: 'task.md', agent: 'architect-agent' })).rejects.toThrow('init failed');
  });

  it('resolves state path using task dirname when workspaceRoot is null', async () => {
    vi.resetModules();
    vi.doMock('../src/runtime/task-resolver.js', () => ({
      ...buildResolverMock({ workspaceRoot: null }),
      resolveTaskPath: async () => ({ resolvedPath: '/tmp/task.md', workspaceRoot: null })
    }));
    vi.doMock('../src/runtime/task-loader.js', () => ({
      loadTask: async () => ({ id: 't', title: 't', owner: 'architect-agent', phase: 'phase-0-acceptance-criteria', strategy: 'long' })
    }));

    const { Runtime } = await import('../src/runtime/runtime.js');
    const runtime = new Runtime();
    const statePath = path.join('/tmp', '.agent', 'runtime', 'state.json');
    await fs.mkdir(path.dirname(statePath), { recursive: true });
    await fs.writeFile(statePath, JSON.stringify({
      version: 1,
      runId: 'x',
      taskId: 't',
      taskTitle: 't',
      taskPath: '/tmp/task.md',
      phase: 'phase-0-acceptance-criteria',
      status: 'idle',
      steps: [],
      updatedAt: new Date().toISOString()
    }, null, 2));

    const result = await runtime.resume({ taskPath: 'task.md', agent: 'architect-agent' });
    expect(result.status).toBe('ok');
  });
});
