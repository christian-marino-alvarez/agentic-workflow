import { html, TemplateResult, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import { IChatView } from '../../types.js';

/**
 * A2UI — Agent-to-UI interactive components.
 * 
 * State lives on the message object (msg.a2uiAnswers, msg.a2uiDismissed).
 * This ensures Lit re-renders always show the correct state.
 * 
 * Flow:
 *   1. First unresolved block is interactive
 *   2. On confirm → answer stored on msg, Lit re-renders, next block appears
 *   3. After last confirm → all answers sent as silent message
 */

export interface A2UIBlock {
  type: string;
  id: string;
  label?: string;
  options: string[];
  preselected?: number;
  path?: string;
  artifactContent?: string;
}

/**
 * Parse A2UI blocks from message text.
 */
export function parseA2UI(text: string): Array<{ type: 'text' | 'a2ui'; content: string; block?: A2UIBlock }> {
  const segments: Array<{ type: 'text' | 'a2ui'; content: string; block?: A2UIBlock }> = [];

  // Quick check: if no a2ui tags at all, return text as-is
  if (!/<a2ui[\s>]/i.test(text)) {
    return [{ type: 'text', content: text }];
  }

  // Use DOMParser to robustly extract <a2ui> elements.
  // Wrap in a container so DOMParser can parse mixed content.
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="__a2ui_root__">${text}</div>`, 'text/html');
  const root = doc.getElementById('__a2ui_root__');
  if (!root) {
    return [{ type: 'text', content: text }];
  }

  // Walk child nodes: text nodes become text segments, <a2ui> elements become blocks
  for (const node of Array.from(root.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName?.toLowerCase() !== 'a2ui')) {
      // Text node or non-a2ui element — preserve as-is
      const content = node.nodeType === Node.TEXT_NODE
        ? node.textContent || ''
        : (node as Element).outerHTML || '';
      if (content.trim()) {
        // Merge with previous text segment if possible
        const last = segments[segments.length - 1];
        if (last && last.type === 'text') {
          last.content += content;
        } else {
          segments.push({ type: 'text', content });
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName?.toLowerCase() === 'a2ui') {
      const el = node as Element;
      const blockType = el.getAttribute('type') || 'choice';
      const id = el.getAttribute('id') || `a2ui-${Date.now()}-${segments.length}`;
      const rawLabel = el.getAttribute('label') || undefined;
      const label = rawLabel?.replace(/\\"/g, '"').replace(/^"|"$/g, '') || undefined;
      const pathAttr = el.getAttribute('path') || undefined;
      const body = (el.textContent || '').trim();

      if (blockType === 'artifact' || ['confirm', 'results', 'chart', 'error', 'warning', 'info', 'gate'].includes(blockType)) {
        // Body-preserving blocks: preserve body as content (don't parse as options)
        segments.push({
          type: 'a2ui',
          content: '',
          block: {
            type: blockType,
            id,
            label,
            path: pathAttr,
            artifactContent: body,
            options: [],
          }
        });
      } else {
        // Choice/gate blocks: parse checkbox-style options from body
        const options: string[] = [];
        let preselected: number | undefined;

        // Normalize literal \n escapes to real newlines
        const normalizedBody = body.replace(/\\n/g, '\n');
        for (const line of normalizedBody.split('\n')) {
          const optMatch = line.match(/^-\s*\[([ xX])\]\s*(.+)$/);
          if (optMatch) {
            options.push(optMatch[2].trim());
            if (optMatch[1].toLowerCase() === 'x') {
              preselected = options.length - 1;
            }
          }
        }

        segments.push({
          type: 'a2ui',
          content: '',
          block: {
            type: blockType,
            id,
            label,
            options,
            preselected,
          }
        });
      }
    }
  }

  // Ensure we always return at least one segment
  if (segments.length === 0) {
    return [{ type: 'text', content: text }];
  }

  return segments;
}

export function hasA2UI(text: string): boolean {
  return /<a2ui\s+/i.test(text);
}

/**
 * Render A2UI sequence. Reads state from `msg` object.
 * @param blocks - parsed A2UI blocks
 * @param view - chat view reference
 * @param msg - the message object (state is stored here)
 * @param msgIndex - index in history
 */
export function renderA2UISequence(blocks: A2UIBlock[], view: IChatView, msg: any, msgIndex: number): TemplateResult {
  const answers: Record<string, string> = msg.a2uiAnswers || {};
  const dismissed = msg.a2uiDismissed === true;

  // Separate artifact, display-only, and interactive blocks
  const artifactBlocks = blocks.filter(b => b.type === 'artifact');
  const displayBlocks = blocks.filter(b => isDisplayBlock(b.type));
  const interactiveBlocks = blocks.filter(b => b.type !== 'artifact' && !isDisplayBlock(b.type));

  // If dismissed, show nothing
  if (dismissed) {
    return html`
      <div class="a2ui-card a2ui-dismissed">
        <div class="a2ui-result a2ui-result-dismissed">
          <span class="a2ui-result-icon">✘</span> Cancelled
        </div>
      </div>
    `;
  }

  // Check if all interactive blocks resolved
  const allResolved = interactiveBlocks.length === 0 || interactiveBlocks.every(b => answers[b.id] !== undefined);

  // Render artifact and display blocks (always shown, independent of interactive flow)
  const artifactCards = artifactBlocks.map(block => renderArtifactCard(block));
  const displayCards = displayBlocks.map(block => renderDisplayBlock(block, view, msg, msgIndex));

  if (allResolved && interactiveBlocks.length > 0) {
    return html`
      <div class="a2ui-sequence">
        ${artifactCards}
        ${displayCards}
        ${interactiveBlocks.map(block => html`
          <div class="a2ui-card a2ui-completed">
            <div class="a2ui-result">
              <span class="a2ui-result-icon">✔</span>
              <strong>${block.label || block.id}:</strong> ${answers[block.id]}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  // Find first unresolved interactive block
  const firstUnresolvedIdx = interactiveBlocks.findIndex(b => answers[b.id] === undefined);

  return html`
    <div class="a2ui-sequence">
      ${artifactCards}
      ${displayCards}
      ${interactiveBlocks.map((block, i) => {
    const isResolved = answers[block.id] !== undefined;
    const isCurrent = i === firstUnresolvedIdx;
    const isLast = interactiveBlocks.filter(b => answers[b.id] === undefined).length === 1;
    const blockId = `a2ui-${block.id}-${msgIndex}`;

    if (isResolved) {
      return html`
            <div class="a2ui-card a2ui-completed">
              <div class="a2ui-result">
                <span class="a2ui-result-icon">✔</span>
                <strong>${block.label || block.id}:</strong> ${answers[block.id]}
              </div>
            </div>
          `;
    }

    if (isCurrent) {
      // Active block — interaction happens in the input area
      return html`
            <div class="a2ui-card a2ui-active" id="${blockId}">
              <div class="a2ui-label">${block.label || block.id}</div>
              <div class="a2ui-pending-hint">↓ Select below</div>
            </div>
          `;
    }

    // Pending — not yet reachable
    return html`
          <div class="a2ui-card a2ui-pending">
            <div class="a2ui-label">${block.label || block.id}</div>
          </div>
        `;
  })}
    </div>
  `;
}

/**
 * Confirm handler — updates msg state and triggers Lit re-render.
 */
function handleConfirm(e: Event, block: A2UIBlock, blockId: string, allBlocks: A2UIBlock[], view: IChatView, msg: any, msgIndex: number, isLast: boolean) {
  const card = (e.target as HTMLElement).closest('.a2ui-card');
  if (!card) {
    return;
  }

  const selected = card.querySelector(`input[name="${blockId}"]:checked`) as HTMLInputElement;
  if (!selected) {
    card.classList.add('a2ui-shake');
    setTimeout(() => card.classList.remove('a2ui-shake'), 500);
    return;
  }

  const value = selected.value;

  // Store answer ON the message object (Lit-compatible state)
  if (!msg.a2uiAnswers) {
    msg.a2uiAnswers = {};
  }
  msg.a2uiAnswers[block.id] = value;

  if (isLast) {
    // All done — send silently
    const parts: string[] = [];
    for (const b of allBlocks) {
      const ans = msg.a2uiAnswers[b.id];
      if (ans) {
        parts.push(`${b.label || b.id}: ${ans}`);
      }
    }
    view.sendSilentMessage(parts.join('\n'));
  }

  // Trigger Lit re-render by mutating history reference
  const historyCopy = [...(view as any).history];
  historyCopy[msgIndex] = { ...historyCopy[msgIndex], a2uiAnswers: { ...msg.a2uiAnswers } };
  (view as any).history = historyCopy;
}

/**
 * Cancel handler — marks entire sequence as dismissed.
 */
function handleCancel(view: IChatView, msg: any, msgIndex: number) {
  msg.a2uiDismissed = true;
  const historyCopy = [...(view as any).history];
  historyCopy[msgIndex] = { ...historyCopy[msgIndex], a2uiDismissed: true };
  (view as any).history = historyCopy;
}

/**
 * Render an artifact block as a collapsible card.
 * Shows file icon + label + path, click to expand and view the content.
 */
function renderArtifactCard(block: A2UIBlock): TemplateResult {
  const fileName = block.label || block.path?.split('/').pop() || 'Document';
  const filePath = block.path || '';

  // Render artifact content as markdown
  let renderedContent: ReturnType<typeof unsafeHTML> | string = '';
  if (block.artifactContent) {
    try {
      renderedContent = unsafeHTML(marked.parse(block.artifactContent) as string);
    } catch {
      renderedContent = block.artifactContent;
    }
  }

  return html`
    <div class="a2ui-artifact-card">
      <div class="a2ui-artifact-header">
        <span class="a2ui-artifact-icon">📄</span>
        <span class="a2ui-artifact-info">
          <span class="a2ui-artifact-name">${fileName}</span>
          ${filePath ? html`<span class="a2ui-artifact-path file-link" data-file-path="${filePath}" title="Click to open in editor">${filePath}</span>` : ''}
        </span>
        ${filePath ? html`
          <button class="a2ui-artifact-open file-link" data-file-path="${filePath}" title="Open in editor">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/></svg>
            Open
          </button>
        ` : ''}
      </div>
      ${block.artifactContent ? html`
        <details class="a2ui-artifact-details" open>
          <summary class="a2ui-artifact-expand">
            <span class="a2ui-artifact-toggle">▶</span> Preview
          </summary>
          <div class="a2ui-artifact-content markdown-body">
            ${renderedContent}
            ${filePath ? html`<p class="a2ui-artifact-more-hint">… click <em>Open</em> to view the full document</p>` : nothing}
          </div>
        </details>
      ` : ''}
    </div>
  `;
}

// ─── New display-only block types ────────────────────────────────────────────

/** Confirm block — SI/NO decision. Usage: <a2ui type="confirm" id="..." label="Title">Body</a2ui> */
export function renderA2UIConfirm(block: A2UIBlock, view: IChatView, msg: any, msgIndex: number): TemplateResult {
  const answered = msg.a2uiAnswers?.[block.id];
  if (answered) {
    return html`
      <div class="a2ui-confirm-card">
        <div class="a2ui-confirm-header">
          <span class="a2ui-confirm-icon">${answered === 'SI' ? '✅' : '❌'}</span>
          <span class="a2ui-confirm-title">${block.label || block.id}</span>
        </div>
        <div class="a2ui-result"><strong>${answered}</strong></div>
      </div>
    `;
  }
  const doConfirm = (val: string) => {
    if (!msg.a2uiAnswers) { msg.a2uiAnswers = {}; }
    msg.a2uiAnswers[block.id] = val;
    view.sendSilentMessage(`${block.label || block.id}: ${val}`);
    const copy = [...(view as any).history];
    copy[msgIndex] = { ...copy[msgIndex], a2uiAnswers: { ...msg.a2uiAnswers } };
    (view as any).history = copy;
  };
  return html`
    <div class="a2ui-confirm-card">
      <div class="a2ui-confirm-header">
        <span class="a2ui-confirm-icon">❓</span>
        <span class="a2ui-confirm-title">${block.label || block.id}</span>
      </div>
      ${block.artifactContent ? html`<div class="a2ui-confirm-body">${block.artifactContent}</div>` : nothing}
      <div class="a2ui-confirm-actions">
        <button class="a2ui-confirm-btn a2ui-confirm-btn-yes" @click=${() => doConfirm('SI')}>SI</button>
        <button class="a2ui-confirm-btn a2ui-confirm-btn-no"  @click=${() => doConfirm('NO')}>NO</button>
      </div>
    </div>
  `;
}

/**
 * Results block — document presentation with stats and acceptance criteria.
 * Usage: <a2ui type="results" label="Title">
 * @Files modified: 3
 * - [x] Criterion met
 * - [ ] Criterion pending
 * </a2ui>
 */
export function renderA2UIResults(block: A2UIBlock): TemplateResult {
  const stats: { k: string; v: string }[] = [];
  const criteria: { text: string; pass: boolean }[] = [];

  for (const line of (block.artifactContent || '').split('\n').map(l => l.trim()).filter(Boolean)) {
    if (line.startsWith('@')) {
      const [k, ...rest] = line.slice(1).split(':');
      stats.push({ k: k.trim(), v: rest.join(':').trim() });
    } else {
      const m = line.match(/^-\s*\[([ xX])\]\s*(.+)$/);
      if (m) { criteria.push({ text: m[2].trim(), pass: m[1].toLowerCase() === 'x' }); }
    }
  }

  const isPass = criteria.length > 0 ? criteria.every(c => c.pass) : true;
  const filePath = block.path || '';

  return html`
    <div class="a2ui-results-card">
      <div class="a2ui-results-header">
        <span class="a2ui-results-icon">📋</span>
        <span class="a2ui-results-title">${block.label || 'Results'}</span>
        ${filePath ? html`
          <button class="a2ui-results-open-btn file-link" data-file-path="${filePath}" title="Open document in editor">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/></svg>
            Ver documento
          </button>
        ` : nothing}
        <span class="a2ui-results-badge ${isPass ? 'a2ui-results-badge-pass' : 'a2ui-results-badge-fail'}">
          ${isPass ? '✓ PASS' : '✗ FAIL'}
        </span>
      </div>
      <div class="a2ui-results-body">
        ${stats.length > 0 ? html`
          <div class="a2ui-results-row">
            ${stats.map(s => html`
              <div class="a2ui-results-stat">
                <div class="a2ui-results-stat-label">${s.k}</div>
                <div class="a2ui-results-stat-value">${s.v}</div>
              </div>
            `)}
          </div>
        ` : nothing}
        ${criteria.length > 0 ? html`
          <div class="a2ui-results-criteria">
            ${criteria.map(c => html`
              <div class="a2ui-results-criterion">
                <span class="${c.pass ? 'a2ui-results-criterion-pass' : 'a2ui-results-criterion-fail'}">
                  ${c.pass ? '✅' : '❌'}
                </span>
                ${c.text}
              </div>
            `)}
          </div>
        ` : nothing}
        ${filePath ? html`<div class="a2ui-results-path"><span class="a2ui-results-path-label">📂</span> ${filePath}</div>` : nothing}
      </div>
    </div>
  `;
}

/**
 * Chart block — horizontal bar chart. Usage: <a2ui type="chart" label="Title">
 * Label A: 75 %
 * Label B: 42
 * </a2ui>
 */
export function renderA2UIChart(block: A2UIBlock): TemplateResult {
  const rows: { label: string; value: number; unit: string }[] = [];
  for (const line of (block.artifactContent || '').split('\n')) {
    const m = line.match(/^(.+?):\s*([\d.]+)\s*(.*)$/);
    if (m) { rows.push({ label: m[1].trim(), value: parseFloat(m[2]), unit: m[3].trim() }); }
  }
  const max = Math.max(...rows.map(r => r.value), 1);

  return html`
    <div class="a2ui-chart-card">
      <div class="a2ui-chart-title">${block.label || 'Statistics'}</div>
      <div class="a2ui-chart-bars">
        ${rows.map(row => html`
          <div class="a2ui-chart-row">
            <div class="a2ui-chart-label">${row.label}</div>
            <div class="a2ui-chart-bar-track">
              <div class="a2ui-chart-bar-fill" style="width:${(row.value / max * 100).toFixed(1)}%"></div>
            </div>
            <div class="a2ui-chart-value">${row.value}${row.unit ? ' ' + row.unit : ''}</div>
          </div>
        `)}
      </div>
    </div>
  `;
}

/** Error alert. Usage: <a2ui type="error" label="Title">Body</a2ui> */
export function renderA2UIError(block: A2UIBlock): TemplateResult {
  return html`
    <div class="a2ui-error-card">
      <span class="a2ui-error-icon">🚨</span>
      <div class="a2ui-error-content">
        ${block.label ? html`<div class="a2ui-error-title">${block.label}</div>` : nothing}
        <div class="a2ui-error-body">${block.artifactContent || ''}</div>
      </div>
    </div>
  `;
}

/** Warning alert. Usage: <a2ui type="warning" label="Title">Body</a2ui> */
export function renderA2UIWarning(block: A2UIBlock): TemplateResult {
  return html`
    <div class="a2ui-warning-card">
      <span class="a2ui-warning-icon">⚠️</span>
      <div class="a2ui-warning-content">
        ${block.label ? html`<div class="a2ui-warning-title">${block.label}</div>` : nothing}
        <div class="a2ui-warning-body">${block.artifactContent || ''}</div>
      </div>
    </div>
  `;
}

/** Info block. Usage: <a2ui type="info" label="Title">Body</a2ui> */
export function renderA2UIInfo(block: A2UIBlock): TemplateResult {
  return html`
    <div class="a2ui-info-card">
      <span class="a2ui-info-icon">ℹ️</span>
      <div class="a2ui-info-content">
        ${block.label ? html`<div class="a2ui-info-title">${block.label}</div>` : nothing}
        <div class="a2ui-info-body">${block.artifactContent || ''}</div>
      </div>
    </div>
  `;
}

/** Display-only types — rendered immediately, bypass interactive flow */
const DISPLAY_TYPES = new Set(['confirm', 'results', 'chart', 'error', 'warning', 'info']);

export function isDisplayBlock(type: string): boolean {
  return DISPLAY_TYPES.has(type);
}

export function renderDisplayBlock(block: A2UIBlock, view: IChatView, msg: any, msgIndex: number): TemplateResult {
  switch (block.type) {
    case 'confirm': return renderA2UIConfirm(block, view, msg, msgIndex);
    case 'results': return renderA2UIResults(block);
    case 'chart': return renderA2UIChart(block);
    case 'error': return renderA2UIError(block);
    case 'warning': return renderA2UIWarning(block);
    case 'info': return renderA2UIInfo(block);
    default: return html``;
  }
}
