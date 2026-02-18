import { html } from 'lit';
import { AppView } from '../index.js';

export function render(view: AppView) {
  return html`
    <nav class="tab-bar">
      <div class="tab-items">
        <button 
          class="tab-item ${view.activeTab === 'settings' ? 'active' : ''}"
          @click=${() => { console.log('Switching to Settings'); view.activeTab = 'settings'; }}
        >
          SETTINGS
        </button>
        <button 
          class="tab-item ${view.activeTab === 'chat' ? 'active' : ''}"
          @click=${() => { console.log('Switching to Chat'); view.activeTab = 'chat'; }}
        >
          CHAT
        </button>
        <button 
          class="tab-item ${view.activeTab === 'history' ? 'active' : ''}"
          @click=${() => view.activeTab = 'history'}
        >
          HISTORY
        </button>
      </div>
      ${view.isSecure ? html`<span class="secure-badge">🔒 Secure</span>` : ''}
    </nav>

    <div class="content-area">
      ${view.activeTab === 'settings' ? html`<settings-view></settings-view>` : ''}
      ${view.activeTab === 'chat' ? html`<chat-view></chat-view>` : ''}
      ${view.activeTab === 'history' ? html`<div class="placeholder">History Module (Coming Soon)</div>` : ''}
    </div>
  `;
}
