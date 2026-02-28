import { html, TemplateResult } from 'lit';
import { IChatView } from '../types.js';

import { renderHeader } from './header/html.js';
import { renderDetailsPanel } from './details/html.js';
import { renderSideTimeline } from './timeline/html.js';
import { renderHistory } from './history/html.js';
import { renderInputGroup, renderAgentStatusBar } from './input/html.js';
import { renderWelcome } from './welcome/html.js';

// ─── Main Render ──────────────────────────────────────────
export function render(view: IChatView): TemplateResult {
  if (view.showWelcome) {
    return html`
      ${renderHeader(view)}
      ${renderWelcome(view)}
    `;
  }

  return html`
    ${renderHeader(view)}
    ${renderDetailsPanel(view)}
    ${renderAgentStatusBar(view)}
    <div class="chat-layout">
      ${renderSideTimeline(view)}
      ${renderHistory(view)}
    </div>
    ${renderInputGroup(view)}
  `;
}
