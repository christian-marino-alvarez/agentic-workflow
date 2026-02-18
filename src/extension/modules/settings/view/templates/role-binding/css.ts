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
`;
