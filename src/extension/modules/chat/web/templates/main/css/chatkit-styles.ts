import { css } from 'lit';

export const chatkitStyles = css`
  openai-chatkit,
  .chat-area openai-chatkit {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 0;
    border: none;
    background: var(--vscode-editor-background);
  }

  /* Shadow Parts OOCSS Overrides */
  openai-chatkit::part(message-list) {
    padding: 8px;
  }

  openai-chatkit::part(input-container) {
    border-top: 1px solid var(--vscode-panel-border);
  }
`;
