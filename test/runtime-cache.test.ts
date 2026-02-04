import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { Runtime } from '../src/runtime/runtime.js';

async function createWorkspace(): Promise<string> {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-runtime-'));
  await fs.mkdir(path.join(base, '.agent', 'artifacts', 'candidate'), { recursive: true });
  await fs.mkdir(path.join(base, '.agent', 'workflows'), { recursive: true });
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
  return base;
}

describe('Runtime cache', () => {
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

  it('uses cache until complete_step clears it', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');

    await runtime.run({ taskPath, agent: 'architect-agent', statePath, breakGlass: true });

    const cached = await runtime.getState({ statePath });
    const cachedRunId = cached.runId as string;

    const fileState = JSON.parse(await fs.readFile(statePath, 'utf-8')) as Record<string, unknown>;
    fileState.runId = 'mutated-run-id';
    await fs.writeFile(statePath, JSON.stringify(fileState, null, 2));

    const stillCached = await runtime.getState({ statePath });
    expect(stillCached.runId).toBe(cachedRunId);

    await runtime.completeStep();
    const afterClear = await runtime.getState({ statePath });
    expect(afterClear.runId).toBe('mutated-run-id');
  });
});
