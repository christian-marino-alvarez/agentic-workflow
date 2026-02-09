import { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { randomUUID } from 'node:crypto';
import { eventBus, SECURITY_EVENTS } from '../shared/event-bus.js'; // Ajustar ruta según estructura real de imports

export interface SessionData {
  apiKey: string;
  expiresAt: number;
}

export type SessionStore = Map<string, SessionData>;

const sessions: SessionStore = new Map();

// Helper para limpiar sesiones expiradas cada 5 minutos
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [token, data] of sessions.entries()) {
    if (data.expiresAt < now) {
      sessions.delete(token);
    }
  }
}, 5 * 60 * 1000).unref();

// Helper function to get secret from Bridge via EventBus (JIT)
async function getSecretJit(secretKeyId: string, environment: 'dev' | 'pro'): Promise<string> {
  const requestId = randomUUID();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      // @ts-ignore - Assuming eventBus exists and has removeAllListeners
      eventBus.removeAllListeners(SECURITY_EVENTS.SECRET_RESPONSE(requestId));
      reject(new Error(`Timeout waiting for secret ${secretKeyId} env=${environment}`));
    }, 5000);

    // @ts-ignore - Assuming eventBus exists and has once
    eventBus.once(SECURITY_EVENTS.SECRET_RESPONSE(requestId), (payload: { secret?: string; error?: string }) => {
      clearTimeout(timeout);
      if (payload.error) {
        reject(new Error(payload.error));
      } else if (payload.secret) {
        resolve(payload.secret);
      } else {
        reject(new Error('Unknown error retrieving secret'));
      }
    });

    // @ts-ignore - Assuming eventBus exists and has emit
    eventBus.emit(SECURITY_EVENTS.SECRET_REQUEST, { secretKeyId, requestId, environment });
  });
}

const sessionPlugin = fp(async (fastify, opts) => {
  fastify.decorate('sessions', sessions);

  fastify.post('/sessions', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { secret_key_id: string; environment?: 'dev' | 'pro' };
    const secretKeyId = body.secret_key_id;
    const environment = body.environment ?? 'pro';

    if (!secretKeyId) {
      return reply.status(400).send({ error: 'Missing secret_key_id' });
    }

    try {
      // 1. Obtener API Key REAL desde el Bridge (Extension Host)
      const apiKey = await getSecretJit(secretKeyId, environment);

      // 2. Generar token de sesión efímero
      const sessionToken = randomUUID();
      const expiresIn = 3600; // 1 hora
      const expiresAt = Date.now() + (expiresIn * 1000);

      // 3. Guardar en memoria
      sessions.set(sessionToken, { apiKey, expiresAt });

      fastify.log.info(`[SessionPlugin] Session created for keyId=${secretKeyId} env=${environment}`);

      // 4. Devolver token al cliente
      return reply.status(201).send({
        client_secret: sessionToken,
        expires_in: expiresIn
      });

    } catch (err) {
      request.log.error(`[SessionPlugin] Failed to create session: ${(err as Error).message}`);
      return reply.status(401).send({ error: 'Failed to retrieve credentials from host.' });
    }
  });

  fastify.log.info('[SessionPlugin] Registered (Core Backend)');
});

export default sessionPlugin;

// Extend Fastify interface
declare module 'fastify' {
  interface FastifyInstance {
    sessions: SessionStore;
  }
}
