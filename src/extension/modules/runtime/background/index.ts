
import * as vscode from 'vscode';
import * as path from 'path';
import { Background, Message, ViewHtml, MessageOrigin } from '../../core/index.js';
import { PermissionEngine } from './permission-engine.js';
import { randomUUID } from 'crypto';

import { NAME, MESSAGES, PATHS, ENGINE_STATUS } from '../constants.js';
import { MESSAGES as CHAT_MESSAGES } from '../../chat/constants.js';

export class RuntimeBackground extends Background {
  private permissionEngine: PermissionEngine;
  private workflowWatcher: vscode.FileSystemWatcher | null = null;
  private rolesWatcher: vscode.FileSystemWatcher | null = null;

  constructor(context: vscode.ExtensionContext) {
    super(NAME, context.extensionUri, 'runtime-view');

    this.permissionEngine = new PermissionEngine();

    this.spawnSidecar(context);
    this.setupFileWatchers(context);
  }

  private spawnSidecar(context: vscode.ExtensionContext): void {
    if (process.env.VSCODE_TEST_MODE === 'true') {
      return;
    }
    const scriptPath = path.join(
      context.extensionUri.fsPath,
      'dist/extension/modules/runtime/backend/index.js'
    );
    this.runBackend(scriptPath, 3001).catch((err: Error) => {
      this.logTagged('#workflow', 'FATAL: Failed to spawn Runtime Server', err);
    });
  }

  private setupFileWatchers(context: vscode.ExtensionContext): void {
    const workspaceRoot = this.workspacePath;
    if (!workspaceRoot) {
      return;
    }

    this.workflowWatcher = this.createWorkflowWatcher(workspaceRoot);
    this.rolesWatcher = this.createRolesWatcher(workspaceRoot);

    context.subscriptions.push(this.workflowWatcher, this.rolesWatcher);
  }

  private createWorkflowWatcher(root: string): vscode.FileSystemWatcher {
    const pattern = new vscode.RelativePattern(root, PATHS.WORKFLOWS_GLOB);
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);

    watcher.onDidChange(() => this.onWorkflowFileChanged());
    watcher.onDidCreate(() => this.onWorkflowFileChanged());
    watcher.onDidDelete(() => this.onWorkflowFileChanged());

