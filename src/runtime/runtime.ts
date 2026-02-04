import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Logger } from '../infrastructure/logger/index.js';
import type { RuntimeEvent } from '../mcp/emitter.js';
import { loadTask } from './task-loader.js';
import {
  collectWorkspaceCandidates,
  ensureInitTaskFile,
  findWorkspaceRoot,
  resolveNextPhase,
  resolveTaskPath,
  resolveWorkflowsRootForTask,
  updateTaskPhase
} from './task-resolver.js';

export type RuntimeActionParams = {
  taskPath?: string;
  agent?: string;
  statePath?: string;
  eventsPath?: string;
  expectedPhase?: string;
  workflowsRoot?: string;
  message?: string;
  role?: string;
  event?: RuntimeEvent;
  limit?: number;
};

export type RuntimeState = {
  version: 1;
  runId: string;
  taskId: string;
  taskTitle: string;
  taskPath: string;
  phase: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  steps: Array<{ status: string; name?: string; at: string }>;
  updatedAt: string;
};

export class Runtime {
  private stateCache = new Map<string, RuntimeState>();

  async run(params: RuntimeActionParams): Promise<Record<string, unknown>> {
    const taskPath = requireString(params.taskPath, 'taskPath');
    const agent = requireString(params.agent, 'agent');
    Logger.info('MCP', 'Tool called: runtime.run', { taskPath, agent });

    const resolved = await resolveTaskPath(taskPath);
    let initResult;
    try {
      initResult = await ensureInitTaskFile(resolved.resolvedPath, resolved.workspaceRoot);
    } catch (error) {
      Logger.warn('MCP', 'runtime failed to create init candidate; fallback required', {
        taskPath,
        error: formatError(error)
      });
      throw error;
    }
    if (initResult.warning) {
      Logger.warn('MCP', initResult.warning, { taskPath, resolvedPath: initResult.taskPath });
    }
    const task = await loadTask(initResult.taskPath);
    ensureOwner(task.owner, agent);

    const statePath = await resolveStatePath(initResult.taskPath, params.statePath);
    const state: RuntimeState = {
      version: 1,
      runId: crypto.randomUUID(),
      taskId: task.id,
      taskTitle: task.title,
      taskPath: initResult.taskPath,
      phase: task.phase,
      status: 'idle',
      steps: [],
      updatedAt: new Date().toISOString()
    };

    await this.writeState(statePath, state);
    return { status: 'ok', runId: state.runId, phase: state.phase, statePath };
  }

  async resume(params: RuntimeActionParams): Promise<Record<string, unknown>> {
    const taskPath = requireString(params.taskPath, 'taskPath');
    const agent = requireString(params.agent, 'agent');
    Logger.info('MCP', 'Tool called: runtime.resume', { taskPath, agent });

    const resolved = await resolveTaskPath(taskPath);
    const task = await loadTask(resolved.resolvedPath);
    ensureOwner(task.owner, agent);

    const statePath = await resolveStatePath(resolved.resolvedPath, params.statePath);
    const state = await this.readState(statePath);
    if (!state) {
      throw new Error('No persisted state found to resume.');
    }
    return { status: 'ok', runId: state.runId, phase: state.phase, statePath };
  }

  async nextStep(params: RuntimeActionParams): Promise<Record<string, unknown>> {
    const taskPath = requireString(params.taskPath, 'taskPath');
    const agent = requireString(params.agent, 'agent');
    Logger.info('MCP', 'Tool called: runtime.next_step', { taskPath, agent });

    const resolved = await resolveTaskPath(taskPath);
    const task = await loadTask(resolved.resolvedPath);
    ensureOwner(task.owner, agent);

    const statePath = await resolveStatePath(resolved.resolvedPath, params.statePath);
    const state = await this.readState(statePath);
    if (!state) {
      throw new Error('No persisted state found to resume.');
    }

    const step = { status: 'completed', at: new Date().toISOString() };
    state.steps.push(step);
    state.updatedAt = step.at;
    await this.writeState(statePath, state);
    return { status: 'ok', runId: state.runId, phase: state.phase, step, statePath };
  }

  async completeStep(): Promise<Record<string, unknown>> {
    Logger.info('MCP', 'Tool called: runtime.complete_step');
    this.clearCache();
    return { status: 'ok', message: 'Step completion acknowledged.' };
  }

  async validateGate(params: RuntimeActionParams): Promise<Record<string, unknown>> {
    const taskPath = requireString(params.taskPath, 'taskPath');
    const agent = requireString(params.agent, 'agent');
    const expectedPhase = params.expectedPhase;
    Logger.info('MCP', 'Tool called: runtime.validate_gate', { taskPath, agent, expectedPhase });

    const resolved = await resolveTaskPath(taskPath);
    const task = await loadTask(resolved.resolvedPath);
    if (task.owner !== agent) {
      return { valid: false, reason: 'Agent mismatch.' };
    }
    if (expectedPhase && task.phase !== expectedPhase) {
      return { valid: false, reason: `Phase mismatch. Current: ${task.phase}.` };
    }
    return { valid: true };
  }

