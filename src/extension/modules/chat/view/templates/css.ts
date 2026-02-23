import { css } from 'lit';

import { headerStyles } from './header/css.js';
import { detailsStyles } from './details/css.js';
import { timelineStyles } from './timeline/css.js';
import { historyStyles } from './history/css.js';
import { messageStyles } from './message/css.js';
import { inputStyles } from './input/css.js';
import { a2uiStyles } from './a2ui/css.js';

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
      overflow: hidden;
    }

    button {
      font-family: var(--vscode-font-family);
    }

    .layout-col {
      display: flex;
      flex-direction: column;
    }

    .layout-row {
      display: flex;
      flex-direction: row;
    }
    
    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 4px;
      color: var(--vscode-foreground);
    }
    
    .btn-icon:hover {
      background: var(--vscode-toolbar-hoverBackground);
    }

    .btn {
      padding: 6px 12px;
      border: none;
      border-radius: 2px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 500;
      color: var(--vscode-button-foreground);
      background: var(--vscode-button-background);
      transition: all 0.2s;
    }
    
    .btn:hover {
      background: var(--vscode-button-hoverBackground);
    }
    
    .btn-primary {
      background-color: #e67e22;
      color: #ffffff;
    }

    .btn-primary:hover {
      background-color: #d35400;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Markdown Body */
    .markdown-body {
      color: var(--vscode-editor-foreground);
    }
    .markdown-body pre {
      background-color: var(--vscode-editor-background);
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      border: 1px solid var(--vscode-panel-border, #30363d);
      margin: 8px 0;
    }
    .markdown-body code {
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 90%;
      background-color: rgba(110,118,129,0.4);
      padding: 2px 4px;
      border-radius: 4px;
    }
    .markdown-body code.file-link {
      cursor: pointer;
      color: var(--vscode-textLink-foreground, #3794ff);
      text-decoration: underline;
      text-decoration-style: dotted;
      text-underline-offset: 2px;
      transition: all 0.15s ease;
    }
    .markdown-body code.file-link:hover {
      background-color: rgba(55, 148, 255, 0.15);
      text-decoration-style: solid;
    }
    .markdown-body pre code {
      background-color: transparent;
      padding: 0;
    }
    .markdown-body p {
      margin-top: 0;
      margin-bottom: 8px;
    }
    .markdown-body p:last-child {
      margin-bottom: 0;
    }
  `,
  headerStyles,
  detailsStyles,
  timelineStyles,
  historyStyles,
  messageStyles,
  inputStyles,
  a2uiStyles
];
