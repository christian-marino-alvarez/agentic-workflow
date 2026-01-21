import fs from 'node:fs/promises';
import path from 'node:path';

export async function createBackup(cwd: string): Promise<string> {
    const agentDir = path.join(cwd, '.agent');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(cwd, '.backups', timestamp, '.agent');

    try {
        await fs.mkdir(path.dirname(backupDir), { recursive: true });
        await fs.cp(agentDir, backupDir, { recursive: true });
        return path.dirname(backupDir);
    } catch (error) {
        throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : String(error)}`);
    }
}
