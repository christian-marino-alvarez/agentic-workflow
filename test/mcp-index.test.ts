import { describe, it, expect } from 'vitest';
import * as mcpIndex from '../src/mcp/index.js';

describe('mcp index', () => {
  it('exports startMcpServer', () => {
    expect(mcpIndex).toHaveProperty('startMcpServer');
    expect(mcpIndex).toHaveProperty('__mcpIndexLoaded', true);
  });
});
