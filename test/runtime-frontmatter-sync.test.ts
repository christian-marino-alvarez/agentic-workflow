import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import matter from 'gray-matter';
import { syncFrontmatterForTaskArtifacts } from '../src/runtime/frontmatter-sync.js';
import { Logger } from '../src/infrastructure/logger/index.js';

type TempWorkspace = {
  root: string;
  artifactsRoot: string;
};

async function createWorkspace(withArtifacts = true): Promise<TempWorkspace> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-frontmatter-'));
  if (withArtifacts) {
    await fs.mkdir(path.join(root, '.agent', 'artifacts'), { recursive: true });
  }
  return { root, artifactsRoot: path.join(root, '.agent', 'artifacts') };
}

function frontmatterDoc(data: Record<string, unknown>, body = 'body'): string {
  return matter.stringify(body, data);
}

describe('frontmatter-sync', () => {
  const warnSpy = vi.spyOn(Logger, 'warn');
  const errorSpy = vi.spyOn(Logger, 'error');

  beforeEach(() => {
    warnSpy.mockClear();
    errorSpy.mockClear();
  });

  afterEach(() => {
    warnSpy.mockClear();
    errorSpy.mockClear();
  });

  it('warns when no artifacts directory is found', async () => {
    const workspace = await createWorkspace(false);

    await syncFrontmatterForTaskArtifacts({
      workspaceRoot: workspace.root,
      taskId: 'task-123',
      taskTitle: 'demo',
      owner: 'architect-agent',
      currentPhase: 'short-phase-2-implementation'
    });

    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0][1]).toContain('No artifacts directory found');
  });

  it('updates frontmatter in existing artifacts and leaves clean files untouched', async () => {
    const workspace = await createWorkspace(true);
    const taskId = 'task-123';
    const taskDir = path.join(workspace.artifactsRoot, `${taskId}-demo`);
    await fs.mkdir(taskDir, { recursive: true });

    await fs.writeFile(
      path.join(taskDir, 'task.md'),
      frontmatterDoc({ owner: 'old-owner', related_task: 'old-task', phase: 'phase-0' }, 'task body')
    );
    await fs.writeFile(
      path.join(taskDir, 'brief.md'),
      frontmatterDoc({ owner: 'old-owner', related_task: 'old-task', phase: 'short-phase-9' }, 'brief body')
    );
    await fs.writeFile(
      path.join(taskDir, 'acceptance.md'),
      frontmatterDoc({ owner: 'architect-agent', related_task: `${taskId}-demo`, phase: 'short-phase-1-brief' }, 'acc body')
    );
    await fs.writeFile(path.join(taskDir, 'implementation.md'), 'no frontmatter');

    await syncFrontmatterForTaskArtifacts({
      workspaceRoot: workspace.root,
      taskId,
      taskTitle: 'demo',
      owner: 'architect-agent',
      currentPhase: 'short-phase-2-implementation'
    });

    const task = matter(await fs.readFile(path.join(taskDir, 'task.md'), 'utf-8')).data;
    const brief = matter(await fs.readFile(path.join(taskDir, 'brief.md'), 'utf-8')).data;
    const acceptance = matter(await fs.readFile(path.join(taskDir, 'acceptance.md'), 'utf-8')).data;

    expect(task.owner).toBe('architect-agent');
    expect(task.related_task).toBe(`${taskId}-demo`);
    expect(task.phase).toBe('short-phase-2-implementation');
    expect(brief.owner).toBe('architect-agent');
    expect(brief.related_task).toBe(`${taskId}-demo`);
    expect(brief.phase).toBe('short-phase-1-brief');
    expect(acceptance.owner).toBe('architect-agent');
    expect(acceptance.related_task).toBe(`${taskId}-demo`);
    expect(acceptance.phase).toBe('short-phase-1-brief');
    expect(errorSpy).toHaveBeenCalled();
  });

  it('uses exact taskId directory when available', async () => {
    const workspace = await createWorkspace(true);
    const taskId = 'task-456';
    const taskDir = path.join(workspace.artifactsRoot, taskId);
    await fs.mkdir(taskDir, { recursive: true });
    await fs.writeFile(
      path.join(taskDir, 'task.md'),
      frontmatterDoc({ owner: 'old-owner', related_task: 'old-task', phase: 'phase-0' }, 'task body')
    );

    await syncFrontmatterForTaskArtifacts({
      workspaceRoot: workspace.root,
      taskId,
      taskTitle: 'title',
      owner: 'architect-agent',
      currentPhase: 'phase-1-research'
    });

    const task = matter(await fs.readFile(path.join(taskDir, 'task.md'), 'utf-8')).data;
    expect(task.related_task).toBe(`${taskId}-title`);
    expect(task.phase).toBe('phase-1-research');
  });

  it('routes writes through write guard when provided', async () => {
    const workspace = await createWorkspace(true);
    const taskId = 'task-789';
    const taskDir = path.join(workspace.artifactsRoot, `${taskId}-demo`);
    await fs.mkdir(taskDir, { recursive: true });
    const filePath = path.join(taskDir, 'task.md');
    await fs.writeFile(
      filePath,
      frontmatterDoc({ owner: 'old-owner', related_task: 'old-task', phase: 'phase-0' }, 'task body')
    );

    const writeFile = vi.fn(async () => {});

    await syncFrontmatterForTaskArtifacts({
      workspaceRoot: workspace.root,
      taskId,
      taskTitle: 'demo',
      owner: 'architect-agent',
      currentPhase: 'phase-2-analysis',
      writeGuard: { writeFile } as any
    });

    expect(writeFile).toHaveBeenCalledOnce();
    expect(writeFile.mock.calls[0][0]).toBe(filePath);
    expect(String(writeFile.mock.calls[0][1])).toContain('architect-agent');
  });
});
