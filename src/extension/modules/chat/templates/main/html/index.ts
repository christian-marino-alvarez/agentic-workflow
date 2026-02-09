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
          <div id="streaming-output" class="streaming-box">
            <!-- Tokens aparecerán aquí -->
          </div>
          <div id="demo-logs" class="demo-logs">
            <!-- Logs de ACKs y validaciones -->
          </div>
        </div>

        <div class="input-area">
          <textarea id="payload" class="input-field" placeholder="Enter instructions for Neo..."></textarea>
          <div class="actions">
            <button class="btn-primary" @click=${params.onSend}>Send to Neo</button>
            <button class="btn-secondary" @click=${() => (document.querySelector('agw-chat-view') as any)?.startDemo()}>Run Bridge Demo</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
