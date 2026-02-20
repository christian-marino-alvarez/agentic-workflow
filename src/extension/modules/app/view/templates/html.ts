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
        <div class="tab-skeleton-overlay">
          ${[1, 2, 3].map(() => html`
            <div class="tab-skeleton-card">
              <div class="tab-skeleton-line" style="width: 70%"></div>
              <div class="tab-skeleton-line short" style="width: 45%"></div>
            </div>
          `)}
        </div>
      ` : ''}
      <div style="display: ${view.activeTab === 'settings' && !view.tabTransitioning ? 'contents' : 'none'}"><settings-view></settings-view></div>
      <div style="display: ${view.activeTab === 'chat' && !view.tabTransitioning ? 'contents' : 'none'}"><chat-view></chat-view></div>
      ${view.activeTab === 'history' && !view.tabTransitioning ? renderHistoryTab(view) : ''}
    </div>
    <div class="global-footer" style="padding: 4px 10px; display: flex; justify-content: flex-end; align-items: center; gap: 8px; font-size: 10px; color: var(--vscode-descriptionForeground); background-color: var(--vscode-sideBar-background); border-top: 1px solid var(--vscode-sideBarSectionHeader-border); opacity: 0.7; flex-shrink: 0;">
      <span>&copy; Christian Mariño</span>
      <span>v${view.appVersion}</span>
    </div>
  `;
}

function renderHistoryTab(view: AppView) {
  const chatView = view.getChatView();
  const sessions = view.historySessions;
  const currentId = chatView?.currentSessionId || '';

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return html`
    <div class="history-container">
      <div class="header-actions">
        <h2>Tasks</h2>
        <div class="actions-group">
          <button class="icon-btn" title="Refresh"
            @click=${() => {
      const cv = view.getChatView();
      if (cv?.requestSessions) { cv.requestSessions(); }
      setTimeout(() => view.refreshHistorySessions(), 300);
    }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 21h5v-5"/>
            </svg>
          </button>
          <button class="icon-btn" title="New task"
            @click=${() => {
      const cv = view.getChatView();
      if (cv?.newSession) { cv.newSession(); }
      view.switchTab('chat');
    }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="history-list">
        ${sessions.length === 0
      ? html`<div class="history-empty">No tasks yet</div>`
      : sessions.map((s: any) => {
        const isCurrent = s.id === currentId;
        const isPendingDelete = view.pendingDeleteSessionId === s.id;
        return html`
              <div class="history-card ${isCurrent ? 'current' : ''}"
                @click=${() => {
            const cv = view.getChatView();
            if (cv?.loadSession) { cv.loadSession(s.id); }
            view.switchTab('chat');
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
                <button class="action-btn delete ${isPendingDelete ? 'confirm-delete' : ''}"
                  title="${isPendingDelete ? 'Click again to confirm' : 'Delete session'}"
                  @click=${(e: Event) => {
            e.stopPropagation();
            view.handleDeleteSession(s.id);
          }}
                >${isPendingDelete ? 'Confirm' : 'Delete'}</button>
              </div>
            `;
      })
    }
      </div>
    </div>
  `;
}
