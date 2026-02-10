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
    <!-- ── Toolbar ──────────────────────────── -->
    <div class="toolbar">
      <span class="toolbar__env toolbar__env--${params.environment || 'pro'}">
        ${(params.environment || 'pro').toUpperCase()}
      </span>
      <span class="toolbar__separator"></span>
      <div class="toolbar__model">
        <span class="toolbar__model-label">Modelo</span>
        ${!params.isInitialized
      ? html`<span class="loading-text" style="height:auto;font-size:11px;">Conectando...</span>`
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
        : html`<span class="error-text">Sin modelos</span>`
    }
      </div>
      <span class="toolbar__status ${params.isInitialized ? '' : 'toolbar__status--disconnected'}"></span>
    </div>

    <!-- ── Model Proposal (HIL) ─────────────── -->
    ${params.proposal && params.proposal.reason ? html`
      <div class="model-proposal-card">
        <div class="proposal-header">
          <span class="proposal-icon">💡</span>
          <span>Optimización sugerida</span>
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

    <!-- ── Chat area ────────────────────────── -->
    <div class="chat-area">
      ${params.isInitialized
      ? html`<openai-chatkit id="chatkit-instance"></openai-chatkit>`
      : html`<div class="loading-text">Inicializando</div>`
    }
    </div>
  `;
}
