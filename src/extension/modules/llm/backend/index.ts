import { AbstractVirtualBackend } from '../../core/backend/virtual-server.js';
import { LLMFactory } from './factory.js';
import { AgentRequest, AgentResponse, RunRequest } from './types.js';
import { Runner } from '@openai/agents';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { API_ENDPOINTS, NAME, CLAUDE_MODELS } from '../constants.js';

export class LLMVirtualBackend extends AbstractVirtualBackend {
  private factory: LLMFactory;

  constructor(options: any) {
    super(NAME);
    this.factory = new LLMFactory(options.extensionUri || process.cwd());
  }

  // Abstract method implementation
  configureRoutes(instance: FastifyInstance): void {
    console.log(`[llm::backend] Registering routes: ${API_ENDPOINTS.RUN}, ${API_ENDPOINTS.STREAM}, /models`);
    instance.post<{ Body: AgentRequest }>(API_ENDPOINTS.RUN, this.run.bind(this));
    instance.post<{ Body: AgentRequest }>(API_ENDPOINTS.STREAM, this.stream.bind(this));

    // List available models for a given provider
    instance.get('/models', async (req: FastifyRequest<{ Querystring: { provider: string, apiKey: string } }>, reply: FastifyReply) => {
      const { provider, apiKey } = req.query;
      try {
        if (provider === 'gemini' || provider === 'google') {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
          const data = await res.json() as any;
          const models = (data.models || [])
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => ({ id: m.name.replace('models/', ''), displayName: m.displayName || m.name.replace('models/', '') }));
          console.log(`[llm::backend] Available Gemini models (${models.length}): ${models.slice(0, 10).map((m: any) => m.id).join(', ')}...`);
          return { success: true, models };
        }

        if (provider === 'codex' || provider === 'openai') {
          const res = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          const data = await res.json() as any;
          const models = (data.data || [])
            .filter((m: any) => m.id && !m.id.includes('realtime') && !m.id.includes('tts') && !m.id.includes('whisper') && !m.id.includes('dall-e') && !m.id.includes('embedding'))
            .map((m: any) => ({ id: m.id, displayName: m.id }))
            .sort((a: any, b: any) => a.id.localeCompare(b.id));
          console.log(`[llm::backend] Available OpenAI models (${models.length}): ${models.slice(0, 10).map((m: any) => m.id).join(', ')}...`);
          return { success: true, models };
        }

        if (provider === 'claude' || provider === 'anthropic') {
          return { success: true, models: CLAUDE_MODELS };
        }

        return { success: false, error: `Provider "${provider}" not supported for listing` };
      } catch (error: any) {
        console.error(`[llm::backend] Error listing models for ${provider}:`, error.message);
        return { success: false, error: error.message };
      }
    });
  }

  async run(req: RunRequest, reply: FastifyReply): Promise<AgentResponse> {
    const { role, input, binding, context, apiKey, provider, instructions } = req.body;

    try {
      const agent = await this.factory.createAgent(role, binding, [], apiKey, provider, instructions);

      const runner = new Runner();
      const result = await runner.run(agent, input);

      const finalOutputText = result.finalOutput
        ? (typeof result.finalOutput === 'string' ? result.finalOutput : JSON.stringify(result.finalOutput))
        : '';

      const lastResponse = result.rawResponses[result.rawResponses.length - 1];

      return {
        output: finalOutputText,
        stats: {
          inputTokens: lastResponse?.usage?.inputTokens || 0,
          outputTokens: lastResponse?.usage?.outputTokens || 0
        }
      };
    } catch (error: unknown) {
      req.log.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      reply.code(500).send({ error: errorMessage, code: 500 });
      throw new Error(`Execution failed: ${errorMessage}`);
    }
  }

  async stream(req: RunRequest, reply: FastifyReply): Promise<void> {
    const { role, input, binding, context, apiKey, provider, instructions } = req.body;

    console.log(`[llm::backend] Stream request: role=${role}, model=${binding[role]}, provider=${provider}`);

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');

    try {
      const agent = await this.factory.createAgent(role, binding, [], apiKey, provider, instructions);
      console.log(`[llm::backend] Agent created, starting stream...`);

      const runner = new Runner();
      const result = await runner.run(agent, input, { stream: true });

      await this.pumpStreamEvents(result as any, reply);
      console.log(`[llm::backend] Stream completed`);

    } catch (error: unknown) {
      console.error(`[llm::backend] Stream error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      reply.raw.write(`data: ${JSON.stringify({ error: errorMessage, code: 500 })}\n\n`);
    } finally {
      reply.raw.end();
    }
  }

  private async pumpStreamEvents(result: AsyncIterable<any>, reply: FastifyReply): Promise<void> {
    for await (const chunk of result) {
      if (chunk.type === 'raw_model_stream_event') {
        const streamEvent = chunk.data as any;
        if (streamEvent.type === 'response.delta' || streamEvent.type === 'output_text_delta') {
          reply.raw.write(`data: ${JSON.stringify({ type: 'content', content: streamEvent.delta })}\n\n`);
        }
      }
    }
    reply.raw.write(`data: [DONE]\n\n`);
  }


}
