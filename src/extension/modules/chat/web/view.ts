import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AgwViewBase } from '../../../core/web/index.js';
import { Tab, MessageType, CHAT_API_URL } from '../constants.js';

// Import modular parts
import { commonStyles, renderNotFound } from './templates/common/index.js';
import { mainStyles, renderMain } from './templates/main/index.js';
import { ChatSchema, ChatMessageType } from '../contracts/index.js';
import { BaseMessageType } from '../../../../shared/messaging/base.js';

@customElement('agw-chat-view')
export class ChatView extends AgwViewBase {
  @state()
  private tab: string = Tab.Main;

  @state()
  private environment: 'dev' | 'pro' = 'pro';

  @state()
  private modelId: string = '';

  @state()
  private secretKeyId: string = '';

  constructor() {
    super();
    this.messageSchema = ChatSchema;
  }

  public static styles = [
    AgwViewBase.styles,
    commonStyles,
    mainStyles
  ];

  protected onMessage(message: any): void {
    const logArea = this.renderRoot.querySelector('#demo-logs');
    if (logArea) {
      const entry = document.createElement('div');
      entry.textContent = `[${new Date().toLocaleTimeString()}] Recibido: ${message.type}`;
      logArea.prepend(entry);
    }

    if (message.type === 'chat:state-update') {
      this.tab = message.tab;
      this.modelId = message.activeModelId || '';
      this.environment = message.activeEnvironment;
      this.requestUpdate();
    }

    if (message.type === ChatMessageType.Streaming) {
      const output = this.renderRoot.querySelector('#streaming-output');
      if (output) {
        if (message.payload.index === 0) {
          output.textContent = '';
        }
        output.textContent += message.payload.token;
        output.scrollTop = output.scrollHeight;
      }
    }
  }

  public startDemo(): void {
    const output = this.renderRoot.querySelector('#streaming-output');
    if (output) {
      output.textContent = 'Iniciando demo de streaming...';
    }
    this.postMessage({ type: 'chat:demo-streaming' }, { expectAck: true });
  }

  protected listen(): void {
    this.postMessage({ type: BaseMessageType.WebviewReady });
  }

  private handleSend() {
    try {
      const payloadElement = this.renderRoot.querySelector('#payload') as HTMLTextAreaElement;
      const payload = JSON.parse(payloadElement.value || '{}');
      const apiUrl = CHAT_API_URL;
      this.postMessage({ type: MessageType.ChatRequest, apiUrl, payload });
    } catch (e) {
      console.error('Invalid JSON payload');
    }
  }

  protected renderView() {
    if (this.tab === Tab.Main) {
      return renderMain({
        environment: this.environment,
        modelId: this.modelId,
        onSend: () => this.handleSend()
      });
    }
    return renderNotFound();
  }
}

