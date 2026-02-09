import { z } from 'zod';
import { BaseMessageSchema } from '../../../../shared/messaging/base.js';

export const WorkflowMessageType = {
  AcceptanceRequest: 'workflow:acceptance-request',
  AcceptanceResponse: 'workflow:acceptance-response'
} as const;

export const UserAcceptanceRequestSchema = BaseMessageSchema.extend({
  type: z.literal(WorkflowMessageType.AcceptanceRequest),
  payload: z.object({
    actionId: z.string(),
    title: z.string(),
    description: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical'])
  })
});

export const UserAcceptanceResponseSchema = BaseMessageSchema.extend({
  type: z.literal(WorkflowMessageType.AcceptanceResponse),
  payload: z.object({
    actionId: z.string(),
    decision: z.enum(['SI', 'NO']),
    reason: z.string().optional()
  })
});

export type UserAcceptanceRequest = z.infer<typeof UserAcceptanceRequestSchema>;
export type UserAcceptanceResponse = z.infer<typeof UserAcceptanceResponseSchema>;
