import { describe, it, expect, vi } from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';

describe('mcp handlers workspace error branch', () => {
  it('handles non-Error thrown from workspace resolution', async () => {
    vi.resetModules();
    vi.doMock('../src/runtime/task-resolver.js', () => ({
      resolveWorkspaceRoot: () => {
        throw 'boom';
      }
    }));

    const { handleToolCall } = await import('../src/mcp/handlers.js');
    const runtime = {
      emitEvent: async () => ({ status: 'ok', emitEvent: { type: 'custom', timestamp: new Date().toISOString(), runId: 'x' } })
    } as any;
    const base = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-mcp-branch-'));
    const eventsPath = path.join(base, 'events.jsonl');
    const result = await handleToolCall(runtime, 'runtime_emit_event', { eventsPath });
    expect(result.content[0].text).toContain('custom');
  });
});
