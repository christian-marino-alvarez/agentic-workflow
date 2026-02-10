import { html } from 'lit';

export function renderMain(params: {
  environment: string;
  models: any[];
  modelId: string;
  proposal?: any | null;
  onSend: () => void;
  onModelChange: (e: Event) => void;
  onAcceptProposal: () => void;
  onRejectProposal: () => void;
  isInitialized: boolean;
}) {
  return html`
    <div class="main-container">
      <div class="header-section">
        <div class="environment-badge">
          <span class="badge badge--${params.environment || 'pro'}">${(params.environment || 'pro').toUpperCase()}</span>
        </div>
        <div class="model-selector">
          <label for="model-selector">Modelo:</label>
          ${!params.isInitialized
      ? html`<span class="loading-text">Conectando...</span>`
      : params.models && params.models.length > 0
        ? html`
                  <vscode-dropdown 
                    id="model-selector" 
                    @change="${params.onModelChange}"
                  >
                    ${params.models.map(model => html`
                      <vscode-option value="${model.id}" ?selected="${model.id === params.modelId}">
                        ${model.name}
                      </vscode-option>
                    `)}
                  </vscode-dropdown>
                `
        : html`<span class="error-text">No hay modelos (Security)</span>`
    }
        </div>
      </div>

      <!-- Notificación de Propuesta de Modelo (HIL) -->
      ${params.proposal && params.proposal.reason ? html`
        <div class="model-proposal-card">
          <div class="proposal-header">
            <span class="proposal-icon">💡</span>
            <span class="proposal-title">Optimización sugerida</span>
          </div>
          <p class="proposal-reason">${params.proposal.reason}</p>
          <div class="proposal-details">
          <div class="proposal-savings">
            <span class="saving-item">💰 Ahorro: <strong>-${params.proposal.estimatedSavings?.cost || 0}%</strong></span>
            <span class="saving-item">⚡ Velocidad: <strong>+${params.proposal.estimatedSavings?.speed || 0}%</strong></span>
          </div>
          <div class="proposal-change">
            <span class="model-old">${params.proposal.currentModel || 'Actual'}</span>
            <span class="change-arrow">→</span>
            <span class="model-new">${params.proposal.proposedModel || 'Nuevo'}</span>
          </div>
        </div>
        <div class="proposal-actions">
          <vscode-button appearance="secondary" @click="${params.onRejectProposal}">Mantener</vscode-button>
          <vscode-button appearance="primary" @click="${params.onAcceptProposal}">Cambiar</vscode-button>
        </div>
      </div>
      ` : ''}

      <div class="streaming-box" id="streaming-output">
        <!-- Ejemplo de conversación -->
        <div class="message user">
          <div class="message-header">
            <div class="avatar user-avatar">👤</div>
            <div class="message-info">
              <span class="message-author">Desarrollador</span>
              <span class="message-time">10:45 AM</span>
            </div>
          </div>
          <div class="message-separator"></div>
          <div class="message-content">
            Necesito ayuda para implementar un sistema de autenticación en mi aplicación.
          </div>
        </div>

        <div class="message assistant">
          <div class="message-header">
            <div class="avatar assistant-avatar">🤖</div>
            <div class="message-info">
              <span class="message-author">GPT-4o</span>
              <span class="message-time">10:45 AM</span>
            </div>
          </div>
          <div class="message-separator"></div>
          <div class="message-content">
            Claro, puedo ayudarte con eso. Para implementar un sistema de autenticación robusto, te recomiendo seguir estos pasos:
            <br/><br/>
            1. Utilizar JSON Web Tokens (JWT) para gestionar sesiones.<br/>
            2. Implementar hash de contraseñas con bcrypt.<br/>
            3. Configurar middleware de autenticación.<br/><br/>
            ¿Qué stack tecnológico estás utilizando?
          </div>
        </div>
      </div>

      <div class="input-area">
        <textarea 
          class="input-field"
          id="payload" 
          placeholder="Escribe tu mensaje aquí..."
          rows="3"
        ></textarea>
        <div class="actions">
          <vscode-button appearance="primary" @click="${params.onSend}">Enviar</vscode-button>
        </div>
      </div>

      <div class="demo-logs" id="demo-logs">
        <!-- Logs de ACKs y validaciones aparecerán aquí -->
      </div>
    </div>
  `;
}
