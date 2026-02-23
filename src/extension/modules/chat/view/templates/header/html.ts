import { html } from 'lit';
import { IChatView, TaskStep } from '../../types.js';
import { formatTimer } from '../utils.js';

export function renderHeader(view: IChatView) {
  const done = view.taskSteps.filter((s: TaskStep) => s.status === 'done').length;
  const total = view.taskSteps.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const activeStep = view.taskSteps.find((s: TaskStep) => s.status === 'active');
  const activeStepIdx = activeStep ? view.taskSteps.indexOf(activeStep) + 1 : 0;
  const hasWorkflow = total > 0 || !!view.workflowDetails.workflowId;

  return html`
    <div class="header layout-col">
      <div class="header-top layout-row">
        <div class="workflow-info">
          <svg width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#3794ff">
            <path d="M13.5 1H11V2H13.5C14.3284 2 15 2.67157 15 3.5V13.5C15 14.3284 14.3284 15 13.5 15H2.5C1.67157 15 1 14.3284 1 13.5V3.5C1 2.67157 1.67157 2 2.5 2H5V1H2.5C1.11929 1 0 2.11929 0 3.5V13.5C0 14.8807 1.11929 16 2.5 16H13.5C14.8807 16 16 14.8807 16 13.5V3.5C16 2.11929 14.8807 1 13.5 1ZM6 1H10V3H6V1ZM3 6H13V7H3V6ZM3 9H13V10H3V9ZM3 12H10V13H3V12Z"/>
          </svg>
          <span class="workflow-label">${view.activeWorkflow}</span>
          <button class="btn-icon header-new-task" title="New Task" @click=${(e: Event) => { e.stopPropagation(); view.newSession(); }}>+</button>
        </div>
        <div class="actions-group">
          <span class="agent-timer ${view.activeActivity ? 'running' : ''}" title="Execution time">⏱ ${formatTimer(view.elapsedSeconds)}</span>

          <!-- Progress pill: toggles the side column timeline -->
          <button class="header-pill-btn ${view.showTimeline ? 'active' : ''}"
            title="${view.showTimeline ? 'Hide step panel' : 'Show step panel'}"
            @click=${() => view.toggleTimeline()}>
            <span class="progress-bar-track">
              <span class="progress-bar-fill" style="width: ${pct}%"></span>
            </span>
            <span class="progress-text">${pct}%</span>
          </button>

          <!-- Details button: toggles the horizontal info panel -->
          <button class="header-pill-btn details-btn ${view.showDetails ? 'active' : ''}"
            title="${view.showDetails ? 'Hide workflow details' : 'Show workflow details'}"
            @click=${() => view.toggleDetails()}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1a6 6 0 1 1 0 12A6 6 0 0 1 8 2zm0 2.5a.75.75 0 1 0 0 1.5A.75.75 0 0 0 8 4.5zM7.25 7h1.5v4.5h-1.5V7z"/>
            </svg>
            Details
            <svg class="timeline-chevron ${view.showDetails ? 'open' : ''}" width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 11L3 6h10z"/>
            </svg>
          </button>
        </div>
      </div>
      ${activeStep ? html`<div class="active-step-hint">▸ Step ${activeStepIdx}/${total} · ${activeStep.label}</div>` : ''}
    </div>
  `;
}
