import { html } from 'lit';
import { MainView } from '../index.js';

export const renderTemplate = (view: MainView) => html`
  <h1>Application Shell</h1>
  <p>Status: ${view.isConnected ? 'Connected' : 'Disconnected'}</p>
  <p>Last Pong: <strong>${view.lastPong}</strong></p>
  <button @click=${view.ping}>Ping Server</button>
`;
