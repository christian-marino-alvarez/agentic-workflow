import { Messaging } from './index.js';
import { Message } from '../types.js';
import { MessageOrigin, LayerScope } from '../constants.js';
import { randomUUID } from 'crypto';

/**
 * Specialized messenger for Backend services.
 * Handles the bridge between the internal bus and the Sidecar (HTTP/SSE).
 */
export class MessagingBackend extends Messaging {
  private endpoint?: string;
  private disposables: { dispose: () => void }[] = [];

  /**
   * Set the Sidecar base URL.
   */
  public setEndpoint(url: string): void {
    this.endpoint = url;

    // Automatic Bridge: Bus -> Sidecar
    const sub = this.on(message => {
      const isTargetedToBackend = message.to === LayerScope.Backend || message.to.endsWith(`::${LayerScope.Backend}`) || message.to === 'sidecar';

      // If message is for sidecar and we originated it (not from server), send it out
      if (isTargetedToBackend && message.from !== 'sidecar' && this.endpoint) {
        if (message.payload.command.includes('stream')) {
          void this.stream(message);
        } else {
          void this.request(message);
        }
      }
    });
    this.disposables.push(sub);
  }

  /**
   * Send an HTTP POST request to the sidecar.
   */
  private async request(message: Message): Promise<void> {
    if (!this.endpoint) {
      console.warn('[MessagingBackend] No endpoint configured, skipping request');
      return;
    }
    try {
      // console.log(`[MessagingBackend] Sending to ${this.endpoint}/command`, message.payload);
      const response = await fetch(`${this.endpoint}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message.payload)
      });

      if (response.ok) {
        const data = await response.json();
        // console.log('[MessagingBackend] Response received', data);
        this.emit({
          id: randomUUID(),
          from: 'sidecar',
          to: message.from,
          origin: MessageOrigin.Server,
          timestamp: Date.now(),
          payload: { command: `${message.payload.command}::response`, data }
        });
      } else {
        console.error(`[MessagingBackend] HTTP Error: ${response.status} ${response.statusText}`);
      }
    } catch (e) {
      console.error('[MessagingBackend] Request error:', e);
    }
  }

  /**
   * Start an SSE stream from the sidecar.
   */
  private async stream(message: Message): Promise<void> {
    if (!this.endpoint) {
      return;
    }
    try {
      const response = await fetch(`${this.endpoint}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify(message.payload)
      });

      if (!response.body) {
        return;
      }

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        // Simple SSE parsing (minimalist)
        const lines = value.split('\n');
        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const data = JSON.parse(line.trim().slice(6));
              this.emit({
                id: randomUUID(),
                from: 'sidecar',
                to: message.from,
                origin: MessageOrigin.Server,
                timestamp: Date.now(),
                payload: { command: `${message.payload.command}::chunk`, data }
              });
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (e) {
      console.error('[MessagingBackend] Stream error:', e);
    }
  }

  /**
   * Subscribe to messages targeted to a specific identity.
   */
  public subscribe(identity: string, callback: (message: Message) => void): { dispose: () => void } {
    return this.on(message => {
      if (message.to === identity || message.to === 'all') {
        callback(message);
      }
    });
  }

  public dispose(): void {
    this.disposables.forEach(d => d.dispose());
  }
}
