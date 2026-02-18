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

  .power-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    margin-right: 8px;
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
    margin-right: 8px;
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

  .power-btn-wrap .power-btn {
    margin-right: 0;
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
