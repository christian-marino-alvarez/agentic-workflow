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
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .token-usage:hover,
    .token-usage.active {
      background: rgba(55, 148, 255, 0.1);
      border-color: rgba(55, 148, 255, 0.3);
    }

    .token-icon { font-size: 10px; }

    .token-count {
      font-size: 10px;
      font-weight: 600;
      color: rgba(55, 148, 255, 0.9);
      font-family: var(--vscode-editor-font-family, monospace);
    }

    .token-cost {
      font-size: 9px;
      color: rgba(255, 255, 255, 0.4);
      margin-left: 2px;
    }

    /* ─── Usage Stats Panel ──────────────────────────────────── */
    .usage-stats-panel {
      margin-top: 8px;
      padding: 12px 14px;
      background: rgba(55, 148, 255, 0.05);
      border: 1px solid rgba(55, 148, 255, 0.15);
      border-radius: 8px;
      animation: slideDown 0.18s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .usage-stats-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .usage-stats-title {
      font-size: 10px;
      font-weight: 700;
      color: rgba(55, 148, 255, 0.8);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .usage-stats-close {
      background: none;
      border: none;
      color: rgba(255,255,255,0.3);
      cursor: pointer;
      font-size: 11px;
      padding: 0 2px;
      line-height: 1;
      transition: color 0.15s;
    }
    .usage-stats-close:hover { color: rgba(255,255,255,0.7); }

    .usage-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 10px;
    }

    .usage-stat-item {
      padding: 7px 10px;
      background: rgba(255,255,255,0.04);
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.06);
    }

    .usage-stat-item.highlight {
      background: rgba(55, 148, 255, 0.08);
      border-color: rgba(55, 148, 255, 0.2);
    }

    .usage-stat-label {
      font-size: 9px;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 3px;
    }

    .usage-stat-value {
      font-size: 14px;
      font-weight: 700;
      color: var(--vscode-foreground);
      font-family: var(--vscode-editor-font-family, monospace);
    }

    .usage-stat-value.input  { color: #7ecfb3; }
    .usage-stat-value.output { color: #7ab8f5; }
    .usage-stat-value.cost   { color: rgba(55, 148, 255, 0.95); }

    .usage-model-breakdown {
      border-top: 1px solid rgba(255,255,255,0.06);
      padding-top: 8px;
    }

    .usage-model-title {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(255,255,255,0.3);
      margin-bottom: 6px;
    }

    .usage-model-row {
      display: grid;
      grid-template-columns: 1fr auto auto auto;
      gap: 8px;
      align-items: center;
      padding: 4px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      font-size: 10px;
    }

    .usage-model-name {
      color: rgba(255,255,255,0.65);
      font-family: var(--vscode-editor-font-family, monospace);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .usage-model-reqs  { color: rgba(255,255,255,0.35); font-size: 9px; }
    .usage-model-tokens { color: #7ecfb3; font-family: monospace; }
    .usage-model-cost  { color: rgba(55, 148, 255, 0.8); font-family: monospace; }

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
      margin-bottom: 2px;
    }

    .a2ui-input-options {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
    }

    /* ─── Radio Option Row ──── */
    .a2ui-radio-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 14px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .a2ui-radio-option:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: rgba(55, 148, 255, 0.3);
    }

    .a2ui-radio-option input[type="radio"] {
      display: none;
    }

    .a2ui-radio-indicator {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.25);
      flex-shrink: 0;
      position: relative;
      transition: all 0.15s ease;
    }

    .a2ui-radio-indicator::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: transparent;
      transition: all 0.15s ease;
    }

    /* Selected state */
    .a2ui-radio-option input[type="radio"]:checked ~ .a2ui-radio-indicator {
      border-color: var(--vscode-textLink-foreground, #3794ff);
    }

    .a2ui-radio-option input[type="radio"]:checked ~ .a2ui-radio-indicator::after {
      background: var(--vscode-textLink-foreground, #3794ff);
    }

    .a2ui-radio-option:has(input[type="radio"]:checked) {
      background: rgba(55, 148, 255, 0.1);
      border-color: rgba(55, 148, 255, 0.35);
    }

    .a2ui-radio-text {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.75);
      line-height: 1.3;
    }

    .a2ui-radio-option:has(input[type="radio"]:checked) .a2ui-radio-text {
      color: rgba(255, 255, 255, 0.95);
      font-weight: 500;
    }

    /* ─── Actions Row ──── */
    .a2ui-input-actions {
      display: flex;
      gap: 8px;
      width: 100%;
      justify-content: flex-end;
      margin-top: 4px;
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
      padding: 6px 20px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
      border: 1px solid rgba(55, 148, 255, 0.3);
      background: rgba(55, 148, 255, 0.12);
      color: rgba(55, 148, 255, 0.5);
      cursor: not-allowed;
      transition: all 0.15s ease;
    }

    .a2ui-input-confirm:disabled {
      opacity: 0.6;
    }

    .a2ui-input-confirm.ready,
    .a2ui-input-confirm:not(:disabled) {
      background: var(--vscode-textLink-foreground, #3794ff);
      color: #fff;
      cursor: pointer;
      opacity: 1;
      border-color: var(--vscode-textLink-foreground, #3794ff);
    }

    .a2ui-input-confirm.ready:hover,
    .a2ui-input-confirm:not(:disabled):hover {
      background: #007ACC;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(55, 148, 255, 0.3);
    }
`;
