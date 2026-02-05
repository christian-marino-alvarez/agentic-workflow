import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export type ToolName =
  | 'runtime_run'
  | 'runtime_update_init'
  | 'runtime_resume'
  | 'runtime_next_step'
  | 'runtime_complete_step'
  | 'runtime_validate_gate'
  | 'runtime_advance_phase'
  | 'runtime_get_state'
  | 'runtime_list_workflows'
  | 'runtime_emit_event'
  | 'runtime_reconcile'
  | 'runtime_chat'
  | 'debug_read_logs';

export const MCP_TOOLS: Tool[] = [
  {
    name: 'runtime_run',
    description: 'Start a new workflow runtime execution',
    inputSchema: {
      type: 'object',
      properties: {
        taskPath: { type: 'string', description: 'Path to task.md file' },
        agent: { type: 'string', description: 'Agent identifier' },
        statePath: { type: 'string', description: 'Optional state file path' },
        eventsPath: { type: 'string', description: 'Optional events file path' }
      },
      required: ['taskPath', 'agent']
    }
  },
  {
    name: 'runtime_update_init',
    description: 'Fill init candidate template with runtime-provided values',
    inputSchema: {
      type: 'object',
      properties: {
        taskPath: { type: 'string', description: 'Path to init candidate file' },
        agent: { type: 'string', description: 'Agent identifier' },
        command: { type: 'string', description: 'Init command invoked' },
        constitutionPaths: { type: 'array', items: { type: 'string' } },
        language: { type: 'string' },
        languageConfirmed: { type: 'boolean' },
        strategy: { type: 'string', description: 'long | short' },
        traceabilityVerified: { type: 'boolean' },
        traceabilityTool: { type: 'string' },
        traceabilityResponse: { type: 'string' },
        traceabilityTimestamp: { type: 'string' },
        runtimeStarted: { type: 'boolean' },
        taskId: { type: 'string' },
        taskPathValue: { type: 'string' }
      },
      required: [
        'taskPath',
        'agent',
        'command',
        'constitutionPaths',
        'language',
        'languageConfirmed',
        'strategy',
        'traceabilityVerified',
        'traceabilityTool',
        'traceabilityResponse',
        'traceabilityTimestamp',
        'runtimeStarted',
        'taskId',
        'taskPathValue'
      ]
    }
  },
  {
    name: 'runtime_resume',
    description: 'Resume workflow runtime execution',
    inputSchema: {
      type: 'object',
      properties: {
        taskPath: { type: 'string', description: 'Path to task.md file' },
        agent: { type: 'string', description: 'Agent identifier' },
        statePath: { type: 'string', description: 'Optional state file path' },
        eventsPath: { type: 'string', description: 'Optional events file path' }
      },
      required: ['taskPath', 'agent']
    }
  },
  {
    name: 'runtime_next_step',
    description: 'Advance runtime one step',
    inputSchema: {
      type: 'object',
      properties: {
        taskPath: { type: 'string', description: 'Path to task.md file' },
        agent: { type: 'string', description: 'Agent identifier' },
        statePath: { type: 'string', description: 'Optional state file path' },
        eventsPath: { type: 'string', description: 'Optional events file path' }
      },
      required: ['taskPath', 'agent']
    }
  },
  {
    name: 'runtime_complete_step',
    description: 'Acknowledge step completion',
    inputSchema: {
      type: 'object',
      properties: {}
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
        agent: { type: 'string' },
        expectedPhase: { type: 'string' },
        eventsPath: { type: 'string' }
      },
      required: ['taskPath', 'agent']
    }
  },
  {
    name: 'runtime_get_state',
    description: 'Read runtime state from statePath',
    inputSchema: {
      type: 'object',
      properties: {
        statePath: { type: 'string', description: 'Path to runtime state file' }
      },
      required: ['statePath']
    }
  },
  {
    name: 'runtime_list_workflows',
    description: 'List available workflows',
    inputSchema: {
      type: 'object',
      properties: {
        workflowsRoot: { type: 'string', description: 'Path to workflows directory' }
      }
    }
  },
  {
    name: 'runtime_emit_event',
    description: 'Emit a runtime event',
    inputSchema: {
      type: 'object',
      properties: {
        eventsPath: { type: 'string' },
        event: { type: 'object', description: 'Runtime event payload' }
      },
      required: ['event']
    }
  },
  {
    name: 'runtime_reconcile',
    description: 'Reconcile out-of-band changes; block if manual resolution is required',
    inputSchema: {
      type: 'object',
      properties: {
        taskPath: { type: 'string' },
        agent: { type: 'string' },
        statePath: { type: 'string' },
        breakGlass: { type: 'boolean' }
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
        role: { type: 'string', description: 'Message role (user/assistant)' },
        eventsPath: { type: 'string', description: 'Optional events file path' }
      },
      required: ['message']
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
