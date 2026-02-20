import { html } from 'lit';
import { AppView } from '../index.js';

export function render(view: AppView) {
  return html`
    <nav class="tab-bar">
      <div class="tab-items">
        <button 
          class="tab-item ${view.activeTab === 'settings' ? 'active' : ''}"
          @click=${() => view.switchTab('settings')}
        >
          SETTINGS
        </button>
        <button 
          class="tab-item ${view.activeTab === 'chat' ? 'active' : ''}"
          @click=${() => view.switchTab('chat')}
        >
          CHAT
        </button>
        <button 
          class="tab-item ${view.activeTab === 'history' ? 'active' : ''}"
          @click=${() => view.switchTab('history')}
        >
          HISTORY
        </button>
      </div>
      ${view.isSecure ? html`<span class="secure-badge">🔒 Secure</span>` : ''}
    </nav>

    <div class="content-area">
      ${view.tabTransitioning ? html`
        <div class="tab-skeleton">
          ${[1, 2, 3].map(() => html`
            <div class="tab-skeleton-card">
              <div class="tab-skeleton-line" style="width: 70%"></div>
              <div class="tab-skeleton-line short" style="width: 45%"></div>
            </div>
          `)}
        </div>
      ` : html`
        <div style="display: ${view.activeTab === 'settings' ? 'contents' : 'none'}"><settings-view></settings-view></div>
        <div style="display: ${view.activeTab === 'chat' ? 'contents' : 'none'}"><chat-view></chat-view></div>
        ${view.activeTab === 'history' ? renderHistoryTab(view) : ''}
      `}
    </div>
    <div class="global-footer" style="padding: 4px 10px; display: flex; justify-content: flex-end; align-items: center; gap: 8px; font-size: 10px; color: var(--vscode-descriptionForeground); background-color: var(--vscode-sideBar-background); border-top: 1px solid var(--vscode-sideBarSectionHeader-border); opacity: 0.7; flex-shrink: 0;">
      <span>&copy; Christian Mariño</span>
      <span>v${view.appVersion}</span>
    </div>
  `;
}

function renderHistoryTab(view: AppView) {
  const getChatView = (): any => {
    return document.querySelector('chat-view') || view.renderRoot?.querySelector('chat-view');
  };

  // Trigger session save + list on tab switch
  setTimeout(() => {
    const chatView = getChatView();
    if (chatView?.saveCurrentSession) { chatView.saveCurrentSession(); }
    setTimeout(() => {
      const cv = getChatView();
      if (cv?.requestSessions) { cv.requestSessions(); }
    }, 150);
  }, 50);

  const chatView = getChatView();
  const sessions = chatView?.sessionList || [];
  const currentId = chatView?.currentSessionId || '';

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return html`
    <div class="history-container">
      <div class="history-header">
        <h2>💬 Conversations</h2>
        <button class="history-new-btn"
          @click=${() => {
      const cv = getChatView();
      if (cv?.newSession) { cv.newSession(); }
      view.activeTab = 'chat';
    }}
        >+ New Chat</button>
      </div>
      <div class="history-list">
        ${sessions.length === 0
      ? html`<div class="history-empty">No conversations yet</div>`
      : sessions.map((s: any) => {
        const isCurrent = s.id === currentId;
        const isPendingDelete = chatView?.pendingDeleteSessionId === s.id;
        return html`
              <div class="history-card ${isCurrent ? 'current' : ''}"
                @click=${() => {
            const cv = getChatView();
            if (cv?.loadSession) { cv.loadSession(s.id); }
            view.activeTab = 'chat';
          }}
              >
                <div class="history-card-info">
                  <div class="history-card-title">
                    ${s.title}${isCurrent ? html` <span class="history-current-badge">● Current</span>` : ''}
                  </div>
                  <div class="history-card-meta">
                    ${formatDate(s.timestamp)} · ${s.messageCount} messages
                  </div>
                </div>
                <button class="history-delete-btn ${isPendingDelete ? 'confirm' : ''}"
                  title="${isPendingDelete ? 'Click again to confirm' : 'Delete'}"
                  @click=${(e: Event) => {
            e.stopPropagation();
            const cv = getChatView();
            if (cv?.handleDeleteSession) { cv.handleDeleteSession(s.id); }
          }}
                >${isPendingDelete ? 'Confirm?' : '🗑'}</button>
              </div>
            `;
      })
    }
      </div>
    </div>
  `;
}
