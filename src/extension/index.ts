import * as vscode from 'vscode';
import { App } from './modules/app/index.js';

let appInstance: App | undefined;

/**
 * Standard VS Code activation function.
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  appInstance = new App(context);
  await appInstance.activate();
}

/**
 * Standard VS Code deactivation function.
 */
export async function deactivate(): Promise<void> {
  if (appInstance) {
    await appInstance.deactivate();
    appInstance = undefined;
  }
}
