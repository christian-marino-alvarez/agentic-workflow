import { css } from 'lit';

export const styles = [
  css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100%;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-font-family);
    }
    
    .tab-bar {
      display: flex;
      background-color: var(--vscode-editor-background);
      border-bottom: 1px solid var(--vscode-panel-border);
      padding: 0;
      margin: 0;
      height: 35px;
      align-items: center;
    }

    .tab-item {
      background: transparent;
      border: none;
      color: var(--vscode-panelTitle-inactiveForeground);
      font-family: var(--vscode-font-family);
      font-size: 11px;
      font-weight: 400;
      text-transform: uppercase;
      padding: 0 12px;
      height: 100%;
      cursor: pointer;
      border-bottom: 1px solid transparent;
      transition: color 0.1s, border-color 0.1s;
      position: relative;
    }

    .tab-item:hover {
      color: var(--vscode-panelTitle-activeForeground);
    }

    .tab-item.active {
      color: var(--vscode-panelTitle-activeForeground);
      border-bottom-color: var(--vscode-panelTitle-activeBorder);
    }

    .content-area {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--vscode-descriptionForeground);
      font-style: italic;
    }
  `
];
