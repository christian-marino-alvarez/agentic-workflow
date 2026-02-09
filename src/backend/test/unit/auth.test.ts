import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifySession } from '../../middleware/auth.js';
import sessionPlugin from '../../plugins/session.js';
import fastify from 'fastify';

describe('Auth Middleware', () => {
  let server: any; // FastifyInstance type mock

  beforeEach(async () => {
    server = fastify();
    await server.register(sessionPlugin);

    // Define protected route once for all tests
    server.post('/protected', { preHandler: verifySession }, async (req: any, reply: any) => {
      return { success: true, apiKey: req.apiKey };
    });

    // Wait for plugins to load to access server.sessions
    await server.ready();
  });

  it('should reject requests without Authorization header', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/protected',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: 'Unauthorized: Invalid or expired session' });
  });

  it('should reject requests with invalid Bearer token', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/protected',
      headers: { Authorization: 'Bearer invalid-token' }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should inject API key for valid session token', async () => {
    // Manually insert a session
    const validToken = 'valid-token-123';
    const fakeApiKey = 'sk-real-api-key';
    const expiresAt = Date.now() + 3600000;

    server.sessions.set(validToken, { apiKey: fakeApiKey, expiresAt });

    const response = await server.inject({
      method: 'POST',
      url: '/protected',
      headers: { Authorization: `Bearer ${validToken}` }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ success: true, apiKey: fakeApiKey });
  });

  it('should reject expired session token', async () => {
    const expiredToken = 'expired-token-123';
    const fakeApiKey = 'sk-old-key';
    const expiresAt = Date.now() - 1000; // Past time

    server.sessions.set(expiredToken, { apiKey: fakeApiKey, expiresAt });

    const response = await server.inject({
      method: 'POST',
      url: '/protected',
      headers: { Authorization: `Bearer ${expiredToken}` }
    });

    expect(response.statusCode).toBe(401);
    // Should have been removed from store
    expect(server.sessions.has(expiredToken)).toBe(false);
  });
});
