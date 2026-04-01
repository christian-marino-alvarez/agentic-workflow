import { css } from 'lit';

export const styles = css`
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 16px 8px 16px;
    border-bottom: 1px solid var(--vscode-widget-border);
    margin-bottom: 0;
    margin-top: 0; 
  }

  .section-header h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .model-details {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
  }

  /* Override shared .model-card for role-binding: column layout */
  .role-binding-section .model-card {
    flex-direction: column;
    align-items: stretch;
  }

  .role-binding-section .model-card.disabled {
    opacity: 0.6;
    filter: grayscale(100%);
  }

  .role-binding-section .model-card.disabled .model-name {
    text-decoration: line-through;
  }

  /* Yellow hover for agent cards */
  .role-binding-section .model-card:not(.disabled):hover {
    border-color: var(--vscode-notificationsWarningIcon-foreground, #cca700);
  }

  /* No selected/active highlight in the Agents section */
  .role-binding-section .model-card.active-model {
    background-color: var(--vscode-editor-background);
    border-color: var(--vscode-widget-border);
  }

  /* ─── Role Row Header (icon + name + power btn) ────── */

  .role-row-header {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .role-row-header .model-info {
    flex: 1;
    min-width: 0;
  }

  .role-row-header .power-btn-wrap {
    flex-shrink: 0;
  }

  /* ─── Role Config Row (dropdowns + capabilities) ───── */

  .role-row-config {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--vscode-widget-border);
  }

  .role-row-config.config-disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .role-dropdowns {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .model-selection-desc {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    font-style: italic;
    padding: 4px 2px 0;
    line-height: 1.4;
    opacity: 0.8;
    animation: descFadeIn 0.3s ease;
  }
  @keyframes descFadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 0.8; transform: translateY(0); }
  }

  /* ─── Normalized Dropdown ────────────────────────── */

  .dropdown-group {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
    min-width: 0;
  }

  .dropdown-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground);
    font-weight: 500;
    padding-left: 2px;
  }

  .dropdown-wrapper {
    position: relative;
  }

  .dropdown-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 5px 8px;
    border-radius: 4px;
    background: var(--vscode-dropdown-background, #252526);
    color: var(--vscode-dropdown-foreground);
    border: 1px solid var(--vscode-dropdown-border, #3c3c3c);
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    transition: border-color 0.15s ease;
    box-sizing: border-box;
    text-align: left;
  }

  .dropdown-trigger:hover:not(:disabled) {
    border-color: var(--vscode-focusBorder);
  }

  .dropdown-trigger.open {
    border-color: var(--vscode-focusBorder);
  }

  .dropdown-trigger:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .dropdown-trigger-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dropdown-trigger-label.placeholder {
    color: var(--vscode-descriptionForeground);
  }

  .dropdown-popup {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 100;
    min-width: 100%;
    background: var(--vscode-dropdown-background, #252526);
    border: 1px solid var(--vscode-dropdown-border, #3c3c3c);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    padding: 4px 0;
    margin-top: 4px;
  }

  .dropdown-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--vscode-dropdown-foreground, #ccc);
    cursor: pointer;
    border-radius: 3px;
    margin: 0 4px;
    transition: background 0.1s ease;
  }

  .dropdown-option:hover {
    background: var(--vscode-list-hoverBackground, #2a2d2e);
  }

  .dropdown-option.active {
    background: var(--vscode-list-activeSelectionBackground, #094771);
    color: var(--vscode-list-activeSelectionForeground, #fff);
  }

  /* ─── Capability Toggles ──────────────────────────── */

  .capability-toggles {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    align-items: center;
  }

  .capability-tag {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 10px;
    border: 1px solid var(--vscode-widget-border);
    background: transparent;
    color: var(--vscode-descriptionForeground);
    cursor: pointer;
    transition: all 0.15s ease;
    text-transform: capitalize;
    letter-spacing: 0.3px;
    font-weight: 500;
    white-space: nowrap;
  }

  .capability-tag:hover:not(:disabled) {
    border-color: var(--vscode-focusBorder);
    color: var(--vscode-foreground);
  }

  .capability-tag.active {
    background: color-mix(in srgb, var(--vscode-testing-iconPassed) 20%, transparent);
    border-color: var(--vscode-testing-iconPassed);
    color: var(--vscode-testing-iconPassed);
  }

  .capability-tag:disabled {
    opacity: 0.4;
    cursor: default;
  }

  /* ─── Power Button ─────────────────────────────── */

  .power-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .power-btn-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .power-btn-wrap::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--vscode-editorHoverWidget-background, #252526);
    color: var(--vscode-editorHoverWidget-foreground, #cccccc);
    border: 1px solid var(--vscode-editorHoverWidget-border, #454545);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 11px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 100;
  }

  .power-btn-wrap:hover::after {
    opacity: 1;
  }

  .power-btn:hover {
    background-color: var(--vscode-toolbar-hoverBackground);
  }

  .power-btn.on:hover,
  .power-btn.off:hover {
    color: var(--vscode-notificationsWarningIcon-foreground, #cca700);
  }

  .power-btn.on {
    color: var(--vscode-testing-iconPassed);
  }

  .power-btn.off {
    color: var(--vscode-descriptionForeground);
  }

  .power-btn.pending {
    color: var(--vscode-notificationsWarningIcon-foreground, #cca700);
    background-color: color-mix(in srgb, var(--vscode-notificationsWarningIcon-foreground, #cca700) 15%, transparent);
    border-radius: 4px;
    padding: 2px 6px;
    gap: 4px;
    animation: pulse 1s ease-in-out infinite;
  }

  .power-btn-label {
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .power-btn .codicon {
    font-size: 16px;
  }
`;
