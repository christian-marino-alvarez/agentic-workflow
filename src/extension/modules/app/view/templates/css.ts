import { css } from 'lit';

export const styles = [
  css`
    :host {
      display: block;
      padding: 20px;
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
    }
    h1 {
      font-size: 1.5em;
      margin-bottom: 0.5em;
    }
    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 12px;
      cursor: pointer;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
  `
];
