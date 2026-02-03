import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Logger } from '../engine/logger.js';
import { registerAll } from './registry/index.js';

export async function startRuntimeMcpServer(): Promise<void> {
  Logger.info('MCP', 'Server started via stdio transport. Waiting for JSON-RPC messages...');
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function createMcpServer(): Server {
  const server = new Server(
    {
      name: 'agentic-workflow',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {},
        resources: {}
      }
    }
  );

  registerAll(server);

  return server;
}
