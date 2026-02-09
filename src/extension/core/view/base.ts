import { LitElement, html, css } from 'lit';
import type { CSSResultGroup } from 'lit';
import { state } from 'lit/decorators.js';
import { z } from 'zod';

export type AgwStatus = 'loading' | 'ready' | 'error';

export abstract class AgwViewBase extends LitElement {
  @state()
  protected status: AgwStatus = 'loading';

  @state()
  protected errorMessage = '';

  protected readonly vscode = window.acquireVsCodeApi ? window.acquireVsCodeApi() : null;

  /**
   * Opcional: Esquema de validación para los mensajes que recibe la Webview.
   */
  protected messageSchema?: z.ZodType<any>;

  private pendingMessages = new Map<string, {
    payload: any;
    attempts: number;
    timer: number;
  }>();

  private readonly MAX_ATTEMPTS = 3;
  private readonly ACK_TIMEOUT = 1000;

  private hasRun = false;

  public static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color-scheme: light dark;
    }
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 120px;
      opacity: 0.7;
    }
    .error {
      color: var(--vscode-errorForeground, #f14c4c);
      font-size: 12px;
    }
  `;

  protected firstUpdated(): void {
    this.run();
  }

  protected run(): void {
    if (this.hasRun) {
      return;
    }
    this.hasRun = true;

    // Configuramos el listener global antes de nada
    window.addEventListener('message', (event) => {
      this.handleIncomingMessage(event.data);
    });

    this.listen();
    this.predata();
    void this.loadData()
      .then(() => {
        this.status = 'ready';
        this.log('info', 'status-ready');
        this.requestUpdate();
      })
      .catch((error: unknown) => {
        this.status = 'error';
        this.errorMessage = error instanceof Error ? error.message : 'Unexpected error';
        this.log('error', 'loadData-failed', { message: this.errorMessage });
      });
  }

  protected listen(): void { }

  protected predata(): void {
    this.status = 'loading';
  }

  protected async loadData(): Promise<void> { }

  protected renderLoading() {
    return html`<div class="loading">Loading…</div>`;
  }

  protected renderError() {
    return html`<div class="error">${this.errorMessage}</div>`;
  }

  protected abstract renderView(): unknown;

  protected render(): unknown {
    if (this.status === 'loading') {
      return this.renderLoading();
    }
    if (this.status === 'error') {
      return this.renderError();
    }
    return this.renderView();
  }

  protected postMessage(payload: any, options: { expectAck?: boolean } = {}): void {
    if (!payload.id) {
      payload.id = crypto.randomUUID();
    }
    if (!payload.timestamp) {
      payload.timestamp = new Date().toISOString();
    }

    if (options.expectAck) {
      this.trackMessage(payload);
    }

    this.vscode?.postMessage(payload);
  }

  private trackMessage(payload: any): void {
    const id = payload.id;
    const attempt = 1;

    const timer = window.setTimeout(() => {
      this.handleAckTimeout(id);
    }, this.ACK_TIMEOUT);

    this.pendingMessages.set(id, { payload, attempts: attempt, timer });
  }

  private handleAckTimeout(id: string): void {
    const pending = this.pendingMessages.get(id);
    if (!pending) {
      return;
    }

    if (pending.attempts < this.MAX_ATTEMPTS) {
      pending.attempts++;
      this.log('warn', 'ack-timeout-retry', { id, attempt: pending.attempts });

      this.vscode?.postMessage(pending.payload);

      pending.timer = window.setTimeout(() => {
        this.handleAckTimeout(id);
      }, this.ACK_TIMEOUT);
    } else {
      this.log('error', 'ack-failed-max-attempts', { id });
      this.pendingMessages.delete(id);
    }
  }

  private handleAck(message: any): void {
    const originalId = message.payload?.originalId;
    if (originalId && this.pendingMessages.has(originalId)) {
      const pending = this.pendingMessages.get(originalId);
      if (pending) {
        window.clearTimeout(pending.timer);
        this.pendingMessages.delete(originalId);
      }
    }
  }

  private sendAck(originalId: string): void {
    this.vscode?.postMessage({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'system:ack',
      payload: { originalId, status: 'ok' }
    });
  }

  protected log(level: string, message: string, payload?: Record<string, unknown>): void {
    this.postMessage({ type: 'log', level, message, payload });
  }

  /**
   * Manejador central de mensajes entrantes con validación opcional.
   */
  private handleIncomingMessage(message: any): void {
    // 1. Envío de ACK automático para mensajes que lo requieran
    if (message?.id && message.type !== 'system:ack') {
      this.sendAck(message.id);
    }

    // 2. Procesar si es un ACK para nosotros
    if (message?.type === 'system:ack') {
      this.handleAck(message);
      return;
    }

    if (this.messageSchema) {
      const result = this.messageSchema.safeParse(message);
      if (!result.success) {
        console.warn('[AgwViewBase] Entrada de mensaje inválida:', result.error.format());
        return;
      }
      message = result.data;
    }

    this.onMessage(message);
  }

  /**
   * Hook para que las subclases procesen mensajes (ya validados si aplica).
   */
  protected onMessage(_message: any): void { }
}
