/**
 * Pure TypeScript Messaging implementation.
 * Zero external dependencies.
 */

import { Message } from '../types.js';

type Callback = (message: Message) => void;

const listeners: Callback[] = [];

export class Messaging {
  /**
   * Broadcast a message to all internal listeners.
   */
  public emit(message: Message): void {
    listeners.forEach(cb => {
      try {
        cb(message);
      } catch (e) {
        console.error('[Messaging] Error in listener:', e);
      }
    });
  }

  /**
   * Subscribe to the global message stream.
   */
  public on(callback: Callback): { dispose: () => void } {
    listeners.push(callback);
    return {
      dispose: () => {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }
}
