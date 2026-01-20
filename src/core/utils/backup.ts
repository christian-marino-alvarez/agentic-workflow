import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Utility to manage backups of the .agent directory.
 */
export async function performBackup(cwd: string): Promise<string> {
    const agentDir = path.join(cwd, '.agent');
    const backupBaseDir = path.join(cwd, '.agent-backups');

    // Check if .agent exists
    try {
        await fs.access(agentDir);
    } catch {
        // No .agent folder, nothing to backup
        return '';
    }

    // Create backup directory with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(backupBaseDir, timestamp);

    await fs.mkdir(backupDir, { recursive: true });

    // Copy .agent to backupDir
    await copyRecursive(agentDir, path.join(backupDir, '.agent'));

    return backupDir;
}

/**
 * Helper to copy directories recursively.
 */
async function copyRecursive(src: string, dest: string) {
    const stats = await fs.stat(src);
    const isDirectory = stats.isDirectory();
    if (isDirectory) {
        await fs.mkdir(dest, { recursive: true });
        const files = await fs.readdir(src);
        for (const file of files) {
            await copyRecursive(path.join(src, file), path.join(dest, file));
        }
    } else {
        await fs.copyFile(src, dest);
    }
}
