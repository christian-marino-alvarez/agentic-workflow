import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { McpToolDefinition, ToolInputSchema } from '../schemas/common.js';
import { handleRun } from '../handlers/runtime/run.js';
import { handleChat } from '../handlers/runtime/events.js';
import { handleListWorkflows } from '../handlers/runtime/workflows.js';
import { handleValidateGate } from '../handlers/runtime/gates.js';
import { handleAdvancePhase } from '../handlers/runtime/advance-phase.js';
import { handleDebugReadLogs } from '../handlers/runtime/debug.js';
import { defineTool } from '../registry/tool.js';

type ToolHandler = (args: Record<string, unknown>) => Promise<CallToolResult>;

type McpToolSpec = McpToolDefinition & {
  handler: ToolHandler;
};

const runtimeRunSchema: ToolInputSchema = {
  type: 'object',
  properties: {
    taskPath: { type: 'string', description: 'Path to task.md file' },
    agent: { type: 'string', description: 'Agent identifier' },
    statePath: { type: 'string', description: 'Optional state file path' },
    eventsPath: { type: 'string', description: 'Optional events file path' }
  },
  required: ['taskPath', 'agent']
};

const runtimeChatSchema: ToolInputSchema = {
  type: 'object',
  properties: {
    message: { type: 'string', description: 'Chat message content' },
    role: { type: 'string', description: 'Message role (user/assistant)' },
    eventsPath: { type: 'string', description: 'Optional events file path' }
  },
  required: ['message']
};

const runtimeListWorkflowsSchema: ToolInputSchema = {
  type: 'object',
  properties: {
    workflowsRoot: { type: 'string', description: 'Path to workflows directory' }
  },
  required: ['workflowsRoot']
};

const runtimeValidateGateSchema: ToolInputSchema = {
  type: 'object',
  properties: {
    taskPath: { type: 'string' },
    agent: { type: 'string' },
    expectedPhase: { type: 'string' }
  },
  required: ['taskPath', 'agent']
};

const runtimeAdvancePhaseSchema: ToolInputSchema = {
  type: 'object',
  properties: {
    taskPath: { type: 'string' },
    agent: { type: 'string' },
    expectedPhase: { type: 'string' },
    eventsPath: { type: 'string' }
  },
  required: ['taskPath', 'agent']
};

const debugReadLogsSchema: ToolInputSchema = {
  type: 'object',
  properties: {
    limit: { type: 'number', description: 'Max logs to return' }
  }
};

export const RUNTIME_TOOL_SPECS: McpToolSpec[] = [
  {
    ...defineTool({
      name: 'runtime_run',
      description: 'Start a new workflow runtime execution',
      inputSchema: runtimeRunSchema
    }),
    handler: handleRun
  },
  {
    ...defineTool({
      name: 'runtime_chat',
      description: 'Send a chat message to the runtime',
      inputSchema: runtimeChatSchema
    }),
    handler: handleChat
  },
  {
    ...defineTool({
      name: 'runtime_list_workflows',
      description: 'List available workflows',
      inputSchema: runtimeListWorkflowsSchema
    }),
    handler: handleListWorkflows
  },
  {
    ...defineTool({
      name: 'runtime_validate_gate',
      description: 'Validate a workflow gate',
      inputSchema: runtimeValidateGateSchema
    }),
    handler: handleValidateGate
  },
  {
    ...defineTool({
      name: 'runtime_advance_phase',
      description: 'Advance to the next workflow phase',
      inputSchema: runtimeAdvancePhaseSchema
    }),
    handler: handleAdvancePhase
  },
  {
    ...defineTool({
      name: 'debug_read_logs',
      description: 'Read runtime debug logs',
      inputSchema: debugReadLogsSchema
    }),
    handler: handleDebugReadLogs
  }
];

export const MCP_TOOLS: McpToolDefinition[] = RUNTIME_TOOL_SPECS.map(({ handler: _handler, ...tool }) => tool);

export function getToolHandler(name: string): ToolHandler | undefined {
  return RUNTIME_TOOL_SPECS.find((tool) => tool.name === name)?.handler;
}
