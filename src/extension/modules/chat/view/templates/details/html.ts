import { html, nothing, TemplateResult } from 'lit';
import { IChatView, TaskStep } from '../../types.js';
import { formatTimer } from '../utils.js';

// ─── SVG Icons ─────────────────────────────────────────────
const fileIcon = html`<svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor" style="flex-shrink:0;opacity:0.7"><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/></svg>`;
const inputIcon = html`<svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor" style="flex-shrink:0;opacity:0.5"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4 8l4-4v3h4v2H8v3L4 8z"/></svg>`;
const outputIcon = html`<svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor" style="flex-shrink:0;opacity:0.5"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4 8l4 4V9h4V7H8V4L4 8z"/></svg>`;

// ─── Section: Header (always visible) ──────────────────────
function renderHeader(d: any) {
  return html`
    <div class="details-header-section">
      ${d.currentPhaseLabel ? html`
        <div class="details-section-label" style="color:rgba(160,200,255,0.8)">ACTIVE PHASE</div>
        <div class="details-row" style="margin-bottom:8px;">
          <span class="details-agent-name" style="font-size:12px;">${d.currentPhaseLabel}</span>
        </div>
      ` : nothing}

      <div class="details-section-label">OWNER</div>
      <div class="details-row" style="margin-bottom:8px;gap:6px;">
        <span class="details-agent-name">${d.owner?.replace(/-agent$/, '') || '—'}</span>
        ${d.model ? html`<span class="details-tag model">${d.model}</span>` : nothing}
      </div>

      <div class="details-section-label">WORKFLOW</div>
      <div class="details-row" style="flex-wrap:wrap;gap:6px;">
        <span class="details-id">${d.workflowId}</span>
        ${d.type ? html`<span class="details-tag type">${d.type}</span>` : nothing}
      </div>
    </div>
  `;
}

// ─── Section: Constitutions ────────────────────────────────
function renderConstitutions(files: string[]) {
  if (!files?.length) { return nothing; }
  return html`
    <details class="details-collapse">
      <summary class="details-collapse-label" style="color:rgba(200,160,232,0.8)">
        CONSTITUTIONS <span class="details-collapse-count">(${files.length})</span>
      </summary>
      <div class="details-collapse-content">
        ${files.map(f => html`
          <div class="details-file-chip">${fileIcon}<span title="${f}">${f}</span></div>
        `)}
      </div>
    </details>
  `;
}

// ─── Section: Objective ────────────────────────────────────
function renderObjective(objective: string | undefined) {
  if (!objective?.length) { return nothing; }
  return html`
    <details class="details-collapse" open>
      <summary class="details-collapse-label" style="color:rgba(180,220,160,0.8)">OBJECTIVE</summary>
      <div class="details-collapse-content">
        <div style="font-size:11px;color:rgba(255,255,255,0.65);line-height:1.4;">
          ${objective}
        </div>
      </div>
    </details>
  `;
}

// ─── Section: Instructions ─────────────────────────────────
function renderInstructions(instructions: string | undefined) {
  if (!instructions) { return nothing; }
  return html`
    <details class="details-collapse">
      <summary class="details-collapse-label" style="color:rgba(160,200,255,0.6)">INSTRUCTIONS</summary>
      <div class="details-collapse-content">
        <div style="font-size:10px;color:rgba(255,255,255,0.5);line-height:1.4;">
          ${instructions}
        </div>
      </div>
    </details>
  `;
}

// ─── Section: Inputs / Outputs ─────────────────────────────
function renderInputsOutputs(inputs: string[] | undefined, outputs: string[] | undefined) {
  const hasInputs = inputs && inputs.length > 0;
  const hasOutputs = outputs && outputs.length > 0;
  if (!hasInputs && !hasOutputs) { return nothing; }

  return html`
    <details class="details-collapse">
      <summary class="details-collapse-label" style="color:rgba(110,200,232,0.7)">INPUTS / OUTPUTS</summary>
      <div class="details-collapse-content">
        ${hasInputs ? html`
          <div style="margin-bottom:8px;">
            <div class="details-section-label" style="color:rgba(110,200,232,0.7);margin-bottom:4px;">INPUTS</div>
            ${inputs!.map(item => html`
              <div class="details-file-chip">${inputIcon}<span title="${item}">${item}</span></div>
            `)}
          </div>
        ` : nothing}
        ${hasOutputs ? html`
          <div>
            <div class="details-section-label" style="color:rgba(160,232,110,0.7);margin-bottom:4px;">OUTPUTS</div>
            ${outputs!.map(item => html`
              <div class="details-file-chip">${outputIcon}<span title="${item}">${item}</span></div>
            `)}
          </div>
        ` : nothing}
      </div>
    </details>
  `;
}

