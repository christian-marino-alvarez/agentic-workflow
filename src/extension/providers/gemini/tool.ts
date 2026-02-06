import { z } from 'zod';
import { tool, Runner } from '@openai/agents';
import { OpenAIProvider } from '@openai/agents-openai';
import type { ExtensionContext } from 'vscode';
import { SecretHelper } from '../../modules/setup/secret-helper.js';
import { GeminiConfigSchema } from './schema.js';

/**
 * Crea una herramienta que delega una tarea a Gemini.
 * @param context El contexto de la extensión para acceder a secretos.
 * @param secretHelper Instancia del helper de secretos.
 */
export function createDelegateToGeminiTool(context: ExtensionContext, secretHelper: SecretHelper) {
  return tool({
    name: 'delegate_to_gemini',
    description: 'Delega una tarea específica que requiera un razonamiento alternativo o capacidades de Google Gemini.',
    parameters: z.object({
      prompt: z.string().describe('El prompt o tarea detallada para enviar a Gemini.'),
      taskType: z.enum(['creative', 'analytical', 'refactor']).optional().describe('El tipo de tarea para ajustar el comportamiento.')
    }),
    execute: async ({ prompt }) => {
      // 1. Configuramos el modelo por defecto para la delegación
      const geminiConfig = GeminiConfigSchema.parse({
        id: 'gemini-delegate-id',
        name: 'Gemini Delegation',
        provider: 'gemini',
        modelId: 'gemini-1.5-pro'
      });

      // 2. Obtenemos la API Key usando el SecretHelper
      const apiKey = await secretHelper.getSecret(geminiConfig.secretKeyId);

      if (!apiKey) {
        throw new Error(`Google Gemini API Key (${geminiConfig.secretKeyId}) not found in SecretStorage.`);
      }

      // 3. Google Gemini es compatible con OpenAI SDK
      // Endpoint base para Google AI Studio compatibilidad OpenAI
      const baseURL = 'https://generativelanguage.googleapis.com/v1beta/openai/';

      const modelProvider = new OpenAIProvider({
        apiKey,
        baseURL
      });

      const runner = new Runner({ modelProvider });

      // Creamos un agente minimalista para la delegación
      const delegateAgent = {
        name: 'Gemini-Expert',
        instructions: 'You are a helpful assistant powered by Google Gemini. Provide clear and concise answers.',
        model: geminiConfig.modelId
      };

      // Ejecutamos la tarea (non-streamed) e indicamos que no queremos tools para evitar recursividad infinita si el agente principal llama a esta tool
      const result = await runner.run(delegateAgent as any, prompt);

      return {
        provider: 'gemini',
        model: geminiConfig.modelId,
        result: (result as any).text || 'No response from Gemini.'
      };
    }
  });
}
