import type { Webview, Disposable } from 'vscode';
import { MessagingBackend } from './backend.js';
import { Message } from '../types.js';

/**
 * Specialized messenger for Background modules.
 * Standard internal bus communication + Webview Bridge + Sidecar Client.
 */
export class MessagingBackground extends MessagingBackend {
  private webview?: Webview;
  private webviewDisposables: Disposable[] = [];

  /**
   * Link a VS Code Webview to this messenger.
   * Automatically handles bidirectional bridging.
   */
  public setWebview(webview: Webview): void {
    // Clear previous disposables if any
    this.webviewDisposables.forEach(d => d.dispose());
    this.webviewDisposables = [];

    this.webview = webview;

    // 1. Ingress: Webview -> Bus
    this.webviewDisposables.push(
      this.webview.onDidReceiveMessage(message => {
        // Broadcast webview messages to the internal bus
        this.emit(message);
      })
    );

    // 2. Egress: Bus -> Webview
    // Note: We don't subscribe here directly to avoid double processing if 'subscribe' is used.
    // Instead, we tap into the emit flow or just rely on 'subscribe' being smart.
    // BUT, the original View messenger did: bus.on(msg => if target=view then webview.postMessage).
    // Let's replicate that simply.
    this.webviewDisposables.push(
      this.on(message => {
        // Forward to webview if target is 'view' or ends with '::view'
        // Since we are now Background, 'view' messages are essentially 'to my UI'.
        const isTargetedToUI = message.to === 'view' || message.to.endsWith('::view');
        if (isTargetedToUI && this.webview) {
          void this.webview.postMessage(message);
        }
      })
    );
  }

  public dispose(): void {
    this.webviewDisposables.forEach(d => d.dispose());
    this.webview = undefined;
  }

  /**
   * Subscribe to messages targeted to a specific identity.
   */
  public subscribe(identity: string, callback: (message: Message) => void): { dispose: () => void } {
    // Extract module name from identity (e.g., "main::background" -> "main")
    const moduleName = identity.split('::')[0];

    return this.on(message => {
      // Accept messages to: exact identity, module name only, or 'all'
      if (message.to === identity || message.to === moduleName || message.to === 'all') {
        callback(message);
      }
    });
  }
}
