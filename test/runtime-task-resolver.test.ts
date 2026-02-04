import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  collectWorkspaceCandidates,
  findWorkspaceRoot,
  resolveTaskPath,
  ensureInitTaskFile,
  resolveNextPhase,
  updateTaskPhase,
  resolveWorkflowsRootForTask,
  resolveWorkspaceRoot
} from '../src/runtime/task-resolver.js';
import { RuntimeWriteGuard } from '../src/runtime/write-guard.js';

async function createWorkspace(): Promise<string> {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-resolver-'));
  await fs.mkdir(path.join(base, '.agent', 'artifacts', 'candidate'), { recursive: true });
  await fs.mkdir(path.join(base, '.agent', 'templates'), { recursive: true });
  await fs.mkdir(path.join(base, '.agent', 'workflows', 'tasklifecycle-long'), { recursive: true });
  await fs.writeFile(
    path.join(base, '.agent', 'templates', 'init.md'),
    [
      '---',
      'id: init-task',
      'title: init-task',
      'owner: architect-agent',
      'strategy: long',
      '---',
      '',
      '# Init',
      '',
      '```yaml',
      'task:',
      '  id: "init-task"',
      '  title: "init-task"',
      '  strategy: "long"',
      '  phase:',
      '    current: "phase-0-acceptance-criteria"',
      '```',
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
      '      phase_2:',
      '        id: phase-2-analysis',
      '```',
      ''
    ].join('\n')
  );
  return base;
}

