import { intro, outro, spinner, confirm, note } from '@clack/prompts';
import fs from 'node:fs/promises';
import path from 'node:path';
import { detectAgentSystem } from '../../core/migration/detector.js';
import { resolveCorePath, resolveInstalledCorePath } from '../../core/mapping/resolver.js';
import { performBackup } from '../../core/utils/backup.js';

export async function initCommand(options: { nonInteractive?: boolean } = {}) {
  intro('Agentic Workflow Initialization');

  const cwd = process.cwd();
  const agentDir = path.join(cwd, '.agent');
  const nonInteractive = Boolean(options.nonInteractive);

  // 1. Existing System Detection
  const systemType = await detectAgentSystem(cwd);

  if (systemType === 'legacy') {
    const shouldUpdate = nonInteractive
      ? true
      : await confirm({
          message: 'A legacy .agent system has been detected. Do you want to migrate it to the latest portable version?',
        });

    if (!shouldUpdate || typeof shouldUpdate === 'symbol') {
      outro('Initialization cancelled by user.');
      return;
    }

    const sBackup = spinner();
    sBackup.start('Creating backup...');
    const resultBackup = await performBackup(cwd);
    if (resultBackup) {
      sBackup.stop(`Backup created at: ${path.relative(cwd, resultBackup)}`);
    } else {
      sBackup.stop('No backup was required.');
    }
  } else if (systemType === 'current') {
    note('The system is already updated to the latest version.', 'Information');
    const reinit = nonInteractive
      ? true
      : await confirm({
          message: 'Do you want to force a re-initialization by reference? (A backup will be created)',
        });
    if (!reinit || typeof reinit === 'symbol') {
      outro('Process finished.');
      return;
    }
    const sBackup = spinner();
    sBackup.start('Creating backup...');
    const resultBackup = await performBackup(cwd);
    sBackup.stop(`Backup created at: ${path.relative(cwd, resultBackup)}`);
  }

  // 2. Cleanup Legacy Files (Enforce Purity)
  const sCleanup = spinner();
  sCleanup.start('Cleaning up legacy environment...');
  await cleanupLegacyMcpConfig(cwd);
  sCleanup.stop('Local environment cleaned.');

  const s = spinner();
  s.start('Scaffolding .agent (core referenced from node_modules)...');

  try {
    // Resolve absolute path to core package in node_modules
    const corePath = (await resolveInstalledCorePath(cwd)) ?? await resolveCorePath();

    // Replace existing .agent with a clean scaffold
    await fs.rm(agentDir, { recursive: true, force: true });
    await fs.mkdir(agentDir, { recursive: true });

    await scaffoldAgentWorkspace(corePath, agentDir, cwd);

    s.stop('Configuration complete.');

    note(`Core located at: ${corePath}\nLocal .agent scaffold created; core stays in node_modules.`, 'Installed');

    outro('Agentic System initialized successfully.');

  } catch (error) {
    s.stop('Initialization failed.');
    console.error(error);
    process.exit(1);
  }
}
/**
 * Removes legacy MCP configuration if present.
 */
async function cleanupLegacyMcpConfig(cwd: string) {
  const mcpConfigPath = path.join(cwd, '.antigravity', 'task_mcp_config.json');
  try {
    await fs.rm(mcpConfigPath, { force: true });
    const mcpDir = path.join(cwd, '.antigravity');
    await fs.rmdir(mcpDir);
  } catch {
    // Ignore if missing or not removable.
  }
}

function normalizeRelativePath(p: string): string {
  const posixPath = p.split(path.sep).join('/');
  return posixPath.length === 0 ? '.' : posixPath;
}

