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

  .dropdown {
    width: 100%;
    padding: 5px 28px 5px 8px;
    border-radius: 4px;
    background: var(--vscode-dropdown-background);
    color: var(--vscode-dropdown-foreground);
    border: 1px solid var(--vscode-dropdown-border);
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    transition: border-color 0.15s ease;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 16 16' fill='%23999'%3E%3Cpath d='M7.976 10.072l4.357-4.357.62.618L8.284 11h-.618L3 6.333l.619-.618 4.357 4.357z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    box-sizing: border-box;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .dropdown:hover:not(:disabled) {
    border-color: var(--vscode-focusBorder);
  }

  .dropdown:focus {
    outline: none;
    border-color: var(--vscode-focusBorder);
  }

  .dropdown:disabled {
    opacity: 0.5;
    cursor: default;
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
