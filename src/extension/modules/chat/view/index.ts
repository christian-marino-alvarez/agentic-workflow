import { View } from '../../core/view/index.js';
import { state } from 'lit/decorators.js';
import { html } from 'lit';
import { styles } from './templates/css.js';
import { render } from './templates/html.js';
import { MESSAGES, NAME } from '../constants.js';

console.log('[chat::view] Module loading...');

export class ChatView extends View {
  static override styles = styles;
  protected override readonly moduleName = NAME;

  constructor() {
    super();
    console.log('[chat::view] Constructor called');
  }

  @state()
  public history: Array<{ sender: string, text: string, role?: string }> = [
    { sender: 'System', text: 'Chat Module Initialized. Active Agent: Architect', role: 'system' }
  ];

  @state()
  public inputText: string = '';

  override firstUpdated() {
    this.log('Chat view mounted');
    this.initWorkflow();
  }

  /**
   * Initialize workflow by requesting init.md content
   */
  private async initWorkflow() {
    try {
      const response = await this.sendMessage(NAME, MESSAGES.LOAD_INIT);
      if (response && response.content) {
        const snippet = response.content.substring(0, 100) + '...';
        this.history = [...this.history, { sender: 'System', text: `Loaded init.md:\n${snippet}` }];
      }
    } catch (error) {
      this.log('Error loading init workflow', error);
      this.history = [...this.history, { sender: 'System', text: 'Error loading init.md' }];
    }
  }

  /**
   * Handle incoming messages from Background (Event stream)
   */
  public override listen(message: any): void {
    const command = message.payload?.command || message.command;
    const data = message.payload?.data || message.data;

    if (command === MESSAGES.RECEIVE_MESSAGE) {
      if (data && data.text) {
        this.history = [...this.history, { sender: 'Architect', text: data.text, role: 'architect' }];
      }
    }
  }

  public handleInput(e: InputEvent) {
    this.inputText = (e.target as HTMLInputElement).value;
  }

  public handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.sendChatMessage();
    }
  }

  public async sendChatMessage() {
    if (!this.inputText.trim()) { return; }

    const text = this.inputText;
    this.history = [...this.history, { sender: 'Me', text, role: 'user' }];
    this.inputText = '';

    try {
      // Send and await ACK (success: true)
      await this.sendMessage(NAME, MESSAGES.SEND_MESSAGE, { text, agentRole: 'architect' });
    } catch (error) {
      this.log('Error sending message', error);
      this.history = [...this.history, { sender: 'System', text: 'Error sending message', role: 'system' }];
    }
  }

  private getIcon(role?: string) {
    if (role === 'user') {
      return html`<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/></svg>`;
    }
    if (role === 'architect') {
      return html`<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6 1v3H1v10h14V4h-5V1H6zm1 3h2V2H7v2zm-3.5 8v-1h9v1h-9zm0-2v-1h9v1h-9zm0-2v-1h9v1h-9z"/></svg>`; // Building iconish
    }
    return html`<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 0 1 2 2v2H6V3a2 2 0 0 1 2-2zm3 4V3a3 3 0 1 0-6 0v2a3 3 0 0 0-3 3v7h12V8a3 3 0 0 0-3-3zM7 14v-2h2v2H7zm0-3V9h2v2H7z"/></svg>`; // Robot/System
  }

  override render() {
    console.log('[chat::view] render() called');
    return html`
      <div class="header layout-row">
        <h2 class="header-title">
            ${this.getIcon('architect')}
            <span>Architect Agent</span>
        </h2>
        <span class="header-status">● Ready</span>
      </div>
      <div class="history layout-scroll chat-container layout-col">
        ${this.history.map(msg => {
      const typeClass = msg.role === 'user' ? 'msg-user' : (msg.role === 'architect' ? 'msg-agent' : 'msg-system');
      return html`
            <div class="msg-bubble ${typeClass}">
                <div class="msg-header">
                    <span class="msg-icon">${this.getIcon(msg.role)}</span>
                    <span class="msg-sender">${msg.sender}</span>
                </div>
                <div class="msg-content">${msg.text}</div>
            </div>`;
    })}
      </div>
      <div class="input-group layout-row">
        <input
          class="input-control"
          type="text"
          .value="${this.inputText}"
          @input="${this.handleInput}"
          @keydown="${this.handleKeyDown}"
          placeholder="Ask the Architect..."
        />
        <button class="btn btn-primary" @click="${this.sendChatMessage}">Send</button>
      </div>
    `;
  }
}

// Manual registration to avoid decorator issues
console.log(`[chat::view] Registering custom element: ${NAME}-view`);
customElements.define(`${NAME}-view`, ChatView);
