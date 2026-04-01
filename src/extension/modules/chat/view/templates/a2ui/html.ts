import { html, TemplateResult, nothing } from 'lit';
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
}

/**
 * Parse A2UI blocks from message text.
 */
export function parseA2UI(text: string): Array<{ type: 'text' | 'a2ui'; content: string; block?: A2UIBlock }> {
  const segments: Array<{ type: 'text' | 'a2ui'; content: string; block?: A2UIBlock }> = [];
  const regex = /<a2ui\s+([^>]*)>([\s\S]*?)<\/a2ui>/gi;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }

    const attrs = match[1];
    const body = match[2].trim();

    const typeMatch = attrs.match(/type="([^"]+)"/);
    const idMatch = attrs.match(/id="([^"]+)"/);
    const labelMatch = attrs.match(/label="([^"]+)"/);

    const options: string[] = [];
    let preselected: number | undefined;
    for (const line of body.split('\n')) {
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
        type: typeMatch?.[1] || 'choice',
        id: idMatch?.[1] || `a2ui-${Date.now()}`,
        label: labelMatch?.[1],
        options,
        preselected,
      }
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  if (segments.length === 1 && segments[0].type === 'text') {
    return [];
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

  // If all answered, show all as resolved (no interactive elements)
  const allResolved = blocks.every(b => answers[b.id] !== undefined);
  if (allResolved) {
    return html`
      <div class="a2ui-sequence">
        ${blocks.map(block => html`
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

  // Find first unresolved block
  const firstUnresolvedIdx = blocks.findIndex(b => answers[b.id] === undefined);

  return html`
    <div class="a2ui-sequence">
      ${blocks.map((block, i) => {
    const isResolved = answers[block.id] !== undefined;
    const isCurrent = i === firstUnresolvedIdx;
    const isLast = blocks.filter(b => answers[b.id] === undefined).length === 1;
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
