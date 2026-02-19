
import * as vscode from 'vscode';
import * as path from 'path';
import { Background, Message, ViewHtml } from '../../core/index.js';
import { PermissionEngine } from './permission-engine.js';

import { NAME, MESSAGES } from '../constants.js';

/**
 * Runtime Background Orchestrator.
 * Manages the Runtime Server sidecar and acts as the Permission Gateway.
 */
export class RuntimeBackground extends Background {
  private permissionEngine: PermissionEngine;

  constructor(context: vscode.ExtensionContext) {
    // Runtime doesn't have a View yet, but Background class requires a viewTag. 
    // We pass a dummy tag 'runtime-view' until the Chat module connects to it.
    super(NAME, context.extensionUri, 'runtime-view');

    this.permissionEngine = new PermissionEngine();

    // Spawn the Sidecar (created in Task 1)
    if (process.env.VSCODE_TEST_MODE !== 'true') {
      const scriptPath = path.join(context.extensionUri.fsPath, 'dist/extension/modules/runtime/backend/index.js');
      // Port 3001 as decided in Architecture Analysis
      this.runBackend(scriptPath, 3001).catch(err => {
        this.log('FATAL: Failed to spawn Runtime Server', err);
      });
    }
  }

  /**
   * Handle messages (likely from Chat Module in the future).
   */
  public override async listen(message: Message): Promise<any> {
    switch (message.payload.command) {
      case MESSAGES.EXECUTE_ACTION:
        return this.handleExecuteAction(message.payload.data);
      default:
        // By default, try to forward to sidecar if command matches?
        // For now, no default forwarding to keep strict control.
        return super.listen(message);
    }
  }

  private async handleExecuteAction(data: any): Promise<any> {
    const { action, params, agentRole } = data;

    // 1. Validate Permission (Gateway)
    const allowed = await this.permissionEngine.checkPermission(agentRole, action);
    if (!allowed) {
      return { error: 'Permission denied', code: 'E_PERM' };
    }

    // 2. Forward to Sidecar via JSON-RPC
    // PENDING: We need the JSON-RPC client implementation here.
    // For this Task 2, we just log the intent. Task 3/4 will wire the actual RPC client.
    this.log(`Authorized action: ${action}`, params);

    // Mock response for now
    return { success: true, result: 'Action executed (mock)' };
  }

  protected getHtmlForWebview(webview: vscode.Webview): string {
    // Standard View loading pattern
    const scriptPath = 'dist/extension/modules/runtime/view/index.js';
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath, this.appVersion);
  }
}
