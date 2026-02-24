import { css } from 'lit';

export const headerStyles = css`
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
      flex-wrap: wrap;
      gap: 10px;
    }

    .actions-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    /* Workflow info in header */
    .workflow-info {
      display: flex;
      align-items: center; /* centers the + button with the text vertically */
      gap: 6px;
      font-size: 11px;
      font-weight: 500;
      flex: 1 1 200px; /* guarantees it takes some width, pushing actions down when small */
      min-width: 0; /* needed for text truncation */
    }

    .workflow-info > svg {
      flex-shrink: 0;
    }

    .workflow-label {
      color: #ffffff;
      font-weight: 500;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .agent-timer {
      white-space: nowrap;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      display: flex;
      align-items: center;
      gap: 4px;
    }


    .header-new-task {
      margin-left: 4px;
      padding: 2px 6px;
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      background: none;
      color: var(--vscode-foreground);
      font-size: 14px;
      line-height: 1;
      flex-shrink: 0;
    }

    /* Header Pill Buttons (progress + details) */
    .header-pill-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 3px 8px;
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.1);
      cursor: pointer;
      color: var(--vscode-foreground);
      transition: all 0.2s ease;
    }

    .header-pill-btn.details-btn {
      gap: 4px;
    }

    .header-pill-btn:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.2);
    }

    .header-pill-btn.active {
      border-color: var(--vscode-textLink-foreground);
      background: rgba(55, 148, 255, 0.1);
      color: var(--vscode-textLink-foreground);
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
`;
