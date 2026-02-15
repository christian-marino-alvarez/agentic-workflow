import * as vscode from 'vscode';

/**
 * Standardized logger for the Agentic Workflow extension.
 * Provides a centralized VS Code Output Channel for visibility.
 */
export class Logger {
  private static channel: vscode.OutputChannel | undefined;

  /**
   * Initialize the output channel.
   */
  public static init(name: string): void {
    if (!this.channel) {
      this.channel = vscode.window.createOutputChannel(name);
    }
    this.channel.show(true); // Show but don't take focus
    this.log('Logger initialized in Output Channel');
  }

  /**
   * Log a message with a timestamp and optional arguments.
   */
  public static log(message: string, ...args: any[]): void {
    const timestamp = new Date().toLocaleTimeString();
    const formattedArgs = args.length > 0
      ? ` | ${args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')}`
      : '';

    const fullMessage = `[${timestamp}] ${message}${formattedArgs}`;

    // Write to Output Channel
    this.channel?.appendLine(fullMessage);

    // Also write to Debug Console
    console.log(fullMessage);
  }

  /**
   * Focus the output channel.
   */
  public static show(): void {
    this.channel?.show();
  }
}
