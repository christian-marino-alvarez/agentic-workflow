import { z } from 'zod';
import { BaseMessageSchema } from '../../../../shared/messaging/base.js';

export const ChatMessageType = {
  Message: 'chat:message',
  Response: 'chat:response',
  Streaming: 'chat:streaming'
} as const;

export const ChatMessageSchema = BaseMessageSchema.extend({
  type: z.literal(ChatMessageType.Message),
  payload: z.object({
    content: z.string(),
    context: z.record(z.string(), z.unknown()).optional()
  })
});

export const ChatResponseSchema = BaseMessageSchema.extend({
  type: z.literal(ChatMessageType.Response),
  payload: z.object({
    content: z.string(),
    done: z.boolean(),
    error: z.string().optional()
  })
});

export const ChatStreamingSchema = BaseMessageSchema.extend({
  type: z.literal(ChatMessageType.Streaming),
  payload: z.object({
    token: z.string(),
    index: z.number(),
    done: z.boolean()
  })
});

export const ChatSchema = z.discriminatedUnion('type', [
  ChatMessageSchema,
  ChatResponseSchema,
  ChatStreamingSchema
]);

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type ChatStreaming = z.infer<typeof ChatStreamingSchema>;
