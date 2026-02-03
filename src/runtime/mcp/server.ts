import readline from 'node:readline';
import path from 'node:path';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { RuntimeEmitter } from '../engine/emitter.js';
import { loadWorkflows, resolvePhaseWorkflow } from '../engine/workflow-loader.js';
import { loadTask, resolveWorkflowsRoot } from '../engine/task-loader.js';
import { runRuntime, resumeRuntime, stepRuntime } from '../engine/service.js';
import type { RuntimeEvent } from '../engine/types.js';
import { Logger } from '../engine/logger.js';

interface McpRequest {
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface McpResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string };
}

const MCP_TOOLS = [
  {
    name: 'runtime_run',
    description: 'Start a new workflow runtime execution',
    inputSchema: {
      type: 'object',
      properties: {
        taskPath: { type: 'string', description: 'Path to task.md file' },
        agent: { type: 'string', description: 'Agent identifier' }
      },
      required: ['taskPath', 'agent']
    }
  },
  {
    name: 'runtime_chat',
    description: 'Send a chat message to the runtime',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Chat message content' },
        role: { type: 'string', description: 'Message role (user/assistant)' }
      },
      required: ['message']
    }
  },
  {
    name: 'runtime_list_workflows',
    description: 'List available workflows',
    inputSchema: {
      type: 'object',
      properties: {
        workflowsRoot: { type: 'string', description: 'Path to workflows directory' }
      },
      required: ['workflowsRoot']
    }
  },
  {
    name: 'runtime_validate_gate',
    description: 'Validate a workflow gate',
    inputSchema: {
      type: 'object',
      properties: {
        taskPath: { type: 'string' },
        agent: { type: 'string' },
        expectedPhase: { type: 'string' }
      },
      required: ['taskPath', 'agent']
    }
  },
  {
    name: 'runtime_advance_phase',
    description: 'Advance to the next workflow phase',
    inputSchema: {
      type: 'object',
      properties: {
        taskPath: { type: 'string' },
        agent: { type: 'string' }
      },
      required: ['taskPath', 'agent']
    }
  },
  {
    name: 'debug_read_logs',
    description: 'Read runtime debug logs',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max logs to return' }
      }
    }
  }
];

interface GateResult {
  valid: boolean;
  reason?: string;
}

export async function startRuntimeMcpServer(): Promise<void> {
  Logger.info('MCP', 'Server started via stdio transport. Waiting for JSON-RPC messages...');
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
    Logger.debug('MCP', 'Received request', { id: request.id, method: request.method });
  } catch (error) {
    writeResponse({ jsonrpc: '2.0', id: 'unknown', error: { code: -32700, message: 'Invalid JSON request.' } });
    return;
  }

  // Notifications (no id) don't require a response
  if (request.id === undefined || request.id === null) {
    Logger.debug('MCP', 'Received notification, no response needed', { method: request.method });
    return;
  }

  try {
    const result = await dispatchRequest(request);
    writeResponse({ jsonrpc: '2.0', id: request.id, result });
  } catch (error) {
    Logger.error('MCP', `Request failed: ${request.method}`, { id: request.id, error: formatError(error) });
    writeResponse({ jsonrpc: '2.0', id: request.id, error: { code: -32603, message: formatError(error) } });
  }
}

async function dispatchRequest(request: McpRequest): Promise<unknown> {
  switch (request.method) {
    // MCP Standard Protocol
    case 'initialize':
      return handleInitialize();
    case 'tools/list':
      return handleToolsList();
    case 'tools/call':
      return handleToolsCall(request.params ?? {});
    // Runtime-specific methods (via tools/call)
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
    case 'runtime.next_step':
      return handleNextStep(request.params ?? {});
    case 'runtime.complete_step':
      return handleCompleteStep(request.params ?? {});
    case 'debug_read_logs':
      return handleDebugReadLogs(request.params ?? {});
    case 'resources/templates/list':
      return handleTemplatesList();
    default:
      throw new Error(`Unknown method: ${request.method}`);
  }
}

function handleInitialize(): unknown {
  return {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {}
    },
    serverInfo: {
      name: 'agentic-workflow',
      version: '1.0.0'
    }
  };
}

function handleToolsList(): unknown {
  return { tools: MCP_TOOLS };
}

async function handleTemplatesList(): Promise<unknown> {
  const workspaceRoot = await findWorkspaceRoot(collectWorkspaceCandidates());
  if (!workspaceRoot) {
    throw new Error('No pude listar templates: no se encontró ".agent/" desde el cwd actual.');
  }

  const indexPath = path.join(workspaceRoot, '.agent', 'templates', 'index.md');
  const raw = await fs.readFile(indexPath, 'utf-8');
  const match = raw.match(/```yaml\n([\s\S]*?)```/);
  if (!match) {
    return { templates: [] };
  }
  const yaml = match[1];
  const data = matter(`---\n${yaml}\n---`).data as Record<string, any>;
  const templates = (data.templates as Record<string, string> | undefined) ?? {};
  const items = Object.entries(templates).map(([alias, templatePath]) => ({
    id: alias,
    path: templatePath,
    absolutePath: path.resolve(workspaceRoot, templatePath)
  }));
  return { templates: items };
}

