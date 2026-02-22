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

// ─── Timer helper ──────────────────────────────────────────
function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Header: Workflow + Timer + Task Progress ──────────────────
function renderHeader(view: IChatView) {
  const done = view.taskSteps.filter(s => s.status === 'done').length;
  const total = view.taskSteps.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const activeStep = view.taskSteps.find(s => s.status === 'active');
  const activeStepIdx = activeStep ? view.taskSteps.indexOf(activeStep) + 1 : 0;

  return html`
    <div class="header layout-col">
      <div class="header-top layout-row">
        <div class="workflow-info">
          <svg width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#3794ff">
            <path d="M13.5 1H11V2H13.5C14.3284 2 15 2.67157 15 3.5V13.5C15 14.3284 14.3284 15 13.5 15H2.5C1.67157 15 1 14.3284 1 13.5V3.5C1 2.67157 1.67157 2 2.5 2H5V1H2.5C1.11929 1 0 2.11929 0 3.5V13.5C0 14.8807 1.11929 16 2.5 16H13.5C14.8807 16 16 14.8807 16 13.5V3.5C16 2.11929 14.8807 1 13.5 1ZM6 1H10V3H6V1ZM3 6H13V7H3V6ZM3 9H13V10H3V9ZM3 12H10V13H3V12Z"/>
          </svg>
          <span class="workflow-label">${view.activeWorkflow}</span>
          <button class="btn-icon" title="New Task" style="margin-left:4px; padding:2px 6px; border:1px solid var(--vscode-input-border); border-radius:4px; background:none; color:var(--vscode-foreground); cursor:pointer; font-size:14px; line-height:1;" @click=${(e: Event) => { e.stopPropagation(); view.newSession(); }}>+</button>
        </div>
        <div class="actions-group" style="gap: 6px;">
          <span class="agent-timer ${view.activeActivity ? 'running' : ''}" title="Execution time">⏱ ${formatTimer(view.elapsedSeconds)}</span>
          <span class="progress-pill">
            <span class="progress-bar-track">
              <span class="progress-bar-fill" style="width: ${pct}%"></span>
            </span>
            <span class="progress-text">${pct}%</span>
          </span>
          ${view.taskSteps.length > 0 ? html`
            <button class="btn-icon timeline-toggle-btn ${view.showTimeline ? 'active' : ''}" 
              title="${view.showTimeline ? 'Hide workflow steps' : 'Show workflow steps'}"
              @click=${() => view.toggleTimeline()}
              style="padding: 3px 6px; border: 1px solid ${view.showTimeline ? 'var(--vscode-textLink-foreground)' : 'var(--vscode-widget-border)'}; border-radius: 4px; background: ${view.showTimeline ? 'rgba(55,148,255,0.12)' : 'none'}; color: ${view.showTimeline ? 'var(--vscode-textLink-foreground)' : 'var(--vscode-descriptionForeground)'}; cursor: pointer; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 3px;">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <circle cx="2" cy="2" r="1.5"/>
                <rect x="4" y="1" width="6" height="2" rx="1"/>
                <circle cx="2" cy="5" r="1.5" opacity="0.5"/>
                <rect x="4" y="4" width="4" height="2" rx="1" opacity="0.5"/>
                <circle cx="2" cy="8" r="1.5" opacity="0.3"/>
                <rect x="4" y="7" width="5" height="2" rx="1" opacity="0.3"/>
              </svg>
              Steps
            </button>
          ` : ''}
        </div>
      </div>
      ${activeStep ? html`<div class="active-step-hint">▸ Step ${activeStepIdx}/${total} · ${activeStep.label}</div>` : ''}
    </div>
  `;
}

