import { css } from 'lit';

export const hostStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    height: 100vh;
    color: var(--vscode-foreground);
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    background-color: var(--vscode-editor-background);
  }
  .tabs {
    display: flex;
    padding: 0 4px;
    background: var(--vscode-sideBar-background);
    border-bottom: 1px solid var(--vscode-panel-border);
    position: sticky;
    top: 0;
    z-index: 10;
    gap: 8px;
    flex-shrink: 0;
  }
  .env-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    background: var(--vscode-sideBar-background);
    border-bottom: 1px solid var(--vscode-panel-border);
  }
  .env-bar select {
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
    padding: 4px 6px;
    font-size: 12px;
  }
  .tab {
    padding: 10px 8px;
    cursor: pointer;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-foreground);
    opacity: 0.6;
    border-bottom: 1px solid transparent;
    transition: opacity 0.2s ease;
    user-select: none;
    margin-bottom: -1px;
  }
  .tab:hover {
    opacity: 1;
  }
  .tab.active {
    opacity: 1;
    color: var(--vscode-settings-headerForeground);
    border-bottom: 1px solid var(--vscode-settings-headerBorder, var(--vscode-foreground));
    font-weight: 600;
  }
  .container {
    padding: 20px 16px;
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
`;
