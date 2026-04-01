import { html } from 'lit';
import { IChatView, TaskStep } from '../../types.js';
import { formatTimer } from '../utils.js';

export function renderDetailsPanel(view: IChatView) {
  if (!view.showDetails) { return ''; }
  const d = view.workflowDetails;
  const elapsedStr = formatTimer(view.elapsedSeconds);
  const activeStep = view.taskSteps.find((s: TaskStep) => s.status === 'active');
  const total = view.taskSteps.length;
  const activeIdx = activeStep ? view.taskSteps.indexOf(activeStep) + 1 : 0;

  return html`
    <div class="details-panel-unified">
      <div class="details-columns">

        <div class="details-col-left">
          <div class="details-section-label">WORKFLOW CONTEXT</div>
          <div class="details-row" style="flex-wrap:wrap;gap:6px;margin-bottom:10px;">
            <span class="details-id">${d.workflowId || '—'}</span>
            ${d.severity ? html`<span class="details-tag severity">${d.severity}</span>` : ''}
            ${d.blocking !== undefined ? html`<span class="details-tag ${d.blocking ? 'blocking' : 'nonblocking'}">${d.blocking ? 'Blocking' : 'Non-blocking'}</span>` : ''}
          </div>

          <div class="details-section-label">ACTIVE AGENT</div>
          <div class="details-row" style="margin-bottom:10px;gap:6px;">
            <span class="details-agent-name">${d.owner?.replace(/-agent$/, '') || '—'}</span>
            ${d.model ? html`<span class="details-tag model">${d.model}</span>` : ''}
          </div>

          <div class="details-section-label">CONTEXT FILES</div>
          <div style="display:flex;flex-direction:column;gap:3px;">
            ${d.contextFiles && d.contextFiles.length > 0
      ? d.contextFiles.map((f: string) => html`
                <div class="details-file-chip">
                  <svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor" style="flex-shrink:0;opacity:0.7"><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/></svg>
                  <span title="${f}">${f.split('/').slice(-2).join('/')}</span>
                </div>`)
      : html`<span class="details-tag dim">no context loaded</span>`
    }
          </div>
        </div>

        <div class="details-separator"></div>

        <div class="details-col-right">
          <div class="details-section-label" style="color:rgba(232,197,110,0.7)">GATE REQUIREMENTS</div>
          <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:12px;">
            ${d.gateRequirements && d.gateRequirements.length > 0
      ? d.gateRequirements.map((req: string) => html`
                <div class="details-gate-req"><span class="gate-check">☐</span><span title="${req}">${req}</span></div>`)
      : html`<span class="details-tag dim">no gate defined</span>`
    }
          </div>

          <div class="details-next-sep"></div>

          <div class="details-section-label" style="color:rgba(110,200,232,0.7);margin-top:10px;">NEXT STEP</div>
          ${d.passTarget
      ? html`<div class="details-next-step"><span class="details-next-num">→</span><span class="details-next-label">${d.passTarget}</span></div>`
      : d.nextStep
        ? html`<div class="details-next-step"><span class="details-next-num">Step ${d.nextStepIndex}</span><span class="details-next-label">${d.nextStep}</span></div>`
        : html`<span class="details-tag dim">${total > 0 ? 'all steps completed' : 'no workflow loaded'}</span>`
    }
        </div>
      </div>

      <div class="details-footer">
        <span>Running ${elapsedStr}</span>
        <span class="details-footer-sep">·</span>
        <span>Status: <strong>${d.workflowId ? 'executing' : 'idle'}</strong></span>
        ${activeStep ? html`<span class="details-footer-sep">·</span><span>${activeIdx} of ${total} — ${activeStep.label}</span>` : ''}
      </div>
    </div>
  `;
}
