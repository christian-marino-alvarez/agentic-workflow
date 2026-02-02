import crypto from 'node:crypto';
import path from 'node:path';
import { RuntimeEmitter } from './emitter.js';
import { RuntimeEngine } from './engine.js';
import { StateStore } from './state-store.js';
import { loadTask, resolveWorkflowsRoot } from './task-loader.js';
import { resolvePhaseWorkflow } from './workflow-loader.js';
import type { RuntimeState } from './types.js';

export interface RuntimeExecutionOptions {
  taskPath: string;
  agent: string;
  statePath?: string;
  eventsPath?: string;
  stdoutEvents?: boolean;
}

export async function runRuntime(options: RuntimeExecutionOptions): Promise<RuntimeState> {
  const taskPath = path.resolve(options.taskPath);
  const task = await loadTask(taskPath);
  ensureOwner(task.owner, options.agent);

  const workflowsRoot = resolveWorkflowsRoot(path.dirname(taskPath));
  const mapping = await resolvePhaseWorkflow(workflowsRoot, task.phase);
  if (!mapping) {
    throw new Error(`No workflow mapping found for phase ${task.phase}.`);
  }

  const runId = crypto.randomUUID();
  const statePath = resolveStatePath(taskPath, options.statePath);
  const workflow = { id: mapping.phaseId, path: mapping.workflowPath };

  const state: RuntimeState = {
    version: 1,
    runId,
    taskId: task.id,
    taskTitle: task.title,
    taskPath,
    workflowId: workflow.id,
    workflowPath: workflow.path,
    phase: task.phase,
    status: 'idle',
    steps: [],
    updatedAt: new Date().toISOString()
  };

  const emitter = new RuntimeEmitter({
    eventsPath: options.eventsPath,
    stdout: options.stdoutEvents ?? true
  });
  const store = new StateStore(statePath);
  const engine = new RuntimeEngine({ emitter, stateStore: store });
  return engine.run(state, workflow);
}

export async function resumeRuntime(options: RuntimeExecutionOptions): Promise<RuntimeState> {
  const taskPath = path.resolve(options.taskPath);
  const task = await loadTask(taskPath);
  ensureOwner(task.owner, options.agent);

  const statePath = resolveStatePath(taskPath, options.statePath);
  const store = new StateStore(statePath);
  const state = await store.load();
  if (!state) {
    throw new Error('No persisted state found to resume.');
  }

  if (state.taskPath !== taskPath) {
    throw new Error('State does not match the provided task path.');
  }

  const workflowsRoot = resolveWorkflowsRoot(path.dirname(taskPath));
  const mapping = await resolvePhaseWorkflow(workflowsRoot, state.phase);
  if (!mapping) {
    throw new Error(`No workflow mapping found for phase ${state.phase}.`);
  }

  const workflow = { id: mapping.phaseId, path: mapping.workflowPath };
  const emitter = new RuntimeEmitter({
    eventsPath: options.eventsPath,
    stdout: options.stdoutEvents ?? true
  });
  const engine = new RuntimeEngine({ emitter, stateStore: store });
  return engine.run(state, workflow);
}

function resolveStatePath(taskPath: string, override?: string): string {
  if (override) {
    return path.resolve(override);
  }
  return path.join(path.dirname(taskPath), '.agent', 'runtime', 'state.json');
}

function ensureOwner(owner: string, agent: string): void {
  if (owner !== agent) {
    throw new Error(`Agent mismatch: expected "${owner}" but got "${agent}".`);
  }
}
