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
  const formatCost = (c: number) => c < 0.001 ? '<$0.001' : `$${c.toFixed(3)}`;
  const formatModelName = (m: string) => m.length > 22 ? m.slice(0, 22) + '…' : m;

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
            <button class="token-usage ${view.showUsagePanel ? 'active' : ''}" @click="${() => view.toggleUsagePanel()}" title="Click to see task token stats">
              <span class="token-icon">⚡</span>
              <span class="token-count">${formatTokens(usage.totalTokens)}</span>
              ${usage.estimatedCost > 0 ? html`<span class="token-cost">${formatCost(usage.estimatedCost)}</span>` : ''}
            </button>
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
      ${view.showUsagePanel && hasUsage ? html`
        <div class="usage-stats-panel">
          <div class="usage-stats-header">
            <span class="usage-stats-title">⚡ Token Stats — Current Task</span>
            <button class="usage-stats-close" @click="${() => view.toggleUsagePanel()}" title="Close">✕</button>
          </div>
          <div class="usage-stats-grid">
            <div class="usage-stat-item">
              <div class="usage-stat-label">Total Tokens</div>
              <div class="usage-stat-value">${formatTokens(usage.totalTokens)}</div>
            </div>
            <div class="usage-stat-item">
              <div class="usage-stat-label">Input</div>
              <div class="usage-stat-value input">${formatTokens(usage.inputTokens)}</div>
            </div>
            <div class="usage-stat-item">
              <div class="usage-stat-label">Output</div>
              <div class="usage-stat-value output">${formatTokens(usage.outputTokens)}</div>
            </div>
            <div class="usage-stat-item">
              <div class="usage-stat-label">Requests</div>
              <div class="usage-stat-value">${usage.requests}</div>
            </div>
            <div class="usage-stat-item highlight">
              <div class="usage-stat-label">Est. Cost</div>
              <div class="usage-stat-value cost">${formatCost(usage.estimatedCost)}</div>
            </div>
            <div class="usage-stat-item">
              <div class="usage-stat-label">Avg / Request</div>
              <div class="usage-stat-value">${usage.requests > 0 ? formatCost(usage.estimatedCost / usage.requests) : '—'}</div>
            </div>
          </div>
          ${Object.keys(usage.byModel).length > 1 ? html`
            <div class="usage-model-breakdown">
              <div class="usage-model-title">By Model</div>
              ${Object.entries(usage.byModel).map(([model, stats]) => html`
                <div class="usage-model-row">
                  <span class="usage-model-name">${formatModelName(model)}</span>
                  <span class="usage-model-reqs">${stats.requests}×</span>
                  <span class="usage-model-tokens">${formatTokens(stats.inputTokens + stats.outputTokens)}</span>
                  <span class="usage-model-cost">${formatCost(stats.cost)}</span>
                </div>
              `)}
            </div>
          ` : ''}
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

  // If there's a pending A2UI, show radio options in the input area
  if (view.pendingA2UI) {
    const { label, options } = view.pendingA2UI;
    const groupName = `a2ui-radio-${Date.now()}`;

    // Input type: free-text field when no options are defined
    if (!options || options.length === 0) {
      return html`
        <div class="a2ui-input-bar">
          <span class="a2ui-input-label">${label}</span>
          <div class="a2ui-input-options" style="padding:0;">
            <textarea class="a2ui-text-input" rows="1" placeholder="Type your answer..." style="
              width:100%;padding:8px 12px;background:rgba(255,255,255,0.05);
              border:1px solid rgba(255,255,255,0.12);border-radius:6px;
              color:var(--vscode-foreground);font-size:13px;outline:none;
              resize:none;overflow:hidden;min-height:36px;max-height:150px;
              font-family:var(--vscode-font-family,inherit);line-height:1.5;
              box-sizing:border-box;
            " @input="${(e: InputEvent) => {
          const ta = e.target as HTMLTextAreaElement;
          ta.style.height = 'auto';
          ta.style.height = Math.min(ta.scrollHeight, 150) + 'px';
          const container = ta.closest('.a2ui-input-bar');
          const confirmBtn = container?.querySelector('.a2ui-input-confirm') as HTMLButtonElement;
          const val = ta.value.trim();
          if (confirmBtn) {
            confirmBtn.disabled = val.length === 0;
            if (val.length > 0) { confirmBtn.classList.add('ready'); } else { confirmBtn.classList.remove('ready'); }
          }
        }}" @keydown="${(e: KeyboardEvent) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const val = (e.target as HTMLTextAreaElement).value.trim();
            if (val) { view.confirmA2UIOption(val); }
          }
        }}"></textarea>
          </div>
          <div class="a2ui-input-actions">
            <button class="btn a2ui-input-confirm" disabled
                    @click="${(e: Event) => {
          const container = (e.target as HTMLElement).closest('.a2ui-input-bar');
          const ta = container?.querySelector('.a2ui-text-input') as HTMLTextAreaElement;
          if (ta?.value.trim()) { view.confirmA2UIOption(ta.value.trim()); }
        }}">Confirm</button>
            <button class="btn a2ui-input-cancel" @click="${() => view.cancelA2UI()}" title="Dismiss">✘</button>
          </div>
        </div>
      `;
    }

    // Choice/gate/multi type: radio buttons
    return html`
      <div class="a2ui-input-bar">
        <span class="a2ui-input-label">${label}</span>
        <div class="a2ui-input-options">
          ${options.map((opt, i) => html`
            <label class="a2ui-radio-option">
              <input type="radio" name="${groupName}" value="${opt}" 
                     @change="${(e: Event) => {
        const container = (e.target as HTMLElement).closest('.a2ui-input-bar');
        const confirmBtn = container?.querySelector('.a2ui-input-confirm') as HTMLButtonElement;
        if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.classList.add('ready'); }
      }}" />
              <span class="a2ui-radio-indicator"></span>
              <span class="a2ui-radio-text">${opt}</span>
            </label>
          `)}
        </div>
        <div class="a2ui-input-actions">
          <button class="btn a2ui-input-confirm" disabled
                  @click="${(e: Event) => {
        const container = (e.target as HTMLElement).closest('.a2ui-input-bar');
        const selected = container?.querySelector('input[type=radio]:checked') as HTMLInputElement;
        if (selected) { view.confirmA2UIOption(selected.value); }
      }}">Confirm</button>
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
