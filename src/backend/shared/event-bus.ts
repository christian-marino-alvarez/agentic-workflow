import { EventEmitter } from 'events';

/**
 * BackendEventBus
 * Bus de eventos centralizado para la comunicación desacoplada entre módulos del backend.
 */
class BackendEventBus extends EventEmitter {
  private static instance: BackendEventBus;

  private constructor() {
    super();
    // Limitar el número de listeners si es necesario, pero por ahora ilimitado
    this.setMaxListeners(0);
  }

  public static getInstance(): BackendEventBus {
    if (!BackendEventBus.instance) {
      BackendEventBus.instance = new BackendEventBus();
    }
    return BackendEventBus.instance;
  }
}

export const eventBus = BackendEventBus.getInstance();

export const SECURITY_EVENTS = {
  READY: 'security:ready',
  SECRET_REQUEST: 'security:secret-request', // payload: { secretKeyId, requestId, environment? }
  SECRET_RESPONSE: (requestId: string) => `security:secret-response:${requestId}`,
} as const;