    return watcher;
  }

  private createRolesWatcher(root: string): vscode.FileSystemWatcher {
    const pattern = new vscode.RelativePattern(root, PATHS.ROLES_GLOB);
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);

    watcher.onDidChange(() => this.onRolesDirectoryChanged());
    watcher.onDidCreate(() => this.onRolesDirectoryChanged());
    watcher.onDidDelete(() => this.onRolesDirectoryChanged());

    return watcher;
  }

  private onWorkflowFileChanged(): void {
    this.logTagged('#workflow', 'Workflow file changed — notifying engine');
    this.forwardToSidecar(MESSAGES.WORKFLOW_RELOAD, {}).catch((err: Error) => {
      this.logTagged('#workflow', 'Failed to notify workflow change', err);
    });
  }

  private onRolesDirectoryChanged(): void {
    this.logTagged('#workflow', 'Agent roles changed — refreshing registry');
    this.forwardToSidecar('workflow.agents.refresh', {}).catch((err: Error) => {
      this.logTagged('#workflow', 'Failed to refresh agent registry', err);
    });
  }

  private async handleExecuteAction(data: any): Promise<any> {
    const { action, params, agentRole } = data;

    const allowed = await this.permissionEngine.checkPermission(agentRole, action);
    if (!allowed) {
      return { error: 'Permission denied', code: 'E_PERM' };
    }

    this.logTagged('#workflow', `Authorized action: ${action}`, params);
    return { success: true, result: 'Action executed (mock)' };
  }

  private async handleWorkflowLoad(data: any): Promise<any> {
    return this.forwardToSidecar('workflow.load', data);
  }

  private async handleWorkflowStart(data: any): Promise<any> {
    // Auto-load the workflow before starting if dirPath is provided
    if (data?.dirPath) {
      // Retry loop: the Runtime sidecar may not be ready yet on startup
      let loaded = false;
      for (let attempt = 1; attempt <= 5 && !loaded; attempt++) {
        try {
          await this.forwardToSidecar('workflow.loadAll', {
            dirPath: data.dirPath,
          }, 5_000);
          this.logTagged('#workflow', 'Workflows loaded from', data.dirPath);
          loaded = true;
        } catch (loadErr: any) {
          if (attempt < 5) {
            this.logTagged('#workflow', `Workflow load attempt ${attempt}/5 failed, retrying in 500ms...`);
            await new Promise(r => setTimeout(r, 500));
          } else {
            this.logTagged('#workflow', 'Workflow load failed after 5 attempts:', loadErr.message);
          }
        }
      }
    }

    const result = await this.forwardToSidecar('workflow.start', data);
    this.emitWorkflowState(result);
    return result;
  }

  private async handleWorkflowGateResponse(data: any): Promise<any> {
    const result = await this.forwardToSidecar('workflow.gate.respond', data);
    this.emitWorkflowState(result);
    return result;
  }

  private async handleWorkflowStepComplete(): Promise<any> {
    const result = await this.forwardToSidecar('workflow.stepComplete', {});
    this.emitWorkflowState(result);
    return result;
  }

  private async handleWorkflowStatus(): Promise<any> {
    const raw = await this.forwardToSidecar('workflow.status', {});
    // Unwrap JSON-RPC result wrapper from sidecar
    return raw?.result || raw;
  }

  private async handleWorkflowReload(data: any): Promise<any> {
    return this.forwardToSidecar('workflow.reload', data);
  }

  private async handleWorkflowAgents(): Promise<any> {
    return this.forwardToSidecar('workflow.agents', {});
  }

  private async handleWorkflowReset(): Promise<any> {
    const result = await this.forwardToSidecar('workflow.reset', {});
    this.emitWorkflowState(result);
    return result;
  }

  private async handleWorkflowSwitchTask(data: any): Promise<any> {
    const result = await this.forwardToSidecar('workflow.switchTask', data);
    this.emitWorkflowState(result);
    return result;
  }


  private async forwardToSidecar(command: string, data: any, timeout?: number): Promise<any> {
    return this.sendMessage(`${NAME}::backend`, command, data, timeout);
  }

  // ─── Response-driven State Emission ──────────────────────

  /**
   * Extract workflowState from the sidecar response and emit it to Chat.
   * Replaces the previous polling mechanism — state is now returned synchronously
   * with every mutating command, so no setInterval is needed.
   */
  private emitWorkflowState(result: any): void {
    // Unwrap JSON-RPC wrapper if present
    const unwrapped = result?.result || result;
    const state = unwrapped?.workflowState;
    if (!state) {
      return;
    }

    this.logTagged('#workflow', `State emitted: status=${state.status}, workflow=${state.currentWorkflowId || 'none'}, phase=${state.currentPhaseId || 'none'}`);
    this.notifyChat(CHAT_MESSAGES.WORKFLOW_STATE_UPDATE, state);

    if (state.status === ENGINE_STATUS.WAITING_GATE && state.currentGate) {
      this.notifyChat(CHAT_MESSAGES.GATE_REQUEST, state.currentGate);
    }
  }

  private notifyChat(command: string, data: any): void {
    this.messenger.emit({
      id: randomUUID(),
      from: `${NAME}::background`,
      to: 'chat::background',
      timestamp: Date.now(),
      origin: MessageOrigin.Server,
      payload: { command, data }
    });
  }

  // ─── Public Methods ───────────────────────────────────────

  public override async listen(message: Message): Promise<any> {
    switch (message.payload.command) {
      case MESSAGES.EXECUTE_ACTION:
        return this.handleExecuteAction(message.payload.data);

      case MESSAGES.WORKFLOW_LOAD:
        return this.handleWorkflowLoad(message.payload.data);

      case MESSAGES.WORKFLOW_START:
        return this.handleWorkflowStart(message.payload.data);

      case MESSAGES.WORKFLOW_GATE_RESPONSE:
        return this.handleWorkflowGateResponse(message.payload.data);

      case MESSAGES.WORKFLOW_STEP_COMPLETE:
        return this.handleWorkflowStepComplete();

      case MESSAGES.WORKFLOW_STATUS:
        return this.handleWorkflowStatus();

      case MESSAGES.WORKFLOW_RELOAD:
        return this.handleWorkflowReload(message.payload.data);

      case MESSAGES.WORKFLOW_AGENTS:
        return this.handleWorkflowAgents();

      case MESSAGES.WORKFLOW_RESET:
        return this.handleWorkflowReset();

      case MESSAGES.WORKFLOW_SWITCH_TASK:
        return this.handleWorkflowSwitchTask(message.payload.data);

      case MESSAGES.WORKFLOW_PREPARE_TURN:
        return this.forwardToSidecar('workflow.prepareTurn', message.payload.data);

      case MESSAGES.WORKFLOW_PROCESS_RESPONSE:
        return this.forwardToSidecar('workflow.processResponse', message.payload.data);


      default:
        return super.listen(message);
    }
  }

  protected getHtmlForWebview(webview: vscode.Webview): string {
    const scriptPath = 'dist/extension/modules/runtime/view/index.js';
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath, this.appVersion);
  }
}