describe('task-resolver', () => {
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

  it('collects workspace candidates', () => {
    process.env.PWD = workspace;
    const candidates = collectWorkspaceCandidates();
    expect(candidates.some((candidate) => candidate.includes(workspace))).toBe(true);
  });

  it('finds workspace root from candidates', async () => {
    const resolved = await findWorkspaceRoot([path.join(workspace, 'nested'), workspace]);
    expect(resolved).toBe(workspace);
  });

  it('returns null when no workspace root is found', async () => {
    const isolated = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-noroot-'));
    const resolved = await findWorkspaceRoot([isolated]);
    expect(resolved).toBeNull();
  });

  it('resolveTaskPath resolves relative paths via workspace root', async () => {
    const result = await resolveTaskPath('.agent/templates/init.md');
    expect(result.resolvedPath).toBe(path.join(workspace, '.agent', 'templates', 'init.md'));
  });

  it('resolveTaskPath resolves absolute paths and infers workspace root', async () => {
    const taskPath = path.join(workspace, '.agent', 'artifacts', 'candidate', 'task.md');
    await fs.writeFile(taskPath, 'stub');
    const result = await resolveTaskPath(taskPath);
    expect(result.resolvedPath).toBe(taskPath);
    expect(result.workspaceRoot).toBe(workspace);
  });

  it('resolveTaskPath throws when workspace root is missing for relative path', async () => {
    const isolated = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-noagent-'));
    const previousCwd = process.cwd();
    const previousEnv = process.env.AGENTIC_WORKSPACE;
    const previousHome = process.env.HOME;
    const home = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-home-'));
    process.chdir(isolated);
    delete process.env.AGENTIC_WORKSPACE;
    process.env.HOME = home;
    try {
      await expect(resolveTaskPath('.agent/artifacts/candidate')).rejects.toThrow('No pude resolver el init');
    } finally {
      process.chdir(previousCwd);
      if (previousEnv === undefined) {
        delete process.env.AGENTIC_WORKSPACE;
      } else {
        process.env.AGENTIC_WORKSPACE = previousEnv;
      }
      if (previousHome === undefined) {
        delete process.env.HOME;
      } else {
        process.env.HOME = previousHome;
      }
    }
  });

  it('resolveTaskPath throws with taskPath subject when not init candidate', async () => {
    const isolated = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-noagent-'));
    const previousCwd = process.cwd();
    const previousEnv = process.env.AGENTIC_WORKSPACE;
    const previousHome = process.env.HOME;
    const home = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-home-'));
    process.chdir(isolated);
    delete process.env.AGENTIC_WORKSPACE;
    process.env.HOME = home;
    try {
      await expect(resolveTaskPath('task.md')).rejects.toThrow('No pude resolver el taskPath');
    } finally {
      process.chdir(previousCwd);
      if (previousEnv === undefined) {
        delete process.env.AGENTIC_WORKSPACE;
      } else {
        process.env.AGENTIC_WORKSPACE = previousEnv;
      }
      if (previousHome === undefined) {
        delete process.env.HOME;
      } else {
        process.env.HOME = previousHome;
      }
    }
  });

  it('resolveTaskPath infers workspace root from absolute path when workspace root cannot be resolved', async () => {
    const taskPath = path.join(workspace, '.agent', 'artifacts', 'task.md');
    await fs.writeFile(taskPath, 'stub');
    const isolated = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-abs-noagent-'));
    const previousCwd = process.cwd();
    const previousEnv = process.env.AGENTIC_WORKSPACE;
    const previousHome = process.env.HOME;
    const home = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-home-'));
    process.chdir(isolated);
    delete process.env.AGENTIC_WORKSPACE;
    process.env.HOME = home;
    try {
      const result = await resolveTaskPath(taskPath);
      expect(result.workspaceRoot).toBe(workspace);
    } finally {
      process.chdir(previousCwd);
      if (previousEnv === undefined) {
        delete process.env.AGENTIC_WORKSPACE;
      } else {
        process.env.AGENTIC_WORKSPACE = previousEnv;
      }
      if (previousHome === undefined) {
        delete process.env.HOME;
      } else {
        process.env.HOME = previousHome;
      }
    }
  });

  it('resolveTaskPath returns null workspaceRoot when absolute path lacks .agent marker', async () => {
    const isolated = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-abs-nomarker-'));
    const taskPath = path.join(isolated, 'task.md');
    await fs.writeFile(taskPath, 'stub');
    const previousCwd = process.cwd();
    const previousEnv = process.env.AGENTIC_WORKSPACE;
    const previousHome = process.env.HOME;
    const home = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-home-'));
    process.chdir(isolated);
    delete process.env.AGENTIC_WORKSPACE;
    process.env.HOME = home;
    try {
      const result = await resolveTaskPath(taskPath);
      expect(result.workspaceRoot).toBeNull();
    } finally {
      process.chdir(previousCwd);
      if (previousEnv === undefined) {
        delete process.env.AGENTIC_WORKSPACE;
      } else {
        process.env.AGENTIC_WORKSPACE = previousEnv;
      }
      if (previousHome === undefined) {
        delete process.env.HOME;
      } else {
        process.env.HOME = previousHome;
      }
    }
  });

  it('resolveTaskPath returns filesystem root when .agent is at root', async () => {
    const root = path.parse(process.cwd()).root;
    const taskPath = path.join(root, '.agent', 'artifacts', 'task.md');
    const isolated = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-root-noagent-'));
    const previousCwd = process.cwd();
    const previousEnv = process.env.AGENTIC_WORKSPACE;
    const previousHome = process.env.HOME;
    const home = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-home-'));
    process.chdir(isolated);
    delete process.env.AGENTIC_WORKSPACE;
    process.env.HOME = home;
    try {
      const result = await resolveTaskPath(taskPath);
      expect(result.workspaceRoot).toBe(root);
    } finally {
      process.chdir(previousCwd);
      if (previousEnv === undefined) {
        delete process.env.AGENTIC_WORKSPACE;
      } else {
        process.env.AGENTIC_WORKSPACE = previousEnv;
      }
      if (previousHome === undefined) {
        delete process.env.HOME;
      } else {
        process.env.HOME = previousHome;
      }
    }
  });

  it('ensureInitTaskFile creates init candidate from template', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'architect-agent', breakGlass: true });
    const result = await ensureInitTaskFile(path.join(workspace, '.agent', 'artifacts', 'candidate'), workspace, guard);
    expect(result.created).toBe(true);
    expect(await fs.readFile(result.taskPath, 'utf-8')).toContain('init-task');
  });

  it('ensureInitTaskFile creates init candidate without write guard', async () => {
    const result = await ensureInitTaskFile(path.join(workspace, '.agent', 'artifacts', 'candidate'), workspace);
    expect(result.created).toBe(true);
    const indexPath = path.join(workspace, '.agent', 'artifacts', 'candidate', 'index.md');
    const indexContent = await fs.readFile(indexPath, 'utf-8');
    expect(indexContent).toContain('Candidates');
  });

  it('ensureInitTaskFile handles candidate path with trailing separator', async () => {
    const candidatePath = `${path.join(workspace, '.agent', 'artifacts', 'candidate')}${path.sep}`;
    const result = await ensureInitTaskFile(candidatePath, workspace);
    expect(result.created).toBe(true);
  });

  it('ensureInitTaskFile detects legacy init path', async () => {
    const legacyPath = path.join(workspace, '.agent', 'artifacts', 'candidate', 'init.md');
    await fs.writeFile(legacyPath, 'legacy');
    await expect(ensureInitTaskFile(legacyPath, workspace)).rejects.toThrow('init.md legacy detectado');
  });

  it('ensureInitTaskFile returns existing init candidate with warning', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'architect-agent', breakGlass: true });
    const candidateDir = path.join(workspace, '.agent', 'artifacts', 'candidate');
    const result1 = await ensureInitTaskFile(candidateDir, workspace, guard);
    const result2 = await ensureInitTaskFile(result1.taskPath, workspace, guard);
    expect(result2.created).toBe(false);
    expect(result2.taskPath).toBe(result1.taskPath);
  });

  it('ensureInitTaskFile returns existing init candidate without workspaceRoot', async () => {
    const candidateDir = path.join(workspace, '.agent', 'artifacts', 'candidate');
    const result1 = await ensureInitTaskFile(candidateDir, workspace);
    const result2 = await ensureInitTaskFile(result1.taskPath, null);
    expect(result2.created).toBe(false);
  });

  it('ensureInitTaskFile throws when workspaceRoot is missing for creation', async () => {
    const candidateDir = path.join(workspace, '.agent', 'artifacts', 'candidate');
    await expect(ensureInitTaskFile(candidateDir, null)).rejects.toThrow('No se pudo resolver el workspace');
  });

  it('ensureInitTaskFile handles missing marker in candidate index', async () => {
    const candidateDir = path.join(workspace, '.agent', 'artifacts', 'candidate');
    const indexPath = path.join(candidateDir, 'index.md');
    await fs.writeFile(indexPath, '# Index without marker\\n');
    const result = await ensureInitTaskFile(candidateDir, workspace);
    const updated = await fs.readFile(indexPath, 'utf-8');
    expect(result.taskPath).toBeTruthy();
    expect(updated).toContain('AUTO-GENERATED');
  });

  it('ensureInitTaskFile handles marker without dedicated line', async () => {
    const candidateDir = path.join(workspace, '.agent', 'artifacts', 'candidate');
    const indexPath = path.join(candidateDir, 'index.md');
    await fs.writeFile(indexPath, `# Header ${'<!-- AUTO-GENERATED: candidates -->'}\\n`);
    const result = await ensureInitTaskFile(candidateDir, workspace);
    const updated = await fs.readFile(indexPath, 'utf-8');
    expect(result.taskPath).toBeTruthy();
    expect(updated).toContain('- .agent/artifacts/candidate');
  });

  it('ensureInitTaskFile treats root path as non-candidate', async () => {
    const result = await ensureInitTaskFile(path.sep, workspace);
    expect(result.created).toBe(false);
  });

  it('resolveNextPhase advances within workflow index', async () => {
    const next = await resolveNextPhase(path.join(workspace, '.agent', 'workflows'), 'phase-0-acceptance-criteria', 'long');
    expect(next).toBe('phase-1-research');
  });

  it('resolveNextPhase returns first short phase for phase-0', async () => {
    const workflowsRoot = path.join(workspace, '.agent', 'workflows');
    await fs.mkdir(path.join(workspace, '.agent', 'workflows', 'tasklifecycle-short'), { recursive: true });
    await fs.writeFile(
      path.join(workspace, '.agent', 'workflows', 'tasklifecycle-short', 'index.md'),
      [
        '```yaml',
        'aliases:',
        '  tasklifecycle-short:',
        '    phases:',
        '      phase_1:',
        '        id: short-phase-1-brief',
        '```',
        ''
      ].join('\n')
    );
    const next = await resolveNextPhase(workflowsRoot, 'phase-0-acceptance-criteria', 'short');
    expect(next).toBe('short-phase-1-brief');
  });

  it('resolveNextPhase advances within short strategy when phase is not phase-0', async () => {
    const workflowsRoot = path.join(workspace, '.agent', 'workflows');
    await fs.mkdir(path.join(workspace, '.agent', 'workflows', 'tasklifecycle-short'), { recursive: true });
    await fs.writeFile(
      path.join(workspace, '.agent', 'workflows', 'tasklifecycle-short', 'index.md'),
      [
        '```yaml',
        'aliases:',
        '  tasklifecycle-short:',
        '    phases:',
        '      phase_1:',
        '        id: short-phase-1-brief',
        '      phase_2:',
        '        id: short-phase-2-focus',
        '```',
        ''
      ].join('\n')
    );
    const next = await resolveNextPhase(workflowsRoot, 'short-phase-1-brief', 'short');
    expect(next).toBe('short-phase-2-focus');
  });

  it('resolveNextPhase short strategy throws when phase is missing and not phase-0', async () => {
    const workflowsRoot = path.join(workspace, '.agent', 'workflows');
    await fs.mkdir(path.join(workspace, '.agent', 'workflows', 'tasklifecycle-short'), { recursive: true });
    await fs.writeFile(
      path.join(workspace, '.agent', 'workflows', 'tasklifecycle-short', 'index.md'),
      [
        '```yaml',
        'aliases:',
        '  tasklifecycle-short:',
        '    phases:',
        '      phase_1:',
        '        id: short-phase-1-brief',
        '```',
        ''
      ].join('\n')
    );
    await expect(resolveNextPhase(workflowsRoot, 'short-phase-missing', 'short')).rejects.toThrow('No next phase found');
  });

  it('resolveNextPhase handles trailing underscore phase keys', async () => {
    const workflowsRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-workflows-'));
    await fs.mkdir(path.join(workflowsRoot, 'tasklifecycle-long'), { recursive: true });
    await fs.writeFile(
      path.join(workflowsRoot, 'tasklifecycle-long', 'index.md'),
      [
        '```yaml',
        'aliases:',
        '  tasklifecycle-long:',
        '    phases:',
        '      phase_:',
        '        id: phase-0-acceptance-criteria',
        '      phase_1:',
        '        id: phase-1-research',
        '```',
        ''
      ].join('\n')
    );
    const next = await resolveNextPhase(workflowsRoot, 'phase-0-acceptance-criteria', 'long');
    expect(next).toBe('phase-1-research');
  });

  it('resolveNextPhase skips when phases are not an object', async () => {
    const workflowsRoot = path.join(workspace, '.agent', 'workflows');
    await fs.writeFile(
      path.join(workspace, '.agent', 'workflows', 'tasklifecycle-long', 'index.md'),
      [
        '```yaml',
        'aliases:',
        '  tasklifecycle-long:',
        '    phases: bad',
        '```',
        ''
      ].join('\n')
    );
    await expect(resolveNextPhase(workflowsRoot, 'phase-0-acceptance-criteria', 'long')).rejects.toThrow('No next phase found');
  });

  it('resolveNextPhase works with explicit strategy name', async () => {
    const next = await resolveNextPhase(path.join(workspace, '.agent', 'workflows'), 'phase-0-acceptance-criteria', 'tasklifecycle-long');
    expect(next).toBe('phase-1-research');
  });

  it('resolveNextPhase works with undefined strategy', async () => {
    const next = await resolveNextPhase(path.join(workspace, '.agent', 'workflows'), 'phase-0-acceptance-criteria');
    expect(next).toBe('phase-1-research');
  });

  it('resolveNextPhase ignores invalid strategy', async () => {
    const next = await resolveNextPhase(path.join(workspace, '.agent', 'workflows'), 'phase-0-acceptance-criteria', 'invalid-strategy');
    expect(next).toBe('phase-1-research');
  });

  it('resolveNextPhase throws when phases are malformed', async () => {
    const workflowsRoot = path.join(workspace, '.agent', 'workflows');
    await fs.writeFile(
      path.join(workspace, '.agent', 'workflows', 'tasklifecycle-long', 'index.md'),
      [
        '```yaml',
        'aliases:',
        '  tasklifecycle-long:',
        '    phases:',
        '      phase_0:',
        '        id:',
        '```',
        ''
      ].join('\n')
    );
    await expect(resolveNextPhase(workflowsRoot, 'phase-0-acceptance-criteria', 'long')).rejects.toThrow('No next phase found');
  });

  it('updateTaskPhase updates yaml block', async () => {
    const taskPath = path.join(workspace, '.agent', 'artifacts', 'task.md');
    const content = [
      '---',
      'id: test-task',
      'title: test-task',
      'owner: architect-agent',
      'strategy: long',
      '---',
      '',
      '<!-- RUNTIME:START task-state -->',
      '```yaml',
      'task:',
      '  id: "test-task"',
      '  title: "test-task"',
      '  strategy: "long"',
      '  phase:',
      '    current: "phase-0-acceptance-criteria"',
      '    validated_by: "architect-agent"',
      '    updated_at: "2026-01-01T00:00:00Z"',
      '  lifecycle:',
      '    phases:',
      '      phase-0-acceptance-criteria:',
      '        completed: false',
      '        validated_by: null',
      '        validated_at: null',
      '```',
      '<!-- RUNTIME:END -->',
      ''
    ].join('\n');
    await fs.writeFile(taskPath, content);
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'architect-agent', breakGlass: true });
    await updateTaskPhase(taskPath, 'phase-0-acceptance-criteria', 'phase-1-research', 'architect-agent', guard);
    const updated = await fs.readFile(taskPath, 'utf-8');
    expect(updated).toContain('current: "phase-1-research"');
    expect(updated).toContain('completed: true');
  });

  it('updateTaskPhase handles malformed phase header and updates validated_at', async () => {
    const taskPath = path.join(workspace, '.agent', 'artifacts', 'task-malformed.md');
    const content = [
      '---',
      'id: test-task',
      'title: test-task',
      'owner: architect-agent',
      'strategy: long',
      '---',
      '',
      '<!-- RUNTIME:START task-state -->',
      '```yaml',
      'task:',
      '  id: "test-task"',
      '  title: "test-task"',
      '  strategy: "long"',
      '  phase:',
      '    current: "phase-0-acceptance-criteria"',
      '    validated_by: "architect-agent"',
      '    updated_at: "2026-01-01T00:00:00Z"',
      '  lifecycle:',
      '    phases:',
      '      phase-0-acceptance-criteria',
      '      phase-0-acceptance-criteria:',
      '        completed: false',
      '        validated_by: null',
      '        note: null',
      '        validated_at: null',
      '```',
      '<!-- RUNTIME:END -->',
      ''
    ].join('\n');
    await fs.writeFile(taskPath, content);
    await updateTaskPhase(taskPath, 'phase-0-acceptance-criteria', 'phase-1-research', 'architect-agent');
    const updated = await fs.readFile(taskPath, 'utf-8');
    expect(updated).toContain('current: "phase-1-research"');
    expect(updated).toContain('validated_at: "');
  });

  it('updateTaskPhase writes without guard', async () => {
    const taskPath = path.join(workspace, '.agent', 'artifacts', 'task-no-guard.md');
    const content = [
      '---',
      'id: test-task',
      'title: test-task',
      'owner: architect-agent',
      'strategy: long',
      '---',
      '',
      '<!-- RUNTIME:START task-state -->',
      '```yaml',
      'task:',
      '  id: "test-task"',
      '  title: "test-task"',
      '  strategy: "long"',
      '  phase:',
      '    current: "phase-0-acceptance-criteria"',
      '    validated_by: "architect-agent"',
      '    updated_at: "2026-01-01T00:00:00Z"',
      '  lifecycle:',
      '    phases:',
      '      phase-0-acceptance-criteria:',
      '        completed: false',
      '        validated_by: null',
      '        validated_at: null',
      '```',
      '<!-- RUNTIME:END -->',
      ''
    ].join('\n');
    await fs.writeFile(taskPath, content);
    await updateTaskPhase(taskPath, 'phase-0-acceptance-criteria', 'phase-1-research', 'architect-agent');
    const updated = await fs.readFile(taskPath, 'utf-8');
    expect(updated).toContain('current: "phase-1-research"');
  });

  it('resolveWorkflowsRootForTask returns .agent/workflows path', () => {
    const taskPath = path.join(workspace, '.agent', 'artifacts', 'task.md');
    const root = resolveWorkflowsRootForTask(taskPath);
    expect(root).toBe(path.join(workspace, '.agent', 'workflows'));
  });

  it('resolveWorkflowsRootForTask returns fallback when no .agent in path', () => {
    const taskPath = path.join(workspace, 'artifacts', 'task.md');
    const root = resolveWorkflowsRootForTask(taskPath);
    expect(root).toBe(path.join(path.dirname(taskPath), '.agent', 'workflows'));
  });

  it('resolveWorkflowsRootForTask handles .agent at filesystem root', () => {
    const rootDir = path.parse(process.cwd()).root;
    const taskPath = path.join(rootDir, '.agent', 'artifacts', 'task.md');
    const root = resolveWorkflowsRootForTask(taskPath);
    expect(root).toBe(path.join(rootDir, '.agent', 'workflows'));
  });

  it('resolveWorkspaceRoot uses .agent/runtime/config.json when present', async () => {
    const configPath = path.join(workspace, '.agent', 'runtime', 'config.json');
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify({ workspaceRoot: workspace }, null, 2));
    const resolved = resolveWorkspaceRoot();
    expect(resolved).toBe(workspace);
  });

  it('resolveWorkspaceRoot ignores invalid cwd config and falls back', async () => {
    const configPath = path.join(workspace, '.agent', 'runtime', 'config.json');
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, '{ invalid json');
    const previousHome = process.env.HOME;
    const home = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-home-'));
    process.env.HOME = home;
    const resolved = resolveWorkspaceRoot();
    const [resolvedReal, workspaceReal] = await Promise.all([fs.realpath(resolved), fs.realpath(workspace)]);
    expect(resolvedReal).toBe(workspaceReal);
    if (previousHome === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = previousHome;
    }
  });

  it('resolveWorkspaceRoot uses global config when present', async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-home-'));
    const configDir = path.join(home, '.agentic-workflow');
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(path.join(configDir, 'config.json'), JSON.stringify({ workspaceRoot: workspace }, null, 2));
    const previousHome = process.env.HOME;
    process.env.HOME = home;
    try {
      const resolved = resolveWorkspaceRoot();
      expect(resolved).toBe(workspace);
    } finally {
      if (previousHome === undefined) {
        delete process.env.HOME;
      } else {
        process.env.HOME = previousHome;
      }
    }
  });

  it('resolveWorkspaceRoot ignores global config with non-absolute path', async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-home-rel-'));
    const configDir = path.join(home, '.agentic-workflow');
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(path.join(configDir, 'config.json'), JSON.stringify({ workspaceRoot: 'relative/path' }, null, 2));
    const previousHome = process.env.HOME;
    process.env.HOME = home;
    try {
      const resolved = resolveWorkspaceRoot();
      const [resolvedReal, workspaceReal] = await Promise.all([fs.realpath(resolved), fs.realpath(workspace)]);
      expect(resolvedReal).toBe(workspaceReal);
    } finally {
      if (previousHome === undefined) {
        delete process.env.HOME;
      } else {
        process.env.HOME = previousHome;
      }
    }
  });

  it('resolveWorkspaceRoot ignores invalid global config and falls back', async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-home-bad-'));
    const configDir = path.join(home, '.agentic-workflow');
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(path.join(configDir, 'config.json'), '{ bad json');
    const previousHome = process.env.HOME;
    process.env.HOME = home;
    try {
      const resolved = resolveWorkspaceRoot();
      const [resolvedReal, workspaceReal] = await Promise.all([fs.realpath(resolved), fs.realpath(workspace)]);
      expect(resolvedReal).toBe(workspaceReal);
    } finally {
      if (previousHome === undefined) {
        delete process.env.HOME;
      } else {
        process.env.HOME = previousHome;
      }
    }
  });

  it('resolveWorkspaceRoot finds .agent by walking directories', async () => {
    const nested = path.join(workspace, 'nested', 'child');
    await fs.mkdir(nested, { recursive: true });
    const previousCwd = process.cwd();
    const previousHome = process.env.HOME;
    const home = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-home-'));
    process.chdir(nested);
    process.env.HOME = home;
    try {
      const resolved = resolveWorkspaceRoot();
      const [resolvedReal, workspaceReal] = await Promise.all([fs.realpath(resolved), fs.realpath(workspace)]);
      expect(resolvedReal).toBe(workspaceReal);
    } finally {
      process.chdir(previousCwd);
      if (previousHome === undefined) {
        delete process.env.HOME;
      } else {
        process.env.HOME = previousHome;
      }
    }
  });
});
