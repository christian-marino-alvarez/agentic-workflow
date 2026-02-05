import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Logger } from '../infrastructure/logger/index.js';
import type { RuntimeEvent } from '../mcp/emitter.js';
import { loadTask } from './task-loader.js';
import { RuntimeWriteGuard } from './write-guard.js';
import { collectArtifactHashes, diffHashes } from './reconcile.js';
import { syncFrontmatterForTaskArtifacts } from './frontmatter-sync.js';
import {
  collectWorkspaceCandidates,
  ensureInitTaskFile,
  findWorkspaceRoot,
  resolveNextPhase,
  resolveTaskPath,
  resolveWorkflowsRootForTask,
  resolveWorkspaceRoot,
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
  breakGlass?: boolean;
  command?: string;
  constitutionPaths?: string[];
  language?: string;
  languageConfirmed?: boolean;
  strategy?: string;
  traceabilityVerified?: boolean;
  traceabilityTool?: string;
  traceabilityResponse?: string;
  traceabilityTimestamp?: string;
  runtimeStarted?: boolean;
  taskId?: string;
  taskPathValue?: string;
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
  artifactHashes?: Record<string, string>;
};

export class Runtime {
  private stateCache = new Map<string, RuntimeState>();

  async run(params: RuntimeActionParams): Promise<Record<string, unknown>> {
    const taskPath = requireString(params.taskPath, 'taskPath');
    const agent = requireString(params.agent, 'agent');
    Logger.info('MCP', 'Tool called: runtime.run', { taskPath, agent });

    const resolved = await resolveTaskPath(taskPath);
    const writeGuard = this.buildWriteGuard(resolved.resolvedPath, resolved.workspaceRoot, agent, params.breakGlass);
    let initResult;
    try {
      initResult = await ensureInitTaskFile(resolved.resolvedPath, resolved.workspaceRoot, writeGuard);
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
      updatedAt: new Date().toISOString(),
      artifactHashes: {}
    };

    await this.writeState(statePath, state, writeGuard);
    return { status: 'ok', runId: state.runId, phase: state.phase, statePath };
  }

