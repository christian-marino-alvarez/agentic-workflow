import fs from 'fs/promises';
import path from 'path';
import { BackendModulePlugin, wrapAsPlugin } from '../../../../backend/shared/module-provider.js';
import { registerChatKitRoutes } from './chatkit/chatkit-routes.js';
import { FileSystemPersistence } from './agents/persistence.js';
import { AgentRegistryService } from './agents/registry.js';
import { WorkflowRuntimeService } from './agents/runtime.js';

const chatBackendPlugin: BackendModulePlugin = async (context) => {
  // Initialize services
  const persistence = new FileSystemPersistence(path.join(process.cwd(), '.agent/sessions'));
  const registry = new AgentRegistryService(path.join(process.cwd(), '.agent/rules/roles'));
  const runtime = new WorkflowRuntimeService(registry, persistence);

  // Registering ChatKit routes
  registerChatKitRoutes(context);

  context.get('/roles', async (request, reply) => {
    try {
      const roles = await registry.listAgents();
      return { status: 'ok', roles };
    } catch (error) {
      context.log.error(error as Error);
      return reply.status(500).send({ error: 'Failed to read roles' });
    }
  });

  context.post('/chat', async (request, reply) => {
    const { sessionId, message, startAgentId } = request.body as {
      sessionId: string;
      message: string;
      startAgentId?: string;
    };

    if (!sessionId || !message) {
      return reply.status(400).send({ error: 'sessionId and message are required' });
    }

    try {
      const result = await runtime.processMessage(sessionId, message, startAgentId);
      return { status: 'ok', result };
    } catch (error) {
      context.log.error(error as Error);
      return reply.status(500).send({ error: (error as Error).message });
    }
  });

  context.post('/chat/approve', async (request, reply) => {
    const { sessionId, callId } = request.body as { sessionId: string; callId: string };

    if (!sessionId || !callId) {
      return reply.status(400).send({ error: 'sessionId and callId are required' });
    }

    try {
      const result = await runtime.approve(sessionId, callId);
      return { status: 'ok', result };
    } catch (error) {
      context.log.error(error as Error);
      return reply.status(500).send({ error: (error as Error).message });
    }
  });

  context.post('/chat/reject', async (request, reply) => {
    const { sessionId, callId } = request.body as { sessionId: string; callId: string };

    if (!sessionId || !callId) {
      return reply.status(400).send({ error: 'sessionId and callId are required' });
    }

    try {
      const result = await runtime.reject(sessionId, callId);
      return { status: 'ok', result };
    } catch (error) {
      context.log.error(error as Error);
      return reply.status(500).send({ error: (error as Error).message });
    }
  });
};

export default wrapAsPlugin(chatBackendPlugin);
