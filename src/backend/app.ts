import Fastify from 'fastify';
import cors from '@fastify/cors';
import chatBackend from '../extension/modules/chat/background/backend.js';
import setupBackend from '../extension/modules/setup/background/backend.js';

export async function createServer() {
  const server = Fastify({
    logger: true
  });

  await server.register(cors, {
    origin: true
  });

  // Health check
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Module Registration
  await server.register(chatBackend, { prefix: '/api/chat' });
  await server.register(setupBackend, { prefix: '/api/setup' });

  return server;
}
