import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { Runtime } from '../../runtime.js';

async function createWorkspace(): Promise<string> {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-runtime-'));
  await fs.mkdir(path.join(base, '.agent', 'artifacts', 'candidate'), { recursive: true });
  await fs.mkdir(path.join(base, '.agent', 'runtime'), { recursive: true });
  await fs.mkdir(path.join(base, '.agent', 'workflows', 'tasklifecycle-long'), { recursive: true });
  await fs.writeFile(
    path.join(base, '.agent', 'workflows', 'index.md'),
    [
      '```yaml',
      'workflows:',
      '  tasklifecycle-long: .agent/workflows/tasklifecycle-long/index.md',
      '```',
      ''
    ].join('\n')
  );
  await fs.writeFile(
    path.join(base, '.agent', 'artifacts', 'candidate', 'task.md'),
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
      '  id: "test-task"',
      '  title: "test-task"',
      '  strategy: "long"',
      '  phase:',
      '    current: "phase-0-acceptance-criteria"',
      '```',
      '<!-- RUNTIME:END -->',
      ''
    ].join('\n')
  );
  await fs.writeFile(
    path.join(base, '.agent', 'workflows', 'tasklifecycle-long', 'index.md'),
    [
      '```yaml',
      'aliases:',
      '  tasklifecycle-long:',
      '    phases:',
      '      phase_0:',
      '        id: phase-0-acceptance-criteria',
      '      phase_1:',
      '        id: phase-1-research',
      '```',
      ''
    ].join('\n')
  );
  return base;
}

