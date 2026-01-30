import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

export interface ContextFile {
    path: string;
    content: string;
    alias?: string;
}

export class ContextManager {
    constructor(private projectRoot: string, private corePath: string) { }

    /**
     * Resuelve un alias (ej: 'rules.constitution') a un conjunto de ficheros.
     */
    async resolveAlias(aliasPath: string): Promise<ContextFile[]> {
        const parts = aliasPath.split('.');
        let currentPath = path.join(this.projectRoot, '.agent/index.md');
        let currentContext: any = null;

        // Si el alias empieza por 'agent.core', saltamos al core
        if (aliasPath.startsWith('agent.core')) {
            currentPath = path.join(this.corePath, 'index.md');
        }

        const files: ContextFile[] = [];

        // Esta es una implementación simplificada que busca en los índices conocidos
        // Para una implementación completa, se requeriría un crawler de YAML
        if (aliasPath.includes('constitution')) {
            const constitutions = [
                { file: 'GEMINI.location.md', alias: 'constitution.GEMINI_location' },
                { file: 'clean-code.md', alias: 'constitution.clean_code' },
                { file: 'agents-behavior.md', alias: 'constitution.agents_behavior' },
            ];
            for (const c of constitutions) {
                const p = path.join(this.corePath, 'rules/constitution', c.file);
                if (await this.exists(p)) {
                    files.push(await this.readFile(p, c.alias));
                }
            }
        } else if (aliasPath.includes('roles')) {
            const rolesDir = path.join(this.corePath, 'rules/roles');
            const roleFiles = await fs.readdir(rolesDir);
            for (const f of roleFiles) {
                if (f.endsWith('.md') && f !== 'index.md') {
                    files.push(await this.readFile(path.join(rolesDir, f), `roles.${f.replace('.md', '')}`));
                }
            }
        }

        return files;
    }


    private async readFile(filePath: string, alias: string): Promise<ContextFile> {
        const content = await fs.readFile(filePath, 'utf-8');
        return { path: filePath, content, alias };
    }

    private async exists(p: string): Promise<boolean> {
        try {
            await fs.access(p);
            return true;
        } catch {
            return false;
        }
    }

    public formatBundle(files: ContextFile[], isBootstrap: boolean = false): string {
        let bundle = isBootstrap ? "# BOOTSTRAP CONTEXT BUNDLE\n\n" : "# CONTEXT BUNDLE\n\n";

        // 1. Manifiesto de Carga (Best Practice)
        bundle += "## MANIFIESTO DE CARGA\n";
        bundle += "Este bundle contiene los siguientes dominios de contexto:\n";
        for (const file of files) {
            bundle += `- [x] \`${file.alias || path.basename(file.path)}\` (v1.0)\n`;
        }
        bundle += "\n---\n\n";

        for (const file of files) {
            bundle += `## FILE: ${file.alias || file.path}\n`;
            bundle += `Path: \`file://${file.path}\`\n\n`;
            bundle += "```markdown\n";
            bundle += file.content;
            if (!file.content.endsWith('\n')) {bundle += '\n';}
            bundle += "```\n\n---\n\n";
        }

        // 2. Siguientes Pasos / Discovery (Best Practice)
        if (isBootstrap) {
            bundle += "## SIGUIENTES PASOS (DISCOVERY)\n";
            bundle += "El sistema está inicializado. Puedes profundizar en dominios específicos usando:\n";
            bundle += "- `tool: hydrate_context({ alias: \"agent.domains.rules.index\" })` para cargar reglas disponibles.\n";
            bundle += "- `tool: hydrate_context({ alias: \"agent.domains.workflows.index\" })` para ver workflows disponibles.\n";
        }

        return bundle;
    }
}
