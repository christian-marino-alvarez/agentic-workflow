import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, type ListToolsResult } from '@modelcontextprotocol/sdk/types.js';
import { Logger } from '../infrastructure/logger/index.js';
import { Runtime } from '../runtime/runtime.js';
import { handleToolCall } from './handlers.js';
import { MCP_TOOLS } from './tools.js';

export async function startMcpServer(): Promise<void> {
  Logger.info('MCP', 'Server iniciado via stdio.', { version: '1.0.0' });
  Logger.info('MCP', 'Esperando mensajes JSON-RPC...');
  console.error('[MCP] Server iniciado via stdio. Version 1.0.0');
  console.error('[MCP] Esperando mensajes JSON-RPC...');
  const server = await createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function createMcpServer(): Promise<Server> {
  const server = new Server(
    {
      name: 'agentic-workflow',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  const runtime = new Runtime();

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: MCP_TOOLS
  }) satisfies ListToolsResult);

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = request.params.arguments ?? {};
    return handleToolCall(runtime, name, args);
  });

  return server;
}
