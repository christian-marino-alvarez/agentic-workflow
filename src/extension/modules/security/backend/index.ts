import { eventBus, SECURITY_EVENTS } from '../../../../backend/shared/event-bus.js';
import { randomUUID } from 'crypto';
import { BridgeClient } from './bridge-client.js';
import { BackendModulePlugin, wrapAsPlugin } from '../../../../backend/shared/module-provider.js';

const securityBackendPlugin: BackendModulePlugin = async (context) => {
  const bridge = new BridgeClient();

  // Escuchar peticiones de secretos desde otros módulos del backend
  eventBus.on(SECURITY_EVENTS.SECRET_REQUEST, async (payload: { secretKeyId: string; requestId: string; environment?: 'dev' | 'pro' }) => {
    try {
      console.log(`[SecurityBackend] Secret request received for ${payload.secretKeyId} env=${payload.environment ?? 'pro'} (ID: ${payload.requestId})`);
      const secret = await bridge.getSecret(payload.secretKeyId);
      eventBus.emit(SECURITY_EVENTS.SECRET_RESPONSE(payload.requestId), { secret });
    } catch (err) {
      console.error(`[SecurityBackend] Error retrieving secret ${payload.secretKeyId}:`, err);
      eventBus.emit(SECURITY_EVENTS.SECRET_RESPONSE(payload.requestId), { error: 'Failed to retrieve secret' });
    }
  });

  // Notificar que el sistema de seguridad está listo si el puente está configurado
  if (bridge.isReady()) {
    console.log('[SecurityBackend] Bridge is ready. Emitting READY event.');
    eventBus.emit(SECURITY_EVENTS.READY);
  }

  context.get('/test-bridge', async (request, reply) => {
    try {
      const requestId = randomUUID();
      const secretKeyId = 'christianmaf80.agentic-workflow.openaiKey'; // ID de ejemplo

      console.log(`[SecurityBackend] Testing bridge for ${secretKeyId}`);

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          eventBus.removeAllListeners(SECURITY_EVENTS.SECRET_RESPONSE(requestId));
          resolve({ status: 'error', message: 'Bridge timeout' });
        }, 5000);

        eventBus.once(SECURITY_EVENTS.SECRET_RESPONSE(requestId), (payload: any) => {
          clearTimeout(timeout);
          if (payload.error) {
            resolve({ status: 'error', message: payload.error });
          } else {
            const secretLength = payload.secret?.length || 0;
            resolve({
              status: 'ok',
              message: 'Bridge communication successful',
              details: { secretId: secretKeyId, receivedLength: secretLength }
            });
          }
        });

        eventBus.emit(SECURITY_EVENTS.SECRET_REQUEST, { secretKeyId, requestId });
      });
    } catch (err: any) {
      return { status: 'error', message: err.message };
    }
  });

  context.get('/config', async (request, reply) => {
    return { status: 'ok', config: {} };
  });

  context.post('/config', async (request, reply) => {
    return { status: 'ok', message: 'Config saved (stub)' };
  });
};

export default wrapAsPlugin(securityBackendPlugin);
