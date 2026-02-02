import { startRuntimeMcpServer } from '../../runtime/mcp/server.js';

export async function mcpCommand(): Promise<void> {
  await startRuntimeMcpServer();
}
