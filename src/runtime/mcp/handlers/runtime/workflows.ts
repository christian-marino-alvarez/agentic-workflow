import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { Logger } from '../../../engine/logger.js';
import { loadWorkflows } from '../../../engine/workflow-loader.js';
import { ensureString } from './runtimeParams.js';

export async function handleListWorkflows(params: Record<string, unknown>): Promise<CallToolResult> {
  const workflowsRoot = ensureString(params.workflowsRoot, 'workflowsRoot');
  Logger.info('MCP', 'Tool called: runtime_list_workflows', { workflowsRoot });
  const workflows = await loadWorkflows(workflowsRoot);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(workflows)
      }
    ]
  };
}
