
import * as vscode from 'vscode';
import * as path from 'path';
import { Background, Message, ViewHtml, MessageOrigin } from '../../core/index.js';
import { MESSAGES as RUNTIME_MESSAGES } from '../../runtime/constants.js';
import { NAME, MESSAGES } from '../constants.js';
import { randomUUID } from 'crypto';

export class ChatBackground extends Background {
  constructor(context: vscode.ExtensionContext) {
    super(NAME, context.extensionUri, 'chat-view');
    try {
      const ext = vscode.extensions.getExtension('christian-marino-alvarez.agentic-workflow');
      this.appVersion = ext?.packageJSON?.version || '0.0.0-error';
    } catch (e) {
      this.appVersion = '0.0.0-ex';
    }
    this.log('Initialized v' + this.appVersion);
  }

  public override async listen(message: Message): Promise<any> {
    switch (message.payload.command) {
      case MESSAGES.SEND_MESSAGE:
        return this.handleSendMessage(message.payload.data);
      case MESSAGES.LOAD_INIT:
        return this.handleLoadInit();
      case MESSAGES.SELECT_FILES:
        return this.handleSelectFiles();
      default:
        return super.listen(message);
    }
  }

  private async handleSendMessage(data: { text: string, agentRole: string }): Promise<any> {
    this.log('Sending message to Runtime:', data);

    // Construct Action Request (Mock for now)
    const actionRequest = {
      command: RUNTIME_MESSAGES.EXECUTE_ACTION,
      data: {
        action: 'fs.read', // Hardcoded for test
        params: { path: 'test.txt' },
        agentRole: data.agentRole || 'backend'
      }
    };

    // Simulate async response from Agent
    // Simulate async response from Agent with Status updates
    setTimeout(() => {
      this.emitStatus('Thinking...');
    }, 500);

    setTimeout(() => {
      this.emitStatus('Reading context (init.md)...');
    }, 1500);

    setTimeout(() => {
      this.emitStatus('Refactoring code...');
    }, 2500);

    setTimeout(() => {
      this.messenger.emit({
        id: randomUUID(),
        from: 'chat::background',
        to: 'chat::view',
        timestamp: Date.now(),
        origin: MessageOrigin.Server,
        payload: {
          command: MESSAGES.RECEIVE_MESSAGE,
          data: {
            text: `(Mock) Received: "${data.text}". \n\nI am the **Architect** agent. \nI have processed your request.`
          }
        }
      });
    }, 3500);

    return { success: true };
  }

  private async handleLoadInit(): Promise<any> {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        return { error: 'No workspace open' };
      }

      const rootPath = workspaceFolders[0].uri.fsPath;
      const initPath = vscode.Uri.file(path.join(rootPath, '.agent', 'workflows', 'init.md'));

      const content = await vscode.workspace.fs.readFile(initPath);


      // Read package.json for version
      const packageJsonPath = vscode.Uri.joinPath(this._extensionUri, 'package.json');
      const packageJson = JSON.parse((await vscode.workspace.fs.readFile(packageJsonPath)).toString());

      return { success: true, content: content.toString(), version: packageJson.version };
    } catch (error) {
      this.log('Error loading init.md', error);
      return { error: 'Failed to load init.md' };
    }
  }

  private async handleSelectFiles(): Promise<any> {
    const files = await vscode.window.showOpenDialog({
      canSelectMany: true,
      openLabel: 'Attach',
      filters: {
        'Code Files': ['ts', 'js', 'json', 'md', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'go', 'rs', 'php', 'html', 'css', 'scss', 'xml', 'yaml', 'yml', 'sql', 'txt']
      }
    });

    if (files && files.length > 0) {
      // Return file paths
      this.messenger.emit({
        id: randomUUID(),
        from: 'chat::background',
        to: 'chat::view',
        timestamp: Date.now(),
        origin: MessageOrigin.Server,
        payload: {
          command: MESSAGES.SELECT_FILES_RESPONSE,
          data: { files: files.map(f => f.fsPath) }
        }
      });
    }
    return { success: true };
  }

  protected getHtmlForWebview(webview: vscode.Webview): string {
    const scriptPath = 'dist/extension/modules/chat/view/index.js';
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath, this.appVersion);
  }
  private emitStatus(status: string) {
    this.messenger.emit({
      id: randomUUID(),
      from: 'chat::background',
      to: 'chat::view',
      timestamp: Date.now(),
      origin: MessageOrigin.Server,
      payload: {
        command: 'AGENT_STATUS',
        data: { status }
      }
    });
  }
}
