import { Logger } from '../../../engine/logger.js';
import { runRuntime } from '../../../engine/service.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ensureInitTaskFile, resolveTaskPath } from '../../adapters/runtimeAdapter.js';
import { ensureString, getOptionalString } from './runtimeParams.js';

export async function handleRun(params: Record<string, unknown>): Promise<CallToolResult> {
  const taskPath = ensureString(params.taskPath, 'taskPath');
  const agent = ensureString(params.agent, 'agent');
  const statePath = getOptionalString(params.statePath);
  const eventsPath = getOptionalString(params.eventsPath);

  Logger.info('MCP', 'Tool called: runtime_run', { taskPath, agent });

  const resolved = await resolveTaskPath(taskPath);
  await ensureInitTaskFile(resolved.resolvedPath, resolved.workspaceRoot);

  const result = await runRuntime({
    taskPath: resolved.resolvedPath,
    agent,
    statePath,
    eventsPath,
    stdoutEvents: false
  });

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ status: 'ok', runId: result.runId, phase: result.phase })
      }
    ]
  };
}
