import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export type ToolName =
  | 'runtime.run'
  | 'runtime.resume'
  | 'runtime.next_step'
  | 'runtime.complete_step'
  | 'runtime.validate_gate'
  | 'runtime.advance_phase'
  | 'runtime.get_state'
  | 'runtime.list_workflows'
  | 'runtime.emit_event'
  | 'runtime.reconcile'
  | 'runtime.chat'
  | 'debug.read_logs';

export const MCP_TOOLS: Tool[] = [
  {
    name: 'runtime.run',
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
    name: 'runtime.resume',
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
    name: 'runtime.next_step',
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
    name: 'runtime.complete_step',
    description: 'Acknowledge step completion',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'runtime.validate_gate',
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
    name: 'runtime.advance_phase',
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
    name: 'runtime.get_state',
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
    name: 'runtime.list_workflows',
    description: 'List available workflows',
    inputSchema: {
      type: 'object',
      properties: {
        workflowsRoot: { type: 'string', description: 'Path to workflows directory' }
      }
    }
  },
  {
    name: 'runtime.emit_event',
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
    name: 'runtime.reconcile',
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
    name: 'runtime.chat',
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
    name: 'debug.read_logs',
    description: 'Read runtime debug logs',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max logs to return' }
      }
    }
  }
];