  async advancePhase(params: RuntimeActionParams): Promise<Record<string, unknown>> {
    const taskPath = requireString(params.taskPath, 'taskPath');
    const agent = requireString(params.agent, 'agent');
    const expectedPhase = params.expectedPhase;
    Logger.info('MCP', 'Tool called: runtime.advance_phase', { taskPath, agent, expectedPhase: expectedPhase ?? null });

    const resolved = await resolveTaskPath(taskPath);
    const task = await loadTask(resolved.resolvedPath);
    if (task.owner !== agent) {
      throw new Error('Agent mismatch.');
    }
    if (expectedPhase && task.phase !== expectedPhase) {
      Logger.warn('MCP', 'runtime.advance_phase expectedPhase mismatch; no phase update', {
        expectedPhase,
        taskPhase: task.phase,
        taskId: task.id
      });
      return {
        status: 'warning',
        warning: 'expectedPhase mismatch; task phase retained',
        previousPhase: task.phase,
        currentPhase: task.phase,
        updatedAt: null
      };
    }
    const workflowsRoot = resolveWorkflowsRootForTask(resolved.resolvedPath);
    let nextPhase: string;
    try {
      nextPhase = await resolveNextPhase(workflowsRoot, task.phase, task.strategy);
    } catch (error) {
      const warning = formatError(error);
      Logger.warn('MCP', 'runtime.advance_phase could not resolve next phase; no phase update', {
        taskPhase: task.phase,
        taskId: task.id,
        strategy: task.strategy ?? null,
        warning
      });
      return {
        status: 'warning',
        warning,
        previousPhase: task.phase,
        currentPhase: task.phase,
        updatedAt: null
      };
    }
    const updated = await updateTaskPhase(resolved.resolvedPath, task.phase, nextPhase, agent);
    return {
      status: 'ok',
      previousPhase: task.phase,
      currentPhase: nextPhase,
      updatedAt: updated.updatedAt,
      taskId: task.id,
      emitEvent: {
        type: 'phase_updated',
        timestamp: updated.updatedAt,
        runId: task.id,
        phase: nextPhase,
        payload: { previousPhase: task.phase }
      }
    };
  }

  async getState(params: RuntimeActionParams): Promise<Record<string, unknown>> {
    const statePath = requireString(params.statePath, 'statePath');
    Logger.info('MCP', 'Tool called: runtime.get_state', { statePath });
    const state = await this.readState(statePath);
    if (!state) {
      throw new Error('No state found.');
    }

    let taskContent = '';
    try {
      if (state.taskPath) {
        taskContent = await fs.readFile(state.taskPath, 'utf-8');
      }
    } catch {
      // Ignore if task file not found
    }

    return { ...state, taskContent };
  }

  async listWorkflows(params: RuntimeActionParams): Promise<Record<string, unknown>> {
    const workflowsRoot = params.workflowsRoot ?? (await resolveDefaultWorkflowsRoot());
    Logger.info('MCP', 'Tool called: runtime.list_workflows', { workflowsRoot });
    const indexPath = path.join(workflowsRoot, 'index.md');
    const raw = await fs.readFile(indexPath, 'utf-8');
    const match = raw.match(/```yaml\n([\s\S]*?)```/);
    if (!match) {
      return { workflows: {} };
    }
    const yaml = match[1];
    return { workflowsYaml: yaml };
  }

  async emitEvent(params: RuntimeActionParams): Promise<Record<string, unknown>> {
    const event = params.event;
    if (!event) {
      throw new Error('Missing event payload.');
    }
    return { status: 'ok', emitEvent: event };
  }

  async chat(params: RuntimeActionParams): Promise<Record<string, unknown>> {
    const message = requireString(params.message, 'message');
    const role = params.role ?? 'user';
    Logger.info('Runtime', `Chat message received from ${role}`, { message });

    return {
      status: 'ok',
      emitEvent: {
        type: 'chat_message',
        timestamp: new Date().toISOString(),
        runId: 'chat',
        payload: { role, content: message }
      }
    };
  }

  async readLogs(params: RuntimeActionParams): Promise<Record<string, unknown>> {
    const maxLogs = typeof params.limit === 'number' ? params.limit : 100;
    const logs = Logger.getInstance().getLogs(maxLogs);
    return { logs };
  }

  private async readState(statePath: string): Promise<RuntimeState | null> {
    const cached = this.stateCache.get(statePath);
    if (cached) {
      return cached;
    }
    try {
      const raw = await fs.readFile(path.resolve(statePath), 'utf-8');
      const state = JSON.parse(raw) as RuntimeState;
      this.stateCache.set(statePath, state);
      return state;
    } catch {
      return null;
    }
  }

  private async writeState(statePath: string, state: RuntimeState): Promise<void> {
    this.stateCache.set(statePath, state);
    await fs.mkdir(path.dirname(statePath), { recursive: true });
    await fs.writeFile(path.resolve(statePath), JSON.stringify(state, null, 2));
  }

  private clearCache(): void {
    this.stateCache.clear();
  }
}

async function resolveStatePath(taskPath: string, override?: string): Promise<string> {
  if (override) {
    return path.resolve(override);
  }
  const resolved = await resolveTaskPath(taskPath);
  const workspaceRoot = resolved.workspaceRoot ?? path.dirname(resolved.resolvedPath);
  return path.join(workspaceRoot, '.agent', 'runtime', 'state.json');
}

async function resolveDefaultWorkflowsRoot(): Promise<string> {
  const root = await findWorkspaceRoot(collectWorkspaceCandidates());
  if (!root) {
    throw new Error('No se encontró workspace para workflows.');
  }
  return path.join(root, '.agent', 'workflows');
}

function ensureOwner(owner: string, agent: string): void {
  if (owner !== agent) {
    throw new Error(`Agent mismatch: expected "${owner}" but got "${agent}".`);
  }
}

function requireString(value: string | undefined, field: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`${field} requerido`);
  }
  return value;
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
