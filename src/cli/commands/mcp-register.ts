import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveCorePath, resolveInstalledCorePath } from '../../core/mapping/resolver.js';

export async function registerMcpCommand(options: { path?: string }) {
  if (!options.path) {
    throw new Error('Missing --path. Provide the full path to the MCP config file.');
  }
  const configPath = options.path;

  await fs.mkdir(path.dirname(configPath), { recursive: true });

  const config = await readConfig(configPath);
  config.mcpServers = config.mcpServers ?? {};

  const corePath = (await resolveInstalledCorePath(process.cwd())) ?? await resolveCorePath();
  const binPath = path.join(corePath, '../bin/cli.js');

  config.mcpServers['agentic-workflow'] = {
    command: 'node',
    args: [binPath, 'mcp'],
    env: {},
    disabled: false
  };

  await fs.writeFile(configPath, JSON.stringify(config, null, 2));

  // eslint-disable-next-line no-console
  console.log(`MCP server registered at: ${configPath}`);
}

async function readConfig(configPath: string): Promise<{ mcpServers?: Record<string, any> }> {
  try {
    const raw = await fs.readFile(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}
