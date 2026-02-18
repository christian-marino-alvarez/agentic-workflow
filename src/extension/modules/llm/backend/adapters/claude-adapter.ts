import { ModelProvider, Model, ModelRequest, ModelResponse, ResponseStreamEvent } from '@openai/agents';
import Anthropic from '@anthropic-ai/sdk';

class ClaudeModel implements Model {
  name: string;
  private client: Anthropic;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'claude-3-opus-20240229') {
    this.name = 'Claude';
    this.modelName = modelName;
    this.client = new Anthropic({ apiKey });
  }

  async getResponse(request: ModelRequest): Promise<ModelResponse> {
    const messages = this.formatMessages(request);

    const response = await this.client.messages.create({
      model: this.modelName,
      max_tokens: 1024,
      messages: messages as any,
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      output: [{ role: 'assistant', content }],
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      }
    } as any;
  }

  async *getStreamedResponse(request: ModelRequest): AsyncIterable<ResponseStreamEvent> {
    const messages = this.formatMessages(request);

    const stream = await this.client.messages.create({
      model: this.modelName,
      max_tokens: 1024,
      messages: messages as any,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield {
          type: 'response.delta',
          delta: { role: 'assistant', content: chunk.delta.text },
        } as any;
      }
    }

    yield {
      type: 'response.completed',
      response: { output: [], usage: {} },
    } as any;
  }

  private formatMessages(request: ModelRequest): any[] {
    // Basic formatting, assumes request.output / request.input structure
    // Improved logic needed for complex history
    return [{ role: 'user', content: String(request.input) }];
  }
}

export class ClaudeProvider implements ModelProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getModel(modelName?: string): Model {
    return new ClaudeModel(this.apiKey, modelName);
  }
}
