import { ExtensionContext, WebviewView, Uri } from 'vscode';
import { AgwViewProviderBase } from '../../../core/background/index.js';
import { onMessage } from '../../../core/decorators/onMessage.js';
import template from '../web/templates/index.js';
import { SettingsStorage } from '../../security/background/settings-storage.js';
import type { ModelConfig } from '../../../providers/index.js';

import { ChatRouter } from './router.js';
import { Tab, MessageType } from '../constants.js';
import type { StateUpdateMessage } from '../types.js';
import { ChatSchema } from '../contracts/index.js';
import { ChatBackendClient } from './client.js';

export class ChatController extends AgwViewProviderBase {
  public static readonly viewType = 'chatView';
  private settings: SettingsStorage;
  private router = new ChatRouter();
  private client: ChatBackendClient;

  public constructor(
    context: ExtensionContext,
    private readonly chatSidecarManager?: any
  ) {
    super(context, ChatController.viewType, undefined, { skipRegistration: true });
    this.settings = new SettingsStorage(context.globalState);
    this.messageSchema = ChatSchema;

    // TODO: Inyectar esto desde el SidecarManager o un singleton de configuración
    // Por ahora, leemos de variables de entorno que el SidecarManager debería setear
    this.client = new ChatBackendClient({
      baseUrl: 'http://127.0.0.1:3000',
      bridgePort: this.chatSidecarManager?.bridgeConfig?.port || 0,
      bridgeToken: this.chatSidecarManager?.bridgeConfig?.bridgeToken || '',
      sessionKey: this.chatSidecarManager?.getSessionKey?.() || ''
    });

    // Listen for model/config updates from other controllers (e.g. Security)
    this.context.subscriptions.push(
      SettingsStorage.onConfigUpdated(() => {
        void this.syncState();
      })
    );
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

    // Re-sync state whenever the view becomes visible
    // This ensures environment and models are always up-to-date
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        void this.syncState();
      }
    });

    void this.renderHtml(webviewView);
  }

  private async renderHtml(webviewView: WebviewView): Promise<void> {
    const nonce = this.createNonce();
    const scriptUri = webviewView.webview.asWebviewUri(
      Uri.joinPath(this.context.extensionUri, 'dist', 'extension', 'modules', 'chat', 'web', 'view.js')
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
    const config = this.settings.getConfig();
    const sessionKey = this.chatSidecarManager?.getSessionKey?.();

    const message: StateUpdateMessage = {
      type: MessageType.StateUpdate,
      tab: state.tab,
      models: config.models,
      activeModelId: this.settings.getActiveModelId(),
      activeEnvironment: this.settings.getEnvironment(),
      sessionKey
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

  @onMessage(MessageType.SetModel)
  protected async handleSetModel(message: { modelId: string }): Promise<void> {
    // TODO: Persist model selection locally for this chat session
    // For now, we just log it. Full implementation will come in backend orchestration step
    console.log('[ChatController] Model changed to:', message.modelId);
    await this.syncState();
  }

  @onMessage('chat:message')
  async onChatMessage(message: any) {
    console.log('[ChatController] Message received:', message);
  }

  @onMessage('chat:request')
  async onChatRequest(message: { content: string, threadId: string }): Promise<void> {
    try {
      if (!message.content) {
        throw new Error('Content is required');
      }

      await this.client.sendMessageStream(
        message.threadId || 'new', // TODO: Gestionar threads reales
        message.content,
        (event) => {
          // Reenviar eventos SSE al frontend
          this.postMessage({ type: 'chat:streaming', payload: event });
        },
        (error) => {
          console.error('[ChatController] Stream error:', error);
          this.postMessage({ type: 'chat:response', ok: false, error: String(error) });
        }
      );

      this.postMessage({ type: 'chat:response', ok: true }); // Stream started successfully

    } catch (error: any) {
      this.postMessage({ type: 'chat:response', ok: false, error: String(error) });
    }
  }

  /**
   * Demo streaming se mantiene igual para pruebas de UI sin backend real
   */
  @onMessage('chat:request-sync')
  protected async handleRequestSync(_message: any): Promise<void> {
    await this.syncState();
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
      }, { expectAck: true });
    }
  }
}

export interface ChatDomainOptions {
  chatSidecarManager: any;
  apiKeyBroadcaster: any;
}

export function createChatDomain(context: ExtensionContext, options?: ChatDomainOptions) {
  const controller = new ChatController(context, options?.chatSidecarManager);
  return {
    view: controller
  };
}

export const Chat = {
  register: createChatDomain
};
