import * as vscode from 'vscode';
import { App } from './modules/app/index.js';

let app: App | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  console.log('[Extension] Initializing Agentic Workflow...');
  try {
    app = new App(context);
    await app.activate();
    console.log('[Extension] Activated successfully.');
  } catch (error) {
    console.error('[Extension] Activation failed:', error);
    throw error;
  }
}

export async function deactivate(): Promise<void> {
  if (app) {
    await app.deactivate();
  }
}
