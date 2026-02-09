import { css } from 'lit';

export const listStyles = css`
  .card {
    background: var(--vscode-sideBar-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 4px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
  }
  .card:hover {
    background: var(--vscode-list-hoverBackground);
  }
  .card.active {
    border-color: var(--vscode-focusBorder);
    background: var(--vscode-list-inactiveSelectionBackground);
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }
  .card-title {
    font-weight: 600;
    font-size: 13px;
    color: var(--vscode-foreground);
  }
  .card-subtitle {
    opacity: 0.7;
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
  }
  .card-id {
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
  }
  .status-badge {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 2px;
    text-transform: uppercase;
    font-weight: 600;
  }
  .status-badge.present {
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
  }
  .status-badge.missing {
    background: var(--vscode-inputValidation-errorBackground);
    color: var(--vscode-inputValidation-errorForeground);
    border: 1px solid var(--vscode-inputValidation-errorBorder);
  }
  .actions {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }
  .active-indicator {
    color: var(--vscode-charts-green);
    font-weight: 600;
    font-size: 12px;
    display: flex;
    align-items: center;
  }
  .empty-state {
    text-align: center;
    color: var(--vscode-descriptionForeground);
    margin-top: 40px;
    font-style: italic;
  }
`;
