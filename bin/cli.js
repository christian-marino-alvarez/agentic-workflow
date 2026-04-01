#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from '../dist/cli/commands/init.js';
import { scaffoldCommand } from '../dist/cli/commands/scaffold.js';
import { forkCommand } from '../dist/cli/commands/fork.js';
import { createCommand } from '../dist/cli/commands/create.js';
import { restoreCommand } from '../dist/cli/commands/restore.js';
import { cleanCommand } from '../dist/cli/commands/clean.js';
import { mcpCommand } from '../dist/cli/commands/mcp.js';

const program = new Command();

program
    .name('agentic-workflow')
    .description('Portable agentic orchestration system')
    .version('1.0.0')
    .option('-w, --workspace <path>', 'Specify the workspace directory')
    .hook('preAction', (thisCommand) => {
        const workspace = thisCommand.opts().workspace;
        if (workspace) {
            process.chdir(workspace);
        }
    });

program
    .command('init')
    .description('Initialize the agentic system in the current directory')
    .option('--non-interactive', 'Run without prompts (assume YES)')
    .option('--start-mcp', 'Start MCP server after initialization (foreground)')
    .action((options) => initCommand(options));

program
    .command('create')
    .argument('<type>', 'The type of element to create (role, workflow)')
    .argument('<name>', 'The name for the new element')
    .description('Scaffold a new project-specific element')
    .action(createCommand);

program
    .command('scaffold <directory>')
    .description('Scaffold the agentic system into a custom directory name (instead of .agent)')
    .option('--non-interactive', 'Run without prompts (assume YES)')
    .action((directory, options) => scaffoldCommand(directory, options));

program
    .command('fork <directory>')
    .description('Clone the entire Agentic Workflow framework source code to build an independent fork')
    .action((directory) => forkCommand(directory));

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

program.parse();
