import { css } from 'lit';

export const messageStyles = css`
    /* ─── Message Bubbles & Common Styles ─────────────────────── */
    .msg-bubble {
      margin-bottom: 12px;
      border-radius: 8px;
    }
    
    .msg-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    
    .msg-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--vscode-foreground);
    }
    
    .msg-icon svg {
      width: 14px;
      height: 14px;
    }

    .msg-sender {
      font-weight: 600;
      color: var(--vscode-editor-foreground);
      font-size: 11px;
    }
    
    .msg-status {
      font-size: 10px;
      opacity: 0.7;
    }
    
    .msg-content {
      line-height: 1.5;
      font-size: 13px;
      color: var(--vscode-editor-foreground);
    }

    .msg-user {
      align-self: flex-end;
      background-color: var(--vscode-editor-inactiveSelectionBackground);
      padding: 10px 14px;
      max-width: 85%;
      border-bottom-right-radius: 2px;
    }

    .msg-agent {
      align-self: flex-start;
      background-color: transparent;
      padding: 4px 0 10px 0;
      width: 100%;
    }

    .msg-system {
      align-self: center;
      background-color: var(--vscode-editor-inactiveSelectionBackground);
      padding: 8px 12px;
      font-size: 11px;
      opacity: 0.8;
      width: 90%;
      text-align: center;
    }

    /* ─── Skeleton ────────────────────────────────────────────── */
    .skeleton-chat {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 10px 0;
    }

    .skeleton-header {
      height: 12px;
      width: 80px;
      background: var(--vscode-widget-border);
      border-radius: 4px;
      margin-bottom: 8px;
      opacity: 0.6;
      animation: pulse 1.5s infinite;
    }

    .skeleton-line {
      height: 10px;
      background: var(--vscode-widget-border);
      border-radius: 4px;
      margin-bottom: 6px;
      opacity: 0.6;
      animation: pulse 1.5s infinite;
    }

    .skeleton-line.full { width: 100%; }
    .skeleton-line.half { width: 50%; }

    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 0.3; }
      100% { opacity: 0.6; }
    }

    /* Streaming Cursor */
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    
    .streaming-cursor {
      display: inline-block;
      width: 6px;
      height: 12px;
      background-color: var(--vscode-foreground);
      margin-left: 2px;
      vertical-align: middle;
      animation: blink 1s step-end infinite;
    }

    /* ─── Delegation Card ──────────────────────────────────── */
    .delegation-card {
      margin: 8px 0;
      padding: 12px 16px;
      border-radius: 8px;
      border-left: 4px solid var(--vscode-charts-blue, #58a6ff);
      background: var(--vscode-editor-inactiveSelectionBackground, rgba(88, 166, 255, 0.08));
    }
    .delegation-card.pending {
      border-left-color: var(--vscode-charts-yellow, #d29922);
      animation: delegation-pulse 2s ease-in-out infinite;
    }
    .delegation-card.completed {
      border-left-color: var(--vscode-charts-green, #3fb950);
    }
    @keyframes delegation-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.85; }
    }
    .delegation-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .delegation-icon {
      font-size: 1.1em;
    }
    .delegation-agent-icon {
      display: flex;
      align-items: center;
    }
    .delegation-agent-icon svg {
      width: 18px;
      height: 18px;
    }
    .delegation-title {
      flex: 1;
      color: var(--vscode-editor-foreground);
    }
    .delegation-status {
      font-size: 0.85em;
      font-weight: 400;
      color: var(--vscode-descriptionForeground);
    }
    .delegation-task {
      font-size: 0.9em;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 8px;
      padding: 4px 0;
    }
    .delegation-task p {
      margin: 0;
    }
    .delegation-report {
      margin-top: 8px;
      border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.1));
      border-radius: 6px;
      overflow: hidden;
    }
    .delegation-report-header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      font-size: 0.9em;
      font-weight: 500;
      background: var(--vscode-sideBar-background, rgba(0,0,0,0.1));
      cursor: pointer;
    }
    .delegation-report-content {
      padding: 12px;
      font-size: 0.88em;
      max-height: 400px;
      overflow-y: auto;
    }
    .delegation-greeting {
      font-size: 0.92em;
      font-weight: 500;
      padding: 6px 0 4px 0;
      color: var(--vscode-editor-foreground);
    }
    .delegation-loading {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.88em;
      color: var(--vscode-descriptionForeground);
      padding: 4px 0;
    }
`;
