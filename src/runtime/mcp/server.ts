import readline from 'node:readline';
import path from 'node:path';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { RuntimeEmitter } from '../engine/emitter.js';
import { loadWorkflows, resolvePhaseWorkflow } from '../engine/workflow-loader.js';
import { loadTask, resolveWorkflowsRoot } from '../engine/task-loader.js';
import { runRuntime, resumeRuntime } from '../engine/service.js';
import type { RuntimeEvent } from '../engine/types.js';

interface McpRequest {
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface McpResponse {
  id: string | number;
  result?: unknown;
  error?: { message: string };
}

interface GateResult {
  valid: boolean;
  reason?: string;
}

export async function startRuntimeMcpServer(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    await handleRequest(trimmed);
  }
}

async function handleRequest(line: string): Promise<void> {
  let request: McpRequest;
  try {
    request = JSON.parse(line) as McpRequest;
  } catch (error) {
    writeResponse({ id: 'unknown', error: { message: 'Invalid JSON request.' } });
    return;
  }

  try {
    const result = await dispatchRequest(request);
    writeResponse({ id: request.id, result });
  } catch (error) {
    writeResponse({ id: request.id, error: { message: formatError(error) } });
  }
}

async function dispatchRequest(request: McpRequest): Promise<unknown> {
  switch (request.method) {
    case 'runtime.run':
      return handleRun(request.params ?? {});
    case 'runtime.resume':
      return handleResume(request.params ?? {});
    case 'runtime.get_state':
      return handleGetState(request.params ?? {});
    case 'runtime.list_workflows':
      return handleListWorkflows(request.params ?? {});
    case 'runtime.validate_gate':
      return handleValidateGate(request.params ?? {});
    case 'runtime.advance_phase':
      return handleAdvancePhase(request.params ?? {});
    case 'runtime.emit_event':
      return handleEmitEvent(request.params ?? {});
    case 'runtime.chat':
      return handleChat(request.params ?? {});
    default:
      throw new Error(`Unknown method: ${request.method}`);
  }
}

async function handleRun(params: Record<string, unknown>): Promise<unknown> {
  const taskPath = ensureString(params.taskPath, 'taskPath');
  const agent = ensureString(params.agent, 'agent');
  const statePath = getOptionalString(params.statePath);
  const eventsPath = getOptionalString(params.eventsPath);
  const result = await runRuntime({
    taskPath,
    agent,
    statePath,
    eventsPath,
    stdoutEvents: false
  });
  return { status: 'ok', runId: result.runId, phase: result.phase };
}

