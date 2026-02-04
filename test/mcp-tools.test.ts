import { describe, it, expect } from 'vitest';
import { MCP_TOOLS, type ToolName } from '../src/mcp/tools.js';
import * as mcpIndex from '../src/mcp/index.js';

describe('mcp tools', () => {
  it('includes runtime.reconcile tool', () => {
    const names = MCP_TOOLS.map((tool) => tool.name as ToolName);
    expect(names).toContain('runtime.reconcile');
  });

  it('exports startMcpServer', () => {
    expect(typeof (mcpIndex as any).startMcpServer).toBe('function');
  });
});
