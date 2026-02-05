import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

type WriteGuardOptions = {
  workspaceRoot: string;
  actor: string;
  auditDir?: string;
  allowedRoots?: string[];
  lockPath?: string;
  breakGlass?: boolean;
};

type AuditEvent = {
  type: 'write_denied';
  actor: string;
  targetPath: string;
  relativePath: string | null;
  timestamp: string;
  sha256?: string;
  reason: string;
};

const DEFAULT_ALLOWED_ROOTS = [
  path.join('.agent', 'artifacts'),
  path.join('.agent', 'runtime'),
  path.join('.agent', 'audit'),
  path.join('.agent', 'state')
];

export class RuntimeWriteGuard {
  private workspaceRoot: string;
  private actor: string;
  private auditDir: string;
  private allowedRoots: string[];
  private lockPath: string;
  private breakGlass: boolean;

  constructor(options: WriteGuardOptions) {
    this.workspaceRoot = path.resolve(options.workspaceRoot);
    this.actor = options.actor;
    this.auditDir = options.auditDir ?? path.join(this.workspaceRoot, '.agent', 'audit');
    this.allowedRoots = (options.allowedRoots ?? DEFAULT_ALLOWED_ROOTS).map((root) =>
      normalizeRoot(root)
    );
    this.lockPath = path.resolve(options.lockPath ?? path.join(this.workspaceRoot, '.agent', 'lock'));
    this.breakGlass = options.breakGlass ?? false;
  }

  async writeFile(targetPath: string, content: string): Promise<void> {
    const release = await this.acquireLockIfNeeded();
    const resolved = path.resolve(targetPath);
    const check = this.ensureAllowed(resolved);
    if (!check.allowed) {
      await this.recordDenied(check.relativePath, check.reason, content);
      throw new Error('FS write not allowed; use runtime tool');
    }
    if (requiresRuntimeMarkers(resolved)) {
      const markersOk = await this.validateTaskMarkers(resolved, content);
      if (!markersOk.allowed) {
        await this.recordDenied(check.relativePath, markersOk.reason ?? 'task_markers_invalid', content);
        throw new Error('FS write not allowed; use runtime tool');
      }
    }
    try {
      await fs.mkdir(path.dirname(resolved), { recursive: true });
      await fs.writeFile(resolved, content, 'utf-8');
    } finally {
      await release();
    }
  }

  async appendFile(targetPath: string, content: string): Promise<void> {
    const release = await this.acquireLockIfNeeded();
    const resolved = path.resolve(targetPath);
    if (requiresRuntimeMarkers(resolved)) {
      await this.recordDenied(this.relativeToWorkspace(resolved), 'task_append_not_allowed', content);
      throw new Error('FS write not allowed; use runtime tool');
    }
    const check = this.ensureAllowed(resolved);
    if (!check.allowed) {
      await this.recordDenied(check.relativePath, check.reason, content);
      throw new Error('FS write not allowed; use runtime tool');
    }
    try {
      await fs.mkdir(path.dirname(resolved), { recursive: true });
      await fs.appendFile(resolved, content, 'utf-8');
    } finally {
      await release();
    }
  }

  async mkdir(targetPath: string): Promise<void> {
    const release = await this.acquireLockIfNeeded();
    const resolved = path.resolve(targetPath);
    const check = this.ensureAllowed(resolved);
    if (!check.allowed) {
      await this.recordDenied(check.relativePath, check.reason);
      throw new Error('FS write not allowed; use runtime tool');
    }
    try {
      await fs.mkdir(resolved, { recursive: true });
    } finally {
      await release();
    }
  }

  private ensureAllowed(targetPath: string): { allowed: boolean; relativePath: string | null; reason: string } {
    const relativePath = this.relativeToWorkspace(targetPath);
    if (!relativePath) {
      return { allowed: false, relativePath, reason: 'path_outside_workspace' };
    }
    const normalized = normalizeRoot(relativePath);
    const allowed = this.allowedRoots.some((root) => normalized.startsWith(root));
    if (!allowed) {
      return { allowed: false, relativePath, reason: 'path_not_allowed' };
    }
    return { allowed: true, relativePath, reason: 'allowed' };
  }

