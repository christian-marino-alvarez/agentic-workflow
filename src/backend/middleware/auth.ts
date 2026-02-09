import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import type { SessionStore } from '../plugins/session.js';



/**
 * Middleware de autenticación de sesión (Core Backend).
 *
 * 1. Lee el token del Header Authorization (Bearer <token>)
 * 2. Verifica si el token existe en la SessionStore del plugin.
 * 3. Si es válido y no expirado, inyecta la `apiKey` en la request.
 * 4. Si no, devuelve 401.
 */
export async function verifySession(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7);
    const sessions = (request.server as FastifyInstance & { sessions: SessionStore }).sessions; // Plugin debe estar registrado

    if (!sessions) {
      request.log.error('[AuthMiddleware] Session plugin not registered correctly');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }

    const sessionData = sessions.get(token);

    if (!sessionData) {
      throw new Error('Invalid session token');
    }

    if (Date.now() > sessionData.expiresAt) {
      sessions.delete(token);
      throw new Error('Session expired');
    }

    // Inyectar API Key en request para uso downstream
    // @ts-ignore - Extend request interface later
    request.apiKey = sessionData.apiKey;

  } catch (err) {
    request.log.warn(`[AuthMiddleware] ${(err as Error).message}`);
    return reply.status(401).send({ error: 'Unauthorized: Invalid or expired session' });
  }
}

// Extend Request interface to include apiKey
declare module 'fastify' {
  interface FastifyRequest {
    apiKey?: string;
  }
  interface FastifyInstance {
    sessions: SessionStore;
  }
}
