import path from 'node:path';
import { startMcpServer } from '../../mcp/server.js';
import { checkMcpRegistration } from './register-mcp.js';
import { Logger } from '../../infrastructure/logger/index.js';

export async function mcpCommand(options: { workspace?: string } = {}): Promise<void> {
  const registration = await checkMcpRegistration();

  if (!registration.antigravity && !registration.codex) {
    Logger.warn('MCP', 'Server not registered in any MCP client. Run: agentic-workflow register-mcp');
  }

  const workspacePath = options.workspace ? path.resolve(options.workspace) : undefined;
  if (workspacePath && !path.isAbsolute(workspacePath)) {
    throw new Error('El workspace debe ser una ruta absoluta.');
  }
  if (workspacePath) {
    process.env.AGENTIC_WORKSPACE = workspacePath;
  }

  await startMcpServer();
}
