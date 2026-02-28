import { css } from 'lit';

export const welcomeStyles = css`
  .welcome-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 24px;
    min-height: 300px;
  }

  .welcome-content {
    text-align: center;
    max-width: 380px;
    width: 100%;
  }

  .welcome-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .welcome-title {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: var(--vscode-foreground);
    letter-spacing: -0.3px;
  }

  .welcome-description {
    font-size: 13px;
    line-height: 1.5;
    color: var(--vscode-descriptionForeground);
    margin: 0 0 20px 0;
  }

  /* ── Features (empty state) ────────────── */
  .welcome-features {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 24px;
    text-align: left;
  }

  .welcome-feature {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--vscode-editor-background);
    border-radius: 8px;
    border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.06));
  }

  .feature-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .feature-text {
    font-size: 12px;
    color: var(--vscode-foreground);
    opacity: 0.85;
  }

  /* ── Sessions (resume state) ───────────── */
  .welcome-sessions {
    margin-bottom: 20px;
    text-align: left;
  }

  .welcome-resume-btn {
    display: block;
    width: 100%;
    padding: 14px 16px;
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-focusBorder, #007acc);
    border-radius: 10px;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
    margin-bottom: 12px;
  }

  .welcome-resume-btn:hover {
    background: var(--vscode-list-hoverBackground);
    transform: translateY(-1px);
  }

  .resume-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-focusBorder, #007acc);
    margin-bottom: 4px;
  }

  .resume-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--vscode-foreground);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .resume-meta {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
  }

  .welcome-others-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 8px;
    padding-left: 4px;
  }

  .welcome-others {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 16px;
  }

  .welcome-session-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 12px;
    background: transparent;
    border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.06));
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
    font-family: var(--vscode-font-family);
  }

  .welcome-session-item:hover {
    background: var(--vscode-list-hoverBackground);
  }

  .session-title {
    font-size: 12px;
    color: var(--vscode-foreground);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    text-align: left;
  }

  .session-meta {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    flex-shrink: 0;
  }

  /* ── Start button ──────────────────────── */
  .welcome-start-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 24px;
    font-size: 13px;
    font-weight: 600;
    color: var(--vscode-button-foreground);
    background: var(--vscode-button-background);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    font-family: var(--vscode-font-family);
  }

  .welcome-start-btn:hover {
    background: var(--vscode-button-hoverBackground);
    transform: translateY(-1px);
  }

  .welcome-start-btn:active {
    transform: translateY(0);
  }
`;
