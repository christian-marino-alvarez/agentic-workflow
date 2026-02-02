import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

interface McpServerConfig {
  command: string;
  args: string[];
}

interface AntigravityConfig {
  mcpServers: Record<string, McpServerConfig>;
}

const AGENTIC_SERVER_NAME = 'agentic-workflow';
const AGENTIC_MCP_CONFIG: McpServerConfig = {
  command: 'agentic-workflow',
  args: ['mcp']
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function registerAntigravity(): Promise<boolean> {
  const configPath = path.join(os.homedir(), '.gemini', 'antigravity', 'mcp_config.json');
  const configDir = path.dirname(configPath);

  try {
    // Ensure directory exists
    await fs.mkdir(configDir, { recursive: true });

    let config: AntigravityConfig = { mcpServers: {} };

    if (await fileExists(configPath)) {
      const raw = await fs.readFile(configPath, 'utf-8');
      config = JSON.parse(raw) as AntigravityConfig;
    }

    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    config.mcpServers[AGENTIC_SERVER_NAME] = AGENTIC_MCP_CONFIG;
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Registered in Antigravity: ${configPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to register in Antigravity:`, error);
    return false;
  }
}

async function registerCodex(): Promise<boolean> {
  const configPath = path.join(os.homedir(), '.codex', 'config.toml');

  try {
    if (!(await fileExists(configPath))) {
      console.log(`⚠️  Codex config not found: ${configPath}`);
      return false;
    }

    let content = await fs.readFile(configPath, 'utf-8');

    const serverSection = `[mcp_servers.${AGENTIC_SERVER_NAME}]`;

    if (content.includes(serverSection)) {
      console.log(`ℹ️  Already registered in Codex`);
      return true;
    }

    const mcpEntry = `
${serverSection}
command = "${AGENTIC_MCP_CONFIG.command}"
args = ${JSON.stringify(AGENTIC_MCP_CONFIG.args)}
`;

    content = content.trimEnd() + '\n' + mcpEntry;
    await fs.writeFile(configPath, content);
    console.log(`✅ Registered in Codex: ${configPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to register in Codex:`, error);
    return false;
  }
}

export async function checkMcpRegistration(): Promise<{ antigravity: boolean; codex: boolean }> {
  const antigravityPath = path.join(os.homedir(), '.gemini', 'antigravity', 'mcp_config.json');
  const codexPath = path.join(os.homedir(), '.codex', 'config.toml');

  let antigravity = false;
  let codex = false;

  try {
    if (await fileExists(antigravityPath)) {
      const raw = await fs.readFile(antigravityPath, 'utf-8');
      const config = JSON.parse(raw) as AntigravityConfig;
      antigravity = !!config.mcpServers?.[AGENTIC_SERVER_NAME];
    }
  } catch { /* ignore */ }

  try {
    if (await fileExists(codexPath)) {
      const content = await fs.readFile(codexPath, 'utf-8');
      codex = content.includes(`[mcp_servers.${AGENTIC_SERVER_NAME}]`);
    }
  } catch { /* ignore */ }

  return { antigravity, codex };
}

export async function registerMcpCommand(): Promise<void> {
  console.log('🔧 Registering agentic-workflow MCP server...\n');

  const antigravityDir = path.join(os.homedir(), '.gemini', 'antigravity');
  const codexConfig = path.join(os.homedir(), '.codex', 'config.toml');

  const hasAntigravity = await fileExists(antigravityDir);
  const hasCodex = await fileExists(codexConfig);

  if (!hasAntigravity && !hasCodex) {
    console.log('❌ No supported MCP clients found.');
    console.log('   Supported: Gemini CLI (Antigravity), OpenAI Codex CLI');
    return;
  }

  let success = false;

  if (hasAntigravity) {
    const result = await registerAntigravity();
    success = success || result;
  }

  if (hasCodex) {
    const result = await registerCodex();
    success = success || result;
  }

  if (success) {
    console.log('\n✅ Registration complete. Restart your CLI to use the tools.');
  }
}
