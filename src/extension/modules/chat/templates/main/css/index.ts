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

  .empty-state {
    text-align: center;
    opacity: 0.5;
  }

  .empty-state p {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
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
