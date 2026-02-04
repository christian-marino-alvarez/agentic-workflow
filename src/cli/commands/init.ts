import { intro, outro, spinner, confirm, note } from '@clack/prompts';
import fs from 'node:fs/promises';
import path from 'node:path';
import { detectAgentSystem } from '../../infrastructure/migration/detector.js';
import {
  resolveCorePath,
  resolveInstalledCorePath
} from '../../infrastructure/mapping/resolver.js';
import { performBackup } from '../../infrastructure/utils/backup.js';
import { startMcpServer } from '../../mcp/server.js';

export async function initCommand(options: { nonInteractive?: boolean; startMcp?: boolean } = {}) {
  intro('Agentic Workflow Initialization');

  const cwd = process.cwd();
  const agentDir = path.join(cwd, '.agent');
  const nonInteractive = Boolean(options.nonInteractive);
  const startMcp = Boolean(options.startMcp);

  // 1. Existing System Detection
  const systemType = await detectAgentSystem(cwd);

  if (systemType === 'legacy') {
    await removeLegacyInitCandidates(cwd);
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
        message: 'Do you want to force a re-initialization? (A backup will be created)',
      });
    if (!reinit || typeof reinit === 'symbol') {
      outro('Process finished.');
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
  }

  // 2. Cleanup Legacy Files (Enforce Purity)
  const sCleanup = spinner();
  sCleanup.start('Cleaning up legacy environment...');
  await cleanupLegacyMcpConfig(cwd);
  sCleanup.stop('Local environment cleaned.');

  const s = spinner();
  s.start('Scaffolding .agent (core copied locally)...');

  try {
    // Resolve absolute path to core package for local copy
    const corePath = (await resolveInstalledCorePath(cwd)) ?? await resolveCorePath();

    // Replace existing .agent with a clean scaffold
    await fs.rm(agentDir, { recursive: true, force: true });
    await fs.mkdir(agentDir, { recursive: true });

    await scaffoldAgentWorkspace(corePath, agentDir);
    await writeAgentsEntry(cwd);
    await fs.mkdir(path.join(cwd, '.backups'), { recursive: true });

    s.stop('Configuration complete.');

    note(`Core copied from: ${corePath}\nLocal .agent created with full core files.`, 'Installed');

    outro('Agentic System initialized successfully.');

    if (startMcp) {
      note('Starting MCP server (foreground)...', 'MCP');
      await startMcpServer();
    }

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

async function scaffoldAgentWorkspace(corePath: string, agentDir: string) {
  const entries = ['rules', 'workflows', 'templates', 'artifacts'];
  await Promise.all(
    entries.map(async (entry) => {
      const srcPath = path.join(corePath, entry);
      const destPath = path.join(agentDir, entry);
      await fs.cp(srcPath, destPath, { recursive: true });
    })
  );
  await fs.copyFile(path.join(corePath, 'index.md'), path.join(agentDir, 'index.md'));
  await fs.mkdir(path.join(agentDir, 'artifacts', 'candidate'), { recursive: true });
}

async function writeAgentsEntry(cwd: string) {
  const agentsPath = path.join(cwd, 'AGENTS.md');
  const content = `# AGENTS

Este fichero es el punto de entrada para asistentes del IDE.
Solo define el arranque del sistema mediante el workflow \`init\`.

## Arranque (OBLIGATORIO)
1. Leer \`.agent/index.md\` (root index local).
2. Cargar el indice de workflows en \`agent.domains.workflows.index\`.
3. Cargar \`workflows.init\`.
4. Ejecutar el workflow \`init\` y seguir sus Gates.
`;

  await fs.writeFile(agentsPath, content);
}

async function removeLegacyInitCandidates(cwd: string) {
  const legacyInitPath = path.join(cwd, '.agent', 'artifacts', 'candidate', 'init.md');
  try {
    await fs.access(legacyInitPath);
  } catch {
    return;
  }

  try {
    await fs.rm(legacyInitPath);
  } catch {
    const command = `rm -f \"${legacyInitPath}\"`;
    throw new Error(`No se pudo eliminar init.md legacy. Ejecuta: ${command} y reintenta init.`);
  }
}
