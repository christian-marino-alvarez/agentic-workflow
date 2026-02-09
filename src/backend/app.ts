import fastify from 'fastify';
import cors from '@fastify/cors';
import sessionPlugin from './plugins/session.js';

import chatBackend from '../extension/modules/chat/backend/index.js';
import securityBackend from '../extension/modules/security/backend/index.js';

import helloWorldAgent from './modules/agents/hello-world.js';

export async function createServer() {
  const server = fastify({
    logger: true
  });

  await server.register(cors, {
    origin: true
  });

  // Core Plugins
  await server.register(sessionPlugin);

  // Health check
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Module Registration
  await server.register(chatBackend, { prefix: '/api/chat' });
  await server.register(securityBackend, { prefix: '/api/security' });

  // Agent Demo Registration (Task 7)
  await server.register(helloWorldAgent, { prefix: '/api/agent' });

  return server;
}
