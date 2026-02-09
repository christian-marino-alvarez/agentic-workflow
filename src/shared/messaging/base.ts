import { z } from 'zod';

/**
 * Base messaging types and schemas shared across all modules.
 */
export const BaseMessageType = {
  WebviewReady: 'webview-ready',
  Ack: 'system:ack',
  Error: 'system:error'
} as const;

export const BaseMessageSchema = z.object({
  id: z.string().uuid().optional(),
  timestamp: z.string().optional()
});

export const AckSchema = BaseMessageSchema.extend({
  type: z.literal(BaseMessageType.Ack),
  payload: z.object({
    originalId: z.string(),
    status: z.enum(['ok', 'error'])
  })
});

export const ErrorSchema = BaseMessageSchema.extend({
  type: z.literal(BaseMessageType.Error),
  payload: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional()
  })
});

export const WebviewReadySchema = BaseMessageSchema.extend({
  type: z.literal(BaseMessageType.WebviewReady)
});
