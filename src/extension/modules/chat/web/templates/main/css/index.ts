import { css } from 'lit';

export const mainStyles = css`
  .main-container {
    padding: 16px;
    height: calc(100vh - 32px);
    display: flex;
    flex-direction: column;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--agw-border);
    padding-bottom: 12px;
  }

  .model-info {
    font-size: 11px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    opacity: 0.7;
  }

  .chat-area {
    flex: 1;
    min-height: 200px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .streaming-box {
    width: 100%;
    height: 120px;
    background: var(--agw-surface-overlay);
    border: 1px solid var(--agw-border);
    border-radius: 8px;
    padding: 12px;
    font-family: var(--agw-font-mono);
    font-size: 13px;
    overflow-y: auto;
    margin-bottom: 12px;
    white-space: pre-wrap;
  }

  .demo-logs {
    width: 100%;
    height: 80px;
    font-size: 10px;
    opacity: 0.6;
    overflow-y: auto;
    border-top: 1px dashed var(--agw-border);
    padding-top: 8px;
  }

  .input-area {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }

  textarea {
    resize: none;
    min-height: 100px;
  }
`;