async function scaffoldAgentWorkspace(corePath: string, agentDir: string, cwd: string) {
  const coreRoot = normalizeRelativePath(path.relative(cwd, corePath));
  const coreIndex = path.posix.join(coreRoot, 'index.md');
  const coreRulesIndex = path.posix.join(coreRoot, 'rules/index.md');
  const coreWorkflowsIndex = path.posix.join(coreRoot, 'workflows/index.md');
  const coreTemplatesIndex = path.posix.join(coreRoot, 'templates/index.md');
  const coreArtifactsIndex = path.posix.join(coreRoot, 'artifacts/index.md');

  const rootIndex = `---
id: agent.index
owner: architect-agent
version: 1.0.0
severity: PERMANENT
description: Punto de entrada global del sistema .agent (core referenciado desde node_modules).
---

# INDEX — .agent (Root)

## Objetivo
Este fichero define los dominios principales del sistema \`.agent\` y referencia el core instalado.
Las extensiones locales viven en \`.agent/*\` y no duplican ficheros del core.

## Patron de indices y alias
- Primero cargar el Root Index local.
- Los dominios principales apuntan al core instalado (node_modules).
- Los \`local_index\` son para extensiones del proyecto.

## Aliases (YAML)
\`\`\`yaml
agent:
  version: 1.0.0
  core:
    root: ${coreRoot}
    index: ${coreIndex}

  domains:
    workflows:
      index: ${coreWorkflowsIndex}
      local_index: .agent/workflows/index.md

    artifacts:
      index: ${coreArtifactsIndex}
      local_index: .agent/artifacts/index.md

    templates:
      index: ${coreTemplatesIndex}
      local_index: .agent/templates/index.md

    rules:
      index: ${coreRulesIndex}
      local_index: .agent/rules/index.md
\`\`\`
`;

  const rulesIndex = `---
id: rules.local.index
owner: architect-agent
version: 1.0.0
severity: RECOMMENDED
---

# INDEX — Rules (Local)

## Objetivo
Indice local para reglas personalizadas del proyecto. No duplicar reglas del core.

## Aliases (YAML)
\`\`\`yaml
rules:
  local:
    constitution:
      index: .agent/rules/constitution/index.md
    roles:
      index: .agent/rules/roles/index.md
\`\`\`
`;

  const rulesConstitutionIndex = `---
id: rules.constitution.local.index
owner: architect-agent
version: 1.0.0
severity: RECOMMENDED
---

# INDEX — Rules / Constitution (Local)

## Objetivo
Indice local de constituciones del proyecto. No duplicar reglas del core.

## Aliases (YAML)
\`\`\`yaml
constitution: {}
\`\`\`
`;

  const rulesRolesIndex = `---
id: rules.roles.local.index
owner: architect-agent
version: 1.0.0
severity: RECOMMENDED
---

# INDEX — Rules / Roles (Local)

## Objetivo
Indice local de roles del proyecto. No duplicar roles del core.

## Aliases (YAML)
\`\`\`yaml
roles: {}
\`\`\`
`;

  const workflowsIndex = `---
id: workflows.local.index
owner: architect-agent
version: 1.0.0
severity: RECOMMENDED
---

# INDEX — Workflows (Local)

## Objetivo
Indice local de workflows del proyecto. No duplicar workflows del core.

## Aliases (YAML)
\`\`\`yaml
workflows: {}
\`\`\`
`;

  const templatesIndex = `---
id: templates.local.index
owner: architect-agent
version: 1.0.0
severity: RECOMMENDED
---

# INDEX — Templates (Local)

## Objetivo
Indice local de templates del proyecto. No duplicar templates del core.

## Aliases (YAML)
\`\`\`yaml
templates: {}
\`\`\`
`;

  const artifactsIndex = `---
id: artifacts.local.index
owner: architect-agent
version: 1.0.0
severity: RECOMMENDED
---

# INDEX — Artifacts (Local)

## Objetivo
Indice local de artifacts generados por el proyecto.

## Aliases (YAML)
\`\`\`yaml
artifacts:
  local:
    dir: .agent/artifacts
    candidate: .agent/artifacts/candidate
\`\`\`
`;

  const dirs = [
    'rules',
    'rules/constitution',
    'rules/roles',
    'workflows',
    'templates',
    'artifacts',
    'artifacts/candidate',
  ];

  for (const dir of dirs) {
    await fs.mkdir(path.join(agentDir, dir), { recursive: true });
  }

  await Promise.all([
    fs.writeFile(path.join(agentDir, 'index.md'), rootIndex),
    fs.writeFile(path.join(agentDir, 'rules', 'index.md'), rulesIndex),
    fs.writeFile(path.join(agentDir, 'rules', 'constitution', 'index.md'), rulesConstitutionIndex),
    fs.writeFile(path.join(agentDir, 'rules', 'roles', 'index.md'), rulesRolesIndex),
    fs.writeFile(path.join(agentDir, 'workflows', 'index.md'), workflowsIndex),
    fs.writeFile(path.join(agentDir, 'templates', 'index.md'), templatesIndex),
    fs.writeFile(path.join(agentDir, 'artifacts', 'index.md'), artifactsIndex),
  ]);
}
