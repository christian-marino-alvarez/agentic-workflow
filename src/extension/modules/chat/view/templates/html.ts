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
          ${view.agentFilter !== 'all' ? html`
            <button class="btn-icon" 
              title="${view.agentPermissions[view.agentFilter] === 'full' ? 'Full Access (Click to Sandbox)' : 'Sandbox Mode (Click to Grant Full Access)'}"
              @click="${() => view.togglePermission(view.agentFilter)}"
              style="color: ${view.agentPermissions[view.agentFilter] === 'full' ? 'var(--vscode-testing-iconFailed)' : 'var(--vscode-testing-iconPassed)'}"
            >
              ${view.agentPermissions[view.agentFilter] === 'full'
        ? html`<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h6V3a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2H3V3a4 4 0 1 1 8 0v4h2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v-2h1v-5h-2v-2h2V3a4 4 0 0 0-4-4z"/></svg>` // Unlock (approx)
        : html`<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/></svg>` // Lock
      }
            </button>
          ` : ''}
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
      <div class="workflow-info" style="display: flex; align-items: center; gap: 6px; padding: 0 4px; margin-bottom: 4px;">
        <svg width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#3794ff">
          <path d="M13.5 1H11V2H13.5C14.3284 2 15 2.67157 15 3.5V13.5C15 14.3284 14.3284 15 13.5 15H2.5C1.67157 15 1 14.3284 1 13.5V3.5C1 2.67157 1.67157 2 2.5 2H5V1H2.5C1.11929 1 0 2.11929 0 3.5V13.5C0 14.8807 1.11929 16 2.5 16H13.5C14.8807 16 16 14.8807 16 13.5V3.5C16 2.11929 14.8807 1 13.5 1ZM6 1H10V3H6V1ZM3 6H13V7H3V6ZM3 9H13V10H3V9ZM3 12H10V13H3V12Z"/>
        </svg>
        <span style="color: #ffffff; font-weight: 500;">${view.activeWorkflow}</span>
      </div>
      <div class="input-row layout-col">
        <!-- Attachments Chips -->
        ${view.attachments.length > 0 ? html`
          <div class="attachments-list" style="display: flex; gap: 4px; padding: 4px; flex-wrap: wrap;">
            ${view.attachments.map(path => html`
              <div class="chip" style="display: flex; align-items: center; gap: 4px; background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); padding: 2px 6px; border-radius: 4px; font-size: 10px;">
                <span class="codicon codicon-file"></span>
                <span style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${path.split('/').pop()}
                </span>
                <span class="codicon codicon-close" style="cursor: pointer;" @click="${() => view.removeAttachment(path)}"></span>
              </div>
            `)}
          </div>
        ` : ''}

        <div style="display: flex; gap: 4px; align-items: center;">
             <button class="btn-icon" title="Attach Context" style="background: none; border: none; color: var(--vscode-foreground); cursor: pointer; padding: 4px; border: 1px solid var(--vscode-input-border); border-radius: 4px; margin-right: 4px;" @click="${() => view.handleAttachFile()}">
               <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                 <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0V3z"/>
               </svg>
             </button>
            <input
              class="input-control"
              type="text"
              style="flex: 1;"
              .value="${view.inputText}"
              @input="${(e: InputEvent) => view.handleInput(e)}"
              @keydown="${(e: KeyboardEvent) => view.handleKeyDown(e)}"
              placeholder="Ask the Architect..."
            />
            <button class="btn btn-primary" @click="${() => view.sendChatMessage()}">Send</button>
        </div>
      </div>
    </div>
    </div>
  `;
}
