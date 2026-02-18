import * as vscode from 'vscode';
import { Logger } from './logger.js';

export * from './backend/index.js'; // Abstract Backend
export * from './constants.js';
export type { Message, MessageHandler, Payload, IMessageTransport } from './types.js';
export { Logger } from './logger.js';
export * from './messaging/index.js';
export * from './messaging/types.js'; // Export Messaging Types
export * from './background/index.js';
export { View } from './view/index.js';
export * as ViewHtml from './view/templates/html.js';


/**
 * Abstract Entry Point for the Extension.
 * Standardizes the activation/deactivation lifecycle and module registration.
 */
export abstract class App {
  /**
   * VS Code extension context, provides access to extension resources and APIs.
   */
  protected readonly context: vscode.ExtensionContext;

  /**
   * Registry for all active modules in the extension.
   */
  private modules: Map<string, vscode.WebviewViewProvider> = new Map();

  constructor(context: vscode.ExtensionContext) {
    // Explicit assignment for clarity
    this.context = context;
    Logger.init('Agentic Workflow');
  }

  /**
   * Main activation entry point.
   */
  public abstract activate(): Promise<void>;

  /**
   * Register a new webview provider (Background instance).
   */
  public register(id: string, provider: vscode.WebviewViewProvider): void {
    this.modules.set(id, provider);
    this.context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(id, provider)
    );
    this.log(`Module Registered: ${id}`);
  }

  /**
   * Retrieve a registered module by ID.
   */
  public getModule(id: string): vscode.WebviewViewProvider | undefined {
    return this.modules.get(id);
  }

  /**
   * Main deactivation entry point.
   */
  public async deactivate(): Promise<void> {
    this.log('Deactivating...');
    this.modules.clear();
  }

  /**
   * Standardized logger for the Application layer.
   */
  protected log(message: string, ...args: any[]): void {
    Logger.log(`[app::main] ${message}`, ...args);
  }
}
