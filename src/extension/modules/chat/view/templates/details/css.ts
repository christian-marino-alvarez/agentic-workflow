import { css } from 'lit';

export const detailsStyles = css`
    /* ─── Details Panel ──────────────────────────────────────── */
    .details-panel-unified {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 14px 20px;
      border-bottom: 1px solid var(--vscode-widget-border);
      background: color-mix(in srgb, var(--vscode-editor-background) 95%, var(--vscode-sideBar-background) 5%);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
      animation: slideDownPanel 0.25s ease;
      flex-shrink: 0;
      max-height: 50vh;
      overflow-y: auto;
    }

    @keyframes slideDownPanel {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .details-header-section {
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .details-collapse {
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }

    .details-collapse-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      cursor: pointer;
      padding: 6px 0;
      list-style: none;
      display: flex;
      align-items: center;
      gap: 6px;
      user-select: none;
      opacity: 0.85;
    }

    .details-collapse-label:hover {
      opacity: 1;
    }

    .details-collapse-label::before {
      content: '▸';
      font-size: 10px;
      transition: transform 0.15s ease;
      flex-shrink: 0;
    }

    .details-collapse[open] > .details-collapse-label::before {
      transform: rotate(90deg);
    }

    /* Hide default marker in webkit browsers */
    .details-collapse-label::-webkit-details-marker {
      display: none;
    }

    .details-collapse-count {
      font-weight: 400;
      opacity: 0.5;
    }

    .details-collapse-content {
      padding: 4px 0 8px 14px;
    }

    .details-separator {
      height: 1px;
      width: 100%;
      background: rgba(255,255,255,0.08);
      margin: 4px 0;
    }

    .details-section-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--vscode-descriptionForeground);
      opacity: 0.8;
      margin-bottom: 6px;
    }
    
    .details-row {
      display: flex;
      align-items: center;
    }

    .details-id {
      font-size: 11px;
      font-weight: 600;
      color: var(--vscode-foreground);
    }

    .details-agent-name {
      font-size: 12px;
      font-weight: 600;
      color: #b8a9e8;
    }

    .details-tag {
      font-size: 9px;
      padding: 1px 5px;
      border-radius: 4px;
      font-weight: 500;
    }

    .details-tag.type {
      background: rgba(110,160,232,0.12);
      color: #6ea0e8;
      border: 1px solid rgba(110,160,232,0.25);
    }

    .details-tag.model {
      background: rgba(255,255,255,0.08);
      color: var(--vscode-foreground);
      border: 1px solid rgba(255,255,255,0.12);
      font-family: var(--vscode-editor-font-family, monospace);
    }

    .details-tag.dim {
      color: rgba(255,255,255,0.25);
      font-style: italic;
    }

    .details-file-chip {
      display: flex;
      align-items: flex-start;
      gap: 4px;
      font-size: 10px;
      color: rgba(126,207,179,0.9);
      padding: 1px 0;
      word-break: break-all;
      overflow-wrap: anywhere;
      max-width: 100%;
    }

    .details-file-chip span {
      word-break: break-all;
      overflow-wrap: anywhere;
    }

    .details-gate-req {
      display: flex;
      align-items: flex-start;
      gap: 5px;
      font-size: 11px;
      color: rgba(232,197,110,0.85);
      line-height: 1.4;
      padding: 1px 0;
    }

    .gate-check {
      flex-shrink: 0;
      font-size: 12px;
      opacity: 0.6;
    }

    .details-next-sep {
      height: 1px;
      background: rgba(255,255,255,0.05);
      margin: 4px 0;
    }

    .details-next-step {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .details-next-num {
      font-size: 9px;
      font-weight: 700;
      color: #6ec8e8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .details-next-label {
      font-size: 11px;
      font-weight: 500;
      color: var(--vscode-foreground);
      line-height: 1.4;
    }

    .details-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      opacity: 0.8;
      padding-top: 6px;
      border-top: 1px solid rgba(255,255,255,0.05);
      flex-wrap: wrap;
    }

    .details-footer-sep {
      color: rgba(255,255,255,0.2);
    }
`;
