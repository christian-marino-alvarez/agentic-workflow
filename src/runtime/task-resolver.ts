import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

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
    const subject = isInitCandidatePath(taskPath) ? 'el init' : 'el taskPath';
    throw new Error(`No pude resolver ${subject}: no se encontró ".agent/" desde el cwd actual. Ejecuta el comando desde el workspace o pasa una ruta absoluta.`);
  }

  return { resolvedPath: path.resolve(workspaceRoot, taskPath), workspaceRoot };
}

export type InitTaskEnsureResult = {
  taskPath: string;
  created: boolean;
  warning?: string;
};

export async function ensureInitTaskFile(taskPath: string, workspaceRoot: string | null): Promise<InitTaskEnsureResult> {
  if (isLegacyInitPath(taskPath)) {
    throw new Error('init.md legacy detectado. Elimina el archivo y reintenta con el nuevo flujo init.');
  }
  if (!isInitCandidatePath(taskPath)) {
    return { taskPath, created: false };
  }

  const initResolution = resolveInitCandidatePath(taskPath);
  const resolvedTaskPath = initResolution.resolvedPath;
  const exists = await fileExists(resolvedTaskPath);
  if (exists) {
    return { taskPath: resolvedTaskPath, created: false, warning: initResolution.warning };
  }
  if (!workspaceRoot) {
    throw new Error('No se pudo resolver el workspace para crear init candidate desde template.');
  }
  const templatePath = path.join(workspaceRoot, '.agent', 'templates', 'init.md');
  const template = await fs.readFile(templatePath, 'utf-8');
  await fs.mkdir(path.dirname(resolvedTaskPath), { recursive: true });
  await fs.writeFile(resolvedTaskPath, template);
  return { taskPath: resolvedTaskPath, created: true, warning: initResolution.warning };
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
  const root = path.dirname(path.resolve(taskPath));
  const parts = root.split(path.sep);
  const agentIndex = parts.lastIndexOf('.agent');
  if (agentIndex === -1) {
    return path.join(root, '.agent', 'workflows');
  }
  const base = parts.slice(0, agentIndex).join(path.sep);
  return path.join(base || path.parse(root).root, '.agent', 'workflows');
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

function isInitCandidatePath(taskPath: string): boolean {
  const normalized = path.normalize(taskPath);
  const candidateDir = path.join('.agent', 'artifacts', 'candidate');
  if (normalized.endsWith(candidateDir)) {
    return true;
  }
  const parsed = path.parse(normalized);
  if (parsed.base.endsWith('-init.md') && normalized.includes(candidateDir)) {
    return true;
  }
  return false;
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

function resolveInitCandidatePath(taskPath: string): { resolvedPath: string; warning?: string } {
  const normalized = path.normalize(taskPath);
  const candidateDir = path.join('.agent', 'artifacts', 'candidate');

  if (normalized.endsWith(candidateDir)) {
    const filename = buildInitCandidateFilename();
    return { resolvedPath: path.join(normalized, filename) };
  }

  return { resolvedPath: normalized };
}

function isLegacyInitPath(taskPath: string): boolean {
  const normalized = path.normalize(taskPath);
  const legacyInit = path.join('.agent', 'artifacts', 'candidate', 'init.md');
  return normalized.endsWith(legacyInit);
}

function buildInitCandidateFilename(): string {
  const iso = new Date().toISOString();
  const trimmed = iso.replace(/\.\d{3}Z$/, 'Z');
  const sanitized = trimmed.replace(/:/g, '-');
  return `${sanitized}-init.md`;
}
