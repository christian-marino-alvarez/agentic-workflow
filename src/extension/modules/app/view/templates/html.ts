import { html } from 'lit';

export function render(this: any) {
  return html`
    <div>
      <h1>Agentic Workflow App</h1>
      <p>Welcome to the main application view.</p>
      <p>Status: Active</p>
      <p>Last Pong: ${this.lastPong}</p>
      <button @click=${this.ping}>
        Ping Backend ${this.pendingRequests > 0 ? `(${this.pendingRequests} pending)` : ''}
      </button>
    </div>
  `;
}
