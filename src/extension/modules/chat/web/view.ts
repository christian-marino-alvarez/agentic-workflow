import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AgwViewBase } from '../../../core/web/index.js';
import { Tab, MessageType, CHAT_API_URL } from '../constants.js';

import { commonStyles, renderNotFound } from './templates/common/index.js';
import { mainStyles, chatkitStyles, renderMain } from './templates/main/index.js';
import { ChatSchema, ChatMessageType } from '../contracts/index.js';
import { BaseMessageType } from '../../../../shared/messaging/base.js';

// import '@openai/chatkit'; // Removed as it only contains types; loaded via CDN in template

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
    this.domain = 'chatView';
    this.messageSchema = ChatSchema;
  }

  public static styles = [
    AgwViewBase.styles,
    commonStyles,
    mainStyles,
    chatkitStyles
  ];

  protected onMessage(message: any): void {
    this.log('info', 'received-message', { type: message.type });
    if (message.type === MessageType.StateUpdate) {
      this.log('info', 'state-update-received', {
        tab: message.tab,
        modelsCount: message.models?.length,
        env: message.activeEnvironment
      });
      this.tab = message.tab;
      this.models = message.models || [];
      this.modelId = message.activeModelId || '';
      this.environment = message.activeEnvironment;
      this.secretKeyId = message.sessionKey || ''; // Use as clientToken
      this.isInitialized = true;
      this.requestUpdate();
    }

    if (message.type === MessageType.ModelProposal) {
      this.currentProposal = message.proposal;
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

  private getChatKitOptions() {
    const isDark = !document.body.classList.contains('vscode-light');
    const options = {
      api: {
        url: CHAT_API_URL,
        domainKey: 'agentic-workflow-local'
      },
      theme: {
        colorScheme: isDark ? 'dark' as const : 'light' as const,
        radius: 'round' as const,
        density: 'compact' as const
      },
      header: {
        enabled: false
      },
      history: {
        enabled: false
      }
    };
    console.log('[ChatView] ChatKit options generated:', options);
    return options;
  }

  private _chatkitInitialized = false;

  protected override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (this._chatkitInitialized) {
      return;
    }

    const chatkit = this.renderRoot.querySelector('#chatkit-instance') as any;
    if (chatkit && typeof chatkit.setOptions === 'function') {
      chatkit.setOptions(this.getChatKitOptions());
      this._chatkitInitialized = true;
      console.log('[ChatView] ChatKit initialized with setOptions');
    }
  }


  protected renderView() {
    if (this.tab === Tab.Main) {
      return renderMain({
        environment: this.environment,
        models: this.models,
        modelId: this.modelId,
        onSend: () => { }, // ChatKit handles sending
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
