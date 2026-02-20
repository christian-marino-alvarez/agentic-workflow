
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

    /* ─── Progress Pill ──────────────────── */
    .progress-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 2px 8px;
      background: rgba(255,255,255,0.06);
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.1);
    }

    .progress-bar-track {
      width: 50px;
      height: 5px;
      background: rgba(255,255,255,0.15);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #00d4aa, #4dacff);
      border-radius: 3px;
      transition: width 0.4s ease;
      box-shadow: 0 0 4px rgba(77, 172, 255, 0.5);
    }

    .progress-text {
      font-size: 10px;
      font-weight: 600;
      color: var(--vscode-foreground);
      min-width: 28px;
      text-align: right;
    }

    .timeline-chevron {
      color: var(--vscode-descriptionForeground);
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    .timeline-chevron.open {
      transform: rotate(180deg);
    }

    .active-step-hint {
      font-size: 10px;
      color: #569cd6;
      padding: 2px 0 0 22px;
      font-weight: 500;
      letter-spacing: 0.3px;
    }

    /* ─── Metro Timeline ─────────────────── */
    .metro-timeline {
      padding: 10px 8px 6px 16px;
      animation: slideDown 0.2s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .metro-step {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .metro-track {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 14px;
      flex-shrink: 0;
    }

    .metro-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
      transition: background 0.3s ease;
    }

    .metro-line {
      width: 2px;
      height: 18px;
      flex-shrink: 0;
      transition: background 0.3s ease;
    }

    .metro-label {
      font-size: 11px;
      line-height: 14px;
      padding-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .metro-label.done { color: #4dacff; }
    .metro-label.active { color: #569cd6; font-weight: 600; }
    .metro-label.pending { color: #555; }

    .metro-active-badge {
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.5px;
      padding: 1px 5px;
      background: rgba(86, 156, 214, 0.2);
      color: #569cd6;
      border-radius: 3px;
      border: 1px solid rgba(86, 156, 214, 0.3);
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
      color: #1a1a1a;
      padding: 1px 6px;
      background: #ffffff;
      border-radius: 8px;
    }

    .agent-no-model-label {
      font-size: 10px;
      color: var(--vscode-testing-iconFailed, #f14c4c);
      margin-left: auto;
    }

    .agent-option.no-model {
      /* Removed opacity 0.5 so agents without models are fully visible and clickable */
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

    /* ─── Markdown Rendering ─────────────────────────── */

    .markdown-body p {
      margin: 0 0 8px 0;
    }

    .markdown-body p:last-child {
      margin-bottom: 0;
    }

    .markdown-body strong {
      font-weight: 600;
      color: var(--vscode-foreground);
    }

    .markdown-body em {
      font-style: italic;
    }

    .markdown-body code {
      font-family: var(--vscode-editor-font-family, 'Fira Code', monospace);
      font-size: 12px;
      background: rgba(255, 255, 255, 0.06);
      padding: 2px 5px;
      border-radius: 3px;
      color: var(--vscode-textPreformat-foreground, #d7ba7d);
    }

    .markdown-body pre {
      background: var(--vscode-textCodeBlock-background, #1e1e1e);
      border: 1px solid var(--vscode-widget-border, #333);
      border-radius: 6px;
      padding: 12px 14px;
      margin: 8px 0;
      overflow-x: auto;
      font-size: 12px;
      line-height: 1.45;
    }

    .markdown-body pre code {
      background: none;
      padding: 0;
      color: var(--vscode-editor-foreground);
      font-size: 12px;
    }

    .markdown-body ul, .markdown-body ol {
      margin: 6px 0;
      padding-left: 20px;
    }

    .markdown-body li {
      margin: 2px 0;
    }

    .markdown-body h1, .markdown-body h2, .markdown-body h3,
    .markdown-body h4, .markdown-body h5, .markdown-body h6 {
      margin: 12px 0 6px 0;
      font-weight: 600;
      color: var(--vscode-foreground);
    }

    .markdown-body h1 { font-size: 18px; }
    .markdown-body h2 { font-size: 16px; }
    .markdown-body h3 { font-size: 14px; }
    .markdown-body h4, .markdown-body h5, .markdown-body h6 { font-size: 13px; }

    .markdown-body blockquote {
      margin: 8px 0;
      padding: 6px 14px;
      border-left: 3px solid var(--vscode-textLink-foreground, #3794ff);
      color: var(--vscode-descriptionForeground);
      background: rgba(255, 255, 255, 0.03);
      border-radius: 0 4px 4px 0;
    }

    .markdown-body table {
      border-collapse: collapse;
      margin: 8px 0;
      width: 100%;
      font-size: 12px;
    }

    .markdown-body th, .markdown-body td {
      border: 1px solid var(--vscode-widget-border, #333);
      padding: 6px 10px;
      text-align: left;
    }

    .markdown-body th {
      background: rgba(255, 255, 255, 0.05);
      font-weight: 600;
    }

    .markdown-body a {
      color: var(--vscode-textLink-foreground, #3794ff);
      text-decoration: none;
    }

    .markdown-body a:hover {
      text-decoration: underline;
    }

    .markdown-body hr {
      border: none;
      border-top: 1px solid var(--vscode-widget-border, #333);
      margin: 12px 0;
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

    /* Tool call / result blocks */
    .tool-events {
      margin-bottom: 8px;
    }
    .tool-call-block,
    .tool-result-block {
      border: 1px solid var(--vscode-panel-border, #30363d);
      border-radius: 6px;
      margin-bottom: 6px;
      overflow: hidden;
      background: var(--vscode-editor-background, #1e1e2e);
    }
    .tool-call-header,
    .tool-result-header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      color: var(--vscode-foreground, #c9d1d9);
      background: var(--vscode-sideBar-background, #161b22);
    }
    .tool-call-header:hover,
    .tool-result-header:hover {
      background: var(--vscode-list-hoverBackground, #1c2128);
    }
    .tool-icon {
      font-size: 14px;
    }
    .tool-name {
      font-family: var(--vscode-editor-font-family, monospace);
      color: var(--vscode-textLink-foreground, #58a6ff);
    }
    .tool-status.running {
      color: var(--vscode-charts-yellow, #e3b341);
    }
    .tool-label {
      font-size: 11px;
      opacity: 0.6;
      margin-left: auto;
    }
    .tool-args,
    .tool-output {
      margin: 0;
      padding: 8px 10px;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 11px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 200px;
      overflow-y: auto;
      color: var(--vscode-foreground, #c9d1d9);
      border-top: 1px solid var(--vscode-panel-border, #30363d);
    }

    /* Permission toggle label */
    .permission-toggle {
      margin-left: auto;
      cursor: pointer;
      user-select: none;
    }
    .perm-label {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .perm-label.sandbox {
      background: rgba(63, 185, 80, 0.15);
      color: var(--vscode-testing-iconPassed, #3fb950);
      border: 1px solid rgba(63, 185, 80, 0.3);
    }
    .perm-label.full-access {
      background: rgba(248, 81, 73, 0.15);
      color: var(--vscode-testing-iconFailed, #f85149);
      border: 1px solid rgba(248, 81, 73, 0.3);
    }
    .perm-label:hover {
      opacity: 0.8;
    }
`;
