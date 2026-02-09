import { z } from 'zod';
import { BaseMessageSchema } from '../../../../shared/messaging/base.js';

export const SecurityMessageType = {
  ModelChange: 'security:model-change',
  ModelChanged: 'security:model-changed'
} as const;

export const ModelChangeSchema = BaseMessageSchema.extend({
  type: z.literal(SecurityMessageType.ModelChange),
  payload: z.object({
    modelId: z.string(),
    provider: z.string()
  })
});

export const ModelChangedSchema = BaseMessageSchema.extend({
  type: z.literal(SecurityMessageType.ModelChanged),
  payload: z.object({
    modelId: z.string(),
    status: z.enum(['success', 'error'])
  })
});

export type ModelChange = z.infer<typeof ModelChangeSchema>;
export type ModelChanged = z.infer<typeof ModelChangedSchema>;
