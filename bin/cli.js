#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initCommand } from '../dist/cli/commands/init.js';
import { createCommand } from '../dist/cli/commands/create.js';
import { restoreCommand } from '../dist/cli/commands/restore.js';
import { cleanCommand } from '../dist/cli/commands/clean.js';
import { mcpCommand } from '../dist/cli/commands/mcp.js';
import { registerMcpCommand } from '../dist/cli/commands/register-mcp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

program
  .name('agentic-workflow')
  .description('Portable agentic orchestration system')
  .version(pkg.version);

program
  .command('init')
  .description('Initialize the agentic system in the current directory')
  .option('--non-interactive', 'Run without prompts (assume YES)')
  .option('-y, --yes', 'Alias for --non-interactive')
  .option('--no-prompt', 'Alias for --non-interactive')
  .option('--workspace <path>', 'Workspace root (absolute path)')
  .option('--start-mcp', 'Start MCP server after initialization (foreground)')
  .action((options) => {
    const nonInteractive =
      Boolean(options.nonInteractive) ||
      Boolean(options.yes) ||
      options.prompt === false;
    return initCommand({ ...options, nonInteractive });
  });

program
  .command('create')
  .argument('<type>', 'The type of element to create (role, workflow, skill)')
  .argument('<name>', 'The name for the new element')
  .description('Scaffold a new project-specific element')
  .action(createCommand);

program
  .command('restore')
  .description('Restore the agentic system from a backup')
  .action(restoreCommand);

program
  .command('clean')
  .description('Remove legacy configuration files (e.g. MCP)')
  .action(cleanCommand);

program
  .command('mcp')
  .description('Start MCP runtime server (stdio)')
  .option('--workspace <path>', 'Workspace root (absolute path)')
  .action((options) => mcpCommand(options));

program
  .command('register-mcp')
  .description('Register MCP server in Gemini CLI (Antigravity) and/or Codex CLI')
  .action(() => registerMcpCommand());

program.parse();
