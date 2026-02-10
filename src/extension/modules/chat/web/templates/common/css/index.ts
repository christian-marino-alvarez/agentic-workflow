import { css } from 'lit';

export const commonStyles = css`
  /* --- OBJECTS --- */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    font-family: inherit;
    border: 1px solid transparent;
    transition: background 0.1s ease;
    user-select: none;
    gap: 6px;
  }
  .input, .select {
    padding: 6px 8px;
    border-radius: 2px;
    font-size: 13px;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }
  .label {
    font-size: 12px;
    font-weight: 400;
  }

  /* --- SKINS / MODIFIERS --- */
  .btn--primary {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border-color: var(--vscode-button-border, transparent);
  }
  .btn--primary:hover {
    background: var(--vscode-button-hoverBackground);
  }
  .btn--secondary {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
    border-color: var(--vscode-button-secondaryBorder, transparent);
  }
  .btn--secondary:hover {
    background: var(--vscode-button-secondaryHoverBackground);
  }
  .btn--danger {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
    border-color: var(--vscode-button-secondaryBorder, transparent);
    opacity: 0.85;
  }
  .btn--danger:hover {
    background: var(--vscode-errorForeground);
    color: var(--vscode-button-foreground);
    border-color: transparent;
    opacity: 1;
  }
  .input, .select {
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, transparent);
  }
  .input:focus, .select:focus {
    outline: 1px solid var(--vscode-focusBorder);
    outline-offset: -1px;
  }
  .label {
    color: var(--vscode-foreground);
    opacity: 0.8;
  }
`;
