export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogEntry = {
  level: LogLevel;
  source: string;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
};

export class Logger {
  private static instance: Logger | null = null;
  private logs: LogEntry[] = [];

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  static info(source: string, message: string, context?: Record<string, unknown>): void {
    Logger.getInstance().append('info', source, message, context);
  }

  static warn(source: string, message: string, context?: Record<string, unknown>): void {
    Logger.getInstance().append('warn', source, message, context);
  }

  static error(source: string, message: string, context?: Record<string, unknown>): void {
    Logger.getInstance().append('error', source, message, context);
  }

  static debug(source: string, message: string, context?: Record<string, unknown>): void {
    Logger.getInstance().append('debug', source, message, context);
  }

  getLogs(limit = 100): LogEntry[] {
    if (limit <= 0) {
      return [];
    }
    return this.logs.slice(-limit);
  }

  private append(level: LogLevel, source: string, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      source,
      message,
      context,
      timestamp: new Date().toISOString()
    };
    this.logs.push(entry);
    const contextText = context ? ` ${JSON.stringify(context)}` : '';
    console.error(`[${level.toUpperCase()}] [${source}] ${message}${contextText}`);
  }
}
