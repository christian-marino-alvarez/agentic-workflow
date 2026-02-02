import { window } from 'vscode';

type LogLevel = 'info' | 'warn' | 'error';

type LogPayload = Record<string, unknown>;

type WebviewLogMessage = {
  level?: LogLevel;
  message?: string;
  payload?: LogPayload;
};

export class ViewLogger {
  private static instance: ViewLogger | null = null;
  private readonly channel = window.createOutputChannel('Agentic Views');
  private firstLog = true;

  public static getInstance(): ViewLogger {
    if (!ViewLogger.instance) {
      ViewLogger.instance = new ViewLogger();
    }
    return ViewLogger.instance;
  }

  public info(viewId: string, message: string, payload?: LogPayload): void {
    this.log('info', viewId, message, payload);
  }

  public warn(viewId: string, message: string, payload?: LogPayload): void {
    this.log('warn', viewId, message, payload);
  }

  public error(viewId: string, message: string, payload?: LogPayload): void {
    this.log('error', viewId, message, payload);
  }

  public fromWebview(viewId: string, message: WebviewLogMessage): void {
    this.log(message.level ?? 'info', viewId, message.message ?? 'webview-log', message.payload);
  }

  private log(level: LogLevel, viewId: string, message: string, payload?: LogPayload): void {
    const timestamp = new Date().toISOString();
    const payloadText = payload ? ` ${JSON.stringify(payload)}` : '';
    this.channel.appendLine(`[AGW] [${timestamp}] [${level}] [${viewId}] ${message}${payloadText}`);
    if (this.firstLog) {
      this.firstLog = false;
      this.channel.show(true);
    }
  }
}
