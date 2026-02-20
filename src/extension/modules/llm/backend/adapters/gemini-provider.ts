import { GoogleGenerativeAI } from '@google/generative-ai';
import { ModelProvider, Model, ModelRequest, ModelResponse } from '@openai/agents-core';
import { randomUUID } from 'crypto';

import { extractPromptText } from './utils.js';

/**
 * Pass-through: model IDs now come from Settings dropdown (dynamic discovery).
 */
function resolveModelName(input: string): string {
  return input;
}

/**
 * Convert SDK SerializedFunctionTool[] to Gemini's functionDeclarations format.
 */
function convertToolsToGemini(tools: any[]): any[] | undefined {
  const functionTools = tools?.filter((t: any) => t.type === 'function');
  if (!functionTools || functionTools.length === 0) { return undefined; }
  return functionTools.map((t: any) => ({
    name: t.name,
    description: t.description,
    parameters: cleanJsonSchema(t.parameters),
  }));
}

/**
 * Clean JSON schema for Gemini compatibility:
 * - Remove unsupported keys like 'additionalProperties', '$schema'
 * - Ensure properties exist
 */
function cleanJsonSchema(schema: any): any {
  if (!schema) { return { type: 'object', properties: {} }; }
  const cleaned: any = { type: schema.type || 'object' };
  if (schema.properties) {
    cleaned.properties = {};
    for (const [key, val] of Object.entries(schema.properties)) {
      const prop = val as any;
      cleaned.properties[key] = { type: prop.type || 'string' };
      if (prop.description) { cleaned.properties[key].description = prop.description; }
    }
  }
  if (schema.required) { cleaned.required = schema.required; }
  return cleaned;
}

/**
 * Custom Model that wraps @google/generative-ai to be compatible with @openai/agents.
 * Supports function calling / tool use via Gemini's functionDeclarations.
 */
class GeminiModel implements Model {
  private requestOptions?: { customHeaders?: Record<string, string> };

  constructor(
    private client: GoogleGenerativeAI,
    private modelName: string,
    requestOptions?: { customHeaders?: Record<string, string> }
  ) {
    this.requestOptions = requestOptions;
  }

  async getResponse(request: ModelRequest): Promise<ModelResponse> {
    const promptText = extractPromptText(request.input);
    const sysInstruction = request.systemInstructions;
    const geminiTools = convertToolsToGemini(request.tools);

    const modelConfig: any = { model: this.modelName };
    if (sysInstruction) { modelConfig.systemInstruction = sysInstruction; }

    const modelObj = this.client.getGenerativeModel(modelConfig);

    const requestConfig: any = {
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
    };
    if (geminiTools) {
      requestConfig.tools = [{ functionDeclarations: geminiTools }];
    }

    const result = await modelObj.generateContent(requestConfig, this.requestOptions);
    const response = result.response;
    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    // Check for function calls
    const functionCallParts = parts.filter((p: any) => p.functionCall);
    if (functionCallParts.length > 0) {
      const output = functionCallParts.map((p: any) => ({
        type: 'function_call',
        id: randomUUID(),
        callId: randomUUID(),
        name: p.functionCall.name,
        arguments: JSON.stringify(p.functionCall.args || {}),
        status: 'completed',
      }));
      return {
        usage: { promptTokens: 0, completionTokens: 0 },
        output,
      } as any;
    }

    // Regular text response
    const text = response.text();
    return {
      usage: { promptTokens: 0, completionTokens: 0 },
      output: [{ type: 'output_text', text }]
    } as any;
  }

