import { Logger } from '../../engine/logger.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getToolHandler } from '../tools/runtime-tools.js';

export async function handleToolsCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const handler = getToolHandler(toolName);
  if (!handler) {
    Logger.error('MCP', `Unknown tool called: ${toolName}`);
    throw new Error(`Unknown tool: ${toolName}`);
  }
  return handler(args);
}
