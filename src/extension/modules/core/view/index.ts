import { LitElement } from 'lit';
import { MessageOrigin } from '../constants.js';
import { LOG_STYLE } from './templates/css.js';

export type ViewStatus = 'loading' | 'ready' | 'error';

/** Default timeout for awaiting a response (ms) */
const REQUEST_TIMEOUT = 10_000;

/** Pending request entry */
interface PendingRequest {
  resolve: (data: any) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * Base View class for Lit-based Webviews.
 * Implements the messaging bridge to the Extension Host (Background).
 * Supports request-response pattern via correlation IDs.
 */
export abstract class View extends LitElement {

  /** Map of pending requests awaiting responses, keyed by message id */
  private pendingRequests = new Map<string, PendingRequest>();

  protected get vscode() {
    if (!(window as any).vscodeApi) {
      if ((window as any).acquireVsCodeApi) {
        (window as any).vscodeApi = (window as any).acquireVsCodeApi();
      }
    }
    return (window as any).vscodeApi;
  }

  /**
   * Lifecycle: registers the message bridge with listen() as handler.
   * Subclasses should NOT override connectedCallback for message handling.
   */
  override connectedCallback() {
    super.connectedCallback();
    this.onMessage((msg) => this.listen(msg));
  }

  /**
   * Override in subclasses to handle incoming messages from the Extension Host.
   * Called for every non-correlated message (correlated responses are resolved automatically).
   */
  public listen(message: any): void {
    // Base implementation — no-op. Subclasses override.
  }

  /**
   * Listen for messages from the Extension Host.
   * Automatically resolves pending request-response promises via correlationId.
   */
  protected onMessage(handler: (message: any) => void): void {
    window.addEventListener('message', event => {
      const message = event.data;

      // Check if this is a response to a pending request
      if (message.correlationId && this.pendingRequests.has(message.correlationId)) {
        const pending = this.pendingRequests.get(message.correlationId)!;
        clearTimeout(pending.timer);
        this.pendingRequests.delete(message.correlationId);
        pending.resolve(message.payload?.data);
        return; // Don't forward to handler — it's a correlated response
      }

      handler(message);
    });
  }

  /**
   * Send a message to the Extension Host.
   * Returns a Promise that resolves when the correlated response arrives.
   *
   * @param to      Target scope (e.g. SCOPES.BACKGROUND)
   * @param command Command identifier
   * @param data    Payload data
   * @param timeout Max wait time in ms (default 10s)
   * @returns       The response payload data, or void if no response expected
   */
  protected sendMessage(to: string, command: string, data: any = {}, timeout = REQUEST_TIMEOUT): Promise<any> {
    const id = crypto.randomUUID();

    const payload = {
      id,
      timestamp: Date.now(),
      to,
      from: 'view',
      origin: MessageOrigin.View,
      payload: { command, data }
    };

    this.log(`→ ${command}`, data);
    this.vscode?.postMessage(payload);

    // Return a promise that resolves when the response is correlated
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`[View] Timeout waiting for response to "${command}" (${timeout}ms)`));
      }, timeout);

      this.pendingRequests.set(id, { resolve, reject, timer });
    });
  }

  /**
   * Ping the Background layer and await the pong response.
   * Native connectivity check.
   */
  public async ping(): Promise<any> {
    return this.sendMessage('main', 'ping');
  }

  protected abstract readonly moduleName: string;

  /**
   * Standardized logger for the View layer.
   */
  protected log(message: string, ...args: any[]): void {
    const formattedMsg = `[${this.moduleName}::view] ${message}`;
    console.log(`%c${formattedMsg}`, LOG_STYLE.View, ...args);

    // Forward to background for output channel logging
    this.vscode?.postMessage({
      command: 'log',
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      to: 'app', // Default to app background
      from: 'view',
      origin: MessageOrigin.View,
      payload: {
        command: 'log',
        data: { message: formattedMsg, args }
      }
    });
  }
}
