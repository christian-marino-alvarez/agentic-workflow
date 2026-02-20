import { html, TemplateResult } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import { IChatView } from '../types.js';
import { getRoleIcon } from '../../../settings/view/templates/icons.js';

// Configure marked for chat-friendly output
marked.setOptions({
  gfm: true,
  breaks: true,
});

function renderMarkdown(text: string): ReturnType<typeof unsafeHTML> {
  try {
    const htmlContent = marked.parse(text) as string;
    return unsafeHTML(htmlContent);
  } catch {
    return unsafeHTML(`<p>${text}</p>`);
  }
}

function getIcon(role?: string) {
  if (role === 'user') {
    return html`<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/></svg>`;
  }
  if (role === 'system') {
    return html`<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 0 1 2 2v2H6V3a2 2 0 0 1 2-2zm3 4V3a3 3 0 1 0-6 0v2a3 3 0 0 0-3 3v7h12V8a3 3 0 0 0-3-3zM7 14v-2h2v2H7zm0-3V9h2v2H7z"/></svg>`;
  }
  return getRoleIcon(role || 'architect');
}

function renderSecureBadge() {
  return html`
    <span class="secure-badge" title="Secure session active">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      Secure
    </span>
  `;
}

function renderVerifyButton(view: IChatView) {
  return html`
    <button class="secure-badge verify-btn"
      title="Click to verify connection"
      style="background: rgba(255,255,255,0.08); color: var(--vscode-descriptionForeground, #999); border: 1px solid rgba(255,255,255,0.15); cursor: pointer;"
      @click="${() => view.testConnection()}"
      ?disabled="${view.isTesting}"
    >
      ${view.isTesting ? html`<span class="spinner"></span> Verifying...` : html`● Not Verified`}
    </button>
  `;
}

function renderPermissionToggle(view: IChatView) {
  const isFull = view.agentPermissions[view.selectedAgent] === 'full';

  const iconUnlock = html`<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h6V3a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2H3V3a4 4 0 1 1 8 0v4h2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v-2h1v-5h-2v-2h2V3a4 4 0 0 0-4-4z"/></svg>`;
  const iconLock = html`<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/></svg>`;

  return html`
    <button class="btn-icon" 
      title="${isFull ? 'Full Access (Click to Sandbox)' : 'Sandbox Mode (Click to Grant Full Access)'}"
      @click="${() => view.togglePermission(view.selectedAgent)}"
      style="color: ${isFull ? 'var(--vscode-testing-iconFailed)' : 'var(--vscode-testing-iconPassed)'}"
    >
      ${isFull ? iconUnlock : iconLock}
    </button>
  `;
}

// ─── Header: Workflow info + Status ──────────────────────────
function renderHeader(view: IChatView) {
  return html`
    <div class="header layout-col">
      <div class="header-top layout-row">
        <div class="workflow-info">
          <svg width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#3794ff">
            <path d="M13.5 1H11V2H13.5C14.3284 2 15 2.67157 15 3.5V13.5C15 14.3284 14.3284 15 13.5 15H2.5C1.67157 15 1 14.3284 1 13.5V3.5C1 2.67157 1.67157 2 2.5 2H5V1H2.5C1.11929 1 0 2.11929 0 3.5V13.5C0 14.8807 1.11929 16 2.5 16H13.5C14.8807 16 16 14.8807 16 13.5V3.5C16 2.11929 14.8807 1 13.5 1ZM6 1H10V3H6V1ZM3 6H13V7H3V6ZM3 9H13V10H3V9ZM3 12H10V13H3V12Z"/>
          </svg>
          <span class="workflow-label">${view.activeWorkflow}</span>
        </div>
        <div class="actions-group">
          ${renderPermissionToggle(view)}
          ${view.isSecure ? renderSecureBadge() : renderVerifyButton(view)}
          <span class="header-status">● Ready</span>
        </div>
      </div>
    </div>
  `;
}

// ─── Message Bubbles ──────────────────────────────────────
function renderMessageBubble(msg: any) {
  const typeClass = msg.role === 'user' ? 'msg-user' : (msg.role === 'architect' ? 'msg-agent' : 'msg-system');
  const isAgent = msg.role !== 'user' && msg.role !== 'system';
  return html`
    <div class="msg-bubble ${typeClass}">
        <div class="msg-header">
            <span class="msg-icon">${getIcon(msg.role)}</span>
            <span class="msg-sender">
              ${msg.sender} 
              ${msg.status ? html`<span class="msg-status">(${msg.status})</span>` : ''}
            </span>
        </div>
        <div class="msg-content ${isAgent ? 'markdown-body' : ''}">
          ${isAgent && msg.text ? renderMarkdown(msg.text) : msg.text}
          ${msg.isStreaming ? html`<span class="streaming-cursor"></span>` : ''}
        </div>
    </div>
  `;
}

