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

  const hasInputs = d.inputs && d.inputs.length > 0;
  const hasOutputs = d.outputs && d.outputs.length > 0;
  const hasObjective = d.objective && d.objective.length > 0;
  const hasGate = d.gateRequirements && d.gateRequirements.length > 0;
  const hasContext = d.contextFiles && d.contextFiles.length > 0;
  const hasWorkflow = !!d.workflowId;

  if (!hasWorkflow) {
    return html`
      <div class="details-panel-unified">
        <div class="details-empty">
          <span style="opacity:0.5">No active workflow. Start one with a <code>/command</code>.</span>
        </div>
      </div>
    `;
  }

  return html`
    <div class="details-panel-unified">
      <div class="details-columns">

        <div class="details-col-left">
          <!-- Phase header (lifecycle workflows only) -->
          ${d.currentPhaseLabel
      ? html`
              <div class="details-section-label" style="color:rgba(160,200,255,0.8)">ACTIVE PHASE</div>
              <div class="details-row" style="margin-bottom:10px;">
                <span class="details-agent-name" style="font-size:12px;">${d.currentPhaseLabel}</span>
              </div>
            `
      : ''}

          <!-- OWNER -->
          <div class="details-section-label">OWNER</div>
          <div class="details-row" style="margin-bottom:10px;gap:6px;">
            <span class="details-agent-name">${d.owner?.replace(/-agent$/, '') || '—'}</span>
            ${d.model ? html`<span class="details-tag model">${d.model}</span>` : ''}
          </div>

          <!-- CONTEXT (workflow id + constitutions) -->
          <div class="details-section-label">CONTEXT</div>
          <div class="details-row" style="flex-wrap:wrap;gap:6px;margin-bottom:6px;">
            <span class="details-id">${d.workflowId}</span>
            ${d.severity ? html`<span class="details-tag severity">${d.severity}</span>` : ''}
            ${d.blocking !== undefined ? html`<span class="details-tag ${d.blocking ? 'blocking' : 'nonblocking'}">${d.blocking ? 'Blocking' : 'Non-blocking'}</span>` : ''}
          </div>
          ${hasContext ? html`
            <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:10px;">
              ${d.contextFiles!.map((f: string) => html`
                <div class="details-file-chip">
                  <svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor" style="flex-shrink:0;opacity:0.7"><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/></svg>
                  <span title="${f}">${f}</span>
                </div>`)}
            </div>
          ` : ''}

          <!-- OBJECTIVE -->
          ${hasObjective ? html`
            <div class="details-section-label" style="color:rgba(180,220,160,0.8)">OBJECTIVE</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.65);margin-bottom:10px;line-height:1.4;">
              ${d.objective}
            </div>
          ` : ''}

          <!-- INPUTS / OUTPUTS -->
          ${hasInputs || hasOutputs ? html`
            <div style="display:flex;gap:16px;margin-bottom:10px;">
              ${hasInputs ? html`
                <div style="flex:1;">
                  <div class="details-section-label" style="color:rgba(110,200,232,0.7)">INPUTS</div>
                  ${d.inputs!.map((item: string) => html`
                    <div class="details-file-chip">
                      <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor" style="flex-shrink:0;opacity:0.5"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4 8l4-4v3h4v2H8v3L4 8z"/></svg>
                      <span title="${item}">${item}</span>
                    </div>
                  `)}
                </div>
              ` : ''}
              ${hasOutputs ? html`
                <div style="flex:1;">
                  <div class="details-section-label" style="color:rgba(160,232,110,0.7)">OUTPUTS</div>
                  ${d.outputs!.map((item: string) => html`
                    <div class="details-file-chip">
                      <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor" style="flex-shrink:0;opacity:0.5"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4 8l4 4V9h4V7H8V4L4 8z"/></svg>
                      <span title="${item}">${item}</span>
                    </div>
                  `)}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <div class="details-separator"></div>

        <!-- Right column: GATE, PASS, FAIL -->
        <div class="details-col-right">
          <div class="details-section-label" style="color:rgba(232,197,110,0.7)">GATE</div>
          <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:12px;">
            ${hasGate
      ? d.gateRequirements!.map((req: string) => html`
                <div class="details-gate-req"><span class="gate-check">☐</span><span title="${req}">${req}</span></div>`)
      : html`<span class="details-tag dim">no gate defined</span>`
    }
          </div>

          <div class="details-next-sep"></div>

          <!-- PASS -->
          <div class="details-section-label" style="color:rgba(110,232,160,0.7);margin-top:10px;">PASS →</div>
          ${d.passTarget
      ? html`<div class="details-next-step"><span class="details-next-num">→</span><span class="details-next-label">${d.passTarget}</span></div>`
      : d.nextStep
        ? html`<div class="details-next-step"><span class="details-next-num">Step ${d.nextStepIndex}</span><span class="details-next-label">${d.nextStep}</span></div>`
        : html`<span class="details-tag dim">${total > 0 ? 'all steps completed' : 'no pass target'}</span>`
    }

          <!-- FAIL -->
          <div class="details-section-label" style="color:rgba(232,110,110,0.7);margin-top:10px;">FAIL ✗</div>
          ${d.failBehavior
      ? html`<div class="details-next-step"><span class="details-next-num">✗</span><span class="details-next-label">${d.failBehavior}</span></div>`
      : html`<span class="details-tag dim">no fail behavior defined</span>`
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
