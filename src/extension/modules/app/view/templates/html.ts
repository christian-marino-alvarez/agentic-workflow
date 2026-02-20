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
      ${view.activeTab === 'history' ? renderHistoryTab(view) : ''}
    </div>
    <div class="global-footer" style="padding: 4px 10px; display: flex; justify-content: flex-end; align-items: center; gap: 8px; font-size: 10px; color: var(--vscode-descriptionForeground); background-color: var(--vscode-sideBar-background); border-top: 1px solid var(--vscode-sideBarSectionHeader-border); opacity: 0.7; flex-shrink: 0;">
      <span>&copy; Christian Mariño</span>
      <span>v${view.appVersion}</span>
    </div>
  `;
}

function renderHistoryTab(view: AppView) {
  // Get chat-view from the parent shadow DOM or page
  const getChatView = (): any => {
    return document.querySelector('chat-view') || view.renderRoot?.querySelector('chat-view');
  };

  // Request sessions on render
  setTimeout(() => {
    const chatView = getChatView();
    if (chatView?.requestSessions) { chatView.requestSessions(); }
  }, 100);

  const chatView = getChatView();
  const sessions = chatView?.sessionList || [];

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return html`
    <div style="display: flex; flex-direction: column; height: 100%; padding: 8px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 13px; font-weight: 600; color: var(--vscode-foreground);">💬 Conversations</span>
        <button
          style="background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 4px 10px; border-radius: 4px; font-size: 11px; cursor: pointer;"
          @click=${() => {
      const cv = getChatView();
      if (cv?.newSession) { cv.newSession(); }
      view.activeTab = 'chat';
    }}
        >+ New Chat</button>
      </div>
      <div style="flex: 1; overflow-y: auto;">
        ${sessions.length === 0
      ? html`<div style="text-align: center; padding: 20px; color: var(--vscode-descriptionForeground); font-size: 12px;">No conversations yet</div>`
      : sessions.map((s: any) => html`
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px; margin-bottom: 4px; border-radius: 6px; background: var(--vscode-sideBar-background); cursor: pointer; border: 1px solid var(--vscode-panel-border);"
              @click=${() => {
          const cv = getChatView();
          if (cv?.loadSession) { cv.loadSession(s.id); }
          view.activeTab = 'chat';
        }}
            >
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 12px; font-weight: 500; color: var(--vscode-foreground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${s.title}
                </div>
                <div style="font-size: 10px; color: var(--vscode-descriptionForeground); margin-top: 2px;">
                  ${formatDate(s.timestamp)} · ${s.messageCount} messages
                </div>
              </div>
              <button
                style="background: none; border: none; color: var(--vscode-errorForeground); cursor: pointer; padding: 2px 4px; font-size: 14px; opacity: 0.5;"
                title="Delete"
                @click=${(e: Event) => {
          e.stopPropagation();
          const cv = getChatView();
          if (cv?.deleteSession) { cv.deleteSession(s.id); }
          // Re-request list after a beat
          setTimeout(() => { if (cv?.requestSessions) { cv.requestSessions(); } }, 200);
        }}
              >🗑</button>
            </div>
          `)
    }
      </div>
    </div>
  `;
}
