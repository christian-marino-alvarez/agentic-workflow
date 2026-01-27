#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from '../dist/agentic-system-structure/cli/commands/init.js';
import { createCommand } from '../dist/agentic-system-structure/cli/commands/create.js';
import { restoreCommand } from '../dist/agentic-system-structure/cli/commands/restore.js';
import { cleanCommand } from '../dist/agentic-system-structure/cli/commands/clean.js';

const program = new Command();

program
    .name('agentic-workflow')
    .description('Portable agentic orchestration system')
    .version('1.0.0');

program
    .command('init')
    .description('Initialize the agentic system in the current directory')
    .option('--non-interactive', 'Run without prompts (assume YES)')
    .action((options) => initCommand(options));

program
    .command('create')
    .argument('<type>', 'The type of element to create (role, workflow)')
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

program.parse();
