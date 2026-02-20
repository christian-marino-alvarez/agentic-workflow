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

  public async activate(): Promise<void> {
    this.log('Activation start');
    // 1. Register UI Module (Background manages Sidecar spawn)
    const version = vscode.extensions.getExtension('christian-marino-alvarez.agentic-workflow')?.packageJSON.version || '0.0.0';
    this.log(`Version resolved: ${version}`);
    const background = new AppBackground(this.context, version);
    this.log('AppBackground created');
    this.register('mainView', background);
    this.log('AppBackground registered');

    // 2. Register Auth Module
    const auth = AuthBackground.getInstance(this.context);
    this.log('AuthBackground created');
    this.register('auth-view', auth);
    this.log('AuthBackground registered');

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
