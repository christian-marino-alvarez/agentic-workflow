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

    // Intentamos buscar el root del paquete subiendo niveles desde src/infrastructure/mapping
    // En desarrollo: agent-workflow/src/infrastructure/mapping -> ../../..
    // En producción (dist): agent-workflow/dist/infrastructure/mapping -> ../../..

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
            '@christianmaf80',
            'agentic-workflow'
        );
        try {
            await fs.access(path.join(directNodeModules, 'package.json'));
            return await resolveCorePathFromPackageRoot(directNodeModules);
        } catch {
            // Fall back to node resolution from cwd.
        }

        const requireFromCwd = createRequire(path.join(cwd, 'package.json'));
        const pkgPath = requireFromCwd.resolve('@christianmaf80/agentic-workflow/package.json');
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
        const legacyRoot = {
            root: currentDir,
            rules: path.join(currentDir, 'rules'),
            workflows: path.join(currentDir, 'workflows'),
        };
        const agentStructureRoot = {
            root: path.join(currentDir, 'agent'),
            rules: path.join(currentDir, 'agent', 'rules'),
            workflows: path.join(currentDir, 'agent', 'workflows'),
        };
        const agenticStructureRoot = {
            root: path.join(currentDir, 'agentic-system-structure'),
            rules: path.join(currentDir, 'agentic-system-structure', 'rules'),
            workflows: path.join(currentDir, 'agentic-system-structure', 'workflows'),
        };

        try {
            await fs.access(legacyRoot.rules);
            await fs.access(legacyRoot.workflows);
            return legacyRoot.root;
        } catch {
            // keep checking other variants
        }

        try {
            await fs.access(agentStructureRoot.rules);
            await fs.access(agentStructureRoot.workflows);
            return agentStructureRoot.root;
        } catch {
            // keep checking other variants
        }

        try {
            await fs.access(agenticStructureRoot.rules);
            await fs.access(agenticStructureRoot.workflows);
            return agenticStructureRoot.root;
        } catch {
            currentDir = path.dirname(currentDir);
        }
    }

    throw new Error('No se pudo localizar el core del framework (@christianmaf80/agentic-workflow). Asegúrate de que el paquete está correctamente instalado.');
}

async function resolveCorePathFromPackageRoot(pkgRoot: string): Promise<string> {
    const candidates = [
        pkgRoot,
        path.join(pkgRoot, 'dist'),
        path.join(pkgRoot, 'dist', 'agent'),
        path.join(pkgRoot, 'src'),
        path.join(pkgRoot, 'src', 'agentic-system-structure'),
    ];
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