function renderLoadingSkeleton() {
  return html`
    <div class="msg-bubble msg-agent skeleton">
      <div class="skeleton-header"></div>
      <div class="skeleton-content">
        <div class="skeleton-line full"></div>
        <div class="skeleton-line half"></div>
      </div>
    </div>
  `;
}

function renderHistory(view: IChatView) {
  return html`
    <div class="history layout-scroll chat-container layout-col">
      ${view.history.map(msg => renderMessageBubble(msg))}
      ${view.isLoading ? renderLoadingSkeleton() : ''}
    </div>
  `;
}

// ─── Agent Selector (bottom, above input) ──────────────────
function renderAgentSelector(view: IChatView) {
  const agentLabel = view.selectedAgent.charAt(0).toUpperCase() + view.selectedAgent.slice(1);
  const currentAgent = view.availableAgents.find(a => a.name === view.selectedAgent);
  const capabilities = currentAgent?.capabilities || {};
  const capKeys = Object.keys(capabilities);

  return html`
    <div class="agent-bar">
      <div class="agent-selector" style="position: relative;">
        <button class="agent-select-btn ${view.agentDisabled ? 'disabled' : ''}" @click=${() => view.toggleAgentDropdown()}>
          ${getIcon(view.selectedAgent)}
          <span>${agentLabel}</span>
          ${view.agentModelName ? html`<span class="agent-model-label">${view.agentModelName}</span>` : ''}
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style="margin-left: 4px; opacity: 0.6;">
            <path d="M7.976 10.072l4.357-4.357.62.618L8.284 11h-.618L3 6.333l.619-.618 4.357 4.357z"/>
          </svg>
        </button>
        ${view.showAgentDropdown ? html`
          <div class="agent-dropdown">
            ${view.availableAgents.map(agent => {
    const hasModel = !!(agent.model?.id);
    return html`
                <div class="agent-option ${agent.name === view.selectedAgent ? 'active' : ''} ${!hasModel ? 'no-model' : ''}"
                  @click=${() => view.handleAgentChange(agent.name)}>
                  ${getIcon(agent.name)}
                  <span>${agent.name.charAt(0).toUpperCase() + agent.name.slice(1)}</span>
                  ${!hasModel ? html`<span class="agent-no-model-label">No model</span>` : ''}
                </div>
              `;
  })}
          </div>
        ` : ''}
      </div>
      ${capKeys.length > 0 ? html`
        <div class="agent-capabilities">
          ${capKeys.map(cap => html`
            <span class="cap-label ${capabilities[cap] ? 'active' : ''}">${cap}</span>
          `)}
        </div>
      ` : ''}
    </div>
  `;
}

// ─── Attachments ──────────────────────────────────────────
function renderAttachmentChip(view: IChatView, path: string) {
  return html`
    <div class="chip" style="display: flex; align-items: center; gap: 4px; background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); padding: 2px 6px; border-radius: 4px; font-size: 10px;">
      <span class="codicon codicon-file"></span>
      <span style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        ${path.split('/').pop()}
      </span>
      <span class="codicon codicon-close" style="cursor: pointer;" @click="${() => view.removeAttachment(path)}"></span>
    </div>
  `;
}

function renderAttachmentsList(view: IChatView) {
  if (view.attachments.length === 0) {
    return '';
  }
  return html`
    <div class="attachments-list" style="display: flex; gap: 4px; padding: 4px; flex-wrap: wrap;">
      ${view.attachments.map(path => renderAttachmentChip(view, path))}
    </div>
  `;
}

// ─── Input Controls ──────────────────────────────────────
function renderInputControls(view: IChatView) {
  const placeholder = view.agentDisabled
    ? 'Agent has no verified model — configure in Settings'
    : `Ask the ${view.selectedAgent.charAt(0).toUpperCase() + view.selectedAgent.slice(1)} Agent...`;

  return html`
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
        placeholder="${placeholder}"
        ?disabled="${view.agentDisabled}"
      />
      <button class="btn btn-primary" @click="${() => view.sendChatMessage()}" ?disabled="${view.agentDisabled}">Send</button>
    </div>
  `;
}

// ─── Input Group: Agent Selector + Attachments + Input ───
function renderInputGroup(view: IChatView) {
  return html`
    <div class="input-group layout-col">
      ${renderAgentSelector(view)}
      <div class="input-row layout-col">
        ${renderAttachmentsList(view)}
        ${renderInputControls(view)}
      </div>
    </div>
  `;
}

// ─── Main Render ──────────────────────────────────────────
export function render(view: IChatView): TemplateResult {
  return html`
    ${renderHeader(view)}
    ${renderHistory(view)}
    ${renderInputGroup(view)}
  `;
}
