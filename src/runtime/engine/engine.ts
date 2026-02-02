import fs from 'node:fs/promises';
import type { RuntimeEvent, RuntimeEventType, RuntimeState, RuntimeStepState } from './types.js';
import type { WorkflowMeta } from './workflow-loader.js';
import { RuntimeEmitter } from './emitter.js';
import { StateStore } from './state-store.js';
import { Logger } from './logger.js';

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
    let currentState = this.ensureSteps(state);

    // Initial emit only if just starting
    if (currentState.status === 'idle') {
      await this.emitEvent('run_started', currentState, workflow);
      await this.emitEvent('workflow_loaded', currentState, workflow);
      await this.emitEvent('context_resolved', currentState, workflow);
      await this.log('info', 'Workflow context resolved', { workflowId: workflow.id, runId: currentState.runId });
    }

    // Run loop
    while (true) {
      if (currentState.status === 'completed' || currentState.status === 'failed') {
        break;
      }

      const nextStep = currentState.steps.find(s => s.status !== 'completed');
      if (!nextStep) {
        // All steps completed
        currentState = this.withStatus(currentState, 'completed');
        await this.log('info', 'Workflow execution completed', { runId: currentState.runId });
        await this.persistState(currentState, workflow, 'run_completed');
        break;
      }

      // Execute single step
      currentState = await this.step(currentState, workflow);
    }

    return currentState;
  }

  public async step(state: RuntimeState, workflow: WorkflowMeta): Promise<RuntimeState> {
    const normalized = this.ensureSteps(state);
    const step = normalized.steps.find(s => s.status !== 'completed');

    if (!step) {
      // Nothing to do, already done
      return normalized;
    }

    try {
      await this.runStep(step, normalized, workflow);
      // Reload state after step execution to ensure we return the latest mutation
      // In this in-memory implementation, 'normalized' was mutated by runStep wrappers? 
      // No, runStep calls withStepStatus which returns NEW state but runStep returns void.
      // Wait, original implementations of runStep mutated state?
      // Let's check the original runStep signature. It takes state but calls this.executeStep.

      // REFACTOR NOTICE: The original runStep was assuming it was running inside the loop and managing state persistence internally.
      // But it didn't return the new state to the caller of run().
      // We need to fetch the latest state from the store because persistence happens inside runStep.

      const latestState = await this.dependencies.stateStore.load();
      if (!latestState) throw new Error('State lost during step execution');
      return latestState;

    } catch (error) {
      // Error handling is done inside runStep (emitError, persist failed state)
      // We just need to return the failed state
      const failedState = await this.dependencies.stateStore.load();
      if (!failedState) throw new Error('State lost during step failure');
      return failedState;
    }
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
    Logger.getInstance().log(level, 'Engine', message, data);

    // Also emit event for back-compat or specialized event stream
    await this.dependencies.emitter.emit({
      type: 'log',
      timestamp: new Date().toISOString(),
      runId: 'system',
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
