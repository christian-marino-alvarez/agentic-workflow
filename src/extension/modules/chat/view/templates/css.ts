
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
      background-color: var(--vscode-editor-background);
      gap: 8px;
    }

    .header-top {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    .actions-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Model Selector */
    .model-selector {
      gap: 12px;
      align-items: center;
      padding-top: 4px;
    }

    .selector-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .model-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--vscode-descriptionForeground);
      white-space: nowrap;
    }

    .model-dropdown {
      flex: 1;
      padding: 4px 8px;
      font-size: 12px;
      font-family: inherit;
      background-color: var(--vscode-dropdown-background);
      color: var(--vscode-dropdown-foreground);
      border: 1px solid var(--vscode-dropdown-border);
      border-radius: 4px;
      outline: none;
      cursor: pointer;
      appearance: auto;
    }

    .model-dropdown:focus {
      border-color: var(--vscode-focusBorder);
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

    .header-title svg {
      color: var(--vscode-textLink-foreground);
    }

    .header-status {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        font-weight: normal;
    }

    .secure-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      color: var(--vscode-testing-iconPassed, #73c991);
      padding: 2px 8px;
      border: 1px solid var(--vscode-testing-iconPassed, #73c991);
      border-radius: 10px;
      background-color: rgba(115, 201, 145, 0.08);
      letter-spacing: 0.3px;
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
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .msg-status {
      font-weight: normal;
      font-style: italic;
      opacity: 0.8;
      font-size: 11px;
      margin-left: 4px;
    }

    .msg-icon {
      display: inline-flex;
      align-items: center;
    }

    .msg-icon svg {
      width: 16px;
      height: 16px;
    }

    .msg-content {
      font-size: 13px;
      line-height: 1.5;
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

    .workflow-info {
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding-bottom: 4px;
      font-weight: 500;
    }

    .input-row {
      width: 100%;
      gap: 10px;
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

    /* Skeleton Loading */
    @keyframes pulse {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 0.4; }
    }

    .skeleton {
      animation: pulse 1.5s ease-in-out infinite;
      pointer-events: none;
      gap: 8px;
    }

    .skeleton-header {
      height: 12px;
      width: 80px;
      background-color: var(--vscode-input-background);
      border-radius: 2px;
    }

    .skeleton-content {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .skeleton-line {
      height: 10px;
      background-color: var(--vscode-input-background);
      border-radius: 2px;
    }

    .skeleton-line.full { width: 90%; }
    .skeleton-line.half { width: 50%; }
`;
