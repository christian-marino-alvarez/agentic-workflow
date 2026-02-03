import { resumeRuntime, stepRuntime } from '../../../engine/service.js';
import { ensureString, getOptionalString } from './runtimeParams.js';

export async function handleResume(params: Record<string, unknown>): Promise<Record<string, unknown>> {
  const taskPath = ensureString(params.taskPath, 'taskPath');
  const agent = ensureString(params.agent, 'agent');
  const statePath = getOptionalString(params.statePath);
  const eventsPath = getOptionalString(params.eventsPath);
  const result = await resumeRuntime({
    taskPath,
    agent,
    statePath,
    eventsPath,
    stdoutEvents: false
  });
  return { status: 'ok', runId: result.runId, phase: result.phase };
}

export async function handleNextStep(params: Record<string, unknown>): Promise<Record<string, unknown>> {
  const taskPath = ensureString(params.taskPath, 'taskPath');
  const agent = ensureString(params.agent, 'agent');
  const statePath = getOptionalString(params.statePath);
  const eventsPath = getOptionalString(params.eventsPath);
  const result = await stepRuntime({
    taskPath,
    agent,
    statePath,
    eventsPath,
    stdoutEvents: false
  });
  return {
    status: 'ok',
    runId: result.runId,
    phase: result.phase,
    step: result.steps.find((step) => step.status === 'completed' || step.status === 'failed')
  };
}

export async function handleCompleteStep(): Promise<Record<string, unknown>> {
  return { status: 'ok', message: 'Step completion acknowledged (logic pending specific requirement).' };
}
