import { css } from 'lit';

export const mainStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    height: 100vh;
    color: var(--vscode-foreground);
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    background-color: var(--vscode-editor-background);
    overflow: hidden;
  }

  /* ── Top toolbar ─────────────────────────────── */
  .toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--vscode-sideBar-background);
    border-bottom: 1px solid var(--vscode-panel-border);
    flex-shrink: 0;
  }

  .toolbar__env {
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }

  .toolbar__env--dev {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  .toolbar__env--pro {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }

  .toolbar__separator {
    width: 1px;
    height: 16px;
    background: var(--vscode-panel-border);
  }

  .toolbar__model {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  .toolbar__model-label {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    white-space: nowrap;
    opacity: 0.7;
  }

  .toolbar__model vscode-dropdown {
    flex: 1;
    min-width: 100px;
    --dropdown-background: var(--vscode-dropdown-background);
    --dropdown-foreground: var(--vscode-dropdown-foreground);
    --dropdown-border: var(--vscode-dropdown-border);
  }

  .toolbar__model vscode-dropdown::part(control) {
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid transparent;
    border-radius: 6px;
    font-size: 12px;
    padding: 3px 8px;
    transition: border-color 0.15s ease;
  }

  .toolbar__model vscode-dropdown::part(control):hover {
    border-color: var(--vscode-focusBorder);
  }

  .toolbar__model vscode-dropdown::part(listbox) {
    background: var(--vscode-dropdown-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 6px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  .toolbar__status {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
    flex-shrink: 0;
  }

  .toolbar__status--disconnected {
    background: #ef4444;
    box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
  }

  /* ── Chat area ───────────────────────────────── */
  .chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    position: relative;
  }

  .loading-text {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
    gap: 8px;
  }

  .loading-text::before {
    content: '';
    width: 14px;
    height: 14px;
    border: 2px solid var(--vscode-panel-border);
    border-top-color: var(--vscode-focusBorder);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-text {
    font-size: 11px;
    color: var(--vscode-errorForeground);
  }

  /* ── Model Proposal Card (HIL) ───────────────── */
  .model-proposal-card {
    background: var(--vscode-notifications-background);
    border: 1px solid var(--vscode-focusBorder);
    border-radius: 8px;
    padding: 14px;
    margin: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .proposal-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--vscode-notificationsInfoIcon-foreground);
    font-weight: 600;
    font-size: 12px;
  }

  .proposal-icon { font-size: 14px; }

  .proposal-reason {
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--vscode-foreground);
  }

  .proposal-details {
    background: var(--vscode-editor-background);
    border-radius: 6px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px solid var(--vscode-panel-border);
  }

  .proposal-savings {
    display: flex;
    gap: 16px;
    font-size: 11px;
  }

  .saving-item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--vscode-descriptionForeground);
  }

  .saving-item strong {
    color: var(--vscode-terminal-ansiGreen);
  }

  .proposal-change {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-family: var(--vscode-editor-font-family);
    font-size: 12px;
    padding: 6px;
    background: var(--vscode-input-background);
    border-radius: 4px;
  }

  .model-old {
    text-decoration: line-through;
    opacity: 0.6;
  }

  .model-new {
    font-weight: 600;
    color: var(--vscode-symbolIcon-methodForeground);
  }

  .change-arrow { opacity: 0.5; }

  .proposal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .proposal-actions vscode-button {
    height: 28px;
  }
`;
