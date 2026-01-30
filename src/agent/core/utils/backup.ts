import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Utility to manage backups of the .agent directory.
 */
export async function performBackup(cwd: string): Promise<string> {
    const agentDir = path.join(cwd, '.agent');
    const backupsContainer = path.join(cwd, '.backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(backupsContainer, `.agent.backup_${timestamp}`);

    // Check if .agent exists
    try {
        await fs.access(agentDir);
    } catch {
        // No .agent folder, nothing to backup
        return '';
    }

    await fs.cp(agentDir, backupDir, { recursive: true });
    return backupDir;
}
