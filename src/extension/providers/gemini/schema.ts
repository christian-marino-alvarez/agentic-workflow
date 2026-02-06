import { z } from 'zod';
import { BaseModelSchema } from '../base.js';

export const GeminiConfigSchema = BaseModelSchema.extend({
  provider: z.literal('gemini'),
  modelId: z.string().min(1).default('gemini-1.5-pro'),
  secretKeyId: z.string().min(1).default('google-gemini-key'),
});

export type GeminiConfig = z.infer<typeof GeminiConfigSchema>;
