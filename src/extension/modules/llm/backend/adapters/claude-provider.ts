import { ModelProvider, Model, ModelRequest, ModelResponse } from '@openai/agents-core';
import { randomUUID } from 'crypto';

import { extractPromptText } from './utils.js';
import { DEFAULT_MODELS } from '../../constants.js';

/**
 * Custom Model that wraps Anthropic's REST API to be compatible with @openai/agents
 */
class ClaudeModel implements Model {
  constructor(private apiKey: string, private modelName: string) { }

  async getResponse(request: ModelRequest): Promise<ModelResponse> {
    const promptText = extractPromptText(request.input);
    const body: any = {
      model: this.modelName,
      max_tokens: 4096,
      messages: [{ role: 'user', content: promptText }]
    };
    if (request.systemInstructions) {
      body.system = request.systemInstructions;
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Claude error: ${res.statusText}`);
    }
    const data: any = await res.json();
    return {
      usage: { promptTokens: data.usage?.input_tokens || 0, completionTokens: data.usage?.output_tokens || 0 },
      output: [{ type: 'output_text', text: data.content?.[0]?.text || '' }]
    } as any;
  }

  async *getStreamedResponse(request: ModelRequest): AsyncIterable<any> {
    yield { type: 'response_started' };

    const promptText = extractPromptText(request.input);
    const body: any = {
      model: this.modelName,
      max_tokens: 4096,
      messages: [{ role: 'user', content: promptText }],
      stream: true
    };
    if (request.systemInstructions) {
      body.system = request.systemInstructions;
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Claude stream error: ${res.statusText}`);
    }

    // Fallback to basic string parsing if running in Node without stream/web abstractions fully available
    const arrayBuffer = await res.arrayBuffer();
    const chunkStr = new TextDecoder().decode(arrayBuffer);
    const lines = chunkStr.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6);
        if (dataStr.trim() === '[DONE]') {
          continue;
        }
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            yield { type: 'output_text_delta', delta: parsed.delta.text };
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    }

    yield {
      type: 'response_done',
      response: {
        id: randomUUID(),
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
      }
    };
  }
}

/**
 * Custom ModelProvider for Claude integration with OpenAI Agents SDK
 */
export class ClaudeProvider implements ModelProvider {
  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error('ClaudeProvider requires an API key');
    }
  }

  getModel(modelName?: string): Model {
    return new ClaudeModel(this.apiKey, modelName || DEFAULT_MODELS.CLAUDE);
  }
}
