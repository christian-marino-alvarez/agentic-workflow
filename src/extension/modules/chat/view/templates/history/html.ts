import { html } from 'lit';
import { IChatView } from '../../types.js';
import { renderMessageBubble } from '../message/html.js';

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

export function renderHistory(view: IChatView) {
  if (view.initialLoading) {
    return html`<div class="history layout-scroll chat-container layout-col">${renderActivityIndicator(view)}</div>`;
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
        ${(view.isLoading || view.activeActivity) ? renderActivityIndicator(view) : ''}
      </div>
    `;
  }

  // Render grouped by phase with left labels
  return html`
    <div class="history layout-scroll chat-container layout-col">
      ${groups.map((group, i) => html`
        ${group.phase ? renderPhaseSeparator(group.phase) : ''}
        <div class="phase-group ${group.phase ? 'has-phase' : ''}">
          ${group.phase ? html`
            <div class="phase-group-sidebar">
              <div class="phase-group-dot"></div>
              <div class="phase-group-line"></div>
            </div>
          ` : ''}
          <div class="phase-group-messages">
            ${group.messages.map(msg => renderMessageBubble(msg, view))}
            ${(view.isLoading || view.activeActivity) && i === groups.length - 1 ? renderActivityIndicator(view) : ''}
          </div>
        </div>
      `)}
      ${(view.isLoading || view.activeActivity) && groups.length === 0 ? renderActivityIndicator(view) : ''}
    </div>
  `;
}

function renderActivityIndicator(view: IChatView) {
  const activity = view.activeActivity || 'Thinking...';
  return html`
    <div class="activity-indicator" style="padding-left: 0;">
      <span class="activity-dot"></span>
      <span class="activity-text">${activity}</span>
    </div>
  `;
}