describe('Runtime', () => {
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

  it('runs and persists state', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    const result = await runtime.run({ taskPath, agent: 'architect-agent', statePath, breakGlass: true });
    expect(result.status).toBe('ok');
    const stateRaw = await fs.readFile(statePath, 'utf-8');
    expect(stateRaw).toContain('test-task');
  });

  it('runs with default state path', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/task.md';
    const result = await runtime.run({ taskPath, agent: 'architect-agent', breakGlass: true });
    expect(result.status).toBe('ok');
    const stateRaw = await fs.readFile(path.join(workspace, '.agent', 'runtime', 'state.json'), 'utf-8');
    expect(stateRaw).toContain('test-task');
  });

  it('run throws on agent mismatch', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/task.md';
    await expect(runtime.run({ taskPath, agent: 'qa-agent', breakGlass: true })).rejects.toThrow('Agent mismatch');
  });

  it('run logs and rethrows when init creation fails', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/init.md';
    await expect(runtime.run({ taskPath, agent: 'architect-agent', breakGlass: true })).rejects.toThrow('init.md legacy detectado');
  });

  it('resume reads persisted state', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    await runtime.run({ taskPath, agent: 'architect-agent', statePath, breakGlass: true });
    const result = await runtime.resume({ taskPath, agent: 'architect-agent', statePath });
    expect(result.status).toBe('ok');
  });

  it('resume throws when no state exists', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'missing.json');
    await expect(runtime.resume({ taskPath, agent: 'architect-agent', statePath })).rejects.toThrow('No persisted state');
  });

  it('nextStep appends step and completeStep clears cache', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    await runtime.run({ taskPath, agent: 'architect-agent', statePath, breakGlass: true });
    const step = await runtime.nextStep({ taskPath, agent: 'architect-agent', statePath, breakGlass: true });
    expect(step.status).toBe('ok');
    const before = await runtime.getState({ statePath });
    await runtime.completeStep();
    const after = await runtime.getState({ statePath });
    expect(after.runId).toBe(before.runId);
  });

  it('nextStep throws when state is missing', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'missing.json');
    await expect(runtime.nextStep({ taskPath, agent: 'architect-agent', statePath })).rejects.toThrow('No persisted state');
  });

  it('validateGate returns true for matching agent/phase', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    await runtime.run({ taskPath, agent: 'architect-agent', statePath, breakGlass: true });
    const result = await runtime.validateGate({ taskPath, agent: 'architect-agent', expectedPhase: 'phase-0-acceptance-criteria' });
    expect(result.valid).toBe(true);
  });

  it('validateGate returns false for agent/phase mismatch', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    await runtime.run({ taskPath, agent: 'architect-agent', statePath, breakGlass: true });
    const agentMismatch = await runtime.validateGate({ taskPath, agent: 'qa-agent' });
    expect(agentMismatch.valid).toBe(false);
    const phaseMismatch = await runtime.validateGate({ taskPath, agent: 'architect-agent', expectedPhase: 'phase-9' });
    expect(phaseMismatch.valid).toBe(false);
  });

  it('advancePhase updates task phase', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    await runtime.run({ taskPath, agent: 'architect-agent', statePath, breakGlass: true });
    const result = await runtime.advancePhase({ taskPath, agent: 'architect-agent', expectedPhase: 'phase-0-acceptance-criteria', breakGlass: true });
    expect(result.status).toBe('ok');
    expect(result.currentPhase).toBe('phase-1-research');
  });

  it('advancePhase returns warning on expectedPhase mismatch', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    await runtime.run({ taskPath, agent: 'architect-agent', statePath, breakGlass: true });
    const result = await runtime.advancePhase({ taskPath, agent: 'architect-agent', expectedPhase: 'phase-9', breakGlass: true });
    expect(result.status).toBe('warning');
  });

  it('advancePhase throws on agent mismatch', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    await runtime.run({ taskPath, agent: 'architect-agent', statePath, breakGlass: true });
    await expect(runtime.advancePhase({ taskPath, agent: 'qa-agent', breakGlass: true })).rejects.toThrow('Agent mismatch');
  });

  it('advancePhase returns warning when next phase cannot be resolved', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    await runtime.run({ taskPath, agent: 'architect-agent', statePath, breakGlass: true });
    await fs.writeFile(path.join(workspace, '.agent', 'workflows', 'tasklifecycle-long', 'index.md'), 'no yaml');
    const result = await runtime.advancePhase({ taskPath, agent: 'architect-agent', breakGlass: true });
    expect(result.status).toBe('warning');
  });

  it('advancePhase warning includes null strategy when missing', async () => {
    const runtime = new Runtime();
    const taskPath = path.join(workspace, '.agent', 'artifacts', 'candidate', 'task-nostrategy.md');
    await fs.writeFile(
      taskPath,
      [
        '---',
        'id: test-task',
        'title: test-task',
        'owner: architect-agent',
        '---',
        '',
        '<!-- RUNTIME:START task-state -->',
        '```yaml',
        'task:',
        '  id: \"test-task\"',
        '  title: \"test-task\"',
        '  phase:',
        '    current: \"phase-0-acceptance-criteria\"',
        '```',
        '<!-- RUNTIME:END -->',
        ''
      ].join('\n')
    );
    await fs.writeFile(path.join(workspace, '.agent', 'workflows', 'tasklifecycle-long', 'index.md'), 'no yaml');
    const result = await runtime.advancePhase({ taskPath, agent: 'architect-agent', breakGlass: true });
    expect(result.status).toBe('warning');
  });

  it('listWorkflows returns yaml', async () => {
    const runtime = new Runtime();
    const workflowsRoot = path.join(workspace, '.agent', 'workflows');
    const result = await runtime.listWorkflows({ workflowsRoot });
    expect(String(result.workflowsYaml)).toContain('workflows');
  });

  it('listWorkflows uses default workflows root', async () => {
    const runtime = new Runtime();
    const result = await runtime.listWorkflows({});
    expect(String(result.workflowsYaml)).toContain('workflows');
  });
  it('listWorkflows returns empty when yaml missing', async () => {
    const runtime = new Runtime();
    const workflowsRoot = path.join(workspace, '.agent', 'workflows');
    await fs.writeFile(path.join(workflowsRoot, 'index.md'), '# no yaml');
    const result = await runtime.listWorkflows({ workflowsRoot });
    expect(result.workflows).toEqual({});
  });

  it('emitEvent returns status ok', async () => {
    const runtime = new Runtime();
    const result = await runtime.emitEvent({ event: { type: 'test', timestamp: new Date().toISOString(), runId: 'x' } });
    expect(result.status).toBe('ok');
  });

  it('emitEvent throws when missing payload', async () => {
    const runtime = new Runtime();
    await expect(runtime.emitEvent({})).rejects.toThrow('Missing event payload');
  });

  it('chat returns emitEvent payload', async () => {
    const runtime = new Runtime();
    const result = await runtime.chat({ message: 'hello', role: 'user' });
    expect(result.status).toBe('ok');
  });

  it('chat defaults to user role when omitted', async () => {
    const runtime = new Runtime();
    const result = await runtime.chat({ message: 'hello' });
    expect(result.status).toBe('ok');
  });

  it('getState returns taskContent when available and empty when missing', async () => {
    let runtime = new Runtime();
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    const state = {
      version: 1,
      runId: 'x',
      taskId: 'test-task',
      taskTitle: 'test-task',
      taskPath: path.join(workspace, '.agent', 'artifacts', 'candidate', 'task.md'),
      phase: 'phase-0-acceptance-criteria',
      status: 'idle',
      steps: [],
      updatedAt: new Date().toISOString()
    };
    await fs.writeFile(statePath, JSON.stringify(state, null, 2));
    const withContent = await runtime.getState({ statePath });
    expect(String(withContent.taskContent)).toContain('test-task');

    const missingState = { ...state, taskPath: path.join(workspace, '.agent', 'artifacts', 'missing.md') };
    await fs.writeFile(statePath, JSON.stringify(missingState, null, 2));
    runtime = new Runtime();
    const withoutContent = await runtime.getState({ statePath });
    expect(withoutContent.taskContent).toBe('');
  });

  it('getState skips taskContent when taskPath is empty', async () => {
    const runtime = new Runtime();
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    const state = {
      version: 1,
      runId: 'x',
      taskId: 'test-task',
      taskTitle: 'test-task',
      taskPath: '',
      phase: 'phase-0-acceptance-criteria',
      status: 'idle',
      steps: [],
      updatedAt: new Date().toISOString()
    };
    await fs.writeFile(statePath, JSON.stringify(state, null, 2));
    const result = await runtime.getState({ statePath });
    expect(result.taskContent).toBe('');
  });

  it('getState throws when state is missing', async () => {
    const runtime = new Runtime();
    const statePath = path.join(workspace, '.agent', 'runtime', 'missing.json');
    await expect(runtime.getState({ statePath })).rejects.toThrow('No state found');
  });

  it('reconcile throws when state is missing', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'missing.json');
    await expect(runtime.reconcile({ taskPath, agent: 'architect-agent', statePath })).rejects.toThrow('No state found');
  });

  it('reconcile accepts when no changes after baseline', async () => {
    const runtime = new Runtime();
    const taskPath = '.agent/artifacts/candidate/task.md';
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    await runtime.run({ taskPath, agent: 'architect-agent', statePath, breakGlass: true });
    await runtime.reconcile({ taskPath, agent: 'architect-agent', statePath, breakGlass: true });
    const result = await runtime.reconcile({ taskPath, agent: 'architect-agent', statePath, breakGlass: true });
    expect(result.status).toBe('accepted');
  });

  it('getState throws when state is invalid JSON', async () => {
    const runtime = new Runtime();
    const statePath = path.join(workspace, '.agent', 'runtime', 'state.json');
    await fs.writeFile(statePath, '{ invalid json');
    await expect(runtime.getState({ statePath })).rejects.toThrow('No state found');
  });

  it('run validates required params', async () => {
    const runtime = new Runtime();
    await expect(runtime.run({ taskPath: '', agent: 'architect-agent' })).rejects.toThrow('taskPath requerido');
  });

  it('run validates param types', async () => {
    const runtime = new Runtime();
    await expect(runtime.run({ taskPath: 123 as any, agent: 'architect-agent' })).rejects.toThrow('taskPath debe ser string');
  });

  it('readLogs returns logs array', async () => {
    const runtime = new Runtime();
    const result = await runtime.readLogs({ limit: 1 });
    expect(Array.isArray(result.logs)).toBe(true);
  });

  it('readLogs uses default limit when omitted', async () => {
    const runtime = new Runtime();
    const result = await runtime.readLogs({});
    expect(Array.isArray(result.logs)).toBe(true);
  });
  describe('updateInit', () => {
    it('updates init artifact with provided values', async () => {
      const runtime = new Runtime();
      const templatePath = path.join(workspace, '.agent', 'templates', 'init.md');
      await fs.mkdir(path.dirname(templatePath), { recursive: true });
      await fs.writeFile(templatePath, 'template content {{command}}');

      const taskId = 'test-init-task';
      const taskPath = `.agent/artifacts/candidate/${taskId}.md`;

      const params = {
        taskPath,
        agent: 'architect-agent',
        command: '/init',
        constitutionPaths: ['path1', 'path2', 'path3'],
        language: 'es',
        languageConfirmed: true,
        strategy: 'short',
        traceabilityVerified: true,
        traceabilityTool: 'tool',
        traceabilityResponse: 'response',
        traceabilityTimestamp: '2023-01-01',
        runtimeStarted: true,
        taskId: '123',
        taskPathValue: 'task-path-value',
        breakGlass: true
      };

      const result = await runtime.updateInit(params);

      expect(result.status).toBe('ok');
      const content = await fs.readFile(path.join(workspace, taskPath), 'utf-8');
      expect(content).toContain('/init');
    });

    it('throws when languageConfirmed is not boolean', async () => {
      const runtime = new Runtime();
      const params = {
        taskPath: 'task.md',
        agent: 'agent',
        command: '/init',
        constitutionPaths: [],
        language: 'en',
        languageConfirmed: 'true' as any,
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
      await expect(runtime.updateInit(params)).rejects.toThrow('Missing or invalid languageConfirmed');
    });

    it('throws when constitutionPaths is not string array', async () => {
      const runtime = new Runtime();
      const params = {
        taskPath: 'task.md',
        agent: 'agent',
        command: '/init',
        constitutionPaths: 'invalid' as any,
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
      await expect(runtime.updateInit(params)).rejects.toThrow('Missing or invalid constitutionPaths');
    });

    it('updates init artifact with minimal params', async () => {
      const runtime = new Runtime();
      const templatePath = path.join(workspace, '.agent', 'templates', 'init.md');
      await fs.mkdir(path.dirname(templatePath), { recursive: true });
      await fs.writeFile(templatePath, 'template content {{command}}');

      const taskId = 'test-init-task-min';
      const taskPath = `.agent/artifacts/candidate/${taskId}.md`;

      const params = {
        taskPath,
        agent: 'architect-agent',
        command: '/init',
        constitutionPaths: [], // Empty array triggers fallback
        language: 'es',
        languageConfirmed: true,
        strategy: 'short',
        traceabilityVerified: true,
        traceabilityTool: 'tool',
        traceabilityResponse: 'response',
        traceabilityTimestamp: '2023-01-01',
        runtimeStarted: true,
        taskId: '123',
        taskPathValue: 'path',
        breakGlass: true
      };

      const result = await runtime.updateInit(params);

      expect(result.status).toBe('ok');
    });
  });
});
