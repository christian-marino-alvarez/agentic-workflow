import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { Logger } from '../../../engine/logger.js';
import { loadTask } from '../../../engine/task-loader.js';
import { ensureString, getOptionalString } from './runtimeParams.js';
import { resolveTaskPath } from '../../adapters/runtimeAdapter.js';

export async function handleValidateGate(params: Record<string, unknown>): Promise<CallToolResult> {
  const taskPath = ensureString(params.taskPath, 'taskPath');
  const agent = ensureString(params.agent, 'agent');
  const expectedPhase = getOptionalString(params.expectedPhase);

  Logger.info('MCP', 'Tool called: runtime_validate_gate', { taskPath, agent, expectedPhase });

  const resolved = await resolveTaskPath(taskPath);
  const task = await loadTask(resolved.resolvedPath);
  if (task.owner !== agent) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ valid: false, reason: 'Agent mismatch.' })
        }
      ]
    };
  }
  if (expectedPhase && task.phase !== expectedPhase) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ valid: false, reason: `Phase mismatch. Current: ${task.phase}.` })
        }
      ]
    };
  }
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ valid: true })
      }
    ]
  };
}
