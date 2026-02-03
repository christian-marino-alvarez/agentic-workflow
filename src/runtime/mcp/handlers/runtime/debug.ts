import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { Logger } from '../../../engine/logger.js';

export async function handleDebugReadLogs(params: Record<string, unknown>): Promise<CallToolResult> {
  const limit = typeof params.limit === 'number' ? params.limit : 100;
  const logs = Logger.getInstance().getLogs(limit);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(logs, null, 2)
      }
    ]
  };
}