// ─── Section: Gate / Transitions ───────────────────────────
function renderGateTransitions(d: any, total: number) {
  const hasGate = d.gateRequirements && d.gateRequirements.length > 0;

  return html`
    <details class="details-collapse">
      <summary class="details-collapse-label" style="color:rgba(232,197,110,0.7)">GATE / TRANSITIONS</summary>
      <div class="details-collapse-content">
        <div class="details-section-label" style="color:rgba(232,197,110,0.7)">GATE</div>
        <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:12px;">
          ${hasGate
      ? d.gateRequirements!.map((req: string) => html`
                <div class="details-gate-req"><span class="gate-check">☐</span><span title="${req}">${req}</span></div>`)
      : html`<span class="details-tag dim">no gate defined</span>`}
        </div>

        <div class="details-next-sep"></div>

        <div class="details-section-label" style="color:rgba(110,232,160,0.7);margin-top:10px;">PASS →</div>
        ${renderPassTarget(d, total)}

        <div class="details-section-label" style="color:rgba(232,110,110,0.7);margin-top:10px;">FAIL ✗</div>
        ${d.fail
      ? html`<div class="details-next-step"><span class="details-next-num">✗</span><span class="details-next-label">${d.fail.behavior}</span></div>`
      : html`<span class="details-tag dim">no fail behavior defined</span>`}
      </div>
    </details>
  `;
}

function renderPassTarget(d: any, total: number) {
  if (d.pass?.nextTarget) {
    return html`<div class="details-next-step"><span class="details-next-num">→</span><span class="details-next-label">${d.pass.nextTarget}</span></div>`;
  }
  if (d.nextStep) {
    return html`<div class="details-next-step"><span class="details-next-num">Step ${d.nextStepIndex}</span><span class="details-next-label">${d.nextStep}</span></div>`;
  }
  return html`<span class="details-tag dim">${total > 0 ? 'all steps completed' : 'no pass target'}</span>`;
}

// ─── Section: Footer ───────────────────────────────────────
function renderFooter(elapsedStr: string, workflowId: string, activeStep: TaskStep | undefined, activeIdx: number, total: number) {
  return html`
    <div class="details-footer">
      <span>Running ${elapsedStr}</span>
      <span class="details-footer-sep">·</span>
      <span>Status: <strong>${workflowId ? 'executing' : 'idle'}</strong></span>
      ${activeStep ? html`<span class="details-footer-sep">·</span><span>${activeIdx} of ${total} — ${activeStep.label}</span>` : nothing}
    </div>
  `;
}

// ─── Main Export ───────────────────────────────────────────
export function renderDetailsPanel(view: IChatView): TemplateResult | string {
  if (!view.showDetails) { return ''; }

  const d = view.workflowDetails;
  const elapsedStr = formatTimer(view.elapsedSeconds);
  const activeStep = view.taskSteps.find((s: TaskStep) => s.status === 'active');
  const total = view.taskSteps.length;
  const activeIdx = activeStep ? view.taskSteps.indexOf(activeStep) + 1 : 0;

  if (!d.workflowId) {
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
      ${renderHeader(d)}
      ${renderConstitutions(d.contextFiles || [])}
      ${renderObjective(d.objective)}
      ${renderInstructions(d.instructions)}
      ${renderInputsOutputs(d.inputs, d.outputs)}
      ${renderGateTransitions(d, total)}
      ${renderFooter(elapsedStr, d.workflowId, activeStep, activeIdx, total)}
    </div>
  `;
}