async function handleResume(params: Record<string, unknown>): Promise<unknown> {
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

async function handleGetState(params: Record<string, unknown>): Promise<unknown> {
  const statePath = ensureString(params.statePath, 'statePath');
  const raw = await fs.readFile(path.resolve(statePath), 'utf-8');
  return JSON.parse(raw);
}

async function handleListWorkflows(params: Record<string, unknown>): Promise<unknown> {
  const workflowsRoot = ensureString(params.workflowsRoot, 'workflowsRoot');
  return loadWorkflows(workflowsRoot);
}

async function handleValidateGate(params: Record<string, unknown>): Promise<GateResult> {
  const taskPath = ensureString(params.taskPath, 'taskPath');
  const agent = ensureString(params.agent, 'agent');
  const expectedPhase = getOptionalString(params.expectedPhase);
  const task = await loadTask(taskPath);
  if (task.owner !== agent) {
    return { valid: false, reason: 'Agent mismatch.' };
  }
  if (expectedPhase && task.phase !== expectedPhase) {
    return { valid: false, reason: `Phase mismatch. Current: ${task.phase}.` };
  }
  return { valid: true };
}

async function handleAdvancePhase(params: Record<string, unknown>): Promise<unknown> {
  const taskPath = ensureString(params.taskPath, 'taskPath');
  const agent = ensureString(params.agent, 'agent');
  const eventsPath = getOptionalString(params.eventsPath);
  const task = await loadTask(taskPath);
  if (task.owner !== agent) {
    throw new Error('Agent mismatch.');
  }
  const workflowsRoot = resolveWorkflowsRoot(path.dirname(taskPath));
  const nextPhase = await resolveNextPhase(workflowsRoot, task.phase);
  const updated = await updateTaskPhase(taskPath, task.phase, nextPhase, agent);
  const emitter = new RuntimeEmitter({ eventsPath, stdout: false });
  await emitter.emit({
    type: 'phase_updated',
    timestamp: updated.updatedAt,
    runId: task.id,
    phase: nextPhase,
    payload: { previousPhase: task.phase }
  });
  return { status: 'ok', previousPhase: task.phase, currentPhase: nextPhase, updatedAt: updated.updatedAt };
}

async function handleEmitEvent(params: Record<string, unknown>): Promise<unknown> {
  const eventsPath = getOptionalString(params.eventsPath);
  const event = params.event as RuntimeEvent | undefined;
  if (!event) {
    throw new Error('Missing event payload.');
  }
  const emitter = new RuntimeEmitter({ eventsPath, stdout: false });
  await emitter.emit(event);
  return { status: 'ok' };
}

async function handleChat(params: Record<string, unknown>): Promise<unknown> {
  const eventsPath = getOptionalString(params.eventsPath);
  const message = ensureString(params.message, 'message');
  const role = getOptionalString(params.role) ?? 'user';
  const emitter = new RuntimeEmitter({ eventsPath, stdout: false });
  await emitter.emit({
    type: 'chat_message',
    timestamp: new Date().toISOString(),
    runId: 'chat',
    payload: { role, content: message }
  });
  return { status: 'ok' };
}

function ensureString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing ${name}.`);
  }
  return value;
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function writeResponse(response: McpResponse): void {
  process.stdout.write(`${JSON.stringify(response)}\n`);
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function resolveNextPhase(workflowsRoot: string, currentPhase: string): Promise<string> {
  const indexPath = path.join(workflowsRoot, 'tasklifecycle-long', 'index.md');
  const raw = await fs.readFile(indexPath, 'utf-8');
  const match = raw.match(/```yaml\n([\s\S]*?)```/);
  if (!match) {
    throw new Error('Missing workflow index YAML block.');
  }
  const yaml = match[1];
  const data = matter(`---\n${yaml}\n---`).data as Record<string, unknown>;
  const phases = (data.aliases as Record<string, any> | undefined)?.['tasklifecycle-long']?.phases;
  if (!phases || typeof phases !== 'object') {
    throw new Error('Invalid workflow index structure.');
  }
  const phaseIds = Object.entries(phases)
    .sort(([a], [b]) => parseInt(a.split('_')[1] ?? '0', 10) - parseInt(b.split('_')[1] ?? '0', 10))
    .map(([, value]) => {
      const id = (value as { id?: string }).id;
      if (!id) {
        throw new Error('Phase entry missing id.');
      }
      return id;
    });
  const index = phaseIds.indexOf(currentPhase);
  if (index === -1 || index === phaseIds.length - 1) {
    throw new Error('No next phase available.');
  }
  return phaseIds[index + 1];
}

async function updateTaskPhase(taskPath: string, currentPhase: string, nextPhase: string, agent: string): Promise<{ updatedAt: string }> {
  const timestamp = new Date().toISOString();
  const raw = await fs.readFile(taskPath, 'utf-8');
  const lines = raw.split('\n');
  let inYaml = false;
  let activePhase: string | null = null;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith('```yaml')) {
      inYaml = true;
      continue;
    }
    if (inYaml && line.startsWith('```')) {
      inYaml = false;
      continue;
    }
    if (!inYaml) {
      continue;
    }
    if (/^\s{6}phase-/.test(line)) {
      const phaseMatch = line.match(/^\s{6}(phase-[^:]+):/);
      activePhase = phaseMatch ? phaseMatch[1] : null;
      continue;
    }
    if (/^\s{4}current:/.test(line)) {
      lines[i] = line.replace(/current:.*$/, `current: "${nextPhase}"`);
      continue;
    }
    if (/^\s{4}validated_by:/.test(line)) {
      lines[i] = line.replace(/validated_by:.*$/, `validated_by: "${agent}"`);
      continue;
    }
    if (/^\s{4}updated_at:/.test(line)) {
      lines[i] = line.replace(/updated_at:.*$/, `updated_at: "${timestamp}"`);
      continue;
    }
    if (activePhase !== currentPhase) {
      continue;
    }
    if (/^\s{8}completed:/.test(line)) {
      lines[i] = '        completed: true';
      continue;
    }
    if (/^\s{8}validated_by:/.test(line)) {
      lines[i] = `        validated_by: "${agent}"`;
      continue;
    }
    if (/^\s{8}validated_at:/.test(line)) {
      lines[i] = `        validated_at: "${timestamp}"`;
    }
  }
  await fs.writeFile(taskPath, lines.join('\n'));
  return { updatedAt: timestamp };
}
