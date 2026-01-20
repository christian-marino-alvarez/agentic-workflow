import { intro, outro, spinner, note } from '@clack/prompts';
import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveCorePath } from '../../core/mapping/resolver.js';

/**
 * Lógica central para la creación de componentes sin dependencias de UI (Clack).
 * Útil para ser llamada desde el CLI o desde un servidor MCP.
 */
export async function performCreate(type: string, name: string, force: boolean = false): Promise<{ success: boolean; message: string; path?: string }> {
    const cwd = process.cwd();
    const agentDir = path.join(cwd, '.agent');
    const typeFolder = type === 'role' ? 'rules/roles' : type === 'workflow' ? 'workflows' : 'tools';
    const targetDir = path.join(agentDir, typeFolder);
    const targetPath = path.join(targetDir, `${name}.md`);

    try {
        const corePath = await resolveCorePath();
        const coreTypeFolder = type === 'role' ? 'rules/roles' : type === 'workflow' ? 'workflows' : 'templates';
        const reservedPath = path.join(corePath, coreTypeFolder, `${name}.md`);

        // 1. Reserved Namespace Check
        try {
            await fs.access(reservedPath);
            return { success: false, message: `El nombre "${name}" está reservado por el core del framework.` };
        } catch {
            // Name is free in core
        }

        // 2. Local Existence Check
        if (!force) {
            try {
                await fs.access(targetPath);
                return { success: false, message: `Ya existe un archivo local con el nombre "${name}" en .agent/${typeFolder}/.`, path: targetPath };
            } catch {
                // Name is free locally or we create it
            }
        }

        // 3. Create Scaffolding
        await fs.mkdir(targetDir, { recursive: true });

        let content = '';
        if (type === 'role') {
            content = `---
id: role.${name}-agent
type: rule
owner: architect-agent
version: 1.0.0
severity: PERMANENT
scope: project
---

# ROLE: ${name}-agent

## Identidad
Eres el **${name}-agent**. Explica aquí tu propósito y especialidad.

## Reglas de ejecución (PERMANENT)
1. **Identificación Obligatoria**: DEBES iniciar TODAS tus respuestas con el prefijo: \`🤖 **${name}-agent**:\`.
2. (Añade aquí tus reglas específicas)

## Disciplina Agéntica (PERMANENT)
1. (Añade aquí tus principios de disciplina)
`;
        } else if (type === 'workflow') {
            content = `---
id: workflow.custom.${name}
description: Descripción de este workflow personalizado.
owner: architect-agent
version: 1.0.0
severity: RECOMMENDED
---

# WORKFLOW: ${name}

## Input (REQUIRED)
- Requisitos previos

## Pasos obligatorios
1. Paso uno
2. Paso dos

## Output (REQUIRED)
- Resultado esperado
`;
        }

        await fs.writeFile(targetPath, content);
        return { success: true, message: `${name} creado correctamente en .agent/${typeFolder}/`, path: targetPath };

    } catch (error) {
        return { success: false, message: `Error durante la creación: ${error instanceof Error ? error.message : String(error)}` };
    }
}

/**
 * Comando del CLI con interfaz visual Clack.
 */
import { select, text, isCancel, cancel } from '@clack/prompts';

export async function createCommand(type: string, name: string) {
    intro(`Creating New ${type}: ${name}`);

    const s = spinner();
    s.start('Validating...');

    // Intentamos crear primero
    let result = await performCreate(type, name);
    s.stop('Validation complete.');

    // Si hay conflicto, gestionamos interactivamente
    if (!result.success && result.message.includes('reservado')) {
        const action = await select({
            message: `El nombre "${name}" está en uso por el CORE. ¿Qué deseas hacer?`,
            options: [
                { value: 'rename', label: 'Renombrar (ej: custom-neo)' },
                { value: 'abort', label: 'Cancelar operación' }
            ],
        });

        if (isCancel(action) || action === 'abort') {
            cancel('Operación cancelada.');
            return process.exit(0);
        }

        if (action === 'rename') {
            const newName = await text({
                message: 'Introduce el nuevo nombre:',
                placeholder: `custom-${name}`,
                validate(value) {
                    if (value.trim().length === 0) return 'El nombre no puede estar vacío';
                    return;
                },
            });

            if (isCancel(newName)) {
                cancel('Operación cancelada.');
                return process.exit(0);
            }

            s.start('Creating with new name...');
            result = await performCreate(type, newName as string);
            s.stop('Done.');
        }
    } else if (!result.success && result.message.includes('Ya existe')) {
        const action = await select({
            message: `El archivo local "${name}" ya existe. ¿Qué deseas hacer?`,
            options: [
                { value: 'overwrite', label: 'Sobrescribir archivo existente' },
                { value: 'rename', label: 'Renombrar nuevo archivo' },
                { value: 'abort', label: 'Cancelar' }
            ],
        });

        if (isCancel(action) || action === 'abort') {
            cancel('Operación cancelada.');
            return process.exit(0);
        }

        if (action === 'overwrite') {
            s.start('Overwriting...');
            // Forzamos borrado previo (hack simple, idealmente performCreate aceptaría flag force)
            const targetPath = result.path || ''; // El path venía undefined en error, necesitamos reconstruirlo o pasar flag
            // Reinvocamos performCreate asumiendo que el usuario ya sabe lo que hace.
            // Para "force", actualizaremos performCreate o simplemente borramos aquí si tuvieramos el path.
            // MEJORA: Pasaremos un flag de 'force' a performCreate.
            result = await performCreate(type, name, true);
            s.stop('Done.');
        } else if (action === 'rename') {
            const newName = await text({
                message: 'Introduce el nuevo nombre:',
                validate(value) {
                    if (value.trim().length === 0) return 'Required';
                },
            });
            if (isCancel(newName)) {
                cancel('Operación cancelada.');
                return process.exit(0);
            }
            s.start('Creating...');
            result = await performCreate(type, newName as string);
            s.stop('Done.');
        }
    }

    if (result.success) {
        note('Recuerda registrarlo en el índice local si deseas usar un alias.', 'Siguiente Paso');
        outro(result.message);
    } else {
        note(result.message, 'Error');
        outro('Proceso finalizado con errores.');
    }
}
