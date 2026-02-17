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
`;
