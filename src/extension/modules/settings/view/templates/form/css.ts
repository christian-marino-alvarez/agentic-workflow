import { css } from 'lit';

export const styles = css`
  .form-container {
    padding: 16px;
    width: 100%;
    box-sizing: border-box;
    max-width: 800px; /* Increased max width for editors */
  }

  h2 {
    margin: 0 0 20px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--vscode-foreground);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .form-row {
    display: flex;
    gap: 16px;
    flex-direction: column; /* Default to column for safety */
  }

  @media (min-width: 500px) {
    .form-row {
      flex-direction: row;
    }
  }
  .form-row .form-group {
    flex: 1;
  }

  label {
    font-size: 13px;
    color: var(--vscode-foreground);
    font-weight: 500;
  }

  input, select {
    background-color: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, transparent);
    padding: 6px 8px;
    border-radius: 2px;
    font-size: 13px;
    font-family: inherit;
  }

  input:focus, select:focus {
    outline: 1px solid var(--vscode-focusBorder);
    border-color: var(--vscode-focusBorder);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }

  button {
    padding: 6px 14px;
    border-radius: 2px;
    font-size: 13px;
    cursor: pointer;
    border: 1px solid transparent;
  }

  .btn-cancel {
    background-color: transparent;
    color: var(--vscode-foreground);
    border: 1px solid var(--vscode-input-border);
  }

  .btn-save {
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
  }

  .btn-save:hover {
    background-color: var(--vscode-button-hoverBackground);
  }

  /* OAuth Credentials Status */
  .oauth-credentials-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    background-color: var(--vscode-editor-background);
    border: 1px solid var(--vscode-widget-border);
    border-radius: 4px;
    transition: border-color 0.2s;
  }

  .oauth-credentials-status.configured {
    border-color: var(--vscode-testing-iconPassed, #73c991);
    background-color: rgba(115, 201, 145, 0.05);
  }

  .oauth-credentials-status.missing {
    border-color: var(--vscode-inputValidation-warningBorder, #cca700);
    background-color: rgba(204, 167, 0, 0.05);
  }

  .oauth-cred-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .oauth-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .configured .oauth-status-dot {
    background-color: var(--vscode-testing-iconPassed, #73c991);
    box-shadow: 0 0 4px rgba(115, 201, 145, 0.5);
  }

  .missing .oauth-status-dot {
    background-color: var(--vscode-inputValidation-warningBorder, #cca700);
  }

  .oauth-cred-label {
    font-size: 12px;
    font-weight: 600;
    display: block;
    color: var(--vscode-foreground);
  }

  .oauth-cred-id {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    font-family: var(--vscode-editor-font-family, monospace);
  }

  .btn-configure-oauth {
    background-color: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
    border: none;
    padding: 4px 10px;
    border-radius: 2px;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    font-family: inherit;
  }

  .btn-configure-oauth:hover {
    background-color: var(--vscode-button-secondaryHoverBackground);
  }

  .oauth-hint {
    margin: 6px 0 0 0;
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
  }

  .oauth-cred-actions {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-shrink: 0;
  }

  .btn-remove-oauth {
    background-color: transparent;
    color: var(--vscode-testing-iconFailed, #f48771);
    border: 1px solid var(--vscode-testing-iconFailed, #f48771);
    padding: 4px 10px;
    border-radius: 2px;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
  }

  .btn-remove-oauth:hover {
    background-color: rgba(244, 135, 113, 0.1);
  }

  .expired .oauth-status-dot {
    background-color: var(--vscode-testing-iconFailed, #f48771);
    box-shadow: 0 0 4px rgba(244, 135, 113, 0.5);
  }

  .oauth-credentials-status.expired {
    border-color: var(--vscode-testing-iconFailed, #f48771);
    background-color: rgba(244, 135, 113, 0.05);
  }
`;
