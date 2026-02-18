import { ModelProvider, Model, ModelRequest, ModelResponse, ResponseStreamEvent } from '@openai/agents';
import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiModel implements Model {
  name: string;
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-1.5-pro') {
    this.name = 'Gemini';
    this.modelName = modelName;
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async getResponse(request: ModelRequest): Promise<ModelResponse> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const prompt = this.formatPrompt(request);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      output: [{ role: 'assistant', content: text }],
      usage: {
        input_tokens: response.usageMetadata?.promptTokenCount || 0,
        output_tokens: response.usageMetadata?.candidatesTokenCount || 0,
      }
    } as any;
  }

  async *getStreamedResponse(request: ModelRequest): AsyncIterable<ResponseStreamEvent> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const prompt = this.formatPrompt(request);

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      yield {
        type: 'response.delta',
        delta: { role: 'assistant', content: text },
      } as any;
    }

    yield {
      type: 'response.completed',
      response: { output: [], usage: {} },
    } as any;
  }

  private formatPrompt(request: ModelRequest): string {
    // request.messages is standard for chat models
    const messages = (request as any).messages || [];
    if (messages.length > 0) {
      return messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');
    }
    // Fallback or if input property exists
    return String((request as any).input || '');
  }
}

export class GeminiProvider implements ModelProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getModel(modelName?: string): Model {
    return new GeminiModel(this.apiKey, modelName);
  }
}