async function handleToolsCall(params: Record<string, unknown>): Promise<unknown> {
  const toolName = ensureString(params.name, 'name');
  const args = (params.arguments ?? {}) as Record<string, unknown>;

  switch (toolName) {
    case 'runtime_run':
      return handleRun(args);
    case 'runtime_chat':
      return handleChat(args);
    case 'runtime_list_workflows':
      return handleListWorkflows(args);
    case 'runtime_validate_gate':
      return handleValidateGate(args);
    case 'runtime_advance_phase':
      return handleAdvancePhase(args);
    case 'debug_read_logs':
      return handleDebugReadLogs(args);
    default:
      Logger.error('MCP', `Unknown tool called: ${toolName}`);
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

async function handleRun(params: Record<string, unknown>): Promise<unknown> {
  const taskPath = ensureString(params.taskPath, 'taskPath');
  const agent = ensureString(params.agent, 'agent');
  const statePath = getOptionalString(params.statePath);
  const eventsPath = getOptionalString(params.eventsPath);

  Logger.info('MCP', `Tool called: runtime_run`, { taskPath, agent });

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

async function handleNextStep(params: Record<string, unknown>): Promise<unknown> {
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
  return { status: 'ok', runId: result.runId, phase: result.phase, step: result.steps.find(s => s.status === 'completed' || s.status === 'failed') };
}

async function handleCompleteStep(params: Record<string, unknown>): Promise<unknown> {
  return { status: 'ok', message: 'Step completion acknowledged (logic pending specific requirement).' };
}

async function handleGetState(params: Record<string, unknown>): Promise<unknown> {
  const statePath = ensureString(params.statePath, 'statePath');
  const rawState = await fs.readFile(path.resolve(statePath), 'utf-8');
  const state = JSON.parse(rawState);

  // Enrich with task content
  let taskContent = '';
  try {
    if (state.taskPath) {
      taskContent = await fs.readFile(state.taskPath, 'utf-8');
    }
  } catch (e) {
    // Ignore if task file not found
  }

  return { ...state, taskContent };
}

async function handleListWorkflows(params: Record<string, unknown>): Promise<unknown> {
  const workflowsRoot = ensureString(params.workflowsRoot, 'workflowsRoot');
  Logger.info('MCP', `Tool called: runtime_list_workflows`, { workflowsRoot });
  const workflows = await loadWorkflows(workflowsRoot);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(workflows)
      }
    ]
  };
}

async function handleValidateGate(params: Record<string, unknown>): Promise<unknown> {
  const taskPath = ensureString(params.taskPath, 'taskPath');
  const agent = ensureString(params.agent, 'agent');
  const expectedPhase = getOptionalString(params.expectedPhase);

  Logger.info('MCP', `Tool called: runtime_validate_gate`, { taskPath, agent, expectedPhase });

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

async function handleAdvancePhase(params: Record<string, unknown>): Promise<unknown> {
  const taskPath = ensureString(params.taskPath, 'taskPath');
  const agent = ensureString(params.agent, 'agent');
  const eventsPath = getOptionalString(params.eventsPath);

  Logger.info('MCP', `Tool called: runtime_advance_phase`, { taskPath, agent });

  const resolved = await resolveTaskPath(taskPath);
  const task = await loadTask(resolved.resolvedPath);
  if (task.owner !== agent) {
    throw new Error('Agent mismatch.');
  }
  const workflowsRoot = resolveWorkflowsRoot(path.dirname(resolved.resolvedPath));
  const nextPhase = await resolveNextPhase(workflowsRoot, task.phase);
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

  Logger.info('Runtime', `Chat message received from ${role}`, { message });

  const emitter = new RuntimeEmitter({ eventsPath, stdout: false });
  await emitter.emit({
    type: 'chat_message',
    timestamp: new Date().toISOString(),
    runId: 'chat',
    payload: { role, content: message }
  });

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ status: 'ok' })
      }
    ]
  };
}

async function handleDebugReadLogs(params: Record<string, unknown>): Promise<unknown> {
  const limit = typeof params.limit === 'number' ? params.limit : 100;
  const logs = Logger.getInstance().getLogs(limit);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(logs, null, 2)
      }
    ]
  };
}

const WORKSPACE_ENV_VARS = ['PWD', 'INIT_CWD', 'AGENTIC_WORKSPACE', 'WORKSPACE'];

