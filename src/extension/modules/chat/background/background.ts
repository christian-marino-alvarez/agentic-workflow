import { ExtensionContext, WebviewView, Uri } from 'vscode';
import { AgwViewProviderBase } from '../../../core/controller/base.js';
import { onMessage } from '../../../core/decorators/onMessage.js';
import template from '../templates/index.js';
import { SettingsStorage } from '../../security/background/settings-storage.js';
import type { ModelConfig } from '../../../providers/index.js';

import { ChatRouter } from './router.js';
import { Tab, MessageType } from '../constants.js';
import type { StateUpdateMessage } from '../types.js';
import { ChatSchema } from '../contracts/index.js';

export class ChatController extends AgwViewProviderBase {
  public static readonly viewType = 'chatView';
  private settings: SettingsStorage;
  private router = new ChatRouter();

  public constructor(context: ExtensionContext) {
    super(context, ChatController.viewType);
    this.settings = new SettingsStorage(context.globalState);
    this.messageSchema = ChatSchema;
  }

  public show(preserveFocus?: boolean): void {
    if (this.webviewView) {
      this.webviewView.show(preserveFocus);
    }
  }

  protected onResolve(webviewView: WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };
    void this.renderHtml(webviewView);
  }

  private async renderHtml(webviewView: WebviewView): Promise<void> {
    const nonce = this.createNonce();
    const scriptUri = webviewView.webview.asWebviewUri(
      Uri.joinPath(this.context.extensionUri, 'dist', 'extension', 'modules', 'chat', 'web', 'chat-view.js')
    );

    const templateParams = {
      nonce,
      scriptUri: scriptUri.toString(),
      cspSource: webviewView.webview.cspSource
    };

    this.renderTemplate(webviewView, template.render, templateParams);
  }

  private async syncState(): Promise<void> {
    if (!this.webviewView) {
      return;
    }

    const state = this.router.getState();
    const config = this.settings.getEnvironment();

    const message: StateUpdateMessage = {
      type: MessageType.StateUpdate,
      tab: state.tab,
      activeModelId: this.settings.getActiveModelId(),
      activeEnvironment: this.settings.getEnvironment()
    };

    this.postMessage(message);
  }

  protected override async onReady(): Promise<void> {
    await this.syncState();
  }

  @onMessage(MessageType.SetTab)
  protected async handleSetTab(message: { tab: any }): Promise<void> {
    this.router.setTab(message.tab);
    await this.syncState();
  }

  @onMessage('chat:message')
  async onChatMessage(message: any) {
    console.log('[ChatController] Message received:', message);
  }

  @onMessage('chat:request')
  async onChatRequest(message: { apiUrl: string; payload: any }): Promise<void> {
    try {
      const response = await fetch(message.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message.payload)
      });
      const data = await response.json();
      this.postMessage({ type: 'chat:response', ok: response.ok, status: response.status, data });
    } catch (error: any) {
      this.postMessage({ type: 'chat:response', ok: false, error: String(error) });
    }
  }

  @onMessage('chat:demo-streaming')
  protected async handleDemoStreaming(_message: any): Promise<void> {
    const tokens = [
      "Hola", " soy", " Neo", ".", " Estoy", " probando",
      " el", " nuevo", " Communication", " Bridge",
      " con", " soporte", " para", " streaming", " y",
      " reintentos", " automáticos", " mediante", " ACKs", "."
    ];

    for (let i = 0; i < tokens.length; i++) {
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 150));

      this.postMessage({
        type: 'chat:streaming',
        payload: {
          token: tokens[i],
          index: i,
          done: i === tokens.length - 1
        }
      }, { expectAck: true }); // Probamos el sistema de ACKs con streaming
    }
  }
}

export interface ChatDomainOptions {
  chatSidecarManager: any;
  apiKeyBroadcaster: any;
}

export function createChatDomain(context: ExtensionContext, options?: ChatDomainOptions) {
  const controller = new ChatController(context);
  // In the future, the controller will use options.chatBackendManager or a fixed port 3000
  return {
    view: controller
  };
}

export const Chat = {
  register: createChatDomain
};
