import type {
  Disposable,
  ExtensionContext,
  Webview,
  WebviewView,
  WebviewViewProvider
} from 'vscode';
import { window } from 'vscode';
import { ViewLogger } from '../logging/logger.js';
import { getMessageHandlers, getServerHandlers } from '../decorators/metadata.js';
import type { ServerEventRegistrar, ViewStage } from './types.js';

export abstract class AgwViewProviderBase
  implements WebviewViewProvider, Disposable
{
  protected readonly logger: ViewLogger;
  protected readonly logId: string;
  protected webviewView?: WebviewView;
  protected readonly disposables: Disposable[] = [];

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

  protected postMessage(payload: Record<string, unknown>): void {
    void this.webviewView?.webview.postMessage(payload);
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

  protected onConnect(_webviewView: WebviewView): void {}

  protected onReady(): void {}

  private async handleMessage(message: {
    type?: string;
    level?: 'info' | 'warn' | 'error';
    message?: string;
    payload?: Record<string, unknown>;
  }): Promise<void> {
    if (message?.type === 'log') {
      this.logger.fromWebview(this.logId, message);
      return;
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
}
