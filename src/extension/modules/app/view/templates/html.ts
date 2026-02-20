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
      <div style="display: ${view.activeTab === 'settings' ? 'contents' : 'none'}"><settings-view></settings-view></div>
      <div style="display: ${view.activeTab === 'chat' ? 'contents' : 'none'}"><chat-view></chat-view></div>
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

  // Save current session then request list, so current appears in History
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
      : sessions.map((s: any) => {
        const isCurrent = s.id === currentId;
        const isPendingDelete = chatView?.pendingDeleteSessionId === s.id;
        return html`
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px; margin-bottom: 4px; border-radius: 6px; background: var(--vscode-sideBar-background); cursor: pointer; border: 1px solid ${isCurrent ? 'var(--vscode-focusBorder)' : 'var(--vscode-panel-border)'}; ${isCurrent ? 'border-left: 3px solid var(--vscode-focusBorder);' : ''} transition: background 0.15s ease;"
              @mouseenter=${(e: Event) => { (e.currentTarget as HTMLElement).style.background = 'var(--vscode-list-hoverBackground)'; }}
              @mouseleave=${(e: Event) => { (e.currentTarget as HTMLElement).style.background = 'var(--vscode-sideBar-background)'; }}
              @click=${() => {
            const cv = getChatView();
            if (cv?.loadSession) { cv.loadSession(s.id); }
            view.activeTab = 'chat';
          }}
            >
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 12px; font-weight: 500; color: var(--vscode-foreground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${s.title}${isCurrent ? html` <span style="font-size: 10px; color: var(--vscode-focusBorder); font-weight: 400;">● Current</span>` : ''}
                </div>
                <div style="font-size: 10px; color: var(--vscode-descriptionForeground); margin-top: 2px;">
                  ${formatDate(s.timestamp)} · ${s.messageCount} messages
                </div>
              </div>
              <button
                style="background: ${isPendingDelete ? 'var(--vscode-inputValidation-errorBackground, #5a1d1d)' : 'none'}; border: ${isPendingDelete ? '1px solid var(--vscode-inputValidation-errorBorder, #be1100)' : 'none'}; color: var(--vscode-errorForeground); cursor: pointer; padding: 2px 8px; font-size: ${isPendingDelete ? '11px' : '13px'}; border-radius: 4px; white-space: nowrap;"
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
