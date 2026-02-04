import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { Runtime } from '../src/runtime/runtime.js';
import { handleToolCall } from '../src/mcp/handlers.js';

async function createWorkspace(): Promise<string> {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-mcp-'));
  await fs.mkdir(path.join(base, '.agent', 'artifacts', 'candidate'), { recursive: true });
  await fs.mkdir(path.join(base, '.agent', 'workflows', 'tasklifecycle-short'), { recursive: true });
  await fs.writeFile(
    path.join(base, '.agent', 'artifacts', 'candidate', 'task.md'),
    [
      '---',
      'id: test-task',
      'title: test-task',
      'owner: architect-agent',
      'strategy: short',
      '---',
      '',
      '# Task',
      '',
      '<!-- RUNTIME:START task-state -->',
      '```yaml',
      'task:',
      '  id: "test-task"',
      '  title: "test-task"',
      '  strategy: "short"',
      '  phase:',
      '    current: "short-phase-1-brief"',
      '```',
      '<!-- RUNTIME:END -->',
      ''
    ].join('\n')
  );
  await fs.writeFile(
    path.join(base, '.agent', 'workflows', 'tasklifecycle-short', 'index.md'),
    [
      '# INDEX',
      '',
      '```yaml',
      'aliases:',
      '  tasklifecycle-short:',
      '    phases:',
      '      phase_1:',
      '        id: short-phase-1-brief',
      '      phase_2:',
      '        id: short-phase-2-implementation',
      '```',
      ''
    ].join('\n')
  );
  return base;
}

