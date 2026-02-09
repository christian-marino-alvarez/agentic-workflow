import { describe, it, expect, vi } from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';

describe('mcp handlers workspace error branch', () => {
  it('handles non-Error thrown from workspace resolution', async () => {
    const originalWorkspace = process.env.AGENTIC_WORKSPACE;
    delete process.env.AGENTIC_WORKSPACE;

    vi.resetModules();
    vi.doMock('../../../runtime/task-resolver.js', () => ({
      resolveWorkspaceRoot: () => {
        throw 'boom';
      }
    }));

    try {
      const { handleToolCall } = await import('../../handlers.js');
      const runtime = {
        emitEvent: async () => ({ status: 'ok', emitEvent: { type: 'custom', timestamp: new Date().toISOString(), runId: 'x' } })
      } as any;
      const base = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-mcp-branch-'));
      const eventsPath = path.join(base, 'events.jsonl');
      const result = await handleToolCall(runtime, 'runtime_emit_event', { eventsPath });
      expect((result.content[0] as any).text).toContain('custom');
    } finally {
      process.env.AGENTIC_WORKSPACE = originalWorkspace;
    }
  });
});
