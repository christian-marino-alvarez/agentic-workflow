import fs from 'node:fs/promises';
import type { RuntimeEvent, RuntimeEventType, RuntimeState, RuntimeStepState } from './types.js';
import type { WorkflowMeta } from './workflow-loader.js';
import { RuntimeEmitter } from './emitter.js';
import { StateStore } from './state-store.js';

export interface RuntimeExecutionContext {
  state: RuntimeState;
  workflow: WorkflowMeta;
}

export interface RuntimeStepExecutor {
  id: string;
  execute(context: RuntimeExecutionContext): Promise<void>;
}

export interface RuntimeEngineDependencies {
  emitter: RuntimeEmitter;
  stateStore: StateStore;
  executors?: RuntimeStepExecutor[];
}

export class RuntimeEngine {
  private executors: Map<string, RuntimeStepExecutor>;

  constructor(private dependencies: RuntimeEngineDependencies) {
    this.executors = this.buildExecutorMap(dependencies.executors ?? []);
  }

  public async run(state: RuntimeState, workflow: WorkflowMeta): Promise<RuntimeState> {
    const normalized = this.ensureSteps(state);
    await this.emitEvent('run_started', normalized, workflow);
    await this.emitEvent('workflow_loaded', normalized, workflow);
    await this.emitEvent('context_resolved', normalized, workflow);
    await this.log('info', 'Workflow context resolved', { workflowId: workflow.id, runId: state.runId });

    for (const step of normalized.steps) {
      if (step.status === 'completed') {
        continue;
      }
      await this.runStep(step, normalized, workflow);
    }

    const completed = this.withStatus(normalized, 'completed');
    await this.log('info', 'Workflow execution completed', { runId: state.runId });
    await this.persistState(completed, workflow, 'run_completed');
    return completed;
  }

  private async runStep(step: RuntimeStepState, state: RuntimeState, workflow: WorkflowMeta): Promise<void> {
    const running = this.withStepStatus(state, step.id, 'running');
    await this.log('info', `Starting step execution: ${step.id}`, { stepId: step.id });
    await this.persistState(running, workflow, 'step_started', step.id);
    try {
      await this.executeStep(step.id, running, workflow);
    } catch (error) {
      const failed = this.withStatus(running, 'failed');
      await this.log('error', `Step execution failed: ${step.id}`, { stepId: step.id, error: String(error) });
      await this.emitError(failed, workflow, error);
      await this.persistState(failed, workflow, 'state_persisted');
      throw error;
    }
    const completed = this.withStepStatus(running, step.id, 'completed');
    await this.log('info', `Step execution completed: ${step.id}`, { stepId: step.id });
    await this.persistState(completed, workflow, 'step_completed', step.id);
  }

  private async executeStep(stepId: string, state: RuntimeState, workflow: WorkflowMeta): Promise<void> {
    const executor = this.executors.get(stepId) ?? this.executors.get('workflow');
    if (executor) {
      await executor.execute({ state, workflow });
      return;
    }
    await fs.access(workflow.path);
  }

  private ensureSteps(state: RuntimeState): RuntimeState {
    if (state.steps.length > 0) {
      return state;
    }
    return {
      ...state,
      steps: [{ id: 'workflow', status: 'idle' }]
    };
  }

  private buildExecutorMap(executors: RuntimeStepExecutor[]): Map<string, RuntimeStepExecutor> {
    return new Map(executors.map((executor) => [executor.id, executor]));
  }

  private async persistState(state: RuntimeState, workflow: WorkflowMeta, eventType: RuntimeEventType, stepId?: string): Promise<void> {
    await this.dependencies.stateStore.save(state);
    await this.emitEvent('state_persisted', state, workflow, stepId);
    await this.emitEvent(eventType, state, workflow, stepId);
  }

  private async emitEvent(type: RuntimeEventType, state: RuntimeState, workflow: WorkflowMeta, stepId?: string): Promise<void> {
    const event = this.buildEvent(type, state, workflow, stepId);
    await this.dependencies.emitter.emit(event);
  }

  private async emitError(state: RuntimeState, workflow: WorkflowMeta, error: unknown): Promise<void> {
    const payload = { error: error instanceof Error ? error.message : String(error) };
    const event = this.buildEvent('error', state, workflow, undefined, payload);
    await this.dependencies.emitter.emit(event);
  }

  private async log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: Record<string, unknown>): Promise<void> {
    const event = this.buildEvent('log', { runId: 'system' } as RuntimeState, { id: 'system' } as WorkflowMeta, undefined, {
      level,
      message,
      data
    });
    // Fix: minimal mock state for system logs if real state is not available contextually here
    // In a real implementation we would want access to current state, but this helper is generic.
    // For now, we rely on the payload.

    // Actually, let's use a simpler approach. We need to pass state/workflow to buildEvent.
    // However, log() is called from methods where we HAVE state.
    // But to keep signature simple, let's just emit raw event manually here or refine signature.

    // Better: let's change signature to accept nothing and use a generic builder, 
    // OR just emit the event directly since we are inside the class.

    // Wait, buildEvent requires state and workflow.
    // Let's manually construct the log event to avoid circular dependencies or complex signatures
    // for this simple logging feature.
    await this.dependencies.emitter.emit({
      type: 'log',
      timestamp: new Date().toISOString(),
      runId: 'system', // or passed in data
      payload: { level, message, ...data }
    });
  }

  private buildEvent(
    type: RuntimeEventType,
    state: RuntimeState,
    workflow: WorkflowMeta,
    stepId?: string,
    payload?: Record<string, unknown>
  ): RuntimeEvent {
    return {
      type,
      timestamp: new Date().toISOString(),
      runId: state.runId,
      workflowId: workflow.id,
      phase: state.phase,
      stepId,
      payload
    };
  }

  private withStatus(state: RuntimeState, status: RuntimeState['status']): RuntimeState {
    return {
      ...state,
      status,
      updatedAt: new Date().toISOString()
    };
  }

  private withStepStatus(state: RuntimeState, stepId: string, status: RuntimeStepState['status']): RuntimeState {
    const steps = state.steps.map((step) => step.id === stepId ? { ...step, status } : step);
    return {
      ...state,
      status: 'running',
      steps,
      updatedAt: new Date().toISOString()
    };
  }
}
