import * as vscode from 'vscode';
import { App as CoreApp } from '../core/index.js';
import { AppBackground } from './background/index.js';

/**
 * Concrete Application Entry Point.
 * Specialized for the main Shell.
 */
export class App extends CoreApp {

  constructor(context: vscode.ExtensionContext) {
    super(context);
  }

  /**
   * Activate the main application shell using instance registration.
   */
  public async activate(): Promise<void> {
    // 1. Register UI Module (Background manages Sidecar spawn)
    const background = new AppBackground(this.context.extensionUri);
    this.register('mainView', background);

    this.log('Application Shell Activated');
  }

  public async deactivate(): Promise<void> {
    await super.deactivate();
  }
}
