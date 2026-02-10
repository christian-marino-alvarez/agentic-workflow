import type {
  Disposable,
  ExtensionContext,
  Webview,
  WebviewView,
  WebviewViewProvider
} from 'vscode';
import { window } from 'vscode';
import { z } from 'zod';
import { ViewLogger } from '../logging/logger.js';
import { getMessageHandlers, getServerHandlers } from '../decorators/metadata.js';
import type { ServerEventRegistrar, ViewStage } from './types.js';
import { BaseMessageType } from '../../../shared/messaging/base.js';

export abstract class AgwViewProviderBase
  implements WebviewViewProvider, Disposable {
  protected readonly logger: ViewLogger;
  protected readonly logId: string;
  protected webviewView?: WebviewView;
  protected readonly disposables: Disposable[] = [];

  /**
   * Mensajes pendientes de confirmación (ACK)
   */
  private pendingMessages = new Map<string, {
    payload: any;
    attempts: number;
    timer: NodeJS.Timeout;
  }>();

  private readonly MAX_ATTEMPTS = 3;
  private readonly ACK_TIMEOUT = 1000; // ms

  /**
   * Opcional: Esquema de validación para los mensajes de este proveedor.
   */
  protected messageSchema?: z.ZodType<any>;

  public constructor(
    protected readonly context: ExtensionContext,
    protected readonly viewId: string,
    logger: ViewLogger = ViewLogger.getInstance()
  ) {
    this.logger = logger;
    this.logId = `${viewId}-next`;
    this.register();
    this.context.subscriptions.push(this);
  }

  public dispose(): void {
    while (this.disposables.length > 0) {
      const disposable = this.disposables.pop();
      disposable?.dispose();
    }
  }

  public resolveWebviewView(webviewView: WebviewView): void {
    this.webviewView = webviewView;
    const messageDisposable = webviewView.webview.onDidReceiveMessage((message) => {
      void this.handleMessage(message);
    });
    this.registerDisposable(messageDisposable);

    this.logStage('resolve');
    this.onResolve(webviewView);

    this.onConnect(webviewView);
    this.logStage('connect');
  }

  protected registerDisposable(disposable: Disposable): void {
    this.disposables.push(disposable);
    this.context.subscriptions.push(disposable);
  }

  protected register(): void {
    try {
      const disposable = window.registerWebviewViewProvider(this.viewId, this);
      this.registerDisposable(disposable);
    } catch (error) {
      this.logger.warn(this.logId, 'register-provider-failed', {
        message: error instanceof Error ? error.message : 'unknown'
      });
    }
  }

  protected createNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let value = '';
    for (let i = 0; i < 32; i += 1) {
      value += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return value;
  }

  protected createScriptUri(webview: Webview, scriptPath: string): string {
    return webview
      .asWebviewUri(
        this.context.extensionUri.with({
          path: `${this.context.extensionUri.path}${scriptPath}`
        })
      )
      .toString();
  }

  protected createWebviewUri(webview: Webview, relativePath: string): string {
    return webview
      .asWebviewUri(
        this.context.extensionUri.with({
          path: `${this.context.extensionUri.path}${relativePath}`
        })
      )
      .toString();
  }

  protected logStage(stage: ViewStage): void {
    this.logger.info(this.logId, `stage-${stage}`);
  }

  protected postMessage(payload: any, options: { expectAck?: boolean } = {}): void {
    if (!payload.id) {
      payload.id = crypto.randomUUID();
    }
    if (!payload.timestamp) {
      payload.timestamp = new Date().toISOString();
    }

    this.logger.info(this.logId, 'post-message', { type: payload.type, id: payload.id });

    if (options.expectAck) {
      this.trackMessage(payload);
    }

    void this.webviewView?.webview.postMessage(payload);
  }

  private trackMessage(payload: any): void {
    const id = payload.id;
    const attempt = 1;

    const timer = setTimeout(() => {
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
      this.logger.warn(this.logId, 'ack-timeout-retry', { id, attempt: pending.attempts });

      // Re-enviar
      void this.webviewView?.webview.postMessage(pending.payload);

      pending.timer = setTimeout(() => {
        this.handleAckTimeout(id);
      }, this.ACK_TIMEOUT);
    } else {
      this.logger.error(this.logId, 'ack-failed-max-attempts', { id });
      this.pendingMessages.delete(id);
      // Aquí se podría notificar al usuario o al sistema de monitoreo
    }
  }

  private handleAck(message: any): void {
    const originalId = message.payload?.originalId;
    if (originalId && this.pendingMessages.has(originalId)) {
      const pending = this.pendingMessages.get(originalId);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingMessages.delete(originalId);
        this.logger.info(this.logId, 'ack-received', { id: originalId });
      }
    }
  }

  protected renderTemplate<TParams>(
    webviewView: WebviewView,
    render: (params: TParams) => string,
    params: TParams
  ): void {
    webviewView.webview.html = render(params);
  }

  protected bindServerEvents(register: ServerEventRegistrar): void {
    const handlers = getServerHandlers(this);
    handlers.forEach((handler) => {
      const method = (this as unknown as Record<string, (payload: unknown) => void>)[
        handler.method
      ];
      if (typeof method !== 'function') {
        this.logger.warn(this.logId, 'missing-server-handler', {
          event: handler.event,
          method: handler.method
        });
        return;
      }
      const disposable = register(handler.event, (payload) => method.call(this, payload));
      if (disposable) {
        this.registerDisposable(disposable);
      }
    });
  }

  protected abstract onResolve(webviewView: WebviewView): void;

  protected onConnect(_webviewView: WebviewView): void { }

  protected onReady(): void { }

  private async handleMessage(message: any): Promise<void> {
    // 1. Envío de ACK automático para mensajes que lo requieran
    if (message?.id && message.type !== BaseMessageType.Ack) {
      this.sendAck(message.id);
    }

    // 2. Procesar si es un ACK para nosotros
    if (message?.type === BaseMessageType.Ack) {
      this.handleAck(message);
      return;
    }

    // 3. Validación de infraestructura (Logs)
    if (message?.type === 'log') {
      this.logger.fromWebview(this.logId, message);
      return;
    }

    // 2. Validación de esquema (si existe)
    if (this.messageSchema) {
      const result = this.messageSchema.safeParse(message);
      if (!result.success) {
        this.logger.error(this.logId, 'invalid-message-contract', {
          type: message?.type,
          errors: result.error.format()
        });

        // Opcional: Informar al frontend del error de contrato
        this.postMessage({
          type: BaseMessageType.Error,
          payload: {
            code: 'CONTRACT_VIOLATION',
            message: 'El mensaje enviado no cumple con el contrato definido.',
            details: result.error.format()
          }
        });
        return;
      }
      // Reemplazamos el mensaje por el validado (con tipos limpios)
      message = result.data;
    }

    if (message?.type === 'webview-ready') {
      this.onReady();
      this.logStage('ready');
    }

    const handlers = getMessageHandlers(this);
    handlers
      .filter((handler) => handler.type === message?.type)
      .forEach((handler) => {
        const method = (this as unknown as Record<string, (payload: unknown) => void>)[
          handler.method
        ];
        if (typeof method !== 'function') {
          this.logger.warn(this.logId, 'missing-message-handler', {
            type: handler.type,
            method: handler.method
          });
          return;
        }
        try {
          method.call(this, message);
        } catch (error) {
          this.logger.error(this.logId, 'message-handler-error', {
            type: handler.type,
            message: error instanceof Error ? error.message : 'unknown'
          });
        }
      });
  }

  private sendAck(originalId: string): void {
    void this.webviewView?.webview.postMessage({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: BaseMessageType.Ack,
      payload: { originalId, status: 'ok' }
    });
  }
}
