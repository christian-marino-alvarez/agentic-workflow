import path from 'node:path';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { resolveWorkflowsRoot } from '../../engine/task-loader.js';

const WORKSPACE_ENV_VARS = ['PWD', 'INIT_CWD', 'AGENTIC_WORKSPACE', 'WORKSPACE'];

export function collectWorkspaceCandidates(): string[] {
  const candidates = [process.cwd(), ...WORKSPACE_ENV_VARS.map((key) => process.env[key])]
    .filter((value): value is string => Boolean(value));
  return Array.from(new Set(candidates.map((candidate) => path.resolve(candidate))));
}

export async function findWorkspaceRoot(candidates: string[]): Promise<string | null> {
  for (const candidate of candidates) {
    const resolved = await findWorkspaceRootFromDir(candidate);
    if (resolved) {
      return resolved;
    }
  }
  return null;
}

export async function resolveTaskPath(taskPath: string): Promise<{ resolvedPath: string; workspaceRoot: string | null }> {
  if (path.isAbsolute(taskPath)) {
    const workspaceRoot = await findWorkspaceRoot([path.dirname(taskPath)]);
    return { resolvedPath: taskPath, workspaceRoot };
  }

  const candidateRoots = collectWorkspaceCandidates();
  const workspaceRoot = await findWorkspaceRoot(candidateRoots);
  if (!workspaceRoot) {
    const subject = taskPath.includes('init.md') ? 'el init' : 'el taskPath';
    throw new Error(`No pude resolver ${subject}: no se encontró ".agent/" desde el cwd actual. Ejecuta el comando desde el workspace o pasa una ruta absoluta.`);
  }

  return { resolvedPath: path.resolve(workspaceRoot, taskPath), workspaceRoot };
}

export async function ensureInitTaskFile(taskPath: string, workspaceRoot: string | null): Promise<void> {
  if (!isInitTaskPath(taskPath)) {
    return;
  }
  const exists = await fileExists(taskPath);
  if (exists) {
    return;
  }
  if (!workspaceRoot) {
    throw new Error('No se pudo resolver el workspace para crear init.md desde template.');
  }
  const templatePath = path.join(workspaceRoot, '.agent', 'templates', 'init.md');
  const template = await fs.readFile(templatePath, 'utf-8');
  await fs.mkdir(path.dirname(taskPath), { recursive: true });
  await fs.writeFile(taskPath, template);
}

export async function resolveNextPhase(workflowsRoot: string, currentPhase: string, strategy?: string): Promise<string> {
  const normalizedStrategy = normalizeStrategy(strategy);
  const strategies = normalizedStrategy ? [normalizedStrategy] : ['tasklifecycle-long', 'tasklifecycle-short'];

  for (const strategyName of strategies) {
    try {
      const indexPath = path.join(workflowsRoot, strategyName, 'index.md');
      const raw = await fs.readFile(indexPath, 'utf-8');
      const match = raw.match(/```yaml\n([\s\S]*?)```/);
      if (!match) {
        continue;
      }

      const yaml = match[1];
      const data = matter(`---\n${yaml}\n---`).data as Record<string, unknown>;
      const phases = (data.aliases as Record<string, any> | undefined)?.[strategyName]?.phases;

      if (!phases || typeof phases !== 'object') {
        continue;
      }

      const phaseIds = Object.entries(phases)
        .sort(([a], [b]) => {
          const aNum = parseInt(a.split('_').pop() ?? '0', 10);
          const bNum = parseInt(b.split('_').pop() ?? '0', 10);
          return aNum - bNum;
        })
        .map(([, value]) => {
          const id = (value as { id?: string }).id;
          if (!id) {
            throw new Error('Phase entry missing id.');
          }
          return id;
        });

      const index = phaseIds.indexOf(currentPhase);
      if (index !== -1 && index < phaseIds.length - 1) {
        return phaseIds[index + 1];
      }
      if (normalizedStrategy === 'tasklifecycle-short' && currentPhase === 'phase-0-acceptance-criteria' && phaseIds.length > 0) {
        return phaseIds[0];
      }
    } catch {
      continue;
    }
  }
  throw new Error(`No next phase found after ${currentPhase} in strategy ${normalizedStrategy ?? 'any'}.`);
}

export async function updateTaskPhase(taskPath: string, currentPhase: string, nextPhase: string, agent: string): Promise<{ updatedAt: string }> {
  const timestamp = new Date().toISOString();
  const resolvedPath = path.resolve(taskPath);
  const raw = await fs.readFile(resolvedPath, 'utf-8');
  const lines = raw.split('\n');
  let inYaml = false;
  let activePhase: string | null = null;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith('```yaml')) {
      inYaml = true;
      continue;
    }
    if (inYaml && line.startsWith('```')) {
      inYaml = false;
      continue;
    }
    if (!inYaml) {
      continue;
    }
    if (/^\s{6}phase-/.test(line)) {
      const phaseMatch = line.match(/^\s{6}(phase-[^:]+):/);
      activePhase = phaseMatch ? phaseMatch[1] : null;
      continue;
    }
    if (/^\s{4}current:/.test(line)) {
      lines[i] = line.replace(/current:.*$/, `current: "${nextPhase}"`);
      continue;
    }
    if (/^\s{4}validated_by:/.test(line)) {
      lines[i] = line.replace(/validated_by:.*$/, `validated_by: "${agent}"`);
      continue;
    }
    if (/^\s{4}updated_at:/.test(line)) {
      lines[i] = line.replace(/updated_at:.*$/, `updated_at: "${timestamp}"`);
      continue;
    }
    if (activePhase !== currentPhase) {
      continue;
    }
    if (/^\s{8}completed:/.test(line)) {
      lines[i] = '        completed: true';
      continue;
    }
    if (/^\s{8}validated_by:/.test(line)) {
      lines[i] = `        validated_by: "${agent}"`;
      continue;
    }
    if (/^\s{8}validated_at:/.test(line)) {
      lines[i] = `        validated_at: "${timestamp}"`;
    }
  }
  await fs.writeFile(resolvedPath, lines.join('\n'));
  return { updatedAt: timestamp };
}

export function resolveWorkflowsRootForTask(taskPath: string): string {
  return resolveWorkflowsRoot(path.dirname(path.resolve(taskPath)));
}

async function findWorkspaceRootFromDir(startDir: string): Promise<string | null> {
  let currentDir = path.resolve(startDir);
  const root = path.parse(currentDir).root;
  while (true) {
    const agentDir = path.join(currentDir, '.agent');
    if (await fileExists(agentDir)) {
      return currentDir;
    }
    if (currentDir === root) {
      return null;
    }
    currentDir = path.dirname(currentDir);
  }
}

function isInitTaskPath(taskPath: string): boolean {
  const normalized = path.normalize(taskPath);
  const initSuffix = path.join('.agent', 'artifacts', 'candidate', 'init.md');
  return normalized.endsWith(initSuffix);
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function normalizeStrategy(strategy?: string): string | null {
  if (!strategy) {
    return null;
  }
  const normalized = strategy.trim().toLowerCase();
  if (normalized === 'short') {
    return 'tasklifecycle-short';
  }
  if (normalized === 'long') {
    return 'tasklifecycle-long';
  }
  if (normalized === 'tasklifecycle-short' || normalized === 'tasklifecycle-long') {
    return normalized;
  }
  return null;
}
