import { html, TemplateResult } from 'lit';
import { IChatView } from '../interface.js';
import { getRoleIcon } from '../../../settings/view/templates/icons.js';

function getIcon(role?: string) {
  if (role === 'user') {
    return html`<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/></svg>`;
  }
  if (role === 'system') {
    return html`<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 0 1 2 2v2H6V3a2 2 0 0 1 2-2zm3 4V3a3 3 0 1 0-6 0v2a3 3 0 0 0-3 3v7h12V8a3 3 0 0 0-3-3zM7 14v-2h2v2H7zm0-3V9h2v2H7z"/></svg>`;
  }
  // Use the same icon as Settings > Agents
  return getRoleIcon(role || 'architect');
}

export function render(view: IChatView): TemplateResult {
  console.log('[chat::view] render() called');
  return html`
    <div class="header layout-col">
      <div class="header-top layout-row">
        <h2 class="header-title">
            ${getIcon('architect')}
            <span>Architect Agent</span>
        </h2>
        <div class="actions-group">
          <span class="secure-badge" title="Secure session active">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Secure
          </span>
          <span class="header-status">● Ready</span>
        </div>
      </div>
      <div class="model-selector layout-row">
        <div class="selector-group">
          <label class="model-label">Model:</label>
          <select class="model-dropdown" .value="${view.selectedModelId}" @change="${(e: Event) => view.handleModelChange(e)}">
            ${view.models.length === 0
      ? html`<option value="" disabled selected>Loading...</option>`
      : view.models.map(m => html`
                  <option value="${m.id}" ?selected="${m.id === view.selectedModelId}">
                    ${m.name}
                  </option>
                `)
    }
          </select>
        </div>
        <div class="selector-group">
          <label class="model-label">Filter:</label>
          <select class="model-dropdown" .value="${view.agentFilter}" @change="${(e: Event) => view.handleFilterChange(e)}">
            <option value="all">All Agents</option>
            ${Array.from(new Set(view.history.map(m => m.role).filter(r => r && r !== 'user' && r !== 'system') as string[])).map(role => html`
              <option value="${role}" ?selected="${role === view.agentFilter}">
                ${role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            `)}
          </select>
        </div>
      </div>
    </div>
    <div class="history layout-scroll chat-container layout-col">
      ${view.history
      .filter(msg => view.agentFilter === 'all' || msg.role === 'user' || msg.role === 'system' || msg.role === view.agentFilter)
      .map(msg => {
        const typeClass = msg.role === 'user' ? 'msg-user' : (msg.role === 'architect' ? 'msg-agent' : 'msg-system');
        return html`
            <div class="msg-bubble ${typeClass}">
                <div class="msg-header">
                    <span class="msg-icon">${getIcon(msg.role)}</span>
                    <span class="msg-sender">
                      ${msg.sender} 
                      ${msg.status ? html`<span class="msg-status">(${msg.status})</span>` : ''}
                    </span>
                </div>
                <div class="msg-content">${msg.text}</div>
            </div>`;
      })}
      ${view.isLoading ? html`
        <div class="msg-bubble msg-agent skeleton">
           <div class="skeleton-header"></div>
           <div class="skeleton-content">
             <div class="skeleton-line full"></div>
             <div class="skeleton-line half"></div>
           </div>
        </div>
      ` : ''}
    </div>
    <div class="input-group layout-col">
      <div class="workflow-info">
        <span class="codicon codicon-git-branch" style="color: var(--vscode-textLink-foreground);"></span>
        <span style="color: #ffffff;">Workflow: ${view.activeWorkflow}</span>
      </div>
      <div class="input-row layout-row">
        <input
          class="input-control"
          type="text"
          .value="${view.inputText}"
          @input="${(e: InputEvent) => view.handleInput(e)}"
          @keydown="${(e: KeyboardEvent) => view.handleKeyDown(e)}"
          placeholder="Ask the Architect..."
        />
        <button class="btn btn-primary" @click="${() => view.sendChatMessage()}">Send</button>
      </div>
    </div>
  `;
}
