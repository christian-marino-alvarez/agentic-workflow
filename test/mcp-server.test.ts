import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let connected = false;
let lastServer: any = null;

vi.mock('@modelcontextprotocol/sdk/server/index.js', () => {
  class FakeServer {
    handlers = new Map();
    constructor() {
      lastServer = this;
    }
    setRequestHandler(schema: any, handler: any) {
      this.handlers.set(schema, handler);
    }
    async connect() {
      connected = true;
    }
  }
  return { Server: FakeServer };
});

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => {
  class FakeTransport {}
  return { StdioServerTransport: FakeTransport };
});

vi.mock('../src/mcp/resources.js', () => {
  return {
    listAliasResources: vi.fn(async () => [
      { uri: 'agentic://aliases/root', name: 'aliases.root' },
      { uri: 'agentic://aliases/rules', name: 'aliases.rules' }
    ]),
    listDomainAliases: vi.fn(async () => ({ rules: { constitution: { index: '.agent/rules/constitution/index.md' } } })),
    readAliasResource: vi.fn(async () => ({ uri: 'agentic://aliases/root', mimeType: 'application/json', text: '{}' }))
  };
});

vi.mock('../src/mcp/handlers.js', () => {
  return {
    handleToolCall: vi.fn(async () => ({
      content: [
        {
          type: 'text',
          text: JSON.stringify({ status: 'ok' })
        }
      ]
    }))
  };
});

describe('mcp server', () => {
  beforeEach(() => {
    connected = false;
    lastServer = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts MCP server and registers handlers', async () => {
    const { startMcpServer } = await import('../src/mcp/server.js');
    await startMcpServer();
    expect(connected).toBe(true);
    expect(lastServer).toBeTruthy();
  });

  it('serves list/read resources and domain list handlers', async () => {
    const { ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, CallToolRequestSchema } = await import('@modelcontextprotocol/sdk/types.js');
    const { startMcpServer } = await import('../src/mcp/server.js');
    const resources = await import('../src/mcp/resources.js');
    (resources.listAliasResources as any).mockImplementationOnce(async () => [
      { uri: 'agentic://aliases/root', name: 'aliases.root' },
      { uri: 'http://example.com/other', name: 'external' },
      { uri: 'agentic://aliases/rules', name: 'aliases.rules' }
    ]);
    await startMcpServer();

    const listTools = lastServer.handlers.get(ListToolsRequestSchema);
    const listResources = lastServer.handlers.get(ListResourcesRequestSchema);
    const readResource = lastServer.handlers.get(ReadResourceRequestSchema);
    const callTool = lastServer.handlers.get(CallToolRequestSchema);

    const toolsResult = await listTools();
    expect(Array.isArray(toolsResult.tools)).toBe(true);

    const resourcesResult = await listResources();
    expect(resourcesResult.resources.some((resource: any) => resource.uri === 'agentic://aliases/root')).toBe(true);

    const readResult = await readResource({ params: { uri: 'agentic://aliases/root' } });
    expect(readResult.contents[0].text).toContain('{}');

    const domainEntry = Array.from(lastServer.handlers.entries()).find(([schema]) => {
      return typeof schema.safeParse === 'function' && schema.safeParse({ method: 'resources/rules/list' }).success;
    });
    expect(domainEntry).toBeTruthy();
    const domainResult = await domainEntry![1]({ method: 'resources/rules/list' });
    expect(domainResult.aliases).toHaveProperty('rules');

    const callResult = await callTool({ params: { name: 'runtime.run', arguments: {} } });
    expect(callResult.content[0].text).toContain('ok');

    const callResultNoArgs = await callTool({ params: { name: 'runtime.run' } });
    expect(callResultNoArgs.content[0].text).toContain('ok');
  });

  it('handles failure in registerDomainResourceHandlers', async () => {
    const resources = await import('../src/mcp/resources.js');
    (resources.listAliasResources as any).mockImplementationOnce(async () => { throw new Error('fail'); });
    const { startMcpServer } = await import('../src/mcp/server.js');
    await startMcpServer();
    expect(connected).toBe(true);
  });

  it('handles resolvePackageVersion failure', async () => {
    vi.resetModules();
    vi.doMock('node:fs', () => {
      const readFileSync = () => { throw new Error('boom'); };
      return { readFileSync, default: { readFileSync } };
    });
    const { startMcpServer } = await import('../src/mcp/server.js');
    await startMcpServer();
    expect(connected).toBe(true);
  });

  it('handles resolvePackageVersion missing version', async () => {
    vi.resetModules();
    vi.doMock('node:fs', () => {
      const readFileSync = () => JSON.stringify({ name: 'agentic-workflow' });
      return { readFileSync, default: { readFileSync } };
    });
    const { startMcpServer } = await import('../src/mcp/server.js');
    await startMcpServer();
    expect(connected).toBe(true);
  });

  it('handles resolvePackageVersion with explicit version', async () => {
    vi.resetModules();
    vi.doMock('node:fs', () => {
      const readFileSync = () => JSON.stringify({ name: 'agentic-workflow', version: '9.9.9' });
      return { readFileSync, default: { readFileSync } };
    });
    const { startMcpServer } = await import('../src/mcp/server.js');
    await startMcpServer();
    expect(connected).toBe(true);
  });
});
