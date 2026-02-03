import * as z from 'zod/v4';
import { RequestSchema } from '@modelcontextprotocol/sdk/types.js';

export const RuntimeRunRequestSchema = RequestSchema.extend({
  method: z.literal('runtime.run'),
  params: z
    .object({
      taskPath: z.string(),
      agent: z.string(),
      statePath: z.string().optional(),
      eventsPath: z.string().optional()
    })
    .optional()
});

export const RuntimeResumeRequestSchema = RequestSchema.extend({
  method: z.literal('runtime.resume'),
  params: z
    .object({
      taskPath: z.string(),
      agent: z.string(),
      statePath: z.string().optional(),
      eventsPath: z.string().optional()
    })
    .optional()
});

export const RuntimeNextStepRequestSchema = RequestSchema.extend({
  method: z.literal('runtime.next_step'),
  params: z
    .object({
      taskPath: z.string(),
      agent: z.string(),
      statePath: z.string().optional(),
      eventsPath: z.string().optional()
    })
    .optional()
});

export const RuntimeCompleteStepRequestSchema = RequestSchema.extend({
  method: z.literal('runtime.complete_step'),
  params: z.object({}).optional()
});

export const RuntimeGetStateRequestSchema = RequestSchema.extend({
  method: z.literal('runtime.get_state'),
  params: z
    .object({
      statePath: z.string()
    })
    .optional()
});

export const RuntimeListWorkflowsRequestSchema = RequestSchema.extend({
  method: z.literal('runtime.list_workflows'),
  params: z
    .object({
      workflowsRoot: z.string()
    })
    .optional()
});

export const RuntimeValidateGateRequestSchema = RequestSchema.extend({
  method: z.literal('runtime.validate_gate'),
  params: z
    .object({
      taskPath: z.string(),
      agent: z.string(),
      expectedPhase: z.string().optional()
    })
    .optional()
});

export const RuntimeAdvancePhaseRequestSchema = RequestSchema.extend({
  method: z.literal('runtime.advance_phase'),
  params: z
    .object({
      taskPath: z.string(),
      agent: z.string(),
      expectedPhase: z.string().optional(),
      eventsPath: z.string().optional()
    })
    .optional()
});

export const RuntimeEmitEventRequestSchema = RequestSchema.extend({
  method: z.literal('runtime.emit_event'),
  params: z
    .object({
      event: z.unknown(),
      eventsPath: z.string().optional()
    })
    .optional()
});

export const RuntimeChatRequestSchema = RequestSchema.extend({
  method: z.literal('runtime.chat'),
  params: z
    .object({
      message: z.string(),
      role: z.string().optional(),
      eventsPath: z.string().optional()
    })
    .optional()
});

export const DebugReadLogsRequestSchema = RequestSchema.extend({
  method: z.literal('debug_read_logs'),
  params: z
    .object({
      limit: z.number().optional()
    })
    .optional()
});
