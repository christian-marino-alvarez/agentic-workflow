import { html } from 'lit';
import { IChatView } from '../../types.js';
import { getIcon } from '../utils.js';

export function renderAgentStatusBar(view: IChatView) {
  const agentLabel = view.selectedAgent.charAt(0).toUpperCase() + view.selectedAgent.slice(1);
  const currentAgent = view.availableAgents.find(a => a.name === view.selectedAgent);
  const capabilities = currentAgent?.capabilities || {};
  const capKeys = Object.keys(capabilities);
  const isSandbox = (view.agentPermissions[view.selectedAgent] || 'sandbox') === 'sandbox';
  const hasActivity = !!view.activeActivity;

  const usage = view.tokenUsage;
  const hasUsage = usage.totalTokens > 0;
  const formatTokens = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : `${n}`;

  return html`
    <div class="agent-status-bar">
      <div class="agent-status-title">Managed Agents</div>
      <div class="agent-status-row">
        <div class="agent-status-info">
          ${getIcon(view.selectedAgent)}
          <span class="agent-status-name">${agentLabel}</span>
          ${view.agentModelName ? html`<span class="agent-status-sep">·</span><span class="agent-status-model">${view.agentModelName}</span>` : ''}
          ${view.activeTask ? html`<span class="agent-status-sep">·</span><span class="agent-status-task">task: ${view.activeTask}</span>` : ''}
          ${view.activeActivity ? html`<span class="agent-status-sep">·</span><span class="agent-status-activity ${hasActivity ? 'active' : ''}">${view.activeActivity}</span>` : ''}
        </div>
        <div class="agent-status-right">
          ${hasUsage ? html`
            <div class="token-usage" title="Input: ${formatTokens(usage.inputTokens)} · Output: ${formatTokens(usage.outputTokens)}">
              <span class="token-icon">⚡</span>
              <span class="token-count">${formatTokens(usage.totalTokens)}</span>
              ${usage.estimatedCost > 0 ? html`<span class="token-cost">~${usage.estimatedCost < 0.01 ? '<0.01' : usage.estimatedCost.toFixed(2)}€</span>` : ''}
            </div>
          ` : ''}
          <div class="permission-toggle" @click="${() => view.togglePermission(view.selectedAgent)}">
            ${isSandbox
      ? html`<span class="perm-label sandbox">🔒 Sandbox</span>`
      : html`<span class="perm-label full-access">🔓 Full Access</span>`
    }
          </div>
        </div>
      </div>
      ${capKeys.length > 0 ? html`
        <div class="agent-status-caps">
          ${capKeys.map(cap => html`
            <span class="cap-label ${capabilities[cap] ? 'active' : ''}">${cap}</span>
          `)}
        </div>
      ` : ''}
    </div>
  `;
}

function renderAttachmentChip(view: IChatView, path: string) {
  return html`
    <div class="chip" style="display:flex;align-items:center;gap:4px;background:var(--vscode-badge-background);color:var(--vscode-badge-foreground);padding:2px 6px;border-radius:4px;font-size:10px;">
      <span class="codicon codicon-file"></span>
      <span style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${path.split('/').pop()}</span>
      <span class="codicon codicon-close" style="cursor:pointer;" @click="${() => view.removeAttachment(path)}"></span>
    </div>
  `;
}

function renderAttachmentsList(view: IChatView) {
  if (view.attachments.length === 0) { return ''; }
  return html`
    <div class="attachments-list" style="display:flex;gap:4px;padding:4px;flex-wrap:wrap;">
      ${view.attachments.map(path => renderAttachmentChip(view, path))}
    </div>
  `;
}

function renderInputControls(view: IChatView) {
  // Skeleton transition between input states
  if (view.inputSkeleton) {
    return html`
      <div class="a2ui-input-skeleton">
        <div class="skeleton-bar"></div>
        <div class="skeleton-bar short"></div>
      </div>
    `;
  }

  // If there's a pending A2UI, show option buttons in the input area
  if (view.pendingA2UI) {
    const { label, options } = view.pendingA2UI;
    return html`
      <div class="a2ui-input-bar">
        <span class="a2ui-input-label">${label}</span>
        <div class="a2ui-input-options">
          ${options.map(opt => html`
            <button class="btn a2ui-input-btn" @click="${() => view.confirmA2UIOption(opt)}">${opt}</button>
          `)}
          <button class="btn a2ui-input-cancel" @click="${() => view.cancelA2UI()}" title="Dismiss">✘</button>
        </div>
      </div>
    `;
  }

  const placeholder = view.agentDisabled
    ? 'Agent has no verified model — configure in Settings'
    : `Ask the ${view.selectedAgent.charAt(0).toUpperCase() + view.selectedAgent.slice(1)} Agent...`;

  return html`
    <div style="display:flex;gap:4px;align-items:center;">
      <button class="btn-icon" title="Attach Context" style="background:none;border:1px solid var(--vscode-input-border);color:var(--vscode-foreground);cursor:pointer;padding:4px;border-radius:4px;" @click="${() => view.handleAttachFile()}">
        <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0V3z"/>
        </svg>
      </button>
      <input class="input-control" type="text" style="flex:1;" .value="${view.inputText}" @input="${(e: InputEvent) => view.handleInput(e)}" @keydown="${(e: KeyboardEvent) => view.handleKeyDown(e)}" placeholder="${placeholder}" ?disabled="${view.agentDisabled}"/>
      <button class="btn btn-primary" @click="${() => view.sendChatMessage()}" ?disabled="${view.agentDisabled}">Send</button>
    </div>
  `;
}

export function renderInputGroup(view: IChatView) {
  return html`
    <div class="input-group layout-col">
      <div class="input-row layout-col">
        ${renderAttachmentsList(view)}
        ${renderInputControls(view)}
      </div>
    </div>
  `;
}
