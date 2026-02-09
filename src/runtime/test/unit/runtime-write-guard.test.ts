import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { RuntimeWriteGuard } from '../../write-guard.js';

async function createWorkspace(): Promise<string> {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-guard-'));
  await fs.mkdir(path.join(base, '.agent', 'artifacts'), { recursive: true });
  await fs.mkdir(path.join(base, '.agent', 'runtime'), { recursive: true });
  await fs.mkdir(path.join(base, '.agent', 'audit'), { recursive: true });
  return base;
}

describe('RuntimeWriteGuard', () => {
  let workspace: string;

  beforeEach(async () => {
    workspace = await createWorkspace();
  });

  it('allows writes inside allowed roots', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test' });
    const target = path.join(workspace, '.agent', 'runtime', 'allowed.json');
    await guard.writeFile(target, '{"ok":true}');
    const saved = await fs.readFile(target, 'utf-8');
    expect(saved).toContain('ok');
  });

  it('denies writes outside allowed roots', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test' });
    const target = path.join(workspace, 'not-allowed.txt');
    await expect(guard.writeFile(target, 'nope')).rejects.toThrow('FS write not allowed');
  });

  it('denies task.md writes without runtime markers', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test' });
    const target = path.join(workspace, '.agent', 'artifacts', 'task.md');
    const content = [
      '---',
      'id: test-task',
      'title: test-task',
      'owner: architect-agent',
      'strategy: long',
      '---',
      '',
      '# Task',
      '',
      '```yaml',
      'task:',
      '  id: "test-task"',
      '  title: "test-task"',
      '  strategy: "long"',
      '  phase:',
      '    current: "phase-0-acceptance-criteria"',
      '```'
    ].join('\n');
    await expect(guard.writeFile(target, content)).rejects.toThrow('FS write not allowed');
  });

  it('uses fallback reason when marker validation lacks reason', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test', breakGlass: true });
    const target = path.join(workspace, '.agent', 'artifacts', 'task.md');
    const content = '<!-- RUNTIME:START task-state -->\\n<!-- RUNTIME:END -->';
    vi.spyOn(guard as unknown as { validateTaskMarkers: () => Promise<{ allowed: boolean }> }, 'validateTaskMarkers')
      .mockResolvedValue({ allowed: false });
    await expect(guard.writeFile(target, content)).rejects.toThrow('FS write not allowed');
    const auditPath = path.join(workspace, '.agent', 'audit', 'write-attempts.jsonl');
    const audit = await fs.readFile(auditPath, 'utf-8');
    expect(audit).toMatch(/\"reason\":\"task_markers_invalid\"/);
  });

  it('denies appendFile for task.md', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test' });
    const target = path.join(workspace, '.agent', 'artifacts', 'task.md');
    await expect(guard.appendFile(target, 'extra')).rejects.toThrow('FS write not allowed');
  });

  it('denies appendFile outside allowed roots', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test' });
    const target = path.join(os.tmpdir(), 'outside-append.txt');
    await expect(guard.appendFile(target, 'nope')).rejects.toThrow('FS write not allowed');
  });

  it('allows task.md writes with runtime markers outside yaml', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test' });
    const target = path.join(workspace, '.agent', 'artifacts', 'task.md');
    const content = [
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
    ].join('\n');
    await guard.writeFile(target, content);
    const saved = await fs.readFile(target, 'utf-8');
    expect(saved).toContain('RUNTIME:START');
  });

  it('denies task.md writes when current content lacks markers', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test' });
    const target = path.join(workspace, '.agent', 'artifacts', 'task.md');
    await fs.writeFile(target, 'no markers here');
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
      '  id: \"test-task\"',
      '  title: \"test-task\"',
      '  strategy: \"long\"',
      '  phase:',
      '    current: \"phase-0-acceptance-criteria\"',
      '```',
      '<!-- RUNTIME:END -->',
      ''
    ].join('\n');
    await expect(guard.writeFile(target, content)).rejects.toThrow('FS write not allowed');
  });

  it('denies task.md writes when outside markers change', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test' });
    const target = path.join(workspace, '.agent', 'artifacts', 'task.md');
    const base = [
      '---',
      'id: test-task',
      'title: test-task',
      'owner: architect-agent',
      'strategy: long',
      '---',
      '',
      'Header',
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
    ].join('\n');
    await fs.writeFile(target, base);
    const changedOutside = base.replace('Header', 'Header changed');
    await expect(guard.writeFile(target, changedOutside)).rejects.toThrow('FS write not allowed');
  });

  it('allows task.md writes when only marker content changes', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test' });
    const target = path.join(workspace, '.agent', 'artifacts', 'task.md');
    const base = [
      '---',
      'id: test-task',
      'title: test-task',
      'owner: architect-agent',
      'strategy: long',
      '---',
      '',
      'Header',
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
    ].join('\n');
    await fs.writeFile(target, base);
    const changedInside = base.replace('phase-0-acceptance-criteria', 'phase-1-research');
    await guard.writeFile(target, changedInside);
    const saved = await fs.readFile(target, 'utf-8');
    expect(saved).toContain('phase-1-research');
  });

  it('denies paths outside workspace', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test' });
    const target = path.join(os.tmpdir(), 'outside-workspace.txt');
    await expect(guard.writeFile(target, 'nope')).rejects.toThrow('FS write not allowed');
  });

  it('denies writes when lock is already held', async () => {
    const lockPath = path.join(workspace, '.agent', 'lock');
    await fs.mkdir(path.dirname(lockPath), { recursive: true });
    await fs.writeFile(lockPath, 'held');
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test' });
    const target = path.join(workspace, '.agent', 'runtime', 'blocked.json');
    await expect(guard.writeFile(target, '{"ok":false}')).rejects.toThrow('FS write not allowed');
  });

  it('releases lock after write completes', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test' });
    const target = path.join(workspace, '.agent', 'runtime', 'lock-test.json');
    await guard.writeFile(target, '{"ok":true}');
    const lockPath = path.join(workspace, '.agent', 'lock');
    await expect(fs.access(lockPath)).rejects.toThrow();
  });

  it('allows breakGlass writes even if lock exists', async () => {
    const lockPath = path.join(workspace, '.agent', 'lock');
    await fs.mkdir(path.dirname(lockPath), { recursive: true });
    await fs.writeFile(lockPath, 'held');
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test', breakGlass: true });
    const target = path.join(workspace, '.agent', 'runtime', 'break-glass.json');
    await guard.writeFile(target, '{"ok":true}');
    const saved = await fs.readFile(target, 'utf-8');
    expect(saved).toContain('ok');
  });

  it('allows mkdir inside allowed roots', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test' });
    const target = path.join(workspace, '.agent', 'runtime', 'new-dir');
    await guard.mkdir(target);
    const stat = await fs.stat(target);
    expect(stat.isDirectory()).toBe(true);
  });

  it('denies mkdir outside allowed roots', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test' });
    const target = path.join(os.tmpdir(), 'outside-dir');
    await expect(guard.mkdir(target)).rejects.toThrow('FS write not allowed');
  });

  it('records sha256 when denial has content', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test' });
    const target = path.join(os.tmpdir(), 'outside-write.txt');
    await expect(guard.writeFile(target, 'payload')).rejects.toThrow('FS write not allowed');
    const auditPath = path.join(workspace, '.agent', 'audit', 'write-attempts.jsonl');
    const audit = await fs.readFile(auditPath, 'utf-8');
    expect(audit).toMatch(/\"sha256\"/);
  });

  it('omits sha256 when denial has no content', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test' });
    const target = path.join(os.tmpdir(), 'outside-dir-2');
    await expect(guard.mkdir(target)).rejects.toThrow('FS write not allowed');
    const auditPath = path.join(workspace, '.agent', 'audit', 'write-attempts.jsonl');
    const audit = await fs.readFile(auditPath, 'utf-8');
    expect(audit).not.toMatch(/\"sha256\":/);
  });

  it('allows appendFile for non-task files', async () => {
    const guard = new RuntimeWriteGuard({ workspaceRoot: workspace, actor: 'test', breakGlass: true });
    const target = path.join(workspace, '.agent', 'runtime', 'append.log');
    await guard.appendFile(target, 'line1\\n');
    const saved = await fs.readFile(target, 'utf-8');
    expect(saved).toContain('line1');
  });
});
