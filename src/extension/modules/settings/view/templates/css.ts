import { css } from 'lit';

export const styles = css`
  :host {
    display: block;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  /* Main Container */
  .settings-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
  }

  /* Header */
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--vscode-widget-border);
  }

  .header-actions h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }


  /* Toolbar */
  .actions-group {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: var(--vscode-icon-foreground);
    cursor: pointer;
    padding: 4px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-btn:hover {
    background-color: var(--vscode-toolbar-hoverBackground);
  }


  /* Skeleton Loading */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .model-card.skeleton {
    animation: pulse 1.5s ease-in-out infinite;
    pointer-events: none;
  }

  .skeleton-title {
    height: 16px;
    background-color: var(--vscode-input-background);
    border-radius: 3px;
    width: 60%;
    margin-bottom: 8px;
  }

  .skeleton-meta {
    height: 12px;
    background-color: var(--vscode-input-background);
    border-radius: 3px;
    width: 40%;
  }

  .skeleton-button {
    height: 28px;
    width: 80px;
    background-color: var(--vscode-input-background);
    border-radius: 3px;
  }

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
    display: inline-flex;
    align-items: center;
    gap: 8px;
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
    border-radius: 6px;
    padding: 12px 16px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    transition: all 0.2s;
  }
  /* Active Model State with Pastel Touch */
  .model-card.active-model {
    background-color: rgba(62, 166, 255, 0.15); /* Pastel Blue Touch */
    border-color: var(--vscode-focusBorder);
  }

  .model-icon-left {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: var(--vscode-editor-background);
    /* border: 1px solid var(--vscode-widget-border); Removed for cleaner look */
    border-radius: 8px;
    color: var(--vscode-foreground);
    flex-shrink: 0;
  }
  
  .model-icon-left svg {
    width: 24px;
    height: 24px;
  }

  .model-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
  }
  
  .model-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .model-name {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .model-details {
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
  }

  .model-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }


  .action-btn {
    background-color: var(--vscode-button-secondaryBackground);
    border: 1px solid var(--vscode-button-border, var(--vscode-widget-border));
    color: var(--vscode-button-secondaryForeground);
    padding: 6px 14px;
    border-radius: 3px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .action-btn:hover {
    background-color: var(--vscode-button-secondaryHoverBackground);
    border-color: var(--vscode-focusBorder);
  }

  .action-btn.select {
    background-color: rgba(115, 201, 145, 0.15);
    color: var(--vscode-testing-iconPassed, #73c991);
    border-color: var(--vscode-testing-iconPassed, #73c991);
    font-weight: 500;
  }

  .action-btn.select:hover {
    background-color: rgba(115, 201, 145, 0.3);
  }
  
  .action-btn.edit {
    background-color: var(--vscode-button-secondaryBackground);
    color: var(--vscode-foreground);
  }

  .action-btn.edit:hover {
    background-color: var(--vscode-button-secondaryHoverBackground);
  }

  .action-btn.delete {
    background-color: transparent;
    color: var(--vscode-descriptionForeground);
    border-color: var(--vscode-widget-border);
    opacity: 0.5;
  }

  .action-btn.delete:hover {
    background-color: rgba(244, 135, 113, 0.15);
    color: var(--vscode-testing-iconFailed, #f48771);
    border-color: var(--vscode-testing-iconFailed, #f48771);
    opacity: 1;
  }

  .action-btn.delete.confirm-delete {
    background-color: rgba(244, 135, 113, 0.25);
    color: var(--vscode-testing-iconFailed, #f48771);
    border-color: var(--vscode-testing-iconFailed, #f48771);
    opacity: 1;
    font-weight: 600;
    animation: pulse 0.8s ease-in-out infinite;
  }

  .model-card.active-model .action-btn {
    background-color: rgba(255, 255, 255, 0.2); /* Stronger pastel overlay for button */
    color: var(--vscode-list-activeSelectionForeground);
    border-color: var(--vscode-list-activeSelectionForeground);
  }
  
  .model-card.active-model .action-btn:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }

  /* Form Styles */
  .form-container {
    padding: 24px;
    max-width: 500px;
  }

  .form-container h2 {
    margin: 0 0 24px 0;
    font-size: 16px;
    font-weight: 600;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 500;
    color: var(--vscode-foreground);
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 8px 10px;
    background-color: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border);
    border-radius: 3px;
    font-size: 13px;
    font-family: inherit;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--vscode-focusBorder);
  }

  .form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
  }

  .btn-cancel,
  .btn-save {
    padding: 8px 16px;
    border-radius: 3px;
    font-size: 13px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .btn-cancel {
    background-color: transparent;
    color: var(--vscode-foreground);
    border: 1px solid var(--vscode-button-border, var(--vscode-widget-border));
  }

  .btn-cancel:hover {
    background-color: var(--vscode-button-secondaryHoverBackground);
  }

  .btn-save {
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
  }

  .btn-save:hover {
    background-color: var(--vscode-button-hoverBackground);
  }
  .error-banner {
    background-color: var(--vscode-inputValidation-errorBackground);
    border: 1px solid var(--vscode-inputValidation-errorBorder);
    color: var(--vscode-foreground);
    padding: 8px 12px;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 13px;
  }
`;
