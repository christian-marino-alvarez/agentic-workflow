/**
 * Stream Event Transforms — each handles one SSE event type.
 * Transforms now ACCUMULATE data instead of emitting to the View.
 * All data is returned as part of the ChatMessagePayload.
 *
 * Pipeline: SSEParserTransform → Error → ToolEvent → Usage → Accumulator
 */

import type { SSEEvent } from './sse-parser.js';

/** Callback for logging. */
export type LogFn = (...args: any[]) => void;

// ─── Error Handler ──────────────────────────────────────────────────────

/** Stops the pipeline on error events. */
export function createErrorHandler(
  role: string,
  emitError: (role: string, msg: string) => void,
): TransformStream<SSEEvent, SSEEvent> {
  return new TransformStream({
    transform(event, controller) {
      if (event.error) {
        emitError(role, `**Error:** ${event.error}`);
        controller.error(new Error(event.error));
        return;
      }
      controller.enqueue(event);
    },
  });
}

// ─── Tool & Delegation Accumulator ──────────────────────────────────────

export interface ToolEventData {
  type: string;
  name?: string;
  arguments?: any;
  output?: any;
}

export interface DelegationData {
  type: string;
  agentRole: string;
  targetAgent?: string;
  taskDescription?: string;
  result?: string;
  status: string;
}

/** Accumulates tool_call / tool_result events (including delegation). Returns collected data. */
export function createToolEventAccumulator(
  role: string,
  parseDelegationArgs: (args: any) => { agent?: string; task?: string } | null | undefined,
): {
  transform: TransformStream<SSEEvent, SSEEvent>;
  getToolEvents: () => ToolEventData[];
  getDelegations: () => DelegationData[];
} {
  const toolEvents: ToolEventData[] = [];
  const delegations: DelegationData[] = [];

  const transform = new TransformStream<SSEEvent, SSEEvent>({
    transform(event, controller) {
      if (event.type === 'tool_call' || event.type === 'tool_result') {
        toolEvents.push({
          type: event.type,
          name: event.name,
          arguments: event.arguments,
          output: event.output,
        });

        // Delegation detection
        if (event.name === 'delegateTask') {
          delegations.push({
            type: event.type,
            agentRole: role,
            targetAgent: event.type === 'tool_call' ? parseDelegationArgs(event.arguments)?.agent : undefined,
            taskDescription: event.type === 'tool_call' ? parseDelegationArgs(event.arguments)?.task : undefined,
            result: event.type === 'tool_result' ? event.output : undefined,
            status: event.type === 'tool_call' ? 'pending' : 'completed',
          });
        }
      }

      controller.enqueue(event);
    },
  });

  return { transform, getToolEvents: () => toolEvents, getDelegations: () => delegations };
}

// ─── Usage Accumulator ──────────────────────────────────────────────────

export interface UsageData {
  model?: string;
  provider?: string;
  role?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/** Accumulates token usage metrics. Returns collected data. */
export function createUsageAccumulator(): {
  transform: TransformStream<SSEEvent, SSEEvent>;
  getUsage: () => UsageData | null;
} {
  let usage: UsageData | null = null;

  const transform = new TransformStream<SSEEvent, SSEEvent>({
    transform(event, controller) {
      if (event.type === 'usage') {
        usage = {
          model: event.model,
          provider: event.provider,
          role: event.role,
          inputTokens: event.inputTokens || 0,
          outputTokens: event.outputTokens || 0,
          totalTokens: event.totalTokens || 0,
        };
      }

      controller.enqueue(event);
    },
  });

  return { transform, getUsage: () => usage };
}

// ─── Text Accumulator (Sink) ────────────────────────────────────────────

/** Creates a WritableStream sink that accumulates content text. */
export function createTextAccumulator(): { writable: WritableStream<SSEEvent>; getText: () => string } {
  let text = '';

  const writable = new WritableStream<SSEEvent>({
    write(event) {
      if (event.type === 'content') { text += event.content; }
    },
  });

  return { writable, getText: () => text };
}
