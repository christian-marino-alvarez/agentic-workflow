import type { ExtensionContext } from 'vscode';
import { registerMainChatView } from './views/index.js';

export function activate(context: ExtensionContext): void {
  registerMainChatView(context);
}

export function deactivate(): void {}
