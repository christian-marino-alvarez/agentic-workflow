import { describe, it, expect } from 'vitest';
import {
  OpenAIConfigSchema,
  GeminiConfigSchema,
  CustomConfigSchema,
  ModelConfigSchema
} from '../../index.js';

describe('Providers Config Schemas', () => {
  describe('OpenAIConfigSchema', () => {
    it('should validate a valid OpenAI config', () => {
      const validConfig = {
        id: '123',
        name: 'GPT-4',
        provider: 'openai',
        modelId: 'gpt-4o',
        secretKeyId: 'my-openai-key'
      };
      const result = OpenAIConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should use default values for parameters', () => {
      const config = {
        id: '123',
        name: 'GPT-4',
        provider: 'openai'
      };
      const result = OpenAIConfigSchema.parse(config);
      expect(result.parameters).toBeDefined();
      expect(result.parameters.temperature).toBe(0.7);
      expect(result.modelId).toBe('gpt-4o');
    });

    it('should fail if provider is incorrect', () => {
      const invalidConfig = {
        id: '123',
        name: 'GPT-4',
        provider: 'gemini'
      };
      const result = OpenAIConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('GeminiConfigSchema', () => {
    it('should validate a valid Gemini config', () => {
      const validConfig = {
        id: '456',
        name: 'Gemini Pro',
        provider: 'gemini',
        modelId: 'gemini-1.5-pro',
        secretKeyId: 'my-gemini-key'
      };
      const result = GeminiConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });
  });

  describe('CustomConfigSchema', () => {
    it('should require baseUrl', () => {
      const invalidConfig = {
        id: '789',
        name: 'Local LLM',
        provider: 'custom',
        modelId: 'llama-3',
        secretKeyId: 'local-key'
      };
      const result = CustomConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should validate with valid baseUrl', () => {
      const validConfig = {
        id: '789',
        name: 'Local LLM',
        provider: 'custom',
        modelId: 'llama-3',
        secretKeyId: 'local-key',
        baseUrl: 'http://localhost:11434'
      };
      const result = CustomConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });
  });

  describe('ModelConfigSchema (Discriminated Union)', () => {
    it('should correctly discriminate between providers', () => {
      const configs = [
        { id: '1', name: 'O1', provider: 'openai' },
        { id: '2', name: 'G1', provider: 'gemini' },
        { id: '3', name: 'C1', provider: 'custom', baseUrl: 'http://api.com', secretKeyId: 'k', modelId: 'm' }
      ];

      configs.forEach(c => {
        const result = ModelConfigSchema.safeParse(c);
        expect(result.success).toBe(true);
      });
    });

    it('should fail if provider is unknown', () => {
      const invalidConfig = {
        id: '999',
        name: 'Unknown',
        provider: 'anthropic'
      };
      const result = ModelConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });
});