async function readEvents(eventsPath: string): Promise<string[]> {
  const raw = await fs.readFile(eventsPath, 'utf-8');
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

describe('MCP handlers', () => {
  let workspace: string;
  let originalCwd: string;
  let originalWorkspaceEnv: string | undefined;

  beforeEach(async () => {
    originalCwd = process.cwd();
    originalWorkspaceEnv = process.env.AGENTIC_WORKSPACE;
    workspace = await createWorkspace();
    process.chdir(workspace);
    process.env.AGENTIC_WORKSPACE = workspace;
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (originalWorkspaceEnv === undefined) {
      delete process.env.AGENTIC_WORKSPACE;
    } else {
      process.env.AGENTIC_WORKSPACE = originalWorkspaceEnv;
    }
  });

  it('emits phase_updated on advance_phase', async () => {
    const runtime = new Runtime();
    const eventsPath = path.join(workspace, '.agent', 'runtime', 'events.jsonl');
    await handleToolCall(runtime, 'runtime.advance_phase', {
      taskPath: '.agent/artifacts/candidate/task.md',
      agent: 'architect-agent',
      eventsPath,
      breakGlass: true
    });

    const events = await readEvents(eventsPath);
    const parsed = events.map((line) => JSON.parse(line));
    expect(parsed.some((event) => event.type === 'phase_updated')).toBe(true);
  });

  it('unknown tool throws', async () => {
    const runtime = new Runtime();
    await expect(handleToolCall(runtime, 'runtime.unknown', {})).rejects.toThrow('Tool no soportada');
  });

  it('runtime.emit_event writes to events', async () => {
    const runtime = new Runtime();
    const eventsPath = path.join(workspace, '.agent', 'runtime', 'events.jsonl');
    await handleToolCall(runtime, 'runtime.emit_event', {
      event: { type: 'custom', timestamp: new Date().toISOString(), runId: 'x' },
      eventsPath,
      agent: 'architect-agent',
      breakGlass: true
    });
    const events = await readEvents(eventsPath);
    const parsed = events.map((line) => JSON.parse(line));
    expect(parsed.some((event) => event.type === 'custom')).toBe(true);
  });

  it('emits chat_message on runtime.chat', async () => {
    const runtime = new Runtime();
    const eventsPath = path.join(workspace, '.agent', 'runtime', 'events.jsonl');
    await handleToolCall(runtime, 'runtime.chat', {
      message: 'hello',
      role: 'assistant',
      eventsPath,
      breakGlass: true
    });

    const events = await readEvents(eventsPath);
    const parsed = events.map((line) => JSON.parse(line));
    expect(parsed.some((event) => event.type === 'chat_message')).toBe(true);
  });

  it('handles emitEvent without eventsPath', async () => {
    const runtime = new Runtime();
    const result = await handleToolCall(runtime, 'runtime.emit_event', {
      event: { type: 'custom', timestamp: new Date().toISOString(), runId: 'x' }
    });
    expect(result.content[0].text).toContain('custom');
  });

  it('handles workspace resolution errors but still returns result', async () => {
    const runtime = new Runtime();
    const isolated = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-mcp-isolated-'));
    const previousCwd = process.cwd();
    const previousWorkspace = process.env.AGENTIC_WORKSPACE;
    const previousHome = process.env.HOME;
    const home = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-home-'));
    process.chdir(isolated);
    delete process.env.AGENTIC_WORKSPACE;
    process.env.HOME = home;
    try {
      const eventsPath = path.join(isolated, 'events.jsonl');
      const result = await handleToolCall(runtime, 'runtime.emit_event', {
        event: { type: 'custom', timestamp: new Date().toISOString(), runId: 'x' },
        eventsPath
      });
      expect(result.content[0].text).toContain('custom');
      const events = await readEvents(eventsPath);
      const parsed = events.map((line) => JSON.parse(line));
      expect(parsed.some((event) => event.type === 'custom')).toBe(true);
    } finally {
      process.chdir(previousCwd);
      if (previousWorkspace === undefined) {
        delete process.env.AGENTIC_WORKSPACE;
      } else {
        process.env.AGENTIC_WORKSPACE = previousWorkspace;
      }
      if (previousHome === undefined) {
        delete process.env.HOME;
      } else {
        process.env.HOME = previousHome;
      }
    }
  });

  it('dispatches all tool handlers', async () => {
    const eventsPath = path.join(workspace, '.agent', 'runtime', 'events.jsonl');
    const runtime = {
      run: vi.fn(async () => ({ status: 'ok' })),
      resume: vi.fn(async () => ({ status: 'ok' })),
      nextStep: vi.fn(async () => ({ status: 'ok' })),
      completeStep: vi.fn(async () => ({ status: 'ok' })),
      validateGate: vi.fn(async () => ({ valid: true })),
      advancePhase: vi.fn(async () => ({ status: 'ok' })),
      getState: vi.fn(async () => ({ status: 'ok' })),
      listWorkflows: vi.fn(async () => ({ workflows: {} })),
      emitEvent: vi.fn(async () => ({
        status: 'ok',
        emitEvent: { type: 'custom', timestamp: new Date().toISOString(), runId: 'x' }
      })),
      reconcile: vi.fn(async () => ({ status: 'ok' })),
      chat: vi.fn(async () => ({ status: 'ok', emitEvent: { type: 'chat', timestamp: new Date().toISOString(), runId: 'x' } })),
      readLogs: vi.fn(async () => ({ logs: [] }))
    } as any;

    await handleToolCall(runtime, 'runtime.run', { taskPath: 'task.md', agent: 'architect-agent' });
    await handleToolCall(runtime, 'runtime.resume', { taskPath: 'task.md', agent: 'architect-agent' });
    await handleToolCall(runtime, 'runtime.next_step', { taskPath: 'task.md', agent: 'architect-agent' });
    await handleToolCall(runtime, 'runtime.complete_step', {});
    await handleToolCall(runtime, 'runtime.validate_gate', { taskPath: 'task.md', agent: 'architect-agent' });
    await handleToolCall(runtime, 'runtime.advance_phase', { taskPath: 'task.md', agent: 'architect-agent' });
    await handleToolCall(runtime, 'runtime.get_state', { statePath: 'state.json' });
    await handleToolCall(runtime, 'runtime.list_workflows', { workflowsRoot: workspace });
    await handleToolCall(runtime, 'runtime.emit_event', { eventsPath, agent: 'architect-agent', breakGlass: true });
    await handleToolCall(runtime, 'runtime.reconcile', { taskPath: 'task.md', agent: 'architect-agent' });
    await handleToolCall(runtime, 'runtime.chat', { message: 'ping' });
    await handleToolCall(runtime, 'debug.read_logs', {});

    expect(runtime.run).toHaveBeenCalled();
    expect(runtime.readLogs).toHaveBeenCalled();
  });
});
