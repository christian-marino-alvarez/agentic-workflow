import { describe, it, expect, vi, beforeEach } from 'vitest';
import fastify from 'fastify';
import { registerChatKitRoutes } from '../../backend/chatkit/chatkit-routes.js';
import { verifySession } from '../../../../../backend/middleware/auth.js';

vi.mock('../../../../../backend/middleware/auth.js', () => ({
  verifySession: vi.fn(async (req: any, reply: any) => {
    // If no token, reply 401
    const parts = req.headers.authorization ? req.headers.authorization.split(' ') : [];
    if (parts.length === 2 && parts[1] === 'valid-token') {
      req.apiKey = 'sk-mock-key';
    } else {
      reply.statusCode = 401;
      reply.send({ error: 'Unauthorized' });
    }
  }),
}));

// We also need to mock chatkit-routes internals if they import fs/openai
// But for now let's hope it loads.
// Actually, registerChatKitRoutes does import .../protocol.js, fs, path, etc.
// Vitest will resolve them.

describe('ChatKit Routes Integration', () => {
  let server: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    server = fastify();
    registerChatKitRoutes(server);
    await server.ready();
  });

  it('should be protected (401 without token)', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/chatkit',
      payload: { type: 'threads_create', user_input: 'Hello' }
    });
    expect(response.statusCode).toBe(401);
  });

  it('should accept valid token (400 bad request logic)', async () => {
    // Sending empty payload to fail validation inside handler, proving auth passed
    const response = await server.inject({
      method: 'POST',
      url: '/chatkit',
      headers: { Authorization: 'Bearer valid-token' },
      payload: {}
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: 'Invalid request' });
  });
});
