import { intro, outro, spinner, confirm, note } from '@clack/prompts';
import fs from 'node:fs/promises';
import path from 'node:path';
import { detectAgentSystem } from '../../core/migration/detector.js';
import { createBackup } from '../../core/migration/backup.js';
import { transformMarkdownContent } from '../../core/migration/transformer.js';
import { resolveCorePath, resolveInstalledCorePath } from '../../core/mapping/resolver.js';
import { performBackup } from '../../core/utils/backup.js';

export async function initCommand() {
  intro('Agentic Workflow Initialization');

  const cwd = process.cwd();
  const agentDir = path.join(cwd, '.agent');

  // 1. Existing System Detection
  const systemType = await detectAgentSystem(cwd);

  if (systemType === 'legacy') {
    const shouldUpdate = await confirm({
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
    const reinit = await confirm({
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
  sCleanup.start('Cleaning up redundant legacy core files...');
  await cleanupLegacyFiles(agentDir);
  await cleanupLegacyMcpConfig(cwd);
  sCleanup.stop('Local environment cleaned (Core references only).');

  const s = spinner();
  s.start('Configuring Agentic Core Reference...');

  try {
    // Resolve absolute path to core package in node_modules
    const corePath = (await resolveInstalledCorePath(cwd)) ?? await resolveCorePath();

    // 1. Create .agent structure (Only project-specific directories)
    await fs.mkdir(agentDir, { recursive: true });

    // Create mirror directories (empty by default)
    const mirrorDirs = ['rules/roles', 'rules/constitution', 'workflows', 'templates', 'artifacts', 'metrics'];
    for (const dir of mirrorDirs) {
      await fs.mkdir(path.join(agentDir, dir), { recursive: true });
    }

    // 2. Create Root Index with ABSOLUTE references to Core
    const indexContent = transformMarkdownContent(`# INDEX — .agent (Root)

## Objective
Global entry point for the agentic system. It uses absolute references to the core to ensure immutability and ease of update.

## Aliases (YAML)
\`\`\`yaml
agent:
  core:
    root: "${corePath}"
    bootstrap: "${path.join(corePath, 'bootstrap.md')}"
    artifacts: "${path.join(corePath, 'artifacts/index.md')}"
    rules: "${path.join(corePath, 'rules/index.md')}"
    workflows: "${path.join(corePath, 'workflows/index.md')}"
    templates: "${path.join(corePath, 'templates/index.md')}"
  
  domains:
    workflows:
      index: .agent/workflows/index.md
    artifacts:
      index: .agent/artifacts/index.md
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
    await fs.writeFile(path.join(agentDir, 'rules', 'index.md'), '# LOCAL RULES\n\nYou can add project-specific rules here.');
    await fs.writeFile(path.join(agentDir, 'rules', 'constitution', 'index.md'), '# LOCAL CONSTITUTION\n\nYou can add project-specific constitutions here.');
    await fs.writeFile(path.join(agentDir, 'rules', 'roles', 'index.md'), '# LOCAL ROLES\n\nYou can add custom roles here (e.g., neo-agent).');
    await fs.writeFile(path.join(agentDir, 'workflows', 'index.md'), '# LOCAL WORKFLOWS\n\nYou can add your own custom workflows here.');
    await fs.writeFile(path.join(agentDir, 'artifacts', 'index.md'), '# LOCAL ARTIFACTS\n\nYou can add custom artifact aliases here.');

    // 4. Create AGENTS.md (The "Portal" for IDE Agents)
    const agentsMdContent = `# AGENTS

This project uses the **Portable Agentic Workflow** framework.

## Getting Started
To initialize the agentic session, the agent MUST first read the index files:
1. Read the master index: \`.agent/index.md\`
2. Follow the Core references in \`node_modules\` described in that index.

## Main Workflow
Execute the core initialization workflow:
- \`${path.join(corePath, 'workflows/init.md')}\`

## Rules and Discipline
The core rules reside at:
- \`${path.join(corePath, 'rules/index.md')}\`
`;
    await fs.writeFile(path.join(cwd, 'AGENTS.md'), agentsMdContent);

    s.stop('Configuration complete.');

    note(`Core located at: ${corePath}\nAbsolute references have been configured for the IDE.`, 'Architecture by Reference');

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
