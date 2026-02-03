import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

export interface TaskRecord {
  id: string;
  title: string;
  owner: string;
  phase: string;
  strategy?: string;
}

interface TaskMeta {
  id?: string;
  title?: string;
  owner?: string;
  strategy?: string;
}

interface TaskYaml {
  task?: {
    id?: string;
    title?: string;
    strategy?: string;
    phase?: {
      current?: string;
    };
  };
}

export async function loadTask(taskPath: string): Promise<TaskRecord> {
  const resolvedPath = path.resolve(taskPath);
  const raw = await fs.readFile(resolvedPath, 'utf-8');
  const { data, content } = matter(raw);
  const meta = data as TaskMeta;
  const yaml = extractYamlBlock(content) as TaskYaml;
  const task = yaml.task ?? {};
  const id = task.id ?? meta.id ?? '';
  const title = task.title ?? meta.title ?? '';
  const phase = task.phase?.current ?? (meta as any).phase?.current ?? (meta as any)['phase.current'] ?? '';
  const owner = meta.owner ?? extractOwner(raw) ?? '';
  const strategy = task.strategy ?? meta.strategy ?? '';

  if (!id || !title || !phase || !owner) {
    throw new Error('Task file missing required fields (id/title/owner/phase.current).');
  }

  return { id, title, owner, phase, strategy: strategy || undefined };
}

export function resolveWorkflowsRoot(projectRoot: string): string {
  const normalized = path.resolve(projectRoot);
  const parsed = path.parse(normalized);
  const parts = normalized.split(path.sep);
  const agentIndex = parts.lastIndexOf('.agent');
  if (agentIndex === -1) {
    return path.join(normalized, '.agent', 'workflows');
  }
  const rootParts = parts.slice(0, agentIndex);
  const root = resolveRoot(rootParts, parsed.root);
  return path.join(root, '.agent', 'workflows');
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

function resolveRoot(parts: string[], fallbackRoot: string): string {
  if (parts.length === 0) {
    return fallbackRoot;
  }
  if (parts[0] === '') {
    return path.join(fallbackRoot, ...parts.slice(1));
  }
  return path.join(...parts);
}
