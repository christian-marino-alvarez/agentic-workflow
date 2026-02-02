import { addMessageHandler } from './metadata.js';

export function onMessage(type: string) {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): void {
    if (typeof descriptor.value !== 'function') {
      return;
    }
    addMessageHandler(target, { type, method: propertyKey.toString() });
  };
}
