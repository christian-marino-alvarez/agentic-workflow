#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from '../dist/cli/commands/init.js';
import { createCommand } from '../dist/cli/commands/create.js';
import { restoreCommand } from '../dist/cli/commands/restore.js';
import { cleanCommand } from '../dist/cli/commands/clean.js';
import { mcpCommand } from '../dist/cli/commands/mcp.js';
import { registerMcpCommand } from '../dist/cli/commands/register-mcp.js';

const program = new Command();

program
  .name('agentic-workflow')
  .description('Portable agentic orchestration system')
  .version('1.24.0-beta.3');

program
  .command('init')
  .description('Initialize the agentic system in the current directory')
  .option('--non-interactive', 'Run without prompts (assume YES)')
  .option('--start-mcp', 'Start MCP server after initialization (foreground)')
  .action((options) => initCommand(options));

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
  .action(() => mcpCommand());

program
  .command('register-mcp')
  .description('Register MCP server in Gemini CLI (Antigravity) and/or Codex CLI')
  .action(() => registerMcpCommand());

program.parse();

