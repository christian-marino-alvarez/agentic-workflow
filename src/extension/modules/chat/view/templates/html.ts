import { html, TemplateResult } from 'lit';
import { IChatView } from '../types.js';

import { renderHeader } from './header/html.js';
import { renderDetailsPanel } from './details/html.js';
import { renderSideTimeline } from './timeline/html.js';
import { renderHistory } from './history/html.js';
import { renderInputGroup, renderAgentStatusBar } from './input/html.js';

// ─── Main Render ──────────────────────────────────────────
export function render(view: IChatView): TemplateResult {
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
