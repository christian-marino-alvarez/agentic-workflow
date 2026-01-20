import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

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

    let currentDir = __dirname;
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
