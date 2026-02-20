
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

    .header-title:hover {
      opacity: 0.85;
    }

    .agent-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 100;
      min-width: 200px;
      background: var(--vscode-dropdown-background, #252526);
      border: 1px solid var(--vscode-dropdown-border, #3c3c3c);
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      padding: 4px 0;
      margin-top: 4px;
    }

    .agent-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      font-size: 12px;
      color: var(--vscode-dropdown-foreground, #ccc);
      cursor: pointer;
      border-radius: 3px;
      margin: 0 4px;
    }

    .agent-option:hover {
      background: var(--vscode-list-hoverBackground, #2a2d2e);
    }

    .agent-option.active {
      background: var(--vscode-list-activeSelectionBackground, #094771);
      color: var(--vscode-list-activeSelectionForeground, #fff);
    }

    .agent-option svg {
      width: 16px;
      height: 16px;
    }

    .header-status {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        font-weight: normal;
    }

    /* Workflow info in header */
    .workflow-info {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .workflow-label {
      color: #ffffff;
      font-weight: 500;
      font-size: 12px;
    }

    /* Agent Bar (bottom, above input) */
    .agent-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      padding: 6px 0 4px 0;
      border-bottom: 1px solid var(--vscode-widget-border);
      margin-bottom: 4px;
    }

    .agent-select-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      border: 1px solid var(--vscode-widget-border);
      border-radius: 4px;
      color: var(--vscode-foreground);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 8px;
      transition: all 0.15s ease;
    }

    .agent-select-btn:hover {
      background: var(--vscode-list-hoverBackground);
    }

    .agent-select-btn.disabled {
      opacity: 0.5;
      border-color: var(--vscode-testing-iconFailed, #f14c4c);
    }

    .agent-select-btn svg {
      width: 16px;
      height: 16px;
      color: var(--vscode-textLink-foreground);
    }

    .agent-model-label {
      font-size: 10px;
      font-weight: 400;
      color: var(--vscode-descriptionForeground);
      padding: 1px 6px;
      background: var(--vscode-badge-background);
      border-radius: 8px;
    }

    .agent-no-model-label {
      font-size: 10px;
      color: var(--vscode-testing-iconFailed, #f14c4c);
      margin-left: auto;
    }

    .agent-option.no-model {
      opacity: 0.5;
    }

    /* Capability Labels */
    .agent-capabilities {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      align-items: center;
    }

    .cap-label {
      font-size: 9px;
      padding: 1px 6px;
      border-radius: 8px;
      border: 1px solid var(--vscode-widget-border);
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
      letter-spacing: 0.3px;
      font-weight: 500;
      opacity: 0.5;
    }

    .cap-label.active {
      opacity: 1;
      background: color-mix(in srgb, var(--vscode-testing-iconPassed) 15%, transparent);
      border-color: var(--vscode-testing-iconPassed);
      color: var(--vscode-testing-iconPassed);
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

    .btn-icon {
      background: none;
      border: none;
      color: var(--vscode-foreground);
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }

    .btn-icon:hover {
      background-color: var(--vscode-toolbar-hoverBackground);
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

    /* Verify Button in header */
    .verify-btn {
      font-family: inherit;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 10px;
      letter-spacing: 0.3px;
      transition: all 0.2s;
    }
    .verify-btn:hover:not(:disabled) {
      background: rgba(255,255,255,0.15) !important;
      border-color: var(--vscode-focusBorder) !important;
      color: var(--vscode-foreground) !important;
    }
    .verify-btn:disabled {
      opacity: 0.6;
      cursor: wait;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spinner {
      display: inline-block;
      width: 10px;
      height: 10px;
      border: 2px solid rgba(255,255,255,0.2);
      border-top-color: var(--vscode-foreground);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    /* Streaming Cursor */
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    
    .streaming-cursor {
      display: inline-block;
      width: 6px;
      height: 12px;
      background-color: var(--vscode-foreground);
      margin-left: 2px;
      vertical-align: middle;
      animation: blink 1s step-end infinite;
    }
`;
