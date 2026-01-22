import fs from 'node:fs/promises';
import path from 'node:path';

export type SystemType = 'current' | 'legacy' | 'none';

export async function detectAgentSystem(cwd: string): Promise<SystemType> {
    const agentDir = path.join(cwd, '.agent');

    try {
        await fs.access(agentDir);
    } catch {
        return 'none';
    }

    // Comprobar si es el sistema actual (Portable)
    try {
        const rootIndex = await fs.readFile(path.join(agentDir, 'index.md'), 'utf-8');
        if (rootIndex.includes('id: agent.index')) {
            return 'current';
        }
    } catch {
        // No hay index.md global
    }

    // Comprobar si es legacy
    try {
        const rulesIndex = await fs.readFile(path.join(agentDir, 'rules', 'index.md'), 'utf-8');
        if (rulesIndex.includes('id: rules.index')) {
            return 'legacy';
        }
    } catch {
        // No hay rules/index.md
    }

    return 'legacy'; // Si existe .agent pero no es actual, lo tratamos como legacy para migrar
}
