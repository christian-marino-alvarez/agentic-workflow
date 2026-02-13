import { LitElement } from 'lit';
import { MessageOrigin } from '../constants.js';
import { LOG_STYLE } from './styles.js';

export type ViewStatus = 'loading' | 'ready' | 'error';

/**
 * Base View class for Lit-based Webviews.
 * Implements the messaging bridge to the Extension Host (Background).
 */
export abstract class View extends LitElement {

  protected get vscode() {
    if (!(window as any).vscodeApi) {
      if ((window as any).acquireVsCodeApi) {
        (window as any).vscodeApi = (window as any).acquireVsCodeApi();
      }
    }
    return (window as any).vscodeApi;
  }

  /**
   * Listen for messages from the Extension Host.
   */
  protected onMessage(handler: (message: any) => void): void {
    window.addEventListener('message', event => {
      const message = event.data;
      // Filter logic can be added here if needed
      handler(message);
    });
  }

  /**
   * Send a message to the Extension Host.
   */
  protected sendMessage(to: string, command: string, data: any = {}): void {
    const payload = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      to,
      from: 'view', // Client-side identity
      origin: MessageOrigin.View,
      payload: { command, data }
    };

    this.log(`Sending Message to ${to}`, command, data);
    this.vscode?.postMessage(payload);
  }

  /**
   * Standardized logger for the View layer.
   * Leverages LOG_STYLE for browser console visibility.
   */
  protected log(message: string, ...args: any[]): void {
    console.log(`%c[View] %c${message}`, LOG_STYLE.View, LOG_STYLE.Args, ...args);
  }
}
