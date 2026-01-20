import { intro, outro, spinner, select, confirm, note } from '@clack/prompts';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function restoreCommand() {
    intro('Agentic Workflow Recovery');

    const cwd = process.cwd();
    const backupBaseDir = path.join(cwd, '.agent-backups');

    try {
        await fs.access(backupBaseDir);
    } catch {
        outro('No se han encontrado copias de seguridad en .agent-backups/');
        return;
    }

    const backups = await fs.readdir(backupBaseDir);
    if (backups.length === 0) {
        outro('No hay backups disponibles.');
        return;
    }

    // Sort backups by date (newest first)
    const sortedBackups = backups.sort((a, b) => b.localeCompare(a));

    const selectedBackup = await select({
        message: 'Selecciona la copia de seguridad que deseas restaurar:',
        options: sortedBackups.map(b => ({ value: b, label: b })),
    });

    if (typeof selectedBackup === 'symbol') {
        outro('Operación cancelada.');
        return;
    }

    const shouldRestore = await confirm({
        message: `¿Estás seguro de que deseas restaurar el backup "${selectedBackup}"? Se sobrescribirá la carpeta .agent/ actual.`,
    });

    if (!shouldRestore || typeof shouldRestore === 'symbol') {
        outro('Restauración cancelada.');
        return;
    }

    const s = spinner();
    s.start('Restoring backup...');

    const backupPath = path.join(backupBaseDir, selectedBackup as string, '.agent');
    const targetPath = path.join(cwd, '.agent');

    try {
        // Simple strategy: delete current and copy backup
        await fs.rm(targetPath, { recursive: true, force: true });
        await copyRecursive(backupPath, targetPath);
        s.stop('Restoration complete.');
        outro(`El sistema ha sido restaurado exitosamente desde ${selectedBackup}`);
    } catch (error) {
        s.stop('Restoration failed.');
        console.error(error);
        outro('Error durante la restauración.');
    }
}

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
