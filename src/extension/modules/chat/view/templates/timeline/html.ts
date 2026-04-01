import { html } from 'lit';
import { IChatView, TaskStep } from '../../types.js';

export function renderSideTimeline(view: IChatView) {
  if (!view.showTimeline) { return ''; }

  const isEmpty = view.taskSteps.length === 0;

  return html`
    <div class="side-timeline">
      <div class="side-timeline-header">Workflow</div>
      ${isEmpty ? html`<div class="side-step-label pending" style="padding-left: 18px; font-style: italic;">No active task</div>` : ''}
      ${view.taskSteps.map((step: TaskStep, i: number) => {
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