// ─── Sticky Side Timeline ──────────────────────────────────────
function renderSideTimeline(view: IChatView) {
  if (!view.showTimeline || view.taskSteps.length === 0) { return ''; }
  return html`
    <div class="side-timeline">
      <div class="side-timeline-header">Workflow</div>
      ${view.taskSteps.map((step, i) => {
    const isLast = i === view.taskSteps.length - 1;
    const isDone = step.status === 'done';
    const isActive = step.status === 'active';
    return html`
          <div class="side-step ${step.status}" title="${step.label}">
            <div class="side-step-track">
              <div class="side-step-dot ${step.status}">
                ${isDone ? html`<svg width="6" height="6" viewBox="0 0 6 6"><path d="M1 3l1.5 1.5L5 1.5" stroke="white" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>` : ''}
                ${isActive ? html`<div class="side-step-pulse"></div>` : ''}
              </div>
              ${!isLast ? html`<div class="side-step-line ${isDone ? 'done' : ''}"></div>` : ''}
            </div>
            <div class="side-step-label ${step.status}">${step.label}</div>
          </div>
        `;
  })}
    </div>
  `;
}

// ─── Active Workflow Metadata ──────────────────────────────
function renderActiveWorkflowDef(view: IChatView) {
  if (!view.activeWorkflowDef) { return ''; }
  const { description, owner, constitutions, severity, blocking } = view.activeWorkflowDef;

  return html`
    <div class="active-workflow-meta" style="margin: 12px 16px; padding: 12px; background: rgba(0,0,0,0.1); border-radius: 6px; border: 1px solid var(--vscode-pickerGroup-border); font-family: var(--vscode-font-family); box-sizing: border-box;">
      <div style="font-size: 11px; text-transform: uppercase; color: var(--vscode-descriptionForeground); margin-bottom: 8px; font-weight: 600;">Active Context</div>
      
      ${description ? html`<div style="font-size: 12px; margin-bottom: 8px; color: var(--vscode-foreground);">${description}</div>` : ''}
      
      <div style="display: flex; gap: 8px; margin-bottom: ${constitutions?.length ? '10px' : '0'}; flex-wrap: wrap;">
        ${owner ? html`<span style="background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); padding: 2px 6px; border-radius: 4px; font-size: 10px;">👤 ${owner}</span>` : ''}
        ${severity ? html`<span style="background: var(--vscode-testing-iconFailed); color: var(--vscode-badge-foreground); padding: 2px 6px; border-radius: 4px; font-size: 10px;">${severity}</span>` : ''}
        ${blocking !== undefined ? html`<span style="background: ${blocking ? 'var(--vscode-testing-iconFailed)' : 'var(--vscode-testing-iconPassed)'}; color: var(--vscode-badge-foreground); padding: 2px 6px; border-radius: 4px; font-size: 10px;">${blocking ? 'Blocking' : 'Non-blocking'}</span>` : ''}
      </div>

      ${constitutions && constitutions.length > 0 ? html`
        <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 4px;">Required Constitutions:</div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${Array.isArray(constitutions) ? constitutions.map((c: string) => html`
            <div style="font-size: 11px; display: flex; align-items: center; gap: 4px;">
              <span class="codicon codicon-book"></span>
              <span style="color: var(--vscode-textLink-foreground); cursor: pointer;" title="View file">${c.split('/').pop()}</span>
            </div>
          `) : ''}
        </div>
      ` : ''}
    </div>
  `;
}

// ─── Tool Call Blocks ──────────────────────────────────────
function renderToolEvents(events?: Array<any>) {
  // HIDDEN BY DESIGN:
  // Tool executions (like readFile, listDirectory, runCommand) are now completely hidden
  // from the developer UI to preserve the chat and conversational experience.
  // 
  // (NOTE: Delegation events to other agents are rendered natively via 
  // renderDelegationCard in a separate module).
  return '';
}

// ─── Delegation Card ──────────────────────────────────────
function renderDelegationCard(msg: any) {
  const isPending = msg.delegationStatus === 'pending';
  const agentIcon = getIcon(msg.delegationAgent);
  const agentName = msg.delegationAgent
    ? msg.delegationAgent.charAt(0).toUpperCase() + msg.delegationAgent.slice(1)
    : 'Agente';
  const roleClass = msg.delegationAgent ? `role-${msg.delegationAgent}` : '';

  return html`
    <div class="delegation-card ${isPending ? 'pending' : 'completed'} ${roleClass}">
      <div class="delegation-header">
        <span class="delegation-agent-icon">${agentIcon}</span>
        <span class="delegation-title">${agentName}</span>
        <span class="delegation-status">${isPending ? '⏳ Trabajando...' : '✅ Listo'}</span>
      </div>
      ${isPending ? html`
        <div class="delegation-greeting">¡Perfecto, me pongo a ello! 💪</div>
        <div class="delegation-task">${renderMarkdown(msg.text)}</div>
        <div class="delegation-loading"><span class="streaming-cursor"></span> Analizando...</div>
      ` : html`
        <div class="delegation-task">${renderMarkdown(msg.text)}</div>
        ${msg.delegationResult ? html`
          <details class="delegation-report" open>
            <summary class="delegation-report-header"><span>${agentIcon}</span> Informe de ${agentName}</summary>
            <div class="delegation-report-content markdown-body">${renderMarkdown(msg.delegationResult)}</div>
          </details>
        ` : ''}
      `}
    </div>
  `;
}

// ─── Gate Card ──────────────────────────────────────────
function renderGateCard(msg: any, view: IChatView) {
  const isPending = !msg.gateDecision;
  const decision = msg.gateDecision;

  return html`
    <div class="msg-bubble msg-system" style="border-left: 3px solid #4dc9c0; background: rgba(77, 201, 192, 0.08);">
      <div class="msg-header">
        <span class="msg-icon">🚦</span>
        <span class="msg-sender">Gate Approval</span>
      </div>
      <div class="msg-content markdown-body">
        ${renderMarkdown(msg.text)}
      </div>
      <div style="display:flex; gap:8px; margin-top:8px;">
        ${isPending ? html`
          <button style="padding:6px 18px; border-radius:4px; border:none; cursor:pointer; font-weight:600; background:#4caf50; color:white;" @click=${() => view.handleGateResponse(msg.gateId, 'approve')}>SI ✔</button>
          <button style="padding:6px 18px; border-radius:4px; border:none; cursor:pointer; font-weight:600; background:#f44336; color:white;" @click=${() => view.handleGateResponse(msg.gateId, 'reject')}>NO ✘</button>
        ` : html`
          <span style="padding:6px 12px; border-radius:4px; font-weight:600; background:${decision === 'approve' ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)'}; color:${decision === 'approve' ? '#4caf50' : '#f44336'};">
            ${decision === 'approve' ? '✔ Approved' : '✘ Rejected'}
          </span>
        `}
      </div>
    </div>
  `;
}

// ─── Message Bubbles ──────────────────────────────────────
function renderMessageBubble(msg: any, view?: IChatView) {
  if (msg.isGate && view) { return renderGateCard(msg, view); }
  if (msg.isDelegation) { return renderDelegationCard(msg); }
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';
  const isAgent = !isUser && !isSystem;
  const typeClass = isUser ? 'msg-user' : (isAgent ? 'msg-agent' : 'msg-system');
  const roleClass = isAgent ? `role-${msg.role}` : '';
  return html`
    <div class="msg-bubble ${typeClass} ${roleClass}">
      <div class="msg-header">
        <span class="msg-icon">${getIcon(msg.role)}</span>
        <span class="msg-sender">
          ${msg.sender} 
          ${msg.status ? html`<span class="msg-status">(${msg.status})</span>` : ''}
        </span>
      </div>
      <div class="msg-content ${isAgent ? 'markdown-body' : ''}">
        ${renderToolEvents(msg.toolEvents)}
        ${isAgent && msg.text ? renderMarkdown(msg.text) : msg.text}
        ${msg.isStreaming ? html`<span class="streaming-cursor"></span>` : ''}
      </div>
    </div>
  `;
}

function renderLoadingSkeleton() {
  return html`
    <div class="skeleton-chat">
      <div class="msg-bubble msg-agent skeleton">
        <div class="skeleton-header"></div>
        <div class="skeleton-content">
          <div class="skeleton-line full"></div>
          <div class="skeleton-line" style="width: 75%"></div>
          <div class="skeleton-line half"></div>
        </div>
      </div>
      <div class="msg-bubble msg-user skeleton">
        <div class="skeleton-header" style="width: 60px"></div>
        <div class="skeleton-content">
          <div class="skeleton-line" style="width: 65%"></div>
        </div>
      </div>
      <div class="msg-bubble msg-agent skeleton">
        <div class="skeleton-header"></div>
        <div class="skeleton-content">
          <div class="skeleton-line full"></div>
          <div class="skeleton-line" style="width: 80%"></div>
        </div>
      </div>
    </div>
  `;
}

// ─── Phase Separator (horizontal with date/time) ──────────────
function renderPhaseSeparator(phase: string) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  return html`
    <div class="phase-separator">
      <span class="phase-separator-line"></span>
      <span class="phase-separator-label">${phase}</span>
      <span class="phase-separator-time">${dateStr} ${timeStr}</span>
      <span class="phase-separator-line"></span>
    </div>
  `;
}

// ─── History (grouped by phase, scrolls together) ──────────────
function renderHistory(view: IChatView) {
  if (view.initialLoading) {
    return html`<div class="history layout-scroll chat-container layout-col">${renderLoadingSkeleton()}</div>`;
  }

  // Group consecutive messages by phase
  const groups: Array<{ phase: string; messages: any[] }> = [];
  let current: { phase: string; messages: any[] } | null = null;

  for (const msg of view.history) {
    const phase = msg.phase || '';
    if (!current || (phase && phase !== current.phase)) {
      current = { phase, messages: [] };
      groups.push(current);
    }
    current.messages.push(msg);
  }

  const hasPhases = groups.some(g => g.phase);

  if (!hasPhases) {
    // No phase info — flat render
    return html`
      <div class="history layout-scroll chat-container layout-col">
        ${view.history.map(msg => renderMessageBubble(msg, view))}
        ${view.isLoading ? renderLoadingSkeleton() : ''}
      </div>
    `;
  }

  // Render grouped by phase with left labels
  return html`
    <div class="history layout-scroll chat-container layout-col">
      ${groups.map((group, i) => html`
        ${i > 0 && group.phase ? renderPhaseSeparator(group.phase) : ''}
        <div class="phase-group ${group.phase ? 'has-phase' : ''}">
          ${group.phase ? html`
            <div class="phase-group-sidebar">
              <div class="phase-group-dot"></div>
              <div class="phase-group-line"></div>
              <span class="phase-group-name">${group.phase}</span>
            </div>
          ` : ''}
          <div class="phase-group-messages">
            ${group.messages.map(msg => renderMessageBubble(msg, view))}
          </div>
        </div>
      `)}
      ${view.isLoading ? renderLoadingSkeleton() : ''}
    </div>
  `;
}

// ─── Agent Status Bar (with sandbox/full toggle) ──────────────
function renderAgentStatusBar(view: IChatView) {
  const agentLabel = view.selectedAgent.charAt(0).toUpperCase() + view.selectedAgent.slice(1);
  const currentAgent = view.availableAgents.find(a => a.name === view.selectedAgent);
  const capabilities = currentAgent?.capabilities || {};
  const capKeys = Object.keys(capabilities);
  const isSandbox = (view.agentPermissions[view.selectedAgent] || 'sandbox') === 'sandbox';
  const hasActivity = !!view.activeActivity;

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

// ─── Attachments ──────────────────────────────────────────
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

// ─── Input Controls ──────────────────────────────────────
function renderInputControls(view: IChatView) {
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

// ─── Input Group ──────────────────────────────────────────
function renderInputGroup(view: IChatView) {
  return html`
    <div class="input-group layout-col">
      ${renderAgentStatusBar(view)}
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
    <div class="chat-layout">
      ${renderSideTimeline(view)}
      ${renderHistory(view)}
    </div>
    ${renderInputGroup(view)}
  `;
}
