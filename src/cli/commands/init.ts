import { intro, outro, spinner, confirm, note } from '@clack/prompts';
import fs from 'node:fs/promises';
import path from 'node:path';
import { detectAgentSystem } from '../../core/migration/detector.js';
import { createBackup } from '../../core/migration/backup.js';
import { transformMarkdownContent } from '../../core/migration/transformer.js';
import { resolveCorePath } from '../../core/mapping/resolver.js';
import { performBackup } from '../../core/utils/backup.js';

export async function initCommand() {
  intro('Agentic Workflow Initialization');

  const cwd = process.cwd();
  const agentDir = path.join(cwd, '.agent');

  // 1. Detección de sistema existente
  const systemType = await detectAgentSystem(cwd);

  if (systemType === 'legacy') {
    const shouldUpdate = await confirm({
      message: 'Se ha detectado un sistema .agent antiguo. ¿Deseas migrarlo a la última versión portable?',
    });

    if (!shouldUpdate || typeof shouldUpdate === 'symbol') {
      outro('Inicialización cancelada por el usuario.');
      return;
    }

    const sBackup = spinner();
    sBackup.start('Creando copia de seguridad...');
    const resultBackup = await performBackup(cwd);
    if (resultBackup) {
      sBackup.stop(`Backup creado en: ${path.relative(cwd, resultBackup)}`);
    } else {
      sBackup.stop('No se requería backup.');
    }
  } else if (systemType === 'current') {
    note('El sistema ya está actualizado a la última versión.', 'Información');
    const reinit = await confirm({
      message: '¿Deseas forzar una reinicialización por referencia? (Se creará backup)',
    });
    if (!reinit || typeof reinit === 'symbol') {
      outro('Proceso finalizado.');
      return;
    }
    const sBackup = spinner();
    sBackup.start('Creando copia de seguridad...');
    const resultBackup = await performBackup(cwd);
    sBackup.stop(`Backup creado en: ${path.relative(cwd, resultBackup)}`);
  }

  // 2. Cleanup Legacy Files (Enforce Purity)
  const sCleanup = spinner();
  sCleanup.start('Cleaning up redundant legacy core files...');
  await cleanupLegacyFiles(agentDir);
  sCleanup.stop('Local environment cleaned (Core references only).');

  const s = spinner();
  s.start('Configuring Agentic Core Reference...');

  try {
    // Resolve absolute path to core package in node_modules
    const corePath = await resolveCorePath();

    // 1. Create .agent structure (Only project-specific directories)
    await fs.mkdir(agentDir, { recursive: true });

    // Create mirror directories (empty by default)
    const mirrorDirs = ['rules/roles', 'workflows', 'templates', 'artifacts', 'metrics'];
    for (const dir of mirrorDirs) {
      await fs.mkdir(path.join(agentDir, dir), { recursive: true });
    }

    // 2. Create Root Index with ABSOLUTE references to Core
    const indexContent = transformMarkdownContent(`# INDEX — .agent (Root)

## Objetivo
Punto de entrada global del sistema agéntico. Utiliza referencias absolutas al core para garantizar inmutabilidad y facilidad de actualización.

## Aliases (YAML)
\`\`\`yaml
agent:
  core:
    root: "${corePath}"
    rules: "${path.join(corePath, 'rules/index.md')}"
    workflows: "${path.join(corePath, 'workflows/index.md')}"
    templates: "${path.join(corePath, 'templates/index.md')}"
  
  domains:
    workflows:
      index: .agent/workflows/index.md
    rules:
      index: .agent/rules/index.md
    roles:
      index: .agent/rules/roles/index.md
    templates:
      index: .agent/templates/index.md
\`\`\`
`, {
      id: 'agent.index',
      owner: 'architect-agent',
      version: '1.3.0',
      severity: 'PERMANENT',
      description: 'Core Reference System'
    });
    await fs.writeFile(path.join(agentDir, 'index.md'), indexContent);

    // 3. Create local domain indices (Proxy/Extension indices)
    await fs.writeFile(path.join(agentDir, 'rules', 'index.md'), '# LOCAL RULES\n\nAquí puedes añadir reglas específicas del proyecto.');
    await fs.writeFile(path.join(agentDir, 'rules', 'roles', 'index.md'), '# LOCAL ROLES\n\nAquí puedes añadir roles personalizados (ej: neo-agent).');
    await fs.writeFile(path.join(agentDir, 'workflows', 'index.md'), '# LOCAL WORKFLOWS\n\nAquí puedes añadir tus propios ciclos de trabajo.');

    // 4. Create AGENTS.md (The "Portal" for IDE Agents)
    const agentsMdContent = `# AGENTS

Este proyecto utiliza el framework **Portable Agentic Workflow**.

## Cómo empezar
Para inicializar la sesión agéntica, el agente DEBE leer primero los índices:
1. Lee el índice maestro: \`.agent/index.md\`
2. Sigue las referencias del Core en \`node_modules\` descritas en dicho índice.

## Workflow principal
Ejecuta el workflow de inicialización del core:
- \`${path.join(corePath, 'workflows/init.md')}\`

## Reglas y Disciplina
El núcleo de reglas reside en:
- \`${path.join(corePath, 'rules/index.md')}\`
`;
    await fs.writeFile(path.join(cwd, 'AGENTS.md'), agentsMdContent);

    s.stop('Configuration complete.');

    note(`Core localizado en: ${corePath}\nSe han configurado referencias absolutas para el IDE.`, 'Arquitectura por Referencia');

    outro('Agentic System initialized successfully\nYour core is now protected in node_modules.');

  } catch (error) {
    s.stop('Initialization failed.');
    console.error(error);
    process.exit(1);
  }
}
/**
 * Removes legacy core files that should now be consumed by reference.
 */
