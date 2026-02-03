import { startRuntimeMcpServer } from '../../runtime/mcp/server.js';
import { checkMcpRegistration } from './register-mcp.js';
import { Logger } from '../../runtime/engine/logger.js';

export async function mcpCommand(): Promise<void> {
  const registration = await checkMcpRegistration();

  if (!registration.antigravity && !registration.codex) {
    Logger.warn('MCP', 'Server not registered in any MCP client. Run: agentic-workflow register-mcp');
  }

  await startRuntimeMcpServer();
}
