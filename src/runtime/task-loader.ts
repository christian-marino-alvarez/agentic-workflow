import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

export type TaskRecord = {
  id: string;
  title: string;
  owner: string;
  phase: string;
  strategy?: string;
};

type TaskYaml = {
  task?: {
    id?: string;
    title?: string;
    strategy?: string;
    phase?: { current?: string };
  };
};

type TaskMeta = {
  id?: string;
  title?: string;
  owner?: string;
  strategy?: string;
};

export async function loadTask(taskPath: string): Promise<TaskRecord> {
  const resolvedPath = path.resolve(taskPath);
  const raw = await fs.readFile(resolvedPath, 'utf-8');
  const { data, content } = matter(raw);
  const meta = data as TaskMeta;
  const yaml = extractYamlBlock(content) as TaskYaml;
  const task = yaml.task ?? {};
  const id = task.id ?? meta.id ?? '';
  const title = task.title ?? meta.title ?? '';
  const phase = task.phase?.current ?? (meta as any).phase?.current ?? '';
  const owner = meta.owner ?? extractOwner(raw) ?? '';
  const strategy = task.strategy ?? meta.strategy ?? '';

  if (!id || !title || !phase || !owner) {
    throw new Error('Task file missing required fields (id/title/owner/phase.current).');
  }

  return { id, title, owner, phase, strategy: strategy || undefined };
}

function extractYamlBlock(markdown: string): unknown {
  const match = markdown.match(/```yaml\n([\s\S]*?)```/);
  if (!match) {
    return {};
  }
  return matter(`---\n${match[1]}\n---`).data;
}

function extractOwner(markdown: string): string | undefined {
  const match = markdown.match(/^- owner:\s*(.+)\s*$/m);
  return match ? match[1].trim() : undefined;
}
