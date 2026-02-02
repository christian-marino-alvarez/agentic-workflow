import { addServerHandler } from './metadata.js';

export function onServer(event: string) {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): void {
    if (typeof descriptor.value !== 'function') {
      return;
    }
    addServerHandler(target, { event, method: propertyKey.toString() });
  };
}