  async updateInit(params: RuntimeActionParams): Promise<Record<string, unknown>> {
    const taskPath = requireString(params.taskPath, 'taskPath');
    const agent = requireString(params.agent, 'agent');
    Logger.info('MCP', 'Tool called: runtime.update_init', { taskPath, agent });

    const command = requireString(params.command, 'command');
    const constitutionPaths = requireStringArray(params.constitutionPaths, 'constitutionPaths');
    const language = requireString(params.language, 'language');
    const languageConfirmed = requireBoolean(params.languageConfirmed, 'languageConfirmed');
    const strategy = requireString(params.strategy, 'strategy');
    const traceabilityVerified = requireBoolean(params.traceabilityVerified, 'traceabilityVerified');
    const traceabilityTool = requireString(params.traceabilityTool, 'traceabilityTool');
    const traceabilityResponse = requireString(params.traceabilityResponse, 'traceabilityResponse');
    const traceabilityTimestamp = requireString(params.traceabilityTimestamp, 'traceabilityTimestamp');
    const runtimeStarted = requireBoolean(params.runtimeStarted, 'runtimeStarted');
    const taskId = requireString(params.taskId, 'taskId');
    const taskPathValue = requireString(params.taskPathValue, 'taskPathValue');

    const resolved = await resolveTaskPath(taskPath);
    const writeGuard = this.buildWriteGuard(resolved.resolvedPath, resolved.workspaceRoot, agent, params.breakGlass);
    const initResult = await ensureInitTaskFile(resolved.resolvedPath, resolved.workspaceRoot, writeGuard);

    if (!resolved.workspaceRoot) {
      throw new Error('No se pudo resolver workspaceRoot para actualizar init candidate.');
    }

    const templatePath = path.join(resolved.workspaceRoot, '.agent', 'templates', 'init.md');
    const template = await fs.readFile(templatePath, 'utf-8');
    const hydrated = renderInitTemplate(template, {
      command,
      constitutionPaths,
      language,
      languageConfirmed,
      strategy,
      traceabilityVerified,
      traceabilityTool,
      traceabilityResponse,
      traceabilityTimestamp,
      runtimeStarted,
      taskId,
      taskPathValue
    });

    await writeGuard.writeFile(initResult.taskPath, hydrated);
    return { status: 'ok', taskPath: initResult.taskPath };
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
    const writeGuard = this.buildWriteGuard(resolved.resolvedPath, resolved.workspaceRoot, agent, params.breakGlass);
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
    await this.writeState(statePath, state, writeGuard);
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
    const writeGuard = this.buildWriteGuard(resolved.resolvedPath, resolved.workspaceRoot, agent, params.breakGlass);
    const task = await loadTask(resolved.resolvedPath);
    if (task.owner !== agent) {
      throw new Error('Agent mismatch.');
    }
    if (expectedPhase && task.phase !== expectedPhase) {
      Logger.error('MCP', 'runtime.advance_phase expectedPhase mismatch; phase likely updated outside runtime', {
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
    const updated = await updateTaskPhase(resolved.resolvedPath, task.phase, nextPhase, agent, writeGuard);
    await syncFrontmatterForTaskArtifacts({
      workspaceRoot: resolved.workspaceRoot as string,
      taskId: task.id,
      taskTitle: task.title,
      owner: task.owner,
      currentPhase: nextPhase,
      writeGuard
    });
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

  async reconcile(params: RuntimeActionParams): Promise<Record<string, unknown>> {
    const taskPath = requireString(params.taskPath, 'taskPath');
    const agent = requireString(params.agent, 'agent');
    Logger.info('MCP', 'Tool called: runtime.reconcile', { taskPath, agent });

    const resolved = await resolveTaskPath(taskPath);
    const statePath = await resolveStatePath(resolved.resolvedPath, params.statePath);
    const state = await this.readState(statePath);
    if (!state) {
      throw new Error('No state found.');
    }
    const artifacts = await collectArtifactHashes(path.dirname(state.taskPath));
    const previous = state.artifactHashes ?? {};
    const changes = diffHashes(previous, artifacts);
    const timestamp = new Date().toISOString();

    if (Object.keys(previous).length === 0) {
      state.artifactHashes = artifacts;
      state.updatedAt = timestamp;
      const writeGuard = this.buildWriteGuard(resolved.resolvedPath, resolved.workspaceRoot, agent, params.breakGlass);
      await this.writeState(statePath, state, writeGuard);
      return {
        status: 'accepted',
        taskId: state.taskId,
        taskPath: state.taskPath,
        emitEvent: {
          type: 'reconcile_accepted',
          timestamp,
          runId: state.taskId,
          payload: { changes: [] }
        }
      };
    }

    if (changes.length > 0) {
      return {
        status: 'blocked',
        reason: 'manual_resolution_required',
        taskId: state.taskId,
        taskPath: state.taskPath,
        changes,
        emitEvent: {
          type: 'reconcile_blocked',
          timestamp,
          runId: state.taskId,
          payload: { reason: 'manual_resolution_required', changes }
        }
      };
    }

    state.artifactHashes = artifacts;
    state.updatedAt = timestamp;
    const writeGuard = this.buildWriteGuard(resolved.resolvedPath, resolved.workspaceRoot, agent, params.breakGlass);
    await this.writeState(statePath, state, writeGuard);
    return {
      status: 'accepted',
      taskId: state.taskId,
      taskPath: state.taskPath,
      emitEvent: {
        type: 'reconcile_accepted',
        timestamp,
        runId: state.taskId,
        payload: { changes: [] }
      }
    };
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

  private async writeState(statePath: string, state: RuntimeState, writeGuard: RuntimeWriteGuard): Promise<void> {
    this.stateCache.set(statePath, state);
    await writeGuard.writeFile(path.resolve(statePath), JSON.stringify(state, null, 2));
  }

  private clearCache(): void {
    this.stateCache.clear();
  }

  private buildWriteGuard(taskPath: string, workspaceRoot: string | null, agent: string, breakGlass?: boolean): RuntimeWriteGuard {
    if (!workspaceRoot) {
      throw new Error('No se pudo resolver workspaceRoot para write guard.');
    }
    return new RuntimeWriteGuard({ workspaceRoot, actor: agent, breakGlass: Boolean(breakGlass) });
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
  const root = resolveWorkspaceRoot(process.env.AGENTIC_WORKSPACE);
  return path.join(root, '.agent', 'workflows');
}

function ensureOwner(owner: string, agent: string): void {
  if (owner !== agent) {
    throw new Error(`Agent mismatch: expected "${owner}" but got "${agent}".`);
  }
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${field} debe ser string`);
  }
  if (value.trim().length === 0) {
    throw new Error(`${field} requerido`);
  }
  return value;
}

function requireBoolean(value: unknown, field: string): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  throw new Error(`Missing or invalid ${field}.`);
}

function requireStringArray(value: unknown, field: string): string[] {
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return value;
  }
  throw new Error(`Missing or invalid ${field}.`);
}

type InitTemplatePayload = {
  command: string;
  constitutionPaths: string[];
  language: string;
  languageConfirmed: boolean;
  strategy: string;
  traceabilityVerified: boolean;
  traceabilityTool: string;
  traceabilityResponse: string;
  traceabilityTimestamp: string;
  runtimeStarted: boolean;
  taskId: string;
  taskPathValue: string;
};

function renderInitTemplate(template: string, payload: InitTemplatePayload): string {
  const replacements: Record<string, string> = {
    '{{command}}': payload.command,
    '{{constitutionPaths[0]}}': payload.constitutionPaths[0] ?? '',
    '{{constitutionPaths[1]}}': payload.constitutionPaths[1] ?? '',
    '{{constitutionPaths[2]}}': payload.constitutionPaths[2] ?? '',
    '{{language}}': payload.language,
    '{{languageConfirmed}}': String(payload.languageConfirmed),
    '{{strategy}}': payload.strategy,
    '{{traceabilityVerified}}': String(payload.traceabilityVerified),
    '{{traceabilityTool}}': payload.traceabilityTool,
    '{{traceabilityResponse}}': payload.traceabilityResponse,
    '{{traceabilityTimestamp}}': payload.traceabilityTimestamp,
    '{{runtimeStarted}}': String(payload.runtimeStarted),
    '{{taskId}}': payload.taskId,
    '{{taskPath}}': payload.taskPathValue
  };

  let output = template;
  for (const [token, value] of Object.entries(replacements)) {
    output = output.split(token).join(value);
  }
  return output;
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
