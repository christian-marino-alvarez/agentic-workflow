import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { Logger } from '../infrastructure/logger/index.js';
import type { RuntimeWriteGuard } from './write-guard.js';

type SyncParams = {
  workspaceRoot: string;
  taskId: string;
  taskTitle: string;
  owner: string;
  currentPhase: string;
  writeGuard?: RuntimeWriteGuard;
};

type FrontmatterUpdate = {
  filePath: string;
  changes: Record<string, { from: unknown; to: unknown }>;
};

const PHASE_BY_ARTIFACT: Record<string, string> = {
  'brief.md': 'short-phase-1-brief',
  'acceptance.md': 'short-phase-1-brief',
  'implementation.md': 'short-phase-2-implementation',
  'closure.md': 'short-phase-3-closure'
};

const FLOW_ARTIFACTS = ['task.md', 'brief.md', 'acceptance.md', 'implementation.md', 'closure.md'];

export async function syncFrontmatterForTaskArtifacts(params: SyncParams): Promise<void> {
  const artifactsRoot = path.join(params.workspaceRoot, '.agent', 'artifacts');
  const artifactDir = await resolveArtifactDir(artifactsRoot, params.taskId);
  if (!artifactDir) {
    Logger.warn('Runtime', 'No artifacts directory found for task; skipping frontmatter sync', {
      taskId: params.taskId
    });
    return;
  }

  const relatedTask = `${params.taskId}-${params.taskTitle}`;
  for (const fileName of FLOW_ARTIFACTS) {
    const filePath = path.join(artifactDir, fileName);
    if (!(await exists(filePath))) {
      continue;
    }
    const expectedPhase = fileName === 'task.md' ? params.currentPhase : PHASE_BY_ARTIFACT[fileName];
    const update = await syncFrontmatter(filePath, {
      owner: params.owner,
      related_task: relatedTask,
      phase: expectedPhase
    }, params.writeGuard);
    if (update) {
      Logger.error('Runtime', 'Frontmatter overwritten by runtime', {
        filePath,
        changes: update.changes
      });
    }
  }
}

async function syncFrontmatter(
  filePath: string,
  desired: { owner: string; related_task: string; phase?: string },
  writeGuard?: RuntimeWriteGuard
): Promise<FrontmatterUpdate | null> {
  const raw = await fs.readFile(filePath, 'utf-8');
  const parsed = matter(raw);
  if (!parsed.data || Object.keys(parsed.data).length === 0) {
    return null;
  }

  const changes: Record<string, { from: unknown; to: unknown }> = {};
  const nextData: Record<string, unknown> = { ...parsed.data };

  if ('owner' in nextData && nextData.owner !== desired.owner) {
    changes.owner = { from: nextData.owner, to: desired.owner };
    nextData.owner = desired.owner;
  }
  if ('related_task' in nextData && nextData.related_task !== desired.related_task) {
    changes.related_task = { from: nextData.related_task, to: desired.related_task };
    nextData.related_task = desired.related_task;
  }
  if (desired.phase && 'phase' in nextData && nextData.phase !== desired.phase) {
    changes.phase = { from: nextData.phase, to: desired.phase };
    nextData.phase = desired.phase;
  }

  if (Object.keys(changes).length === 0) {
    return null;
  }

  const nextContent = matter.stringify(parsed.content, nextData);
  if (writeGuard) {
    await writeGuard.writeFile(filePath, nextContent);
  } else {
    await fs.writeFile(filePath, nextContent, 'utf-8');
  }

  return { filePath, changes };
}

async function resolveArtifactDir(artifactsRoot: string, taskId: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(artifactsRoot, { withFileTypes: true });
    const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    const exact = dirs.find((dir) => dir === taskId);
    if (exact) {
      return path.join(artifactsRoot, exact);
    }
    const prefix = dirs.find((dir) => dir.startsWith(`${taskId}-`));
    if (prefix) {
      return path.join(artifactsRoot, prefix);
    }
    return null;
  } catch {
    return null;
  }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
