
import { css } from 'lit';

export const styles = css`

    /* --- Layout & Structure (OOCSS) --- */
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }

    .layout-col {
      display: flex;
      flex-direction: column;
    }

    .layout-row {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .layout-scroll {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    /* --- Components --- */

    /* Header Component */
    .header {
      padding: 12px 20px;
      border-bottom: 1px solid var(--vscode-widget-border);
      justify-content: space-between;
      background-color: var(--vscode-editor-background);
    }
    
    .header-title {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--vscode-foreground);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-status {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        font-weight: normal;
    }

    /* Chat Area */
    .chat-container {
      padding: 20px;
      gap: 16px;
      display: flex;
      flex-direction: column;
    }

    /* Message Bubble Component */
    .msg-bubble {
      padding: 12px;
      border-radius: 6px;
      max-width: 85%;
      font-size: 13px;
      line-height: 1.5;
      word-wrap: break-word;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .msg-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      opacity: 0.8;
      margin-bottom: 2px;
    }

    .msg-icon svg {
      width: 14px;
      height: 14px;
    }

    .msg-system {
      align-self: center;
      background-color: transparent;
      color: var(--vscode-descriptionForeground);
      border: 1px dashed var(--vscode-widget-border);
      font-size: 12px;
      padding: 8px 16px;
      max-width: 90%;
      box-shadow: none;
    }

    .msg-agent {
       align-self: flex-start;
       background-color: var(--vscode-editor-background);
       border: 1px solid var(--vscode-widget-border);
       color: var(--vscode-foreground);
    }
    
    .msg-agent .msg-header {
        color: var(--vscode-textLink-foreground);
    }

    .msg-user {
      align-self: flex-end;
      background-color: rgba(230, 126, 34, 0.1); /* Slight orange tint */
      border: 1px solid rgba(230, 126, 34, 0.3);
      color: var(--vscode-foreground);
    }
    
    .msg-user .msg-header {
        color: #e67e22;
        flex-direction: row-reverse;
    }

    /* Input Group Component */
    .input-group {
      padding: 16px 20px;
      border-top: 1px solid var(--vscode-widget-border);
      gap: 10px;
      background-color: var(--vscode-editor-background);
    }

    .input-control {
      flex: 1;
      padding: 8px 12px;
      background-color: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      font-family: inherit;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }

    .input-control:focus {
      border-color: var(--vscode-focusBorder);
    }

    /* Button Component */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;
      border: none;
      line-height: 1;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background-color: #e67e22; /* Orange as requested */
      color: #ffffff;
    }

    .btn-primary:hover {
      background-color: #d35400;
    }
`;