async function resolveTaskPath(taskPath: string): Promise<{ resolvedPath: string; workspaceRoot: string | null }> {
  if (path.isAbsolute(taskPath)) {
    const workspaceRoot = await findWorkspaceRoot([path.dirname(taskPath)]);
    return { resolvedPath: taskPath, workspaceRoot };
  }

  const candidateRoots = collectWorkspaceCandidates();
  const workspaceRoot = await findWorkspaceRoot(candidateRoots);
  if (!workspaceRoot) {
    const subject = taskPath.includes('init.md') ? 'el init' : 'el taskPath';
    throw new Error(`No pude resolver ${subject}: no se encontró ".agent/" desde el cwd actual. Ejecuta el comando desde el workspace o pasa una ruta absoluta.`);
  }

  return { resolvedPath: path.resolve(workspaceRoot, taskPath), workspaceRoot };
}

async function ensureInitTaskFile(taskPath: string, workspaceRoot: string | null): Promise<void> {
  if (!isInitTaskPath(taskPath)) {
    return;
  }
  const exists = await fileExists(taskPath);
  if (exists) {
    return;
  }
  if (!workspaceRoot) {
    throw new Error('No se pudo resolver el workspace para crear init.md desde template.');
  }
  const templatePath = path.join(workspaceRoot, '.agent', 'templates', 'init.md');
  const template = await fs.readFile(templatePath, 'utf-8');
  await fs.mkdir(path.dirname(taskPath), { recursive: true });
  await fs.writeFile(taskPath, template);
}

function collectWorkspaceCandidates(): string[] {
  const candidates = [process.cwd(), ...WORKSPACE_ENV_VARS.map((key) => process.env[key])]
    .filter((value): value is string => Boolean(value));
  return Array.from(new Set(candidates.map((candidate) => path.resolve(candidate))));
}

async function findWorkspaceRoot(candidates: string[]): Promise<string | null> {
  for (const candidate of candidates) {
    const resolved = await findWorkspaceRootFromDir(candidate);
    if (resolved) {
      return resolved;
    }
  }
  return null;
}

async function findWorkspaceRootFromDir(startDir: string): Promise<string | null> {
  let currentDir = path.resolve(startDir);
  const root = path.parse(currentDir).root;
  while (true) {
    const agentDir = path.join(currentDir, '.agent');
    if (await fileExists(agentDir)) {
      return currentDir;
    }
    if (currentDir === root) {
      return null;
    }
    currentDir = path.dirname(currentDir);
  }
}

function isInitTaskPath(taskPath: string): boolean {
  const normalized = path.normalize(taskPath);
  const initSuffix = path.join('.agent', 'artifacts', 'candidate', 'init.md');
  return normalized.endsWith(initSuffix);
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
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
  Logger.debug('MCP', 'Sending response', { id: response.id, error: !!response.error });
  process.stdout.write(`${JSON.stringify(response)}\n`);
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function resolveNextPhase(workflowsRoot: string, currentPhase: string): Promise<string> {
  const strategies = ['tasklifecycle-long', 'tasklifecycle-short'];

  for (const strategy of strategies) {
    try {
      const indexPath = path.join(workflowsRoot, strategy, 'index.md');
      const raw = await fs.readFile(indexPath, 'utf-8');
      const match = raw.match(/```yaml\n([\s\S]*?)```/);
      if (!match) {
        continue;
      }

      const yaml = match[1];
      const data = matter(`---\n${yaml}\n---`).data as Record<string, unknown>;
      const phases = (data.aliases as Record<string, any> | undefined)?.[strategy]?.phases;

      if (!phases || typeof phases !== 'object') {
        continue;
      }

      const phaseIds = Object.entries(phases)
        .sort(([a], [b]) => {
          const aNum = parseInt(a.split('_').pop() ?? '0', 10);
          const bNum = parseInt(b.split('_').pop() ?? '0', 10);
          return aNum - bNum;
        })
        .map(([, value]) => {
          const id = (value as { id?: string }).id;
          if (!id) {
            throw new Error('Phase entry missing id.');
          }
          return id;
        });

      const index = phaseIds.indexOf(currentPhase);
      if (index !== -1 && index < phaseIds.length - 1) {
        return phaseIds[index + 1];
      }
    } catch (error) {
      continue;
    }
  }
  throw new Error(`No next phase found after ${currentPhase} in any known strategy.`);
}

async function updateTaskPhase(taskPath: string, currentPhase: string, nextPhase: string, agent: string): Promise<{ updatedAt: string }> {
  const timestamp = new Date().toISOString();
  const resolvedPath = path.resolve(taskPath);
  const raw = await fs.readFile(resolvedPath, 'utf-8');
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
  await fs.writeFile(resolvedPath, lines.join('\n'));
  return { updatedAt: timestamp };
}
