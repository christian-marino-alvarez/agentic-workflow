import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { Logger } from '../infrastructure/logger/index.js';
import { resolveWorkspaceRoot } from '../runtime/task-resolver.js';
import { Runtime } from '../runtime/runtime.js';
import { RuntimeEmitter } from './emitter.js';
import type { ToolName } from './tools.js';

type ToolHandler = (runtime: Runtime, args: Record<string, unknown>) => Promise<Record<string, unknown>>;

const TOOL_HANDLERS: Record<ToolName, ToolHandler> = {
  'runtime.run': (runtime, args) => runtime.run(args),
  'runtime.resume': (runtime, args) => runtime.resume(args),
  'runtime.next_step': (runtime, args) => runtime.nextStep(args),
  'runtime.complete_step': (runtime) => runtime.completeStep(),
  'runtime.validate_gate': (runtime, args) => runtime.validateGate(args),
  'runtime.advance_phase': (runtime, args) => runtime.advancePhase(args),
  'runtime.get_state': (runtime, args) => runtime.getState(args),
  'runtime.list_workflows': (runtime, args) => runtime.listWorkflows(args),
  'runtime.emit_event': (runtime, args) => runtime.emitEvent(args),
  'runtime.chat': (runtime, args) => runtime.chat(args),
  'debug.read_logs': (runtime, args) => runtime.readLogs(args)
};

export async function handleToolCall(runtime: Runtime, name: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const workspaceEnv = process.env.AGENTIC_WORKSPACE;
  let workspaceRoot: string | null = null;
  let workspaceError: string | null = null;
  try {
    workspaceRoot = resolveWorkspaceRoot(workspaceEnv);
  } catch (error) {
    workspaceError = error instanceof Error ? error.message : String(error);
  }
  Logger.info('MCP', 'Tool call received', {
    tool: name,
    cwd: process.cwd(),
    workspaceEnv,
    workspaceRoot,
    workspaceError
  });

  const handler = TOOL_HANDLERS[name as ToolName];
  if (!handler) {
    throw new Error(`Tool no soportada: ${name}`);
  }
  const result = await handler(runtime, args);
  await emitEventIfPresent(result, args);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result)
      }
    ]
  };
}

async function emitEventIfPresent(result: Record<string, unknown>, args: Record<string, unknown>): Promise<void> {
  const event = result.emitEvent as Record<string, unknown> | undefined;
  if (!event) {
    return;
  }
  const eventsPath = typeof args.eventsPath === 'string' ? args.eventsPath : undefined;
  if (!eventsPath) {
    return;
  }
  const emitter = new RuntimeEmitter(eventsPath);
  await emitter.emit(event as any);
}
