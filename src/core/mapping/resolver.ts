import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';

/**
 * Resuelve la ruta absoluta del core del framework agentic-workflow.
 * Busca las carpetas 'rules', 'workflows' y 'templates' desde la ubicación del script.
 */
export async function resolveCorePath(): Promise<string> {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Intentamos buscar el root del paquete subiendo niveles desde src/core/mapping
    // En desarrollo: agent-workflow/src/core/mapping -> ../../..
    // En producción (dist): agent-workflow/dist/core/mapping -> ../../..

    return resolveCorePathFromDir(__dirname);
}

/**
 * Intenta resolver el core instalado en node_modules desde el cwd.
 * Devuelve null si no hay instalación local.
 */
export async function resolveInstalledCorePath(cwd: string = process.cwd()): Promise<string | null> {
    try {
        const directNodeModules = path.join(
            cwd,
            'node_modules',
            '@christian-marino-alvarez',
            'agentic-workflow'
        );
        try {
            await fs.access(path.join(directNodeModules, 'package.json'));
            return await resolveCorePathFromPackageRoot(directNodeModules);
        } catch {
            // Fall back to node resolution from cwd.
        }

        const requireFromCwd = createRequire(path.join(cwd, 'package.json'));
        const pkgPath = requireFromCwd.resolve('@christian-marino-alvarez/agentic-workflow/package.json');
        const pkgRoot = path.dirname(pkgPath);
        return await resolveCorePathFromPackageRoot(pkgRoot);
    } catch {
        return null;
    }
}

async function resolveCorePathFromDir(startDir: string): Promise<string> {
    let currentDir = startDir;
    const maxRetries = 5;

    for (let i = 0; i < maxRetries; i++) {
        const potentialRulesPath = path.join(currentDir, 'rules');
        const potentialWorkflowsPath = path.join(currentDir, 'workflows');

        try {
            await fs.access(potentialRulesPath);
            await fs.access(potentialWorkflowsPath);
            return currentDir; // Encontrado
        } catch {
            currentDir = path.dirname(currentDir);
        }
    }

    throw new Error('No se pudo localizar el core del framework (@cmarino/agentic-workflow). Asegúrate de que el paquete está correctamente instalado.');
}

async function resolveCorePathFromPackageRoot(pkgRoot: string): Promise<string> {
    const candidates = [pkgRoot, path.join(pkgRoot, 'dist'), path.join(pkgRoot, 'src')];
    for (const candidate of candidates) {
        try {
            const rulesPath = path.join(candidate, 'rules');
            const workflowsPath = path.join(candidate, 'workflows');
            await fs.access(rulesPath);
            await fs.access(workflowsPath);
            return candidate;
        } catch {
            // Not a core root, try next.
        }
    }
    throw new Error('No se pudo localizar el core instalado en node_modules.');
}
