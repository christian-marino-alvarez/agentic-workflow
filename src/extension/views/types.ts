import type { ExtensionContext, WebviewViewProvider } from 'vscode';

export type ViewId = 'chatView' | 'historyView' | 'workflowView' | 'keyView';

export interface ViewRegistration {
  id: ViewId;
  factory: (context: ExtensionContext) => WebviewViewProvider;
}
