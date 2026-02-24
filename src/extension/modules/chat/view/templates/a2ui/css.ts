import { css } from 'lit';

export const a2uiStyles = css`
  /* ─── A2UI Component Card ─── */
  .a2ui-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 14px 16px;
    margin: 10px 0 4px;
    transition: all 0.3s ease;
  }

  .a2ui-card:hover {
    border-color: rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.06);
  }

  .a2ui-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.3px;
    color: rgba(232, 197, 110, 0.9);
    margin-bottom: 10px;
  }

  /* ─── Radio Options ─── */
  .a2ui-options {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }

  .a2ui-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid transparent;
  }

  .a2ui-option:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .a2ui-option input[type="radio"] {
    display: none;
  }

  .a2ui-option-radio {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    flex-shrink: 0;
    position: relative;
    transition: all 0.2s ease;
  }

  .a2ui-option-radio::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: transparent;
    transition: all 0.2s ease;
  }

  .a2ui-option input[type="radio"]:checked + .a2ui-option-radio {
    border-color: #e67e22;
  }

  .a2ui-option input[type="radio"]:checked + .a2ui-option-radio::after {
    background: #e67e22;
  }

  .a2ui-option input[type="radio"]:checked ~ .a2ui-option-text {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 500;
  }

  .a2ui-option-text {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.3;
  }

  /* ─── Action Buttons ─── */
  .a2ui-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .a2ui-btn {
    padding: 6px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.2s ease;
    letter-spacing: 0.3px;
  }

  .a2ui-btn-confirm {
    background: #e67e22;
    color: white;
  }

  .a2ui-btn-confirm:hover {
    background: #d35400;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(230, 126, 34, 0.3);
  }

  .a2ui-btn-cancel {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.5);
  }

  .a2ui-btn-cancel:hover {
    background: rgba(244, 67, 54, 0.15);
    color: #f44336;
  }

  /* ─── Result State ─── */
  .a2ui-completed {
    background: rgba(76, 175, 80, 0.08);
    border-color: rgba(76, 175, 80, 0.3);
    padding: 10px 14px;
  }

  .a2ui-dismissed {
    background: rgba(255, 255, 255, 0.02);
    border-color: rgba(255, 255, 255, 0.05);
    padding: 8px 14px;
    opacity: 0.5;
  }

  .a2ui-result {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .a2ui-result-icon {
    font-size: 14px;
  }

  .a2ui-result-dismissed {
    color: rgba(255, 255, 255, 0.4);
  }

  /* ─── Shake Animation ─── */
  @keyframes a2ui-shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(3px); }
  }

  .a2ui-shake {
    animation: a2ui-shake 0.4s ease;
    border-color: rgba(244, 67, 54, 0.5) !important;
  }

  /* ─── Sequential Flow ─── */
  .a2ui-sequence {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .a2ui-pending {
    opacity: 0.35;
    padding: 8px 14px;
    pointer-events: none;
  }

  .a2ui-pending .a2ui-label {
    margin-bottom: 2px;
    font-size: 10px;
  }

  .a2ui-pending-hint {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.3);
    font-style: italic;
  }

  .a2ui-active {
    border-color: rgba(230, 126, 34, 0.3);
    animation: a2ui-fadein 0.3s ease;
  }

  @keyframes a2ui-fadein {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ─── Artifact Cards ─── */
  .a2ui-artifact-card {
    margin: 8px 0;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    transition: all 0.2s ease;
  }

  .a2ui-artifact-card:hover {
    border-color: rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.05);
  }

  .a2ui-artifact-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
  }

  .a2ui-artifact-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .a2ui-artifact-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .a2ui-artifact-name {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .a2ui-artifact-path {
    font-size: 10px;
    color: rgba(232, 197, 110, 0.6);
    font-family: var(--vscode-editor-font-family, monospace);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
  }

  .a2ui-artifact-path:hover {
    color: rgba(232, 197, 110, 0.9);
    text-decoration: underline;
  }

  .a2ui-artifact-open {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border: 1px solid rgba(232, 197, 110, 0.3);
    border-radius: 6px;
    background: rgba(232, 197, 110, 0.08);
    color: rgba(232, 197, 110, 0.8);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }

  .a2ui-artifact-open:hover {
    background: rgba(232, 197, 110, 0.15);
    border-color: rgba(232, 197, 110, 0.5);
    color: rgba(232, 197, 110, 1);
  }

  .a2ui-artifact-details {
    width: 100%;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .a2ui-artifact-expand {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    cursor: pointer;
    list-style: none;
    user-select: none;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    transition: color 0.15s ease;
  }

  .a2ui-artifact-expand::-webkit-details-marker {
    display: none;
  }

  .a2ui-artifact-expand:hover {
    color: rgba(255, 255, 255, 0.7);
  }

  .a2ui-artifact-toggle {
    font-size: 9px;
    color: inherit;
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }

  .a2ui-artifact-details[open] .a2ui-artifact-toggle {
    transform: rotate(90deg);
  }

  .a2ui-artifact-content {
    padding: 14px 16px;
    font-size: 12px;
    line-height: 1.6;
    max-height: 300px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.15);
    color: rgba(255, 255, 255, 0.8);
  }

  .a2ui-artifact-content h1,
  .a2ui-artifact-content h2,
  .a2ui-artifact-content h3 {
    color: rgba(232, 197, 110, 0.9);
    margin-top: 12px;
    margin-bottom: 6px;
  }

  .a2ui-artifact-content h1 { font-size: 16px; }
  .a2ui-artifact-content h2 { font-size: 14px; }
  .a2ui-artifact-content h3 { font-size: 13px; }

  .a2ui-artifact-content p {
    margin: 6px 0;
  }

  .a2ui-artifact-content ul,
  .a2ui-artifact-content ol {
    padding-left: 20px;
    margin: 4px 0;
  }

  .a2ui-artifact-content code {
    background: rgba(255, 255, 255, 0.08);
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 11px;
  }

  .a2ui-artifact-content pre {
    background: rgba(0, 0, 0, 0.3);
    padding: 10px;
    border-radius: 6px;
    overflow-x: auto;
  }

  .a2ui-artifact-content pre code {
    background: none;
    padding: 0;
  }

  .a2ui-artifact-more-hint {
    margin: 8px 0 0;
    font-size: 10px;
    font-style: italic;
    color: var(--vscode-descriptionForeground);
    opacity: 0.6;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 6px;
  }

  /* ─── Confirm Component ─── */
  .a2ui-confirm-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    padding: 16px 18px;
    margin: 10px 0 4px;
  }

  .a2ui-confirm-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .a2ui-confirm-icon {
    font-size: 18px;
    line-height: 1;
  }

  .a2ui-confirm-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--vscode-foreground);
  }

  .a2ui-confirm-body {
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 14px;
    line-height: 1.5;
  }

  .a2ui-confirm-actions {
    display: flex;
    gap: 8px;
  }

  .a2ui-confirm-btn {
    padding: 6px 18px;
    border-radius: 6px;
    border: none;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .a2ui-confirm-btn-yes {
    background: rgba(72, 187, 120, 0.2);
    color: rgb(72, 187, 120);
    border: 1px solid rgba(72, 187, 120, 0.3);
  }

  .a2ui-confirm-btn-yes:hover {
    background: rgba(72, 187, 120, 0.35);
  }

  .a2ui-confirm-btn-no {
    background: rgba(255, 255, 255, 0.06);
    color: var(--vscode-descriptionForeground);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .a2ui-confirm-btn-no:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  /* ─── Results / Document Presentation ─── */
  .a2ui-results-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    overflow: hidden;
    margin: 10px 0 4px;
  }

  .a2ui-results-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.04);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .a2ui-results-icon {
    font-size: 16px;
  }

  .a2ui-results-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--vscode-foreground);
    flex: 1;
  }

  .a2ui-results-badge {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 20px;
    font-weight: 600;
  }

  .a2ui-results-badge-pass {
    background: rgba(72, 187, 120, 0.2);
    color: rgb(72, 187, 120);
  }

  .a2ui-results-badge-fail {
    background: rgba(220, 53, 69, 0.2);
    color: rgb(220, 53, 69);
  }

  .a2ui-results-open-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 5px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.06);
    color: var(--vscode-foreground);
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-right: 6px;
  }

  .a2ui-results-open-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .a2ui-results-path {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 10px;
    color: var(--vscode-descriptionForeground);
    opacity: 0.7;
  }

  .a2ui-results-path-label {
    font-size: 11px;
  }

  .a2ui-results-body {
    padding: 12px 16px;
  }

  .a2ui-results-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 10px;
  }

  .a2ui-results-stat {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    padding: 10px 12px;
  }

  .a2ui-results-stat-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 4px;
  }

  .a2ui-results-stat-value {
    font-size: 15px;
    font-weight: 700;
    color: var(--vscode-foreground);
  }

  .a2ui-results-criteria {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .a2ui-results-criterion {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    padding: 4px 0;
    color: var(--vscode-foreground);
  }

  .a2ui-results-criterion-pass { color: rgb(72, 187, 120); font-size: 14px; }
  .a2ui-results-criterion-fail { color: rgb(220, 53, 69); font-size: 14px; }

  /* ─── Chart / Statistics ─── */
  .a2ui-chart-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 14px 16px;
    margin: 10px 0 4px;
  }

  .a2ui-chart-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 14px;
  }

  .a2ui-chart-bars {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .a2ui-chart-row {
    display: grid;
    grid-template-columns: 80px 1fr 40px;
    align-items: center;
    gap: 10px;
  }

  .a2ui-chart-label {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .a2ui-chart-bar-track {
    height: 10px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 5px;
    overflow: hidden;
  }

  .a2ui-chart-bar-fill {
    height: 100%;
    border-radius: 5px;
    background: linear-gradient(90deg, rgba(232, 197, 110, 0.5), rgba(232, 197, 110, 0.9));
    transition: width 0.6s ease;
  }

  .a2ui-chart-value {
    font-size: 11px;
    font-weight: 700;
    color: var(--vscode-foreground);
    text-align: left;
  }

  /* ─── Error Component ─── */
  .a2ui-error-card {
    background: rgba(220, 53, 69, 0.08);
    border: 1px solid rgba(220, 53, 69, 0.3);
    border-left: 3px solid rgb(220, 53, 69);
    border-radius: 8px;
    padding: 12px 14px;
    margin: 10px 0 4px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .a2ui-error-icon {
    font-size: 16px;
    line-height: 1.3;
    flex-shrink: 0;
  }

  .a2ui-error-content {}

  .a2ui-error-title {
    font-size: 12px;
    font-weight: 700;
    color: rgb(220, 53, 69);
    margin-bottom: 4px;
  }

  .a2ui-error-body {
    font-size: 12px;
    color: var(--vscode-foreground);
    line-height: 1.5;
  }

  /* ─── Warning Component ─── */
  .a2ui-warning-card {
    background: rgba(255, 193, 7, 0.07);
    border: 1px solid rgba(255, 193, 7, 0.25);
    border-left: 3px solid rgb(255, 193, 7);
    border-radius: 8px;
    padding: 12px 14px;
    margin: 10px 0 4px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .a2ui-warning-icon {
    font-size: 16px;
    line-height: 1.3;
    flex-shrink: 0;
  }

  .a2ui-warning-content {}

  .a2ui-warning-title {
    font-size: 12px;
    font-weight: 700;
    color: rgb(255, 193, 7);
    margin-bottom: 4px;
  }

  .a2ui-warning-body {
    font-size: 12px;
    color: var(--vscode-foreground);
    line-height: 1.5;
  }

  /* ─── Info Component ─── */
  .a2ui-info-card {
    background: rgba(99, 179, 237, 0.07);
    border: 1px solid rgba(99, 179, 237, 0.25);
    border-left: 3px solid rgb(99, 179, 237);
    border-radius: 8px;
    padding: 12px 14px;
    margin: 10px 0 4px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .a2ui-info-icon {
    font-size: 16px;
    line-height: 1.3;
    flex-shrink: 0;
  }

  .a2ui-info-content {}

  .a2ui-info-title {
    font-size: 12px;
    font-weight: 700;
    color: rgb(99, 179, 237);
    margin-bottom: 4px;
  }

  .a2ui-info-body {
    font-size: 12px;
    color: var(--vscode-foreground);
    line-height: 1.5;
  }
`;
