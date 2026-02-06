import { z } from 'zod';
import { BaseModelSchema } from '../base.js';

export const OpenAIConfigSchema = BaseModelSchema.extend({
  provider: z.literal('openai'),
  modelId: z.string().min(1).default('gpt-4o'),
  secretKeyId: z.string().min(1).default('openai-api-key'),
});

export type OpenAIConfig = z.infer<typeof OpenAIConfigSchema>;
