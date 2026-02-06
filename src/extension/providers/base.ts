import { z } from 'zod';

export const ModelParametersSchema = z.object({
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().positive().optional().default(2048),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
});

export const BaseModelSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  parameters: ModelParametersSchema.default({
    temperature: 0.7,
    maxTokens: 2048
  }),
});
