import { intro, outro, spinner, note } from '@clack/prompts';
import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveCorePath, resolveInstalledCorePath } from '../../core/mapping/resolver.js';

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
        const corePath = (await resolveInstalledCorePath(cwd)) ?? await resolveCorePath();
        const coreTypeFolder = type === 'role' ? 'rules/roles' : type === 'workflow' ? 'workflows' : 'templates';
        const reservedPath = path.join(corePath, coreTypeFolder, `${name}.md`);

        // 1. Reserved Namespace Check
        try {
            await fs.access(reservedPath);
            return { success: false, message: `The name "${name}" is reserved by the core framework.` };
        } catch {
            // Name is free in core
        }

        // 2. Local Existence Check
        if (!force) {
            try {
                await fs.access(targetPath);
                return { success: false, message: `A local file named "${name}" already exists in .agent/${typeFolder}/.`, path: targetPath };
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

## Identity
You are the **${name}-agent**. Explain your purpose and specialty here.

## Execution Rules (PERMANENT)
1. **Mandatory Identification**: You MUST start ALL your responses with the prefix: \`🤖 **${name}-agent**:\`.
2. (Add your specific rules here)

## Agentic Discipline (PERMANENT)
1. (Add your discipline principles here)
`;
        } else if (type === 'workflow') {
            content = `---
id: workflow.custom.${name}
description: Description of this custom workflow.
owner: architect-agent
version: 1.0.0
severity: RECOMMENDED
---

# WORKFLOW: ${name}

## Input (REQUIRED)
- Pre-requisites

## Mandatory Steps
1. Step one
2. Step two

## Output (REQUIRED)
- Expected result
`;
        }

        await fs.writeFile(targetPath, content);
        return { success: true, message: `${name} created successfully in .agent/${typeFolder}/`, path: targetPath };

    } catch (error) {
        return { success: false, message: `Error during creation: ${error instanceof Error ? error.message : String(error)}` };
    }
}

/**
 * CLI Command with Clack visual interface.
 */
import { select, text, isCancel, cancel } from '@clack/prompts';

export async function createCommand(type: string, name: string) {
    intro(`Creating New ${type}: ${name}`);

    const s = spinner();
    s.start('Validating...');

    // Try to create first
    let result = await performCreate(type, name);
    s.stop('Validation complete.');

    // Handle conflicts interactively
    if (!result.success && result.message.includes('reserved')) {
        const action = await select({
            message: `The name "${name}" is in use by the CORE. What do you want to do?`,
            options: [
                { value: 'rename', label: 'Rename (e.g., custom-neo)' },
                { value: 'abort', label: 'Cancel operation' }
            ],
        });

        if (isCancel(action) || action === 'abort') {
            cancel('Operation cancelled.');
            return process.exit(0);
        }

        if (action === 'rename') {
            const newName = await text({
                message: 'Enter the new name:',
                placeholder: `custom-${name}`,
                validate(value) {
                    if (value.trim().length === 0) return 'Name cannot be empty';
                    return;
                },
            });

            if (isCancel(newName)) {
                cancel('Operation cancelled.');
                return process.exit(0);
            }

            s.start('Creating with new name...');
            result = await performCreate(type, newName as string);
            s.stop('Done.');
        }
    } else if (!result.success && result.message.includes('already exists')) {
        const action = await select({
            message: `The local file "${name}" already exists. What do you want to do?`,
            options: [
                { value: 'overwrite', label: 'Overwrite existing file' },
                { value: 'rename', label: 'Rename new file' },
                { value: 'abort', label: 'Cancel' }
            ],
        });

        if (isCancel(action) || action === 'abort') {
            cancel('Operation cancelled.');
            return process.exit(0);
        }

        if (action === 'overwrite') {
            s.start('Overwriting...');
            result = await performCreate(type, name, true);
            s.stop('Done.');
        } else if (action === 'rename') {
            const newName = await text({
                message: 'Enter the new name:',
                validate(value) {
                    if (value.trim().length === 0) return 'Required';
                },
            });
            if (isCancel(newName)) {
                cancel('Operation cancelled.');
                return process.exit(0);
            }
            s.start('Creating...');
            result = await performCreate(type, newName as string);
            s.stop('Done.');
        }
    }

    if (result.success) {
        note('Remember to register it in the local index if you want to use an alias.', 'Next Step');
        outro(result.message);
    } else {
        note(result.message, 'Error');
        outro('Process finished with errors.');
    }
}
