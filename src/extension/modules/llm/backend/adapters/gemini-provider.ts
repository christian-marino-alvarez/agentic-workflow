import { GoogleGenerativeAI } from '@google/generative-ai';
import { ModelProvider, Model, ModelRequest, ModelResponse } from '@openai/agents-core';
import { randomUUID } from 'crypto';

import { extractPromptText } from './utils.js';

/**
 * Convert OpenAI Agents SDK input messages to Gemini multi-turn contents format.
 * The SDK sends messages as an array of {type, role, content} objects.
 * Gemini expects {role: 'user'|'model', parts: [{text}]}.
 * 
 * Falls back to single-user-message if input format is unexpected.
 */
function convertToGeminiContents(input: any): { role: string; parts: { text: string }[] }[] {
  if (!Array.isArray(input)) {
    return [{ role: 'user', parts: [{ text: typeof input === 'string' ? input : JSON.stringify(input) }] }];
  }

  const contents: { role: string; parts: { text: string }[] }[] = [];

  for (const item of input) {
    // Determine the Gemini role
    let geminiRole: string;
    const sdkRole = item.role || '';
    if (sdkRole === 'assistant' || sdkRole === 'model') {
      geminiRole = 'model';
    } else {
      geminiRole = 'user';
    }

    // Extract text content
    let text: string;
    if (typeof item === 'string') {
      text = item;
    } else if (item.type === 'input_text') {
      text = item.text || '';
    } else if (item.type === 'message' && typeof item.content === 'string') {
      text = item.content;
    } else if (item.type === 'message' && Array.isArray(item.content)) {
      text = item.content.map((c: any) => c.text || JSON.stringify(c)).join('\n');
    } else if (item.text) {
      text = item.text;
    } else if (item.content) {
      text = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
    } else {
      text = JSON.stringify(item);
    }

    if (!text || text.trim().length === 0) { continue; }

    // Gemini requires alternating user/model turns — merge consecutive same-role messages
    const lastContent = contents[contents.length - 1];
    if (lastContent && lastContent.role === geminiRole) {
      lastContent.parts[0].text += '\n' + text;
    } else {
      contents.push({ role: geminiRole, parts: [{ text }] });
    }
  }

  // Gemini requires the first message to be from 'user'
  if (contents.length > 0 && contents[0].role !== 'user') {
    contents.unshift({ role: 'user', parts: [{ text: '(conversation start)' }] });
  }

  // Fallback: if no valid contents were extracted
  if (contents.length === 0) {
    const fallbackText = extractPromptText(input);
    return [{ role: 'user', parts: [{ text: fallbackText }] }];
  }

  console.log(`[gemini::model] Converted ${input.length} SDK messages → ${contents.length} Gemini turns`);
  return contents;
}

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
 * - Recursively handle nested objects, arrays, enums, anyOf/oneOf
 * - Ensure properties exist
 */
