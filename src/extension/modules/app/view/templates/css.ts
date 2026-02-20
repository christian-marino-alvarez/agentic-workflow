import { css } from 'lit';

export const styles = [
  css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100%;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-font-family);
    }
    
    .tab-bar {
      display: flex;
      justify-content: space-between;
      background-color: var(--vscode-editor-background);
      border-bottom: 1px solid var(--vscode-panel-border);
      padding: 0 8px 0 0;
      margin: 0;
      height: 35px;
      align-items: center;
    }

    .tab-items {
      display: flex;
      height: 100%;
      align-items: center;
    }

    .secure-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      font-weight: 600;
      color: var(--vscode-testing-iconPassed, #73c991);
      padding: 2px 8px;
      border: 1px solid var(--vscode-testing-iconPassed, #73c991);
      border-radius: 10px;
      background-color: rgba(115, 201, 145, 0.08);
      letter-spacing: 0.3px;
      white-space: nowrap;
    }

    .tab-item {
      background: transparent;
      border: none;
      color: var(--vscode-panelTitle-inactiveForeground);
      font-family: var(--vscode-font-family);
      font-size: 11px;
      font-weight: 400;
      text-transform: uppercase;
      padding: 0 12px;
      height: 100%;
      cursor: pointer;
      border-bottom: 1px solid transparent;
      transition: color 0.1s, border-color 0.1s;
      position: relative;
    }

    .tab-item:hover {
      color: var(--vscode-panelTitle-activeForeground);
    }

    .tab-item.active {
      color: var(--vscode-panelTitle-activeForeground);
      border-bottom-color: var(--vscode-panelTitle-activeBorder);
    }

    .content-area {
      flex: 1;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .content-area > * {
      flex: 1;
      min-height: 0;
    }

    .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--vscode-descriptionForeground);
      font-style: italic;
    }

    /* ─── History Tab ──────────────────────────────── */
    .history-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 16px 20px;
      box-sizing: border-box;
    }
    .history-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .history-header h2 {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--vscode-foreground);
    }
    .history-new-btn {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .history-new-btn:hover { opacity: 0.85; }
    .history-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .history-empty {
      text-align: center;
      padding: 32px 20px;
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
    }
    .history-card {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 6px;
      background: var(--vscode-sideBar-background);
      cursor: pointer;
      border: 1px solid var(--vscode-panel-border);
      transition: background 0.15s ease, border-color 0.15s ease;
    }
    .history-card:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .history-card.current {
      border-color: var(--vscode-focusBorder);
      border-left: 3px solid var(--vscode-focusBorder);
    }
    .history-card-info {
      flex: 1;
      min-width: 0;
    }
    .history-card-title {
      font-size: 12px;
      font-weight: 500;
      color: var(--vscode-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .history-current-badge {
      font-size: 10px;
      color: var(--vscode-focusBorder);
      font-weight: 400;
    }
    .history-card-meta {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      margin-top: 2px;
    }
    .history-delete-btn {
      background: none;
      border: none;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      padding: 2px 8px;
      font-size: 13px;
      border-radius: 4px;
      white-space: nowrap;
      transition: color 0.15s;
    }
    .history-delete-btn:hover {
      color: var(--vscode-errorForeground);
    }
    .history-delete-btn.confirm {
      background: var(--vscode-inputValidation-errorBackground, #5a1d1d);
      border: 1px solid var(--vscode-inputValidation-errorBorder, #be1100);
      color: var(--vscode-errorForeground);
      font-size: 11px;
    }

    /* History Skeleton */
    @keyframes historyPulse {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 0.4; }
    }
    .history-skeleton-card {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 6px;
      background: var(--vscode-sideBar-background);
      border: 1px solid var(--vscode-panel-border);
      animation: historyPulse 1.5s ease-in-out infinite;
    }
    .history-skeleton-title {
      height: 12px;
      width: 60%;
      background: var(--vscode-input-background);
      border-radius: 2px;
    }
    .history-skeleton-meta {
      height: 8px;
      width: 40%;
      background: var(--vscode-input-background);
      border-radius: 2px;
      margin-top: 6px;
    }
  `
];
