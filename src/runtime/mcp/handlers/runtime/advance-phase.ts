import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { Logger } from '../../../engine/logger.js';
import { loadTask } from '../../../engine/task-loader.js';
import { RuntimeEmitter } from '../../../engine/emitter.js';
import { ensureString, getOptionalString } from './runtimeParams.js';
import { resolveNextPhase, resolveTaskPath, resolveWorkflowsRootForTask, updateTaskPhase } from '../../adapters/runtimeAdapter.js';

export async function handleAdvancePhase(params: Record<string, unknown>): Promise<CallToolResult> {
  const taskPath = ensureString(params.taskPath, 'taskPath');
  const agent = ensureString(params.agent, 'agent');
  const eventsPath = getOptionalString(params.eventsPath);
  const expectedPhase = getOptionalString(params.expectedPhase);

  Logger.info('MCP', 'Tool called: runtime_advance_phase', { taskPath, agent, expectedPhase: expectedPhase ?? null });

  const resolved = await resolveTaskPath(taskPath);
  const task = await loadTask(resolved.resolvedPath);
  if (task.owner !== agent) {
    throw new Error('Agent mismatch.');
  }
  if (expectedPhase && task.phase !== expectedPhase) {
    Logger.warn('MCP', 'runtime_advance_phase expectedPhase mismatch; no phase update', {
      expectedPhase,
      taskPhase: task.phase,
      taskId: task.id
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'warning',
            warning: 'expectedPhase mismatch; task phase retained',
            previousPhase: task.phase,
            currentPhase: task.phase,
            updatedAt: null
          })
        }
      ]
    };
  }
  const workflowsRoot = resolveWorkflowsRootForTask(resolved.resolvedPath);
  let nextPhase: string;
  try {
    nextPhase = await resolveNextPhase(workflowsRoot, task.phase, task.strategy);
  } catch (error) {
    const warning = formatError(error);
    Logger.warn('MCP', 'runtime_advance_phase could not resolve next phase; no phase update', {
      taskPhase: task.phase,
      taskId: task.id,
      strategy: task.strategy ?? null,
      warning
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'warning',
            warning,
            previousPhase: task.phase,
            currentPhase: task.phase,
            updatedAt: null
          })
        }
      ]
    };
  }
  const updated = await updateTaskPhase(resolved.resolvedPath, task.phase, nextPhase, agent);
  const emitter = new RuntimeEmitter({ eventsPath, stdout: false });
  await emitter.emit({
    type: 'phase_updated',
    timestamp: updated.updatedAt,
    runId: task.id,
    phase: nextPhase,
    payload: { previousPhase: task.phase }
  });

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ status: 'ok', previousPhase: task.phase, currentPhase: nextPhase, updatedAt: updated.updatedAt })
      }
    ]
  };
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
