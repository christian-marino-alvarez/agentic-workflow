import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { Runtime } from '../src/runtime/runtime.js';
import { collectArtifactHashes, diffHashes } from '../src/runtime/reconcile.js';

async function createWorkspace(): Promise<string> {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-reconcile-'));
  await fs.mkdir(path.join(base, '.agent', 'artifacts'), { recursive: true });
  await fs.mkdir(path.join(base, '.agent', 'runtime'), { recursive: true });
  await fs.writeFile(
    path.join(base, '.agent', 'artifacts', 'task.md'),
    [
      '---',
      'id: test-task',
      'title: test-task',
      'owner: architect-agent',
      'strategy: long',
      '---',
      '',
      '# Task',
      '',
      '<!-- RUNTIME:START task-state -->',
      '```yaml',
      'task:',
      '  id: \"test-task\"',
      '  title: \"test-task\"',
      '  strategy: \"long\"',
      '  phase:',
      '    current: \"phase-0-acceptance-criteria\"',
      '```',
      '<!-- RUNTIME:END -->',
      ''
    ].join('\n')
  );
  return base;
}

describe('Runtime.reconcile', () => {
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

  it('accepts when no prior hashes and sets baseline', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    await runtime.run({ taskPath, agent: 'architect-agent', statePath });

    const result = await runtime.reconcile({ taskPath, agent: 'architect-agent', statePath });
    expect(result.status).toBe('accepted');

    const stateRaw = await fs.readFile(statePath, 'utf-8');
    const state = JSON.parse(stateRaw) as { artifactHashes?: Record<string, string> };
    expect(state.artifactHashes && state.artifactHashes['task.md']).toBeTruthy();
  });

  it('blocks when hashes differ from baseline', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    await runtime.run({ taskPath, agent: 'architect-agent', statePath });
    await runtime.reconcile({ taskPath, agent: 'architect-agent', statePath });

    const taskFile = path.join(workspace, '.agent', 'artifacts', 'task.md');
    let content = await fs.readFile(taskFile, 'utf-8');
    content = content.replace('phase-0-acceptance-criteria', 'phase-1-research');
    await fs.writeFile(taskFile, content);

    const result = await runtime.reconcile({ taskPath, agent: 'architect-agent', statePath });
    expect(result.status).toBe('blocked');
    const changes = result.changes as Array<{ file: string }>;
    expect(changes.some((change) => change.file === 'task.md')).toBe(true);
  });

  it('accepts when hashes match existing baseline', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    await runtime.run({ taskPath, agent: 'architect-agent', statePath });
    await runtime.reconcile({ taskPath, agent: 'architect-agent', statePath });

    const result = await runtime.reconcile({ taskPath, agent: 'architect-agent', statePath });
    expect(result.status).toBe('accepted');
  });

  it('treats null artifactHashes as empty baseline', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    await runtime.run({ taskPath, agent: 'architect-agent', statePath });

    const stateRaw = await fs.readFile(statePath, 'utf-8');
    const state = JSON.parse(stateRaw) as { artifactHashes?: Record<string, string> | null };
    state.artifactHashes = null;
    await fs.writeFile(statePath, JSON.stringify(state, null, 2));

    const runtimeForReconcile = new Runtime();
    const result = await runtimeForReconcile.reconcile({ taskPath, agent: 'architect-agent', statePath });
    expect(result.status).toBe('accepted');
  });

  it('accepts when artifactHashes are pre-populated and match', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    await runtime.run({ taskPath, agent: 'architect-agent', statePath });

    const stateRaw = await fs.readFile(statePath, 'utf-8');
    const state = JSON.parse(stateRaw) as { artifactHashes?: Record<string, string>; taskPath: string };
    state.artifactHashes = await collectArtifactHashes(path.dirname(state.taskPath));
    await fs.writeFile(statePath, JSON.stringify(state, null, 2));

    const runtimeForReconcile = new Runtime();
    const result = await runtimeForReconcile.reconcile({ taskPath, agent: 'architect-agent', statePath });
    expect(result.status).toBe('accepted');
  });

  it('collectArtifactHashes ignores missing files and returns hashes for existing ones', async () => {
    const baseDir = path.join(workspace, '.agent', 'artifacts');
    const hashes = await collectArtifactHashes(baseDir, ['task.md', 'missing.md']);
    expect(hashes['task.md']).toBeTruthy();
    expect(hashes['missing.md']).toBeUndefined();
  });

  it('diffHashes returns no changes when hashes match', async () => {
    const changes = diffHashes({ 'task.md': 'abc' }, { 'task.md': 'abc' });
    expect(changes.length).toBe(0);
  });
});
