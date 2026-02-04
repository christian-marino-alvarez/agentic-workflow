import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const DEFAULT_ARTIFACTS = [
  'task.md',
  'plan.md',
  'analysis.md',
  'acceptance.md',
  path.join('researcher', 'research.md')
];

export async function collectArtifactHashes(baseDir: string, artifacts = DEFAULT_ARTIFACTS): Promise<Record<string, string>> {
  const hashes: Record<string, string> = {};
  for (const rel of artifacts) {
    const filePath = path.join(baseDir, rel);
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      hashes[rel] = crypto.createHash('sha256').update(raw).digest('hex');
    } catch {
      // Ignore missing files.
    }
  }
  return hashes;
}

export function diffHashes(previous: Record<string, string>, current: Record<string, string>): Array<{ file: string; before?: string; after?: string }> {
  const files = new Set([...Object.keys(previous), ...Object.keys(current)]);
  const changes: Array<{ file: string; before?: string; after?: string }> = [];
  for (const file of files) {
    const before = previous[file];
    const after = current[file];
    if (before !== after) {
      changes.push({ file, before, after });
    }
  }
  return changes;
}
