import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Messaging } from '../../messaging/index.js';
import { Message } from '../../types.js';
import { MessageOrigin } from '../../constants.js';

class TestMessaging extends Messaging {
  // Expose protected methods for testing if needed
}

describe('Messaging (Base)', () => {
  let messaging: TestMessaging;

  beforeEach(() => {
    messaging = new TestMessaging();
  });

  it('should emit and receive messages', () => {
    const handler = vi.fn();
    messaging.on(handler);

    const message: Message = {
      from: 'sender',
      to: 'receiver',
      origin: MessageOrigin.View,
      timestamp: Date.now(),
      payload: { command: 'test', data: {} }
    };

    messaging.emit(message);
    expect(handler).toHaveBeenCalledWith(message);
  });

  it('should handle dispose correctly', () => {
    const handler = vi.fn();
    const subscription = messaging.on(handler);

    subscription.dispose();

    const message: Message = {
      from: 'sender',
      to: 'receiver',
      origin: MessageOrigin.View,
      timestamp: Date.now(),
      payload: { command: 'test', data: {} }
    };

    messaging.emit(message);
    expect(handler).not.toHaveBeenCalled();
  });
});
