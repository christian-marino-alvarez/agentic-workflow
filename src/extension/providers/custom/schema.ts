import { z } from 'zod';
import { BaseModelSchema } from '../base.js';

export const CustomConfigSchema = BaseModelSchema.extend({
  provider: z.literal('custom'),
  baseUrl: z.string().url(),
  modelId: z.string().min(1),
  secretKeyId: z.string().min(1),
});

export type CustomConfig = z.infer<typeof CustomConfigSchema>;
