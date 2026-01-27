import fs from 'node:fs/promises';
import path from 'node:path';
import { intro, outro, spinner } from '@clack/prompts';

export async function cleanCommand() {
  intro('Agentic Workflow Cleanup');

  const cwd = process.cwd();
  const s = spinner();
  s.start('Removing legacy MCP config...');

  const mcpConfigPath = path.join(cwd, '.antigravity', 'task_mcp_config.json');
  try {
    await fs.rm(mcpConfigPath, { force: true });
  } catch {
    // Ignore if missing or not removable.
  }

  s.stop('Cleanup complete.');
  outro('Legacy MCP configuration removed.');
}