async function cleanupLegacyFiles(agentDir: string) {
  const coreFileNames = [
    // Roles
    'architect.md', 'qa.md', 'driver.md', 'researcher.md',
    'module.md', 'surface.md', 'tooling.md', 'neo.md',
    // Constitution
    'GEMINI.location.md', 'agent-system.md', 'agents-behavior.md',
    'clean-code.md', 'project-architecture.md', 'extensio-architecture.md',
    'drivers.md', 'modules.md', 'pages.md', 'shards.md',
    // Lifecycle Long
    'phase-0-acceptance-criteria.md', 'phase-1-research.md', 'phase-2-analysis.md',
    'phase-3-planning.md', 'phase-4-implementation.md', 'phase-5-verification.md',
    'phase-6-results-acceptance.md', 'phase-7-evaluation.md', 'phase-8-commit-push.md',
    // Lifecycle Short
    'short-phase-1-brief.md', 'short-phase-2-implementation.md', 'short-phase-3-closure.md',
    // Command specific
    'init.md', 'analysis.md', 'planning.md', 'verification.md',
    'results-acceptance.md', 'review.md', 'changelog.md',
    'subtask-implementation.md', 'supplemental-report.md', 'todo-item.md',
    // Templates
    'acceptance.md', 'agent-scores.md', 'agent-task.md', 'brief.md', 'closure.md',
    'driver-create.md', 'driver-delete.md', 'driver-refactor.md',
    'module-create.md', 'module-delete.md', 'module-refactor.md',
    'research.md', 'task-metrics.md', 'task.md',
    // Driver & Module Workflows
    'create.md', 'delete.md', 'refactor.md', 'pages.create.md', 'shards.create.md'
  ];

  const targetDirs = [
    'rules/roles',
    'rules/constitution',
    'workflows',
    'templates',
    'workflows/drivers',
    'workflows/modules',
    'workflows/tasklifecycle-long',
    'workflows/tasklifecycle-short'
  ];

  for (const relDir of targetDirs) {
    const dirPath = path.join(agentDir, relDir);
    try {
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) continue;

      const files = await fs.readdir(dirPath);
      for (const file of files) {
        // Never delete index files
        if (file === 'index.md') continue;

        // Delete if it matches a known core filename
        if (coreFileNames.includes(file)) {
          await fs.unlink(path.join(dirPath, file));
        }
      }
    } catch {
      // Directory doesn't exist, skip
    }
  }
}
