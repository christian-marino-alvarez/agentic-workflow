import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  type ListToolsResult,
  type ListResourcesResult,
  type ReadResourceResult
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Logger } from '../infrastructure/logger/index.js';
import { Runtime } from '../runtime/runtime.js';
import { handleToolCall } from './handlers.js';
import { MCP_TOOLS } from './tools.js';
import { listAliasResources, listDomainAliases, readAliasResource } from './resources.js';
import { z } from 'zod';

export async function startMcpServer(): Promise<void> {
  const version = resolvePackageVersion();
  Logger.info('MCP', 'Server iniciado via stdio.', { version });
  Logger.info('MCP', 'Esperando mensajes JSON-RPC...');
  console.error(`[MCP] Server iniciado via stdio. Version ${version}`);
  console.error('[MCP] Esperando mensajes JSON-RPC...');
  const server = await createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function createMcpServer(): Promise<Server> {
  const server = new Server(
    {
      name: 'agentic-workflow',
      version: resolvePackageVersion()
    },
    {
      capabilities: {
        tools: {},
        resources: {}
      }
    }
  );

  const runtime = new Runtime();

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: MCP_TOOLS
  }) satisfies ListToolsResult);

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const resources = await listAliasResources();
    return { resources } satisfies ListResourcesResult;
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    const content = await readAliasResource(uri);
    return { contents: [content] } satisfies ReadResourceResult;
  });

  await registerDomainResourceHandlers(server);

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = request.params.arguments ?? {};
    return handleToolCall(runtime, name, args);
  });

  return server;
}

async function registerDomainResourceHandlers(server: Server): Promise<void> {
  try {
    const resources = await listAliasResources();
    for (const resource of resources) {
      if (!resource.uri.startsWith('agentic://aliases/')) {
        continue;
      }
      const domain = resource.uri.replace('agentic://aliases/', '');
      if (!domain || domain === 'root') {
        continue;
      }
      const schema = z.object({
        jsonrpc: z.literal('2.0').optional(),
        id: z.any().optional(),
        method: z.literal(`resources/${domain}/list`),
        params: z.any().optional()
      });
      server.setRequestHandler(schema, async () => {
        const aliases = await listDomainAliases(domain);
        return { aliases };
      });
    }
  } catch (error) {
    Logger.warn('MCP', 'No se pudo registrar resources/<domain>/list', { error });
  }
}

function resolvePackageVersion(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const pkgPath = path.join(__dirname, '..', '..', 'package.json');
    const raw = fs.readFileSync(pkgPath, 'utf-8');
    const parsed = JSON.parse(raw) as { version?: string };
    return parsed.version ?? 'unknown';
  } catch {
    return 'unknown';
  }
}
