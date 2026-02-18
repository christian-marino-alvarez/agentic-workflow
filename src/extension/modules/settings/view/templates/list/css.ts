import { css } from 'lit';

export const styles = css`
  /* Empty State */
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    padding: 32px;
  }

  .empty-state-content {
    text-align: center;
    max-width: 400px;
  }

  .empty-state-content h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: var(--vscode-foreground);
  }

  .empty-state-content p {
    margin: 0 0 24px 0;
    font-size: 13px;
    color: var(--vscode-descriptionForeground);
  }

  .add-btn-centered {
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    padding: 8px 20px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .add-btn-centered:hover {
    background-color: var(--vscode-button-hoverBackground);
  }

  /* Model List */
  .settings-list-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .model-card {
    background-color: var(--vscode-list-hoverBackground);
    border: 1px solid var(--vscode-widget-border);
    border-radius: 4px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* Active State */
  .model-card.active-model {
    border-color: var(--vscode-focusBorder);
    background-color: var(--vscode-list-activeSelectionBackground);
    color: var(--vscode-list-activeSelectionForeground);
  }

  .badge-active {
    font-size: 10px;
    background-color: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    padding: 2px 6px;
    border-radius: 8px;
    margin-left: 8px;
    vertical-align: middle;
  }

  .badge-auth-type {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 8px;
    opacity: 0.85;
  }

  .badge-auth-type.oauth {
    background-color: rgba(78, 154, 241, 0.15);
    color: var(--vscode-textLink-foreground, #4e9af1);
  }

  .badge-auth-type.apikey {
    background-color: rgba(255, 255, 255, 0.08);
    color: var(--vscode-descriptionForeground);
  }

  .badge-verified {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 8px;
    background-color: rgba(115, 201, 145, 0.15);
    color: var(--vscode-testing-iconPassed, #73c991);
    font-weight: 600;
  }

  @media (min-width: 500px) {
    .model-card {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  .model-info h3 {
    margin: 0 0 8px 0;
    font-size: 13px;
    font-weight: 600;
  }

  .model-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 4px;
    opacity: 0.8;
  }
  
  .model-card.active-model .model-meta {
    color: var(--vscode-list-activeSelectionForeground);
    opacity: 0.9;
  }

  .model-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Button Styles */
  .action-btn {
    background: transparent;
    border: 1px solid var(--vscode-button-border, var(--vscode-widget-border));
    color: var(--vscode-button-foreground);
    padding: 4px 12px;
    border-radius: 3px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .action-btn:hover {
    background-color: var(--vscode-button-hoverBackground);
    border-color: var(--vscode-focusBorder);
  }

  /* Specific Button Colors */
  .action-btn.select {
    color: var(--vscode-testing-iconPassed, #73c991);
    border-color: var(--vscode-testing-iconPassed, #73c991);
  }

  .action-btn.select:hover {
    background-color: rgba(115, 201, 145, 0.1);
  }
  
  .action-btn.edit {
    color: var(--vscode-foreground);
  }

  .action-btn.delete {
    color: var(--vscode-testing-iconFailed, #f48771);
    border-color: var(--vscode-testing-iconFailed, #f48771);
  }

  .action-btn.delete:hover {
    background-color: rgba(244, 135, 113, 0.1);
  }

  /* Active Card Button Override */
  .model-card.active-model .action-btn {
    color: var(--vscode-list-activeSelectionForeground);
    border-color: var(--vscode-list-activeSelectionForeground);
  }
  
  .model-card.active-model .action-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;
