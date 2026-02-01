import type { ExtensionContext } from 'vscode';
import { window } from 'vscode';
import type { ViewRegistration } from '../types.js';

export function registerViewRegistry(
  context: ExtensionContext,
  registrations: ViewRegistration[]
): void {
  registrations.forEach((registration) => {
    const provider = registration.factory(context);
    context.subscriptions.push(
      window.registerWebviewViewProvider(registration.id, provider)
    );
  });
}
