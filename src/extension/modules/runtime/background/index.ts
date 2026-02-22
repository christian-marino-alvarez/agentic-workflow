
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
  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  private lastStatus: string = ENGINE_STATUS.IDLE;
  private taskStepsEmitted: boolean = false;

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
      this.log('FATAL: Failed to spawn Runtime Server', err);
    });
  }

  private setupFileWatchers(context: vscode.ExtensionContext): void {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
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
    this.log('Workflow file changed — notifying engine');
    this.forwardToSidecar(MESSAGES.WORKFLOW_RELOAD, {}).catch((err: Error) => {
      this.log('Failed to notify workflow change', err);
    });
  }

  private onRolesDirectoryChanged(): void {
    this.log('Agent roles changed — refreshing registry');
    this.forwardToSidecar('workflow.agents.refresh', {}).catch((err: Error) => {
      this.log('Failed to refresh agent registry', err);
    });
  }

  private async handleExecuteAction(data: any): Promise<any> {
    const { action, params, agentRole } = data;

    const allowed = await this.permissionEngine.checkPermission(agentRole, action);
    if (!allowed) {
      return { error: 'Permission denied', code: 'E_PERM' };
    }

    this.log(`Authorized action: ${action}`, params);
    return { success: true, result: 'Action executed (mock)' };
  }

  private async handleWorkflowLoad(data: any): Promise<any> {
    return this.forwardToSidecar('workflow.load', data);
  }

  private async handleWorkflowStart(data: any): Promise<any> {
    // Auto-load the workflow before starting if dirPath is provided
    if (data?.dirPath) {
      try {
        await this.forwardToSidecar('workflow.loadAll', {
          dirPath: data.dirPath,
        }, 30_000);
        this.log('Workflows loaded from', data.dirPath);
      } catch (loadErr: any) {
        this.log('Workflow load failed:', loadErr.message);
      }
    }

    const result = await this.forwardToSidecar('workflow.start', data);
    this.startPolling();
    // Force emit immediately to populate the UI (including timeline) without waiting 1s
    this.pollWorkflowState(true);
    return result;
  }

  private async handleWorkflowGateResponse(data: any): Promise<any> {
    const result = await this.forwardToSidecar('workflow.gate.respond', data);
    this.startPolling();
    this.pollWorkflowState(true);
    return result;
  }

  private async handleWorkflowStatus(): Promise<any> {
    return this.forwardToSidecar('workflow.status', {});
  }

  private async handleWorkflowReload(data: any): Promise<any> {
    return this.forwardToSidecar('workflow.reload', data);
  }

  private async handleWorkflowAgents(): Promise<any> {
    return this.forwardToSidecar('workflow.agents', {});
  }

  private async forwardToSidecar(command: string, data: any, timeout?: number): Promise<any> {
    return this.sendMessage(`${NAME}::backend`, command, data, timeout);
  }

  // ─── Workflow State Polling ───────────────────────────────

  private startPolling(): void {
    this.stopPolling();
    this.taskStepsEmitted = false;
    this.pollingTimer = setInterval(() => this.pollWorkflowState(), 1000);
  }

  private stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private async pollWorkflowState(forceEmit = false): Promise<void> {
    try {
      const state = await this.forwardToSidecar('workflow.status', {});
      if (!state) {
        return;
      }

      const currentStatus = state.status || ENGINE_STATUS.IDLE;
      const hasSteps = Array.isArray(state.steps) && state.steps.length > 0;

      if (forceEmit || currentStatus !== this.lastStatus) {
        if (!forceEmit) {
          this.log(`Workflow state changed: ${this.lastStatus} → ${currentStatus}`);
        }
        this.lastStatus = currentStatus;
        this.notifyChat(CHAT_MESSAGES.WORKFLOW_STATE_UPDATE, state);
      } else if (hasSteps && !this.taskStepsEmitted) {
        // Always emit at least once if we have steps (even if status hasn't changed)
        this.taskStepsEmitted = true;
        this.notifyChat(CHAT_MESSAGES.WORKFLOW_STATE_UPDATE, state);
      }

      if (currentStatus === ENGINE_STATUS.WAITING_GATE && state.currentGate) {
        this.notifyChat(CHAT_MESSAGES.GATE_REQUEST, state.currentGate);
        this.stopPolling();
      }

      // Only stop polling on terminal states; keep polling on IDLE if workflow is loaded (steps exist)
      if (currentStatus === ENGINE_STATUS.COMPLETED || currentStatus === ENGINE_STATUS.FAILED) {
        this.stopPolling();
      }
      if (currentStatus === ENGINE_STATUS.IDLE && !hasSteps) {
        this.stopPolling();
      }
    } catch (err) {
      this.log('Polling error', err);
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

      case MESSAGES.WORKFLOW_STATUS:
        return this.handleWorkflowStatus();

      case MESSAGES.WORKFLOW_RELOAD:
        return this.handleWorkflowReload(message.payload.data);

      case MESSAGES.WORKFLOW_AGENTS:
        return this.handleWorkflowAgents();

      default:
        return super.listen(message);
    }
  }

  protected getHtmlForWebview(webview: vscode.Webview): string {
    const scriptPath = 'dist/extension/modules/runtime/view/index.js';
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath, this.appVersion);
  }
}
