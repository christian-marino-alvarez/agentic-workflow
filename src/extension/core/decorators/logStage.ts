import type { ViewStage } from '../controller/types.js';

export function logStage(stage: ViewStage) {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): void {
    const original = descriptor.value;
    if (typeof original !== 'function') {
      return;
    }
    descriptor.value = function (...args: unknown[]) {
      const self = this as { logStage?: (stageName: ViewStage) => void };
      self.logStage?.(stage);
      return original.apply(this, args);
    };
  };
}
