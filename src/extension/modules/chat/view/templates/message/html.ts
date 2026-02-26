import { html } from 'lit';
import { IChatView } from '../../types.js';
import { renderMarkdown, getIcon } from '../utils.js';
import { parseA2UI, renderA2UISequence } from '../a2ui/html.js';

export function renderToolEvents(events?: Array<any>) {
  // HIDDEN BY DESIGN:
  // Tool executions are now hidden from UI to preserve conversational experience.
  return '';
}

export function renderDelegationCard(msg: any) {
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

export function renderGateCard(msg: any, view: IChatView) {
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

export function renderMessageBubble(msg: any, view?: IChatView) {
  if (msg.isGate && view) { return renderGateCard(msg, view); }
  if (msg.isDelegation) { return renderDelegationCard(msg); }

  // Custom Empty State / Welcome Card for "No workspace"
  if (msg.role === 'system' && msg.text?.includes('Welcome to Extensio!')) {
    return html`
      <div class="empty-state-card" style="margin: 20px 0; padding: 32px; background: var(--vscode-editorWidget-background, #252526); border: 1px solid var(--vscode-widget-border, #3c3c3c); border-radius: 12px; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
        <div style="margin-bottom: 20px;">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="64" height="64" style="color: var(--vscode-textLink-foreground, #3794ff);">
             <g transform="translate(64, 64)">
               <path d="M -16,-52 C -40,-52 -56,-24 -56,0 C -56,24 -40,52 -16,52" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round"/>
               <path d="M -24,-30 L 30,-30" stroke="currentColor" stroke-width="20" stroke-linecap="round"/>
               <path d="M -30,0 L 20,0" stroke="currentColor" stroke-width="20" stroke-linecap="round"/>
               <path d="M -24,30 L 40,30" stroke="currentColor" stroke-width="20" stroke-linecap="round"/>
             </g>
           </svg>
        </div>
        <h2 style="margin: 0 0 12px 0; font-size: 1.25rem; font-weight: 600; color: var(--vscode-editor-foreground, #cccccc);">
          Welcome to Extensio
        </h2>
        <p style="margin: 0 0 24px 0; font-size: 0.95rem; line-height: 1.5; color: var(--vscode-descriptionForeground, #8a8a8a);">
          Extensio is your agentic workflow system. To get started, please open a folder or workspace in VS Code so the agents have context to work with.
        </p>
        <button style="background: var(--vscode-button-background, #0e639c); color: var(--vscode-button-foreground, #ffffff); border: none; padding: 8px 16px; border-radius: 4px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-size: 13px;"
          @click=${() => view && view.sendMessage('chat', 'OPEN_FOLDER')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M14.5 3L8.2 3 7 1.5 1.5 1.5 1 2v12l.5.5h13l.5-.5V3.5L14.5 3zM14 13.5H2v-11h4.6l1.2 1.5H14v9.5z"/></svg>
          Open Folder
        </button>
      </div>
    `;
  }


  // Error messages: styled as a distinct error card
  if (msg.isError || (msg.role === 'system' && msg.text?.includes('**System Error:**'))) {
    if (msg.text?.includes('Max turns') || msg.text?.includes('exceeded')) {
      return html`
        <div class="msg-bubble msg-system" style="border-left: 3px solid #ffb74d; background: rgba(255, 183, 77, 0.08); margin: 8px 0;">
          <div class="msg-header">
            <span class="msg-icon">⏱️</span>
            <span class="msg-sender" style="color: #ffb74d; font-weight: 600;">Pausa Estratégica</span>
          </div>
          <div class="msg-content markdown-body" style="color: var(--vscode-editor-foreground);">
            <p>El agente lleva un rato pensando y explorando información, así que ha hecho una pausa de seguridad.</p>
            <p>Puedes revisar lo que ha hecho hasta ahora y decirle de continuar cuando estés listo.</p>
            <div style="margin-top: 12px;">
              <button class="btn btn-secondary" style="border: 1px solid rgba(255, 183, 77, 0.5); color: #ffb74d; background: rgba(255, 183, 77, 0.1); padding: 6px 16px; border-radius: 4px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;" 
                      @click=${() => view && view.sendSilentMessage("Sigue trabajando en la tarea, vas por buen camino. Necesito que continúes donde lo dejaste.")}>
                <span>▶</span> Continuar Trabajo
              </button>
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="msg-bubble msg-error" style="border-left: 3px solid #f44336; background: rgba(244, 67, 54, 0.08); margin: 8px 0;">
        <div class="msg-header">
          <span class="msg-icon">⚠️</span>
          <span class="msg-sender" style="color: #f44336; font-weight: 600;">Error</span>
        </div>
        <div class="msg-content markdown-body" style="color: var(--vscode-errorForeground, #f44336);">
          ${renderMarkdown(msg.text)}
        </div>
      </div>
    `;
  }

  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';
  const isAgent = !isUser && !isSystem;

  const typeClass = isUser ? 'msg-user' : (isAgent ? 'msg-agent' : 'msg-system');
  const roleClass = isAgent ? `role-${msg.role}` : '';

  // Check for A2UI components in agent messages
  const msgIndex = view?.history?.indexOf(msg) ?? 0;
  const hasA2UIInStream = isAgent && msg.isStreaming && msg.text && /&lt;a2ui\s|<a2ui\s/i.test(msg.text);
  const a2uiSegments = isAgent && msg.text && !msg.isStreaming ? parseA2UI(msg.text) : [];

  // During streaming: extract text before A2UI tags to show, hide the raw tags
  let streamPreText = '';
  if (hasA2UIInStream && msg.text) {
    const a2uiStart = msg.text.search(/<a2ui\s/i);
    if (a2uiStart > 0) {
      streamPreText = msg.text.slice(0, a2uiStart);
    }
  }

  return html`
    <div class="msg-bubble ${typeClass} ${roleClass}">
      <div class="msg-header">
        <span class="msg-icon ${roleClass}">${getIcon(msg.role)}</span>
        <span class="msg-sender ${roleClass}">
          ${msg.sender} 
          ${msg.status ? html`<span class="msg-status">(${msg.status})</span>` : ''}
        </span>
        ${isAgent && msg.tokenCost ? html`
          <span class="msg-token-cost" title="Input: ${msg.tokenCost.inputTokens.toLocaleString()} · Output: ${msg.tokenCost.outputTokens.toLocaleString()} · Model: ${msg.tokenCost.model}">
            <span class="msg-token-cost-icon">⚡</span>
            <span class="msg-token-cost-value">${msg.tokenCost.cost < 0.001 ? '<$0.001' : `$${msg.tokenCost.cost.toFixed(3)}`
      }</span>
            <span class="msg-token-cost-tokens">${(() => { const t = msg.tokenCost.inputTokens + msg.tokenCost.outputTokens; return t >= 1000 ? `${(t / 1000).toFixed(1)}k` : `${t}`; })()
      }</span>
          </span>
        ` : ''}
      </div>
      <div class="msg-content ${isAgent ? 'markdown-body' : ''}">
        ${renderToolEvents(msg.toolEvents)}
        ${hasA2UIInStream
      ? html`
              ${streamPreText ? renderMarkdown(streamPreText) : ''}
              <div class="a2ui-composing">
                <div class="a2ui-composing-dots">
                  <span></span><span></span><span></span>
                </div>
                <span class="a2ui-composing-text">Composing interactive elements...</span>
              </div>
            `
      : a2uiSegments.length > 0 && view
        ? (() => {
          // Separate text segments and A2UI blocks
          const textParts = a2uiSegments.filter(s => s.type === 'text');
          const a2uiBlocks = a2uiSegments.filter(s => s.type === 'a2ui' && s.block).map(s => s.block!);
          return html`
            ${textParts.map(seg => renderMarkdown(seg.content))}
            ${a2uiBlocks.length > 0 ? renderA2UISequence(a2uiBlocks, view, msg, msgIndex) : ''}
          `;
        })()
        : isAgent && msg.text ? renderMarkdown(msg.text) : msg.text
    }
        ${msg.isStreaming && !hasA2UIInStream ? html`<span class="streaming-cursor"></span>` : ''}
      </div>
    </div>
  `;
}

export function renderLoadingSkeleton() {
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
