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
            const constitutions = ['GEMINI.location.md', 'project-architecture.md', 'clean-code.md', 'agent-system.md'];
            for (const c of constitutions) {
                const p = path.join(this.corePath, 'rules/constitution', c);
                if (await this.exists(p)) {
                    files.push(await this.readFile(p, `constitution.${c.replace('.md', '')}`));
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

    /**
     * Crea un bundle de inicialización (Bootstrap) siguiendo las Best Practices.
     */
    async bootstrapContext(): Promise<string> {
        const files: ContextFile[] = [];

        // 1. Índice Maestro Local
        const localIndex = path.join(this.projectRoot, '.agent/index.md');
        files.push(await this.readFile(localIndex, 'agent.index'));

        // 2. Local Domain Indexes (client-defined)
        const localRulesIndex = path.join(this.projectRoot, '.agent/rules/index.md');
        const localRolesIndex = path.join(this.projectRoot, '.agent/rules/roles/index.md');
        const localWorkflowsIndex = path.join(this.projectRoot, '.agent/workflows/index.md');
        const localArtifactsIndex = path.join(this.projectRoot, '.agent/artifacts/index.md');
        const localTemplatesIndex = path.join(this.projectRoot, '.agent/templates/index.md');

        if (await this.exists(localRulesIndex)) files.push(await this.readFile(localRulesIndex, 'agent.local.rules'));
        if (await this.exists(localRolesIndex)) files.push(await this.readFile(localRolesIndex, 'agent.local.roles'));
        if (await this.exists(localWorkflowsIndex)) files.push(await this.readFile(localWorkflowsIndex, 'agent.local.workflows'));
        if (await this.exists(localArtifactsIndex)) files.push(await this.readFile(localArtifactsIndex, 'agent.local.artifacts'));
        if (await this.exists(localTemplatesIndex)) files.push(await this.readFile(localTemplatesIndex, 'agent.local.templates'));

        const localBundle = this.formatBundle(files, true);

        // Use prebuilt core bootstrap bundle only (no dynamic fallback).
        const coreBootstrapPath = path.join(this.corePath, 'bootstrap.md');
        if (!(await this.exists(coreBootstrapPath))) {
            throw new Error('No se encontró bootstrap.md en el core. Ejecuta el build para generarlo.');
        }

        const coreBundle = await fs.readFile(coreBootstrapPath, 'utf-8');
        return `${localBundle}\n\n---\n\n${coreBundle}`.trim();
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
            if (!file.content.endsWith('\n')) bundle += '\n';
            bundle += "```\n\n---\n\n";
        }

        // 2. Siguientes Pasos / Discovery (Best Practice)
        if (isBootstrap) {
            bundle += "## SIGUIENTES PASOS (DISCOVERY)\n";
            bundle += "El sistema está inicializado. Puedes profundizar en dominios específicos usando:\n";
            bundle += "- `tool: hydrate_context({ alias: \"agent.core.rules\" })` para cargar todas las reglas.\n";
            bundle += "- `tool: hydrate_context({ alias: \"agent.core.workflows\" })` para ver procesos disponibles.\n";
        }

        return bundle;
    }
}