  private relativeToWorkspace(targetPath: string): string | null {
    const relative = path.relative(this.workspaceRoot, targetPath);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
      return null;
    }
    return relative;
  }

  private async recordDenied(relativePath: string | null, reason: string, content?: string): Promise<void> {
    const event: AuditEvent = {
      type: 'write_denied',
      actor: this.actor,
      targetPath: relativePath ?? 'unknown',
      relativePath,
      timestamp: new Date().toISOString(),
      sha256: content ? hashContent(content) : undefined,
      reason
    };
    const auditPath = path.join(this.auditDir, 'write-attempts.jsonl');
    await fs.mkdir(path.dirname(auditPath), { recursive: true });
    await fs.appendFile(auditPath, `${JSON.stringify(event)}\n`, 'utf-8');
  }

  private async validateTaskMarkers(targetPath: string, nextContent: string): Promise<{ allowed: boolean; reason?: string }> {
    if (!hasRuntimeMarkers(nextContent)) {
      return { allowed: false, reason: 'task_markers_missing' };
    }
    const currentContent = await readIfExists(targetPath);
    if (!currentContent) {
      return { allowed: true };
    }
    if (!hasRuntimeMarkers(currentContent)) {
      return { allowed: false, reason: 'task_markers_missing_current' };
    }
    const currentOutside = extractOutsideSections(currentContent);
    const nextOutside = extractOutsideSections(nextContent);
    if (currentOutside !== nextOutside) {
      return { allowed: false, reason: 'task_markers_outside_modified' };
    }
    return { allowed: true };
  }

  private async acquireLockIfNeeded(): Promise<() => Promise<void>> {
    if (this.breakGlass) {
      return async () => {};
    }
    const now = new Date().toISOString();
    const lockRecord = `${JSON.stringify({ actor: this.actor, timestamp: now })}\n`;
    await fs.mkdir(path.dirname(this.lockPath), { recursive: true });
    try {
      const handle = await fs.open(this.lockPath, 'wx');
      await handle.writeFile(lockRecord, 'utf-8');
      await handle.close();
      return async () => {
        try {
          await fs.unlink(this.lockPath);
        } catch {
          // Ignore lock cleanup failures.
        }
      };
    } catch {
      await this.recordDenied(this.relativeToWorkspace(this.lockPath), 'lock_already_held');
      throw new Error('FS write not allowed; use runtime tool');
    }
  }
}

function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function normalizeRoot(value: string): string {
  return value.split(path.sep).join('/');
}

function requiresRuntimeMarkers(targetPath: string): boolean {
  const normalized = normalizeRoot(targetPath);
  return normalized.includes('/.agent/artifacts/') && normalized.endsWith('/task.md');
}

function hasRuntimeMarkers(content: string): boolean {
  return /<!--\s*RUNTIME:START\s+[^>]+-->/.test(content) && /<!--\s*RUNTIME:END\s*-->/.test(content);
}

function extractOutsideSections(content: string): string {
  const lines = content.split('\n');
  let inRuntime = false;
  const outside: string[] = [];
  for (const line of lines) {
    if (/<!--\s*RUNTIME:START\s+[^>]+-->/.test(line)) {
      inRuntime = true;
      continue;
    }
    if (/<!--\s*RUNTIME:END\s*-->/.test(line)) {
      inRuntime = false;
      continue;
    }
    if (!inRuntime) {
      outside.push(line);
    }
  }
  return outside.join('\n');
}

async function readIfExists(targetPath: string): Promise<string | null> {
  try {
    return await fs.readFile(targetPath, 'utf-8');
  } catch {
    return null;
  }
}
