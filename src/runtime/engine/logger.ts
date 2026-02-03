import fs from 'node:fs';
import path from 'node:path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  context?: Record<string, unknown>;
}

export class Logger {
  private static instance: Logger;
  private buffer: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;
  private logFile: string;

  private constructor() {
    this.logFile = '/Users/milos/Documents/workspace/agentic-workflow/agentic-runtime.log';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(level: LogLevel, source: string, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      context,
    };

    this.buffer.push(entry);

    // Circular buffer logic (simple FIFO eviction)
    if (this.buffer.length > this.MAX_LOGS) {
      this.buffer.shift();
    }

    // Console output for human readability
    this.printToConsole(entry);

    // Persistent file logging for external tailing
    this.appendToFile(entry);
  }

  private appendToFile(entry: LogEntry): void {
    const logLine = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.source}] ${entry.message} ${entry.context ? JSON.stringify(entry.context) : ''}\n`;
    try {
      fs.appendFileSync(this.logFile, logLine);
    } catch (e) {
      // Ignored to avoid cascading failures if disk is full or read-only
    }
  }

  public getLogs(limit: number = 100): LogEntry[] {
    return this.buffer.slice(-limit);
  }

  public clear(): void {
    this.buffer = [];
  }

  private printToConsole(entry: LogEntry): void {
    const colorMap: Record<LogLevel, string> = {
      debug: '\x1b[34m', // Blue
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
    };
    const reset = '\x1b[0m';
    const color = colorMap[entry.level] || reset;

    console.error(
      `${color}[${entry.level.toUpperCase()}]${reset} [${entry.source}] ${entry.message}`,
      entry.context ? JSON.stringify(entry.context) : ''
    );
  }

  // Convenience methods
  public static debug(source: string, message: string, context?: Record<string, unknown>): void {
    this.getInstance().log('debug', source, message, context);
  }

  public static info(source: string, message: string, context?: Record<string, unknown>): void {
    this.getInstance().log('info', source, message, context);
  }

  public static warn(source: string, message: string, context?: Record<string, unknown>): void {
    this.getInstance().log('warn', source, message, context);
  }

  public static error(source: string, message: string, context?: Record<string, unknown>): void {
    this.getInstance().log('error', source, message, context);
  }
}
