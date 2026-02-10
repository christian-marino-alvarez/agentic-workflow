import { css } from 'lit';

export const mainStyles = css`
  .main-container {
    padding: 16px;
    height: calc(100vh - 32px);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .header-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--vscode-panel-border);
    flex-shrink: 0;
  }

  .environment-badge {
    display: flex;
    align-items: center;
  }

  .badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    display: inline-block;
  }

  .badge--dev {
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    border: 1px solid var(--vscode-panel-border);
  }

  .badge--pro {
    background: var(--vscode-testing-iconPassed);
    color: white;
  }

  .model-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .model-selector label {
    font-size: 11px;
    font-weight: 600;
    color: var(--vscode-descriptionForeground);
    white-space: nowrap;
  }

  .model-selector vscode-dropdown {
    flex: 1;
    min-width: 120px;
    /* Force styles to match theme context */
    --dropdown-background: var(--vscode-dropdown-background);
    --dropdown-foreground: var(--vscode-dropdown-foreground);
    --dropdown-border: var(--vscode-dropdown-border);
    z-index: 100;
  }

  .model-selector vscode-dropdown::part(control) {
    background: var(--vscode-dropdown-background);
    color: var(--vscode-dropdown-foreground);
    border: 1px solid var(--vscode-dropdown-border);
  }

  .model-selector vscode-dropdown::part(listbox) {
    background: var(--vscode-dropdown-background);
    border: 1px solid var(--vscode-dropdown-border);
  }

  .loading-text {
    font-size: 11px;
    font-style: italic;
    opacity: 0.6;
  }

  .chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 200px;
  }

  .streaming-box {
    flex: 1;
    padding: 16px;
    font-family: var(--vscode-editor-font-family);
    font-size: 13px;
    overflow-y: auto;
    color: var(--vscode-editor-foreground);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .message {
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: fadeIn 0.3s ease-in;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .user-avatar {
    background: linear-gradient(135deg, var(--vscode-button-background), var(--vscode-button-hoverBackground));
  }

  .assistant-avatar {
    background: linear-gradient(135deg, var(--vscode-terminal-ansiGreen), var(--vscode-terminal-ansiCyan));
  }

  .message-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .message-author {
    font-size: 13px;
    font-weight: 600;
    color: var(--vscode-foreground);
  }

  .message-time {
    font-size: 11px;
    opacity: 0.6;
    color: var(--vscode-descriptionForeground);
  }

  .message-separator {
    height: 1px;
    background: var(--vscode-panel-border);
    opacity: 0.5;
  }

  .message-content {
    padding-left: 48px;
    line-height: 1.6;
    color: var(--vscode-foreground);
    white-space: pre-wrap;
  }

  .demo-logs {
    height: 100px;
    font-size: 11px;
    font-family: var(--vscode-editor-font-family);
    opacity: 0.7;
    overflow-y: auto;
    border-top: 1px dashed var(--vscode-panel-border);
    padding-top: 8px;
    color: var(--vscode-descriptionForeground);
  }

  .input-area {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .input-field {
    width: 100%;
    min-height: 80px;
    padding: 12px;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border);
    border-radius: 4px;
    font-family: var(--vscode-editor-font-family);
    font-size: 13px;
    resize: vertical;
  }

  .input-field:focus {
    outline: 1px solid var(--vscode-focusBorder);
    border-color: var(--vscode-focusBorder);
  }

  .input-field::placeholder {
    color: var(--vscode-input-placeholderForeground);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  /* Model Proposal Card (HIL) */
  .model-proposal-card {
    background: var(--vscode-notifications-background);
    border: 1px solid var(--vscode-notifications-border, var(--vscode-focusBorder));
    border-radius: 8px;
    padding: 16px;
    margin: 4px 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .proposal-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--vscode-notificationsInfoIcon-foreground);
    font-weight: 600;
    font-size: 13px;
  }

  .proposal-icon {
    font-size: 16px;
  }

  .proposal-reason {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: var(--vscode-foreground);
  }

  .proposal-details {
    background: var(--vscode-editor-background);
    border-radius: 6px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 1px solid var(--vscode-panel-border);
  }

  .proposal-savings {
    display: flex;
    gap: 16px;
    font-size: 12px;
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
    padding: 8px;
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

  .change-arrow {
    opacity: 0.5;
  }

  .proposal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .proposal-actions vscode-button {
    height: 28px;
  }
`;
