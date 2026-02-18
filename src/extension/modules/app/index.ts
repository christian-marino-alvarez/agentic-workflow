import * as vscode from 'vscode';

import { App as CoreApp } from '../core/index.js';
import { AppBackground } from './background/index.js';
import { Background as AuthBackground } from '../auth/index.js';


/**
 * Concrete Application Entry Point.
 * Specialized for the main Shell.
 */
export class App extends CoreApp {

  constructor(context: any) {
    super(context);
  }

  /**
   * Activate the main application shell using instance registration.
   */
  public async activate(): Promise<void> {
    // 1. Register UI Module (Background manages Sidecar spawn)
    const background = new AppBackground(this.context);
    this.register('mainView', background);

    // 2. Register Auth Module
    const auth = AuthBackground.getInstance(this.context);
    this.register('auth-view', auth);

    // NOTE: Settings module is managed internally by AppBackground,
    // which creates its own SettingsBackground and delegates messages to it.
    // Do NOT register a standalone SettingsBackground here — it would create
    // a duplicate instance that processes every message twice.

    this.log('Application Shell Activated');
  }

  public async deactivate(): Promise<void> {
    await super.deactivate();
  }
}
