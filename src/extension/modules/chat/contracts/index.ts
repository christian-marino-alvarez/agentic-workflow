import { z } from 'zod';
import { BaseMessageSchema } from '../../../../shared/messaging/base.js';

export const ChatMessageType = {
  Message: 'chat:message',
  Response: 'chat:response',
  Streaming: 'chat:streaming',
  WebviewReady: 'webview-ready',
  RequestSync: 'chat:request-sync',
  StateUpdate: 'chat:state-update',
  SetTab: 'set-tab',
  SetModel: 'chat:set-model',
  ModelDecision: 'chat:model-decision'
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

export const WebviewReadySchema = BaseMessageSchema.extend({
  type: z.literal(ChatMessageType.WebviewReady)
});

export const ChatRequestSyncSchema = BaseMessageSchema.extend({
  type: z.literal(ChatMessageType.RequestSync)
});

export const SetTabSchema = BaseMessageSchema.extend({
  type: z.literal(ChatMessageType.SetTab),
  tab: z.string()
});

export const SetModelSchema = BaseMessageSchema.extend({
  type: z.literal(ChatMessageType.SetModel),
  modelId: z.string()
});

export const ModelDecisionSchema = BaseMessageSchema.extend({
  type: z.literal(ChatMessageType.ModelDecision),
  accepted: z.boolean(),
  proposal: z.any()
});

export const StateUpdateSchema = BaseMessageSchema.extend({
  type: z.literal(ChatMessageType.StateUpdate),
  tab: z.string(),
  models: z.array(z.any()).optional(),
  activeModelId: z.string().optional(),
  activeEnvironment: z.enum(['dev', 'pro'])
});

export const ChatSchema = z.discriminatedUnion('type', [
  ChatMessageSchema,
  ChatResponseSchema,
  ChatStreamingSchema,
  WebviewReadySchema,
  ChatRequestSyncSchema,
  SetTabSchema,
  SetModelSchema,
  ModelDecisionSchema,
  StateUpdateSchema
]);

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type ChatStreaming = z.infer<typeof ChatStreamingSchema>;
export type WebviewReady = z.infer<typeof WebviewReadySchema>;
export type ChatRequestSync = z.infer<typeof ChatRequestSyncSchema>;
export type StateUpdate = z.infer<typeof StateUpdateSchema>;
