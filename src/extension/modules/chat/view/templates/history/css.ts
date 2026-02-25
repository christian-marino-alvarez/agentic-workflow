import { css } from 'lit';

export const historyStyles = css`
    /* ─── History ────────────────────────────────────────────── */
    .history {
      padding: 16px;
      gap: 12px;
    }

    /* Phase Markers */
    /* Phase Separator (horizontal divider between phases) */
    .phase-separator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
      margin: 4px 0;
    }

    .phase-separator-line {
      flex: 1;
      height: 1px;
      background: var(--vscode-widget-border);
    }

    .phase-separator-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-textLink-foreground, #3794ff);
      padding: 2px 10px;
      border-radius: 10px;
      background: rgba(55, 148, 255, 0.1);
      border: 1px solid rgba(55, 148, 255, 0.25);
      white-space: nowrap;
    }

    .phase-separator-time {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      opacity: 0.7;
      white-space: nowrap;
    }

    /* Phase Group (left sidebar + messages) */
    .phase-group {
      display: flex;
      gap: 0;
    }

    .phase-group.has-phase {
      gap: 8px;
    }

    .phase-group-sidebar {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 48px;
      flex-shrink: 0;
      padding-top: 4px;
    }

    .phase-group-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--vscode-textLink-foreground, #3794ff);
      flex-shrink: 0;
    }

    .phase-group-line {
      width: 2px;
      flex: 1;
      min-height: 8px;
      background: rgba(55, 148, 255, 0.3);
    }

    .phase-group-messages {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
    }

    /* ─── Chat Layout (side-timeline + chat) ──────────────────── */
    .chat-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
      min-height: 0;
    }

    .chat-container {
      flex: 1;
      overflow-y: auto;
    }

    /* ─── Inline Activity Indicator ─── */
    .activity-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      animation: activity-fadein 0.3s ease;
    }

    .activity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--vscode-textLink-foreground, #3794ff);
      animation: activity-pulse 1.4s ease-in-out infinite;
    }

    .activity-text {
      font-size: 14px;
      color: var(--vscode-descriptionForeground, rgba(255,255,255,0.5));
      font-style: italic;
      animation: activity-pulse 1.4s ease-in-out infinite;
    }

    @keyframes activity-pulse {
      0%, 100% { opacity: 0.3; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.1); }
    }

    @keyframes activity-fadein {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
`;
