import { z } from 'zod';
import { OpenAIConfigSchema } from './openai/schema.js';
import { GeminiConfigSchema } from './gemini/schema.js';
import { CustomConfigSchema } from './custom/schema.js';

export * from './base.js';
export * from './openai/schema.js';
export * from './gemini/schema.js';
export * from './custom/schema.js';

/**
 * Enumeración de proveedores soportados
 */
export const ProviderSchema = z.enum(['openai', 'gemini', 'custom']);
export type ProviderType = z.infer<typeof ProviderSchema>;

/**
 * Unión discriminada para configuración de modelos
 */
export const ModelConfigSchema = z.discriminatedUnion('provider', [
  OpenAIConfigSchema,
  GeminiConfigSchema,
  CustomConfigSchema
]);

export type ModelConfig = z.infer<typeof ModelConfigSchema>;

/**
 * Esquema para la lista completa de modelos
 */
export const ExtensionConfigSchema = z.object({
  models: z.array(ModelConfigSchema).default([]),
  activeModelId: z.string().optional(),
  artifactsPath: z.string().optional(),
  environment: z.enum(['dev', 'pro']).default('pro'),
});

export type ExtensionConfig = z.infer<typeof ExtensionConfigSchema>;
