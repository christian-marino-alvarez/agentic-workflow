import { css } from 'lit';

export const inputStyles = css`
    /* ─── Input Area ──────────────────────────────────────────── */
    .input-group {
      border-top: 1px solid var(--vscode-widget-border);
      background-color: var(--vscode-editor-background);
      padding: 0;
    }

    .input-row {
      padding: 12px 16px;
      gap: 12px;
    }

    .input-control {
      flex: 1;
      padding: 8px 12px;
      font-size: 13px;
      border: 1px solid var(--vscode-input-border);
      border-radius: 6px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      transition: border-color 0.2s;
    }

    .input-control:focus {
      outline: none;
      border-color: var(--vscode-focusBorder);
    }
    
    .input-control:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* ─── Agent Status Bar ──────────────────────────────────── */
    .agent-status-bar {
      padding: 6px 16px;
      background: color-mix(in srgb, var(--vscode-editor-background) 80%, var(--vscode-sideBar-background) 20%);
      border-bottom: 1px solid var(--vscode-widget-border);
    }

    .agent-status-title {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--vscode-descriptionForeground);
      opacity: 0.7;
      margin-bottom: 4px;
    }

    .agent-status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .agent-status-info {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-width: 0;
    }

    .agent-status-name {
      font-size: 11px;
      font-weight: 600;
      color: var(--vscode-foreground);
    }

    .agent-status-sep {
      color: var(--vscode-descriptionForeground);
      opacity: 0.5;
      font-size: 10px;
    }

    .agent-status-model {
      font-size: 10px;
      color: var(--vscode-textLink-foreground);
      font-family: var(--vscode-editor-font-family, monospace);
    }

    .agent-status-task {
      font-size: 10px;
      color: rgba(63, 185, 80, 0.9);
      font-style: italic;
    }

    .agent-status-activity {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      opacity: 0.8;
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .agent-status-activity.active {
      animation: pulseActivity 1.5s infinite;
    }

    @keyframes pulseActivity {
      0% { opacity: 0.5; }
      50% { opacity: 1; }
      100% { opacity: 0.5; }
    }

    .agent-status-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Token Usage Indicator ─────────────────────────────── */
    .token-usage {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      cursor: default;
      transition: all 0.2s ease;
    }

    .token-usage:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .token-icon {
      font-size: 10px;
    }

    .token-count {
      font-size: 10px;
      font-weight: 600;
      color: rgba(232, 197, 110, 0.9);
      font-family: var(--vscode-editor-font-family, monospace);
    }

    .token-cost {
      font-size: 9px;
      color: rgba(255, 255, 255, 0.4);
      margin-left: 2px;
    }

    .agent-status-caps {
      display: flex;
      gap: 4px;
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px dashed rgba(255,255,255,0.05);
    }

    .cap-label {
      font-size: 9px;
      padding: 1px 4px;
      background: rgba(255,255,255,0.05);
      color: var(--vscode-descriptionForeground);
      border-radius: 3px;
    }

    .cap-label.active {
      color: #7ecfb3;
      background: rgba(126, 207, 179, 0.1);
      border: 1px solid rgba(126, 207, 179, 0.2);
    }

    /* Permission toggle labels */
    .permission-toggle {
      cursor: pointer;
    }

    .perm-label {
      font-size: 10px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 8px;
      transition: all 0.15s ease;
    }

    .perm-label.sandbox {
      color: var(--vscode-testing-iconPassed, #73c991);
      background: color-mix(in srgb, var(--vscode-testing-iconPassed) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--vscode-testing-iconPassed) 25%, transparent);
    }

    .perm-label.full-access {
      color: var(--vscode-testing-iconFailed, #f48771);
      background: color-mix(in srgb, var(--vscode-testing-iconFailed) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--vscode-testing-iconFailed) 25%, transparent);
    }

    /* ─── A2UI Input Bar (replaces text input when pending) ──── */
    .a2ui-input-bar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      width: 100%;
      animation: a2ui-slide-in 0.2s ease-out;
    }

    @keyframes a2ui-slide-in {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ─── Skeleton Loading ──── */
    .a2ui-input-skeleton {
      display: flex;
      gap: 8px;
      width: 100%;
      align-items: center;
    }

    .skeleton-bar {
      height: 32px;
      flex: 1;
      border-radius: 6px;
      background: linear-gradient(90deg,
        rgba(255,255,255,0.04) 25%,
        rgba(255,255,255,0.08) 50%,
        rgba(255,255,255,0.04) 75%
      );
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.2s ease-in-out infinite;
    }

    .skeleton-bar.short {
      flex: 0 0 80px;
    }

    @keyframes skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .a2ui-input-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--vscode-descriptionForeground);
      width: 100%;
      text-align: center;
    }

    .a2ui-input-options {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      width: 100%;
      justify-content: center;
    }

    .a2ui-input-btn {
      padding: 6px 16px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
      border: 1px solid rgba(207, 142, 52, 0.4);
      background: rgba(207, 142, 52, 0.15);
      color: #cf8e34;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .a2ui-input-btn:hover {
      background: #cf8e34;
      color: #fff;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(207, 142, 52, 0.3);
    }

    .a2ui-input-cancel {
      padding: 6px 10px;
      font-size: 12px;
      border-radius: 6px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--vscode-descriptionForeground, #888);
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }

    .a2ui-input-cancel:hover {
      border-color: rgba(244, 135, 113, 0.4);
      background: rgba(244, 135, 113, 0.12);
      color: var(--vscode-testing-iconFailed, #f48771);
    }

    .a2ui-input-confirm {
      padding: 6px 18px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
      border: 1px solid rgba(207, 142, 52, 0.4);
      background: #cf8e34;
      color: #fff;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .a2ui-input-confirm:hover {
      background: #b87d2e;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(207, 142, 52, 0.3);
    }
`;