  async *getStreamedResponse(request: ModelRequest): AsyncIterable<any> {
    yield { type: 'response_started' };

    const promptText = extractPromptText(request.input);
    const sysInstruction = request.systemInstructions;
    const geminiTools = convertToolsToGemini(request.tools);

    const modelConfig: any = { model: this.modelName };
    if (sysInstruction) { modelConfig.systemInstruction = sysInstruction; }

    const modelObj = this.client.getGenerativeModel(modelConfig);

    const requestConfig: any = {
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
    };
    if (geminiTools) {
      requestConfig.tools = [{ functionDeclarations: geminiTools }];
    }

    const result = await modelObj.generateContentStream(requestConfig, this.requestOptions);

    let fullText = '';
    const functionCalls: any[] = [];

    for await (const chunk of result.stream) {
      const parts = chunk.candidates?.[0]?.content?.parts || [];

      for (const part of parts) {
        if (part.functionCall) {
          functionCalls.push(part.functionCall);
        } else if (part.text) {
          fullText += part.text;
          yield { type: 'output_text_delta', delta: part.text };
        }
      }
    }

    // If function calls were received, emit them as function_call items
    if (functionCalls.length > 0) {
      const outputItems = functionCalls.map(fc => ({
        type: 'function_call',
        id: randomUUID(),
        callId: randomUUID(),
        name: fc.name,
        arguments: JSON.stringify(fc.args || {}),
        status: 'completed',
      }));

      yield {
        type: 'response_done',
        response: {
          id: randomUUID(),
          output: outputItems,
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
        }
      };
      return;
    }

    yield {
      type: 'response_done',
      response: {
        id: randomUUID(),
        output: [{
          type: 'message',
          role: 'assistant',
          status: 'completed',
          content: [{ type: 'output_text', text: fullText }]
        }],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
      }
    };
  }
}

/**
 * Custom ModelProvider for Gemini integration with OpenAI Agents SDK.
 * Supports both API keys and OAuth access tokens.
 * Auto-discovers available models from the API.
 */
export class GeminiProvider implements ModelProvider {
  private client: GoogleGenerativeAI;
  private requestOptions?: { customHeaders?: Record<string, string> };
  private apiKey: string;
  private static cachedModels: string[] | null = null;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('GeminiProvider requires an API key or OAuth access token');
    }

    this.apiKey = apiKey;

    // Detect OAuth access tokens (they start with 'ya29.')
    const isOAuthToken = apiKey.startsWith('ya29.');

    if (isOAuthToken) {
      this.client = new GoogleGenerativeAI('OAUTH_MODE');
      this.requestOptions = {
        customHeaders: { 'Authorization': `Bearer ${apiKey}` }
      };
    } else {
      this.client = new GoogleGenerativeAI(apiKey);
    }
  }

  /**
   * Discover available models from the Gemini API.
   */
  private async discoverModels(): Promise<string[]> {
    if (GeminiProvider.cachedModels) {
      return GeminiProvider.cachedModels;
    }

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
      const data = await res.json() as any;
      GeminiProvider.cachedModels = (data.models || [])
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => m.name.replace('models/', ''));
      console.log(`[llm::backend] Available models: ${GeminiProvider.cachedModels!.join(', ')}`);
    } catch (e) {
      console.error('[llm::backend] Failed to discover models:', e);
      GeminiProvider.cachedModels = [];
    }

    return GeminiProvider.cachedModels!;
  }

  /**
   * Find the best matching model from available models.
   */
  private findBestModel(available: string[], requested: string): string {
    if (available.includes(requested)) {
      return requested;
    }

    const lower = requested.toLowerCase();
    const match = available.find(m => m.toLowerCase().includes(lower));
    if (match) {
      return match;
    }

    const preferences = ['flash', 'pro'];
    for (const pref of preferences) {
      const prefMatch = available.find(m => m.includes(pref) && !m.includes('embedding') && !m.includes('aqa'));
      if (prefMatch) {
        return prefMatch;
      }
    }

    return available[0] || requested;
  }

  async getModel(modelName?: string): Promise<Model> {
    const requested = modelName || 'gemini-1.5-flash';
    const available = await this.discoverModels();

    const resolved = available.length > 0
      ? this.findBestModel(available, resolveModelName(requested))
      : resolveModelName(requested);

    console.log(`[llm::backend] Resolved model: "${requested}" → "${resolved}"`);
    return new GeminiModel(this.client, resolved, this.requestOptions);
  }
}
