import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { loadTask } from '../src/runtime/task-loader.js';

async function writeTempTask(content: string): Promise<string> {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-task-loader-'));
  const taskPath = path.join(base, 'task.md');
  await fs.writeFile(taskPath, content);
  return taskPath;
}

describe('task-loader', () => {
  it('loads task from markdown yaml block and owner line', async () => {
    const taskPath = await writeTempTask([
      '---',
      'id: meta-task',
      'title: meta-task',
      'strategy: long',
      '---',
      '',
      '- owner: architect-agent',
      '',
      '```yaml',
      'task:',
      '  id: "yaml-task"',
      '  title: "yaml-task"',
      '  phase:',
      '    current: "phase-0-acceptance-criteria"',
      '```',
      ''
    ].join('\n'));

    const task = await loadTask(taskPath);
    expect(task.id).toBe('yaml-task');
    expect(task.owner).toBe('architect-agent');
  });

  it('uses front matter phase when markdown yaml block is missing', async () => {
    const taskPath = await writeTempTask([
      '---',
      'id: meta-task',
      'title: meta-task',
      'owner: architect-agent',
      'phase:',
      '  current: phase-1-research',
      '---',
      '',
      '# Task',
      ''
    ].join('\n'));

    const task = await loadTask(taskPath);
    expect(task.phase).toBe('phase-1-research');
  });

  it('falls back to front matter when yaml task id/title are missing', async () => {
    const taskPath = await writeTempTask([
      '---',
      'id: meta-task',
      'title: meta-task',
      'owner: architect-agent',
      'phase:',
      '  current: phase-1-research',
      '---',
      '',
      '```yaml',
      'task:',
      '  phase:',
      '    current: "phase-1-research"',
      '```',
      ''
    ].join('\n'));

    const task = await loadTask(taskPath);
    expect(task.id).toBe('meta-task');
    expect(task.title).toBe('meta-task');
  });

  it('throws when id is missing in both yaml and front matter', async () => {
    const taskPath = await writeTempTask([
      '---',
      'title: meta-task',
      'owner: architect-agent',
      'phase:',
      '  current: phase-1-research',
      '---',
      '',
      '```yaml',
      'task:',
      '  phase:',
      '    current: "phase-1-research"',
      '```',
      ''
    ].join('\n'));

    await expect(loadTask(taskPath)).rejects.toThrow('Task file missing required fields');
  });

  it('throws when title is missing in both yaml and front matter', async () => {
    const taskPath = await writeTempTask([
      '---',
      'id: meta-task',
      'owner: architect-agent',
      'phase:',
      '  current: phase-1-research',
      '---',
      '',
      '```yaml',
      'task:',
      '  id: "meta-task"',
      '  phase:',
      '    current: "phase-1-research"',
      '```',
      ''
    ].join('\n'));

    await expect(loadTask(taskPath)).rejects.toThrow('Task file missing required fields');
  });

  it('throws when required fields are missing', async () => {
    const taskPath = await writeTempTask([
      '---',
      'id: meta-task',
      'title: meta-task',
      '---',
      '',
      '# Task',
      ''
    ].join('\n'));

    await expect(loadTask(taskPath)).rejects.toThrow('Task file missing required fields');
  });
});
