import { css } from 'lit';

export const timelineStyles = css`
    /* ─── Sticky Side Timeline ──────────────────────────────────── */
    .side-timeline {
      width: 140px;
      flex-shrink: 0;
      overflow-y: auto;
      border-right: 1px solid var(--vscode-widget-border);
      padding: 12px 8px 12px 10px;
      display: flex;
      flex-direction: column;
      gap: 0;
      background: color-mix(in srgb, var(--vscode-editor-background) 95%, var(--vscode-sideBar-background) 5%);
      animation: slideInLeft 0.25s ease;
    }

    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-10px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .side-timeline-header {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--vscode-descriptionForeground);
      opacity: 0.6;
      margin-bottom: 10px;
      padding-left: 18px;
    }

    .side-step {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      min-height: 28px;
    }

    .side-step-track {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 12px;
      flex-shrink: 0;
      padding-top: 4px;
    }

    .side-step-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.3s ease;
    }

    .side-step-dot.done {
      background: #007ACC;
    }

    .side-step-dot.active {
      background: var(--vscode-textLink-foreground, #3794ff);
      box-shadow: 0 0 0 2px rgba(55, 148, 255, 0.3);
    }

    .side-step-dot.pending {
      background: transparent;
      border: 1.5px solid rgba(255,255,255,0.15);
    }

    .side-step-pulse {
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      border: 2px solid rgba(55, 148, 255, 0.5);
      animation: pulseSide 1.8s ease-in-out infinite;
    }

    @keyframes pulseSide {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.4); opacity: 0; }
    }

    .side-step-line {
      width: 2px;
      flex: 1;
      min-height: 12px;
      background: rgba(255,255,255,0.08);
      margin: 2px 0;
      border-radius: 1px;
      transition: background 0.3s ease;
    }

    .side-step-line.done {
      background: rgba(77, 172, 255, 0.4);
    }

    .side-step-label {
      font-size: 11px;
      line-height: 1.3;
      padding: 2px 0 10px 0;
      word-break: break-word;
      transition: color 0.3s ease;
      flex: 1;
      min-width: 0;
    }

    .side-step-label.done {
      color: rgba(77, 172, 255, 0.7);
    }

    .side-step-label.active {
      color: #88c0f8;
      font-weight: 600;
    }

    .side-step-label.pending {
      color: rgba(255,255,255,0.2);
    }
`;
