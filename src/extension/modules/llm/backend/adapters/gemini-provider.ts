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
 * Custom Model that wraps @google/generative-ai to be compatible with @openai/agents
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

    const modelObj = sysInstruction
      ? this.client.getGenerativeModel({ model: this.modelName, systemInstruction: sysInstruction })
      : this.client.getGenerativeModel({ model: this.modelName });

    const result = await modelObj.generateContent({
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
    }, this.requestOptions);
    const text = result.response.text();

    return {
      usage: { promptTokens: 0, completionTokens: 0 },
      output: [{ type: 'output_text', text }]
    } as any;
  }

  async *getStreamedResponse(request: ModelRequest): AsyncIterable<any> {
    yield { type: 'response_started' };

    const promptText = extractPromptText(request.input);
    const sysInstruction = request.systemInstructions;

    const modelObj = sysInstruction
      ? this.client.getGenerativeModel({ model: this.modelName, systemInstruction: sysInstruction })
      : this.client.getGenerativeModel({ model: this.modelName });

    const result = await modelObj.generateContentStream(
      { contents: [{ role: 'user', parts: [{ text: promptText }] }] },
      this.requestOptions
    );

    let fullText = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        fullText += text;
        yield { type: 'output_text_delta', delta: text };
      }
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
    // If the exact requested name is available, use it
    if (available.includes(requested)) {
      return requested;
    }

    // Try to find a match containing the requested name
    const lower = requested.toLowerCase();
    const match = available.find(m => m.toLowerCase().includes(lower));
    if (match) {
      return match;
    }

    // Preference order for auto-selection
    const preferences = ['flash', 'pro'];
    for (const pref of preferences) {
      const prefMatch = available.find(m => m.includes(pref) && !m.includes('embedding') && !m.includes('aqa'));
      if (prefMatch) {
        return prefMatch;
      }
    }

    // Fallback to first available
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

