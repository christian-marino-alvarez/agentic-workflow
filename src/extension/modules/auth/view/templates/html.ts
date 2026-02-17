import { html } from 'lit';
import { Auth } from '../index.js';

export const render = (view: Auth) => html`
  <h1>Authentication Module</h1>
  <p>
    This module handles OAuth authentication for the Agentic Workflow extension.
    It operates primarily in the background.
  </p>
  <p>
    Current Status: <strong>Active</strong>
  </p>
`;


