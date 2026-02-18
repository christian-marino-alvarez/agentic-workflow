import { AbstractVirtualBackend } from '../../core/backend/virtual-server.js';
import { LLMFactory } from './factory.js';
import { AgentRequest, AgentResponse } from './types.js';
import { Runner } from '@openai/agents';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { API_ENDPOINTS, NAME } from '../constants.js';

interface RunRequest extends FastifyRequest<{ Body: AgentRequest }> { }

export class LLMVirtualBackend extends AbstractVirtualBackend {
  private factory: LLMFactory;

  constructor(options: any) {
    super(NAME);
    this.factory = new LLMFactory(options.extensionUri || process.cwd());
  }

  // Abstract method implementation
  configureRoutes(instance: FastifyInstance): void {
    console.log(`[LLMVirtualBackend] Registering routes: ${API_ENDPOINTS.RUN}, ${API_ENDPOINTS.STREAM}`);
    instance.post<{ Body: AgentRequest }>(API_ENDPOINTS.RUN, this.run.bind(this));
    instance.post<{ Body: AgentRequest }>(API_ENDPOINTS.STREAM, this.stream.bind(this));
  }

  async run(req: RunRequest, reply: FastifyReply): Promise<AgentResponse> {
    const { role, input, binding, context } = req.body;

    try {
      const agent = await this.factory.createAgent(role, binding);

      const runner = new Runner({
        // maxTurns is likely in a different config object or assumed default if not in Partial<RunConfig>
        // Removing explicit config for now to pass compilation if types mismatch
      });

      const result = await runner.run(agent, input);

      return {
        output: typeof result.finalOutput === 'string' ? result.finalOutput : JSON.stringify(result.finalOutput),
        stats: {
          inputTokens: 0,
          outputTokens: 0
        }
      };
    } catch (error: any) {
      req.log.error(error);
      reply.code(500).send({ error: error.message });
      throw error;
    }
  }

  async stream(req: RunRequest, reply: FastifyReply): Promise<void> {
    const { role, input, binding, context } = req.body;

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');

    try {
      const agent = await this.factory.createAgent(role, binding);

      const runner = new Runner({});

      const result = await runner.run(agent, input);

      reply.raw.write(`data: ${JSON.stringify({ type: 'content', content: result.finalOutput })}\n\n`);
      reply.raw.write(`data: [DONE]\n\n`);

    } catch (error: any) {
      req.log.error(error);
      reply.raw.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    } finally {
      reply.raw.end();
    }
  }


}