function cleanJsonSchema(schema: any): any {
  if (!schema) { return { type: 'object', properties: {} }; }

  // Handle anyOf/oneOf by taking the first non-null option
  if (schema.anyOf || schema.oneOf) {
    const options = schema.anyOf || schema.oneOf;
    const nonNull = options.find((o: any) => o.type !== 'null') || options[0];
    return cleanJsonSchema(nonNull);
  }

  const cleaned: any = {};

  // Determine type
  const schemaType = schema.type || 'object';
  cleaned.type = schemaType === 'integer' ? 'number' : schemaType; // Gemini uses 'number' for integers too

  // Description
  if (schema.description) { cleaned.description = schema.description; }

  // Enum values
  if (schema.enum) { cleaned.enum = schema.enum; }

  // Handle objects with properties
  if (schemaType === 'object' && schema.properties) {
    cleaned.properties = {};
    for (const [key, val] of Object.entries(schema.properties)) {
      cleaned.properties[key] = cleanJsonSchema(val);
    }
  }

  // Handle arrays
  if (schemaType === 'array' && schema.items) {
    cleaned.items = cleanJsonSchema(schema.items);
  }

  // Required fields (only for objects)
  if (schema.required && Array.isArray(schema.required)) {
    cleaned.required = schema.required;
  }

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
    const contents = convertToGeminiContents(request.input);
    const sysInstruction = request.systemInstructions;
    const geminiTools = convertToolsToGemini(request.tools);

    const modelConfig: any = { model: this.modelName };
    if (sysInstruction) { modelConfig.systemInstruction = sysInstruction; }

    // Add Structured Output config if a json_schema is provided
    if (request.outputType && typeof request.outputType === 'object' && request.outputType.type === 'json_schema') {
      const gSchema = cleanJsonSchema(request.outputType.schema);
      modelConfig.generationConfig = {
        responseMimeType: 'application/json',
        responseSchema: gSchema,
      };
      console.log(`[gemini::model] Enforcing Structured Output schema: ${request.outputType.name}`);
    }

    const modelObj = this.client.getGenerativeModel(modelConfig);

    const requestConfig: any = {
      contents,
    };
    if (geminiTools) {
      requestConfig.tools = [{ functionDeclarations: geminiTools }];
    }

    const result = await modelObj.generateContent(requestConfig, this.requestOptions);
    const response = result.response;
    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    // Extract real usage from Gemini API
    const usageMeta = (response as any).usageMetadata;
    const usage = {
      inputTokens: usageMeta?.promptTokenCount || 0,
      outputTokens: usageMeta?.candidatesTokenCount || 0,
      totalTokens: usageMeta?.totalTokenCount || 0,
      promptTokens: usageMeta?.promptTokenCount || 0,
      completionTokens: usageMeta?.candidatesTokenCount || 0,
    };

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
      return { usage, output } as any;
    }

    // Regular text response
    const text = response.text();
    return {
      usage,
      output: [{ type: 'output_text', text }]
    } as any;
  }

  async *getStreamedResponse(request: ModelRequest): AsyncIterable<any> {
    yield { type: 'response_started' };

    const contents = convertToGeminiContents(request.input);
    const sysInstruction = request.systemInstructions;
    const geminiTools = convertToolsToGemini(request.tools);

    const modelConfig: any = { model: this.modelName };
    if (sysInstruction) { modelConfig.systemInstruction = sysInstruction; }

    // Add Structured Output config if a json_schema is provided
    if (request.outputType && typeof request.outputType === 'object' && request.outputType.type === 'json_schema') {
      const gSchema = cleanJsonSchema(request.outputType.schema);
      modelConfig.generationConfig = {
        responseMimeType: 'application/json',
        responseSchema: gSchema,
      };
      console.log(`[gemini::model] Enforcing Structured Output schema: ${request.outputType.name}`);
    }

    const modelObj = this.client.getGenerativeModel(modelConfig);

    const requestConfig: any = {
      contents,
    };
    if (geminiTools) {
      requestConfig.tools = [{ functionDeclarations: geminiTools }];
    }

    const result = await modelObj.generateContentStream(requestConfig, this.requestOptions);

    let fullText = '';
    const functionCalls: any[] = [];
    let lastUsageMeta: any = null;
    let lastFinishReason: string | undefined;

    for await (const chunk of result.stream) {
      const candidate = chunk.candidates?.[0];
      const parts = candidate?.content?.parts || [];

      // Capture finish reason
      if (candidate?.finishReason) {
        lastFinishReason = candidate.finishReason as string;
      }

      // Capture usage metadata from each chunk (last one has the totals)
      if ((chunk as any).usageMetadata) {
        lastUsageMeta = (chunk as any).usageMetadata;
      }

      for (const part of parts) {
        if (part.functionCall) {
          functionCalls.push(part.functionCall);
        } else if (part.text) {
          fullText += part.text;
          yield { type: 'output_text_delta', delta: part.text };
        }
      }
    }

    // Diagnostic: log when the model produces no output
    if (fullText.length === 0 && functionCalls.length === 0) {
      console.error(`[gemini::model] ⚠️ Empty response! finishReason=${lastFinishReason || 'unknown'}, usage=${JSON.stringify(lastUsageMeta)}`);

      // MALFORMED_FUNCTION_CALL: retry WITHOUT tools so model falls back to text
      if (lastFinishReason === 'MALFORMED_FUNCTION_CALL') {
        console.log('[gemini::model] Retrying without tools (MALFORMED_FUNCTION_CALL recovery)...');
        const retryConfig: any = { contents };
        // No tools in retry — force text output
        const retryResult = await modelObj.generateContentStream(retryConfig, this.requestOptions);
        for await (const chunk of retryResult.stream) {
          const retryCandidate = chunk.candidates?.[0];
          const retryParts = retryCandidate?.content?.parts || [];
          if ((chunk as any).usageMetadata) { lastUsageMeta = (chunk as any).usageMetadata; }
          for (const part of retryParts) {
            if (part.text) {
              fullText += part.text;
              yield { type: 'output_text_delta', delta: part.text };
            }
          }
        }
        console.log(`[gemini::model] Retry completed: ${fullText.length} chars`);
      }
    } else {
      console.log(`[gemini::model] Stream done: ${fullText.length} chars, ${functionCalls.length} tool calls, finishReason=${lastFinishReason || 'unknown'}`);
    }

    // Extract real usage from Gemini API
    const usage = {
      inputTokens: lastUsageMeta?.promptTokenCount || 0,
      outputTokens: lastUsageMeta?.candidatesTokenCount || 0,
      totalTokens: lastUsageMeta?.totalTokenCount || 0,
    };

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
          usage,
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
        usage,
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
