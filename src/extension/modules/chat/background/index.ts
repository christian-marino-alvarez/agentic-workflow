
import * as vscode from 'vscode';
import * as path from 'path';
import { Background, Message, ViewHtml, MessageOrigin } from '../../core/index.js';
import { MESSAGES as RUNTIME_MESSAGES } from '../../runtime/constants.js';
import { NAME, MESSAGES } from '../constants.js';
import { randomUUID } from 'crypto';

export class ChatBackground extends Background {
  constructor(context: vscode.ExtensionContext) {
    super(NAME, context.extensionUri, 'chat-view');
    this.log('Initialized');
  }

  public override async listen(message: Message): Promise<any> {
    switch (message.payload.command) {
      case MESSAGES.SEND_MESSAGE:
        return this.handleSendMessage(message.payload.data);
      case MESSAGES.LOAD_INIT:
        return this.handleLoadInit();
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
            text: `(Mock) Received: "${data.text}". Action forwarded to Runtime. Agent: ${data.agentRole || 'architect'}`
          }
        }
      });
    }, 800);

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
      return { success: true, content: content.toString() };
    } catch (error) {
      this.log('Error loading init.md', error);
      return { error: 'Failed to load init.md' };
    }
  }

  protected getHtmlForWebview(webview: vscode.Webview): string {
    const scriptPath = 'dist/extension/modules/chat/view/index.js';
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath);
  }
}
