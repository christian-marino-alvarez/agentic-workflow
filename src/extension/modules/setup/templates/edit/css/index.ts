import { css } from 'lit';

export const editStyles = css`
  .form-actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
  .btn-secondary {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
  }
  .btn-secondary:hover {
    background: var(--vscode-button-secondaryHoverBackground);
  }
`;
