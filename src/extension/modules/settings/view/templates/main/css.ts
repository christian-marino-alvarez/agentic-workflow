import { css } from 'lit';

export const styles = css`
  :host {
    display: block;
    height: 100%;
    overflow: hidden;
  }

  .settings-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    box-sizing: border-box;
  }

  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--vscode-panel-border);
  }

  h2 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--vscode-foreground);
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    /* Ensure scrollbar doesn't overlap content too much */
    padding-right: 4px; 
  }

  .add-btn {
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    padding: 4px 12px;
    font-size: 12px;
    font-family: var(--vscode-font-family);
    border-radius: 2px;
    cursor: pointer;
    transition: background-color 0.1s;
  }

  .add-btn:hover {
    background-color: var(--vscode-button-hoverBackground);
  }
`;
