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
  s.start('Installing Agentic Core into .agent...');

  try {
    // Resolve absolute path to core package in node_modules
    const corePath = (await resolveInstalledCorePath(cwd)) ?? await resolveCorePath();

    // Replace existing .agent with a clean install from core
    await fs.rm(agentDir, { recursive: true, force: true });
    await fs.mkdir(agentDir, { recursive: true });

    await copyCoreToAgent(corePath, agentDir);

    s.stop('Configuration complete.');

    note(`Core located at: ${corePath}\nCore files installed into .agent.`, 'Installed');

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

async function copyCoreToAgent(corePath: string, agentDir: string) {
  const entries = [
    'index.md',
    'rules',
    'workflows',
    'templates',
    'artifacts',
  ];

  for (const entry of entries) {
    const srcPath = path.join(corePath, entry);
    const destPath = path.join(agentDir, entry);
    try {
      await fs.cp(srcPath, destPath, { recursive: true });
    } catch {
      // Skip missing entries in core.
    }
  }
}
