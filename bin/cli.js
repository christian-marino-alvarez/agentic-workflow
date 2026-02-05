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

function checkDevEnvironment() {
  try {
    const cwd = process.cwd();
    const pkgPath = join(cwd, 'package.json');
    // Check if we are in the repo
    const cwdPkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    if (cwdPkg.name === '@christianmaf80/agentic-workflow') {
      // We are in the repo. Check if we are running the local binary.
      // __filename is the absolute path of the executing script.
      if (!__filename.startsWith(cwd)) {
        console.warn('\x1b[33m%s\x1b[0m', '--------------------------------------------------------------------------------');
        console.warn('\x1b[33m%s\x1b[0m', '⚠️  WARNING: DEVELOPMENT ENVIRONMENT DETECTED');
        console.warn('\x1b[33m%s\x1b[0m', '   You are running a global/external version of agentic-workflow inside the source repo.');
        console.warn('\x1b[33m%s\x1b[0m', '   This may cause version mismatches (missing MCP tools, etc).');
        console.warn('\x1b[33m%s\x1b[0m', '   PLEASE RUN: npm run dev:setup');
        console.warn('\x1b[33m%s\x1b[0m', '--------------------------------------------------------------------------------');
      }
    }
  } catch (e) {
    // Ignore errors (e.g. no package.json in cwd), just proceed.
  }
}
checkDevEnvironment();

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
