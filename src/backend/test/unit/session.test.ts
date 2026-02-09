import { describe, it, expect, vi, beforeEach } from 'vitest';
import sessionPlugin, { SessionStore } from '../../plugins/session.js';
import { eventBus, SECURITY_EVENTS } from '../../shared/event-bus.js';
import fastify from 'fastify';

// Mock eventBus
vi.mock('../../shared/event-bus.js', () => ({
  eventBus: {
    emit: vi.fn(),
    once: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  SECURITY_EVENTS: {
    SECRET_REQUEST: 'security:secret-request',
    SECRET_RESPONSE: (id: string) => `security:secret-response:${id}`,
  },
}));

describe('Session Plugin', () => {
  let server: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    server = fastify();
    await server.register(sessionPlugin);
  });

  it('should register successfully and decorate server with sessions', async () => {
    expect(server.sessions).toBeInstanceOf(Map);
    expect(server.hasDecorator('sessions')).toBe(true);
  });

  it('should fail if secret_key_id is missing', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/sessions',
      payload: {},
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: 'Missing secret_key_id' });
  });

  it('should create session when bridge returns secret', async () => {
    const secretKeyId = 'openai-api-key';
    const fakeApiKey = 'sk-test-123';

    // Mock JIT logic
    (eventBus.once as any).mockImplementation((event: string, cb: Function) => {
      if (event.startsWith('security:secret-response:')) {
        cb({ secret: fakeApiKey });
      }
    });

    const response = await server.inject({
      method: 'POST',
      url: '/sessions',
      payload: { secret_key_id: secretKeyId },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.client_secret).toBeDefined();
    expect(body.expires_in).toBe(3600);

    // Verify stored session
    const stored = server.sessions.get(body.client_secret);
    expect(stored).toBeDefined();
    expect(stored.apiKey).toBe(fakeApiKey);
  });

  it('should handle bridge errors (e.g. timeout or auth failure)', async () => {
    // Mock failure
    (eventBus.once as any).mockImplementation((event: string, cb: Function) => {
      if (event.startsWith('security:secret-response:')) {
        cb({ error: 'Access Denied' });
      }
    });

    const response = await server.inject({
      method: 'POST',
      url: '/sessions',
      payload: { secret_key_id: 'bad-key' },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: 'Failed to retrieve credentials from host.' });
  });
});
