import fs from 'node:fs/promises';
import path from 'node:path';

export async function createBackup(cwd: string): Promise<string> {
    const agentDir = path.join(cwd, '.agent');
    const backupsContainer = path.join(cwd, '.backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(backupsContainer, `.agent.backup_${timestamp}`);

    try {
        await fs.cp(agentDir, backupDir, { recursive: true });
        return backupDir;
    } catch (error) {
        throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : String(error)}`);
    }
}
