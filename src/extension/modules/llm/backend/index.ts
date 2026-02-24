import { AbstractVirtualBackend } from '../../core/backend/virtual-server.js';
import { LLMFactory } from './factory.js';
import { AgentRequest, AgentResponse, RunRequest } from './types.js';
import { Runner } from '@openai/agents';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { API_ENDPOINTS, NAME, CLAUDE_MODELS } from '../constants.js';
import { agentTools, createDelegateTaskTool } from './tools/index.js';

// Suppress OpenAI tracing exporter warning (we use Gemini, not OpenAI tracing)
process.env.OPENAI_AGENTS_DISABLE_TRACING = '1';

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

    let finalInput = input || '';
    if (context && context.length > 0) {
      finalInput += '\n\n[CONTEXT ATTACHMENTS]\nThe user has provided the following files for context:\n';
      context.forEach((c: any) => {
        finalInput += `- ${c.title || c.url}: ${c.url}\n`;
      });
      finalInput += 'Use your readFile tool to examine their contents if necessary.\n';
    }

    try {
      // Build role-specific tools: architect gets delegateTask
      const tools = this.getToolsForRole(role, apiKey, provider, binding);
      const agent = await this.factory.createAgent(role, binding, tools, apiKey, provider, instructions);

      const runner = new Runner({ tracingDisabled: true });
      const result = await runner.run(agent, finalInput);

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
    const { role, input, binding, context, apiKey, provider, instructions, messages, agenticContext } = req.body;

    console.log(`[llm::backend] Stream request: role=${role}, model=${binding[role]}, provider=${provider}`);

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');

    try {
      const tools = this.getToolsForRole(role, apiKey, provider, binding);
      let runResult: any;

      if (messages && agenticContext) {
        // ── New mode: multi-turn messages + typed context ──
        console.log(`[llm::backend] Using AgenticContext mode (${messages.length} messages)`);
        const { agent } = await this.factory.createAgentWithContext(role, binding, tools, apiKey, provider);

        // Convert ConversationTurn[] to AgentInputItem[]
        const agentInput = messages.map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        }));

        const runner = new Runner({ tracingDisabled: true });
        runResult = await runner.run(agent, agentInput as any, {
          stream: true,
          context: agenticContext,
        } as any);
      } else {
        // ── Legacy mode: string input + static instructions ──
        let finalInput = input || '';
        if (context && (context as any).length > 0) {
          finalInput += '\n\n[CONTEXT ATTACHMENTS]\nThe user has provided the following files for context:\n';
          (context as any).forEach((c: any) => {
            finalInput += `- ${c.title || c.url}: ${c.url}\n`;
          });
          finalInput += 'Use your readFile tool to examine their contents if necessary.\n';
        }

        const agent = await this.factory.createAgent(role, binding, tools, apiKey, provider, instructions);
        console.log(`[llm::backend] Agent created (legacy mode), starting stream...`);

        const runner = new Runner({ tracingDisabled: true });
        runResult = await runner.run(agent, finalInput, { stream: true });
      }

      console.log(`[llm::backend] Agent created, starting stream...`);
      const outputChars = await this.pumpStreamEvents(runResult as any, reply);

      // Extract and emit token usage after stream completes
      try {
        const responses = runResult.rawResponses || [];
        let totalInput = 0;
        let totalOutput = 0;
        for (const resp of responses) {
          totalInput += resp?.usage?.inputTokens || resp?.usage?.promptTokens || 0;
          totalOutput += resp?.usage?.outputTokens || resp?.usage?.completionTokens || 0;
        }

        // Fallback: estimate from character counts (~4 chars per token)
        if (totalInput === 0 && totalOutput === 0) {
          const inputChars = (input || '').length + (instructions || '').length;
          totalInput = Math.ceil(inputChars / 4);
          totalOutput = Math.ceil(outputChars / 4);
        }

        const modelName = binding[role] || 'unknown';
        reply.raw.write(`data: ${JSON.stringify({
          type: 'usage',
          model: modelName,
          provider: provider || 'unknown',
          role,
          inputTokens: totalInput,
          outputTokens: totalOutput,
          totalTokens: totalInput + totalOutput,
          estimated: totalInput > 0 && responses.length === 0,
        })}\n\n`);
        console.log(`[llm::backend] Usage: ${totalInput} in / ${totalOutput} out (${modelName})${responses.length === 0 ? ' [estimated]' : ''}`);
      } catch { /* usage extraction is non-blocking */ }

      console.log(`[llm::backend] Stream completed`);

    } catch (error: unknown) {
      console.error(`[llm::backend] Stream error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      reply.raw.write(`data: ${JSON.stringify({ error: errorMessage, code: 500 })}\n\n`);
    } finally {
      reply.raw.end();
    }
  }

  private async pumpStreamEvents(result: AsyncIterable<any>, reply: FastifyReply): Promise<number> {
    let outputChars = 0;
    for await (const chunk of result) {
      if (chunk.type === 'run_item_stream_event') {
        const item = chunk.item as any;
        if (item.type === 'tool_call_item') {
          reply.raw.write(`data: ${JSON.stringify({
            type: 'tool_call',
            name: item.name || item.rawItem?.name,
            arguments: item.rawItem?.arguments,
            status: 'running',
          })}\n\n`);
        } else if (item.type === 'tool_call_output_item') {
          reply.raw.write(`data: ${JSON.stringify({
            type: 'tool_result',
            name: item.rawItem?.name,
            output: typeof item.output === 'string' ? item.output : JSON.stringify(item.output),
          })}\n\n`);
        }
      } else if (chunk.type === 'raw_model_stream_event') {
        const streamEvent = chunk.data as any;
        if (streamEvent.type === 'response.delta' || streamEvent.type === 'output_text_delta') {
          const delta = streamEvent.delta || '';
          outputChars += delta.length;
          reply.raw.write(`data: ${JSON.stringify({ type: 'content', content: delta })}\n\n`);
        }
      }
    }
    reply.raw.write(`data: [DONE]\n\n`);
    return outputChars;
  }

  /**
   * Returns the appropriate tool set for a given role.
   * Only the architect-agent gets the delegateTask tool.
   */
  private getToolsForRole(role: string, apiKey?: string, provider?: string, binding?: Record<string, string>): any[] {
    if (role === 'architect') {
      const delegateTool = createDelegateTaskTool(this.factory, apiKey, provider, binding);
      return [...agentTools, delegateTool];
    }
    return agentTools;
  }

}
