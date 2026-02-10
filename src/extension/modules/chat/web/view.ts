import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AgwViewBase } from '../../../core/web/index.js';
import { Tab, MessageType, CHAT_API_URL } from '../constants.js';

// Import modular parts
import { commonStyles, renderNotFound } from './templates/common/index.js';
import { mainStyles, renderMain } from './templates/main/index.js';
import { ChatSchema, ChatMessageType } from '../contracts/index.js';
import { BaseMessageType } from '../../../../shared/messaging/base.js';

import {
  provideVSCodeDesignSystem,
  vsCodeDropdown,
  vsCodeOption,
  vsCodeButton
} from '@vscode/webview-ui-toolkit';

provideVSCodeDesignSystem().register(
  vsCodeDropdown(),
  vsCodeOption(),
  vsCodeButton()
);

@customElement('agw-chat-view')
export class ChatView extends AgwViewBase {
  @state()
  private tab: string = Tab.Main;

  @state()
  private environment: 'dev' | 'pro' = 'pro';

  @state()
  private modelId: string = '';

  @state()
  private models: any[] = [];

  @state()
  private secretKeyId: string = '';

  @state()
  private currentProposal: any | null = null;

  @state()
  private isInitialized: boolean = false;

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

    if (message.type === MessageType.StateUpdate) {
      this.tab = message.tab;
      this.models = message.models || [];
      this.modelId = message.activeModelId || '';
      this.environment = message.activeEnvironment;
      this.isInitialized = true;
      this.requestUpdate();
    }

    if (message.type === MessageType.ModelProposal) {
      this.currentProposal = message.proposal;
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

  protected override listen(): void {
    // Request immediate sync when webview is fully ready
    this.postMessage({ type: 'chat:request-sync' });
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

  private handleModelChange(event: Event) {
    const dropdown = event.target as any;
    const newModelId = dropdown.value;
    this.postMessage({
      type: MessageType.SetModel,
      modelId: newModelId
    });
  }

  private handleDecision(accepted: boolean) {
    if (!this.currentProposal) {
      return;
    }

    this.postMessage({
      type: MessageType.ModelDecision,
      accepted,
      proposal: this.currentProposal
    });
    this.currentProposal = null;
  }

  protected renderView() {
    if (this.tab === Tab.Main) {
      return renderMain({
        environment: this.environment,
        models: this.models,
        modelId: this.modelId,
        onSend: () => this.handleSend(),
        onModelChange: (e: Event) => this.handleModelChange(e),
        proposal: this.currentProposal,
        onAcceptProposal: () => this.handleDecision(true),
        onRejectProposal: () => this.handleDecision(false),
        isInitialized: this.isInitialized
      });
    }
    return renderNotFound();
  }
}
