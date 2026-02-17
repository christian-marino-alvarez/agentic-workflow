import { html } from 'lit';
import { AppView } from '../index.js';

export function render(view: AppView) {
  return html`
    <nav class="tab-bar">
      <button 
        class="tab-item ${view.activeTab === 'settings' ? 'active' : ''}"
        @click=${() => view.activeTab = 'settings'}
      >
        SETTINGS
      </button>
      <button 
        class="tab-item ${view.activeTab === 'chat' ? 'active' : ''}"
        @click=${() => view.activeTab = 'chat'}
      >
        CHAT
      </button>
      <button 
        class="tab-item ${view.activeTab === 'history' ? 'active' : ''}"
        @click=${() => view.activeTab = 'history'}
      >
        HISTORY
      </button>
    </nav>

    <div class="content-area">
      ${view.activeTab === 'settings' ? html`<settings-view></settings-view>` : ''}
      ${view.activeTab === 'chat' ? html`<div class="placeholder">Chat Module (Coming Soon)</div>` : ''}
      ${view.activeTab === 'history' ? html`<div class="placeholder">History Module (Coming Soon)</div>` : ''}
    </div>
  `;
}
