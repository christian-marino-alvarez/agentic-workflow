import { css } from 'lit';

export const commonStyles = css`
  :host {
    display: block;
    box-sizing: border-box;
  }
  * {
    box-sizing: border-box;
  }
`;

export const LOG_STYLE = {
  View: 'background: #6a1b9a; color: #fff; padding: 2px 5px; border-radius: 3px; font-weight: bold;',
  Args: 'color: #9c27b0;'
};
