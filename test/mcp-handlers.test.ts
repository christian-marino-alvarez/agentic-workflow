import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
    `---\n` +
      `id: test-task\n` +
      `title: test-task\n` +
      `owner: architect-agent\n` +
      `strategy: short\n` +
      `---\n\n` +
      `# Task\n\n` +
      `\`\`\`yaml\n` +
      `task:\n` +
      `  id: \"test-task\"\n` +
      `  title: \"test-task\"\n` +
      `  strategy: \"short\"\n` +
      `  phase:\n` +
      `    current: \"short-phase-1-brief\"\n` +
      `\`\`\`\n`
  );
  await fs.writeFile(
    path.join(base, '.agent', 'workflows', 'tasklifecycle-short', 'index.md'),
    `# INDEX\n\n\`\`\`yaml\naliases:\n  tasklifecycle-short:\n    phases:\n      phase_1:\n        id: short-phase-1-brief\n      phase_2:\n        id: short-phase-2-implementation\n\`\`\`\n`
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

  beforeEach(async () => {
    originalCwd = process.cwd();
    workspace = await createWorkspace();
    process.chdir(workspace);
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  it('emits phase_updated on advance_phase', async () => {
    const runtime = new Runtime();
    const eventsPath = path.join(workspace, '.agent', 'runtime', 'events.jsonl');
    await handleToolCall(runtime, 'runtime.advance_phase', {
      taskPath: '.agent/artifacts/candidate/task.md',
      agent: 'architect-agent',
      eventsPath
    });

    const events = await readEvents(eventsPath);
    const parsed = events.map((line) => JSON.parse(line));
    expect(parsed.some((event) => event.type === 'phase_updated')).toBe(true);
  });

  it('emits chat_message on runtime.chat', async () => {
    const runtime = new Runtime();
    const eventsPath = path.join(workspace, '.agent', 'runtime', 'events.jsonl');
    await handleToolCall(runtime, 'runtime.chat', {
      message: 'hello',
      role: 'assistant',
      eventsPath
    });

    const events = await readEvents(eventsPath);
    const parsed = events.map((line) => JSON.parse(line));
    expect(parsed.some((event) => event.type === 'chat_message')).toBe(true);
  });
});
