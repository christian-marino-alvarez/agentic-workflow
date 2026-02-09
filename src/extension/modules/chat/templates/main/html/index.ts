import { html } from 'lit';

export function renderMain(params: { environment: string, modelId: string, onSend: () => void }) {
  return html`
    <div class="main-container animate-fade">
      <div class="glass-card">
        <div class="header-row">
          <span class="badge badge-${params.environment}">${params.environment}</span>
          <span class="model-info">Model: <strong>${params.modelId || 'Not Selected'}</strong></span>
        </div>
        
        <div class="chat-area">
          <!-- Chat messages would go here -->
          <div class="empty-state">
            <p>Welcome to Agentic Workflow Chat</p>
            <small>Configure your secrets in the Security tab to start.</small>
          </div>
        </div>

        <div class="input-area">
          <textarea id="payload" class="input-field" placeholder="Enter instructions for Neo..."></textarea>
          <div class="actions">
            <button class="btn-primary" @click=${params.onSend}>Send to Neo</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
