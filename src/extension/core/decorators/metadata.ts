export type MessageHandlerMeta = {
  type: string;
  method: string;
};

export type ServerHandlerMeta = {
  event: string;
  method: string;
};

const messageHandlersKey = Symbol('agw:message-handlers');
const serverHandlersKey = Symbol('agw:server-handlers');

function ensureArray<T>(target: Record<string | symbol, T[]>, key: symbol): T[] {
  if (!target[key]) {
    target[key] = [];
  }
  return target[key];
}

export function addMessageHandler(target: object, handler: MessageHandlerMeta): void {
  const ctor = (target as { constructor: Record<string | symbol, MessageHandlerMeta[]> })
    .constructor;
  ensureArray(ctor, messageHandlersKey).push(handler);
}

export function addServerHandler(target: object, handler: ServerHandlerMeta): void {
  const ctor = (target as { constructor: Record<string | symbol, ServerHandlerMeta[]> })
    .constructor;
  ensureArray(ctor, serverHandlersKey).push(handler);
}

export function getMessageHandlers(instance: object): MessageHandlerMeta[] {
  const ctor = (instance as { constructor: Record<string | symbol, MessageHandlerMeta[]> })
    .constructor;
  return ctor[messageHandlersKey] ?? [];
}

export function getServerHandlers(instance: object): ServerHandlerMeta[] {
  const ctor = (instance as { constructor: Record<string | symbol, ServerHandlerMeta[]> })
    .constructor;
  return ctor[serverHandlersKey] ?? [];
}
