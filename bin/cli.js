#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from '../dist/cli/commands/init.js';
import { createCommand } from '../dist/cli/commands/create.js';
import { restoreCommand } from '../dist/cli/commands/restore.js';

const program = new Command();

program
    .name('agentic-workflow')
    .description('Portable agentic orchestration system')
    .version('1.0.0');

program
    .command('init')
    .description('Initialize the agentic system in the current directory')
    .action(initCommand);

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

program.parse();
