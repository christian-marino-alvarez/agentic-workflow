
import { html, TemplateResult } from 'lit';
import { IChatView } from '../interface.js';

export function render(this: IChatView): TemplateResult {
  return html`
      <div class="header layout-row">
        <h2 class="header-title">Runtime Chat</h2>
      </div>
      
      <div class="history layout-scroll chat-container layout-col">
        ${this.history.map(msg => {
    const isUser = msg.startsWith('Me:');
    const typeClass = isUser ? 'msg-user' : 'msg-system';
    const content = isUser ? msg.substring(4) : msg;
    return html`<div class="msg-bubble ${typeClass}">${content}</div>`;
  })}
      </div>
      
      <div class="input-group layout-row">
        <input 
            class="input-control"
            type="text" 
            .value="${this.inputText}" 
            @input="${this.handleInput}" 
            @keydown="${this.handleKeyDown}"
            placeholder="Type an action command (e.g. fs.read)..."
        />
        <button class="btn btn-primary" @click="${this.sendChatMessage}">Send</button>
      </div>
    `;
}
