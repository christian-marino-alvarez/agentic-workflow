import { html, nothing } from 'lit';
import { Settings } from '../../index.js';
import { LLMModelConfig } from '../../../types.js';
import { getProviderIcon } from '../icons.js';

export function renderList(view: Settings) {
  console.log('[View] renderList called. Models:', view.models.length);
  if (view.models.length === 0) {
    console.log('[View] Rendering empty state');
    return html`
      <div class="empty-state">
        <div class="empty-state-content">
          <h3>No models registered</h3>
          <p>Add your first LLM model to get started</p>
          <button class="add-btn-centered" @click=${() => view.userActionAdded()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Add Model</span>
          </button>
        </div>
      </div>
    `;
  }

  return html`
    <div class="settings-list-container">
      ${view.models.map(model => renderModelCard(view, model))}
    </div>
  `;
}

function renderModelCard(view: Settings, model: LLMModelConfig) {
  const isActive = model.id === view.activeModelId;

  return html`
    <div class="model-card ${isActive ? 'active-model' : ''}">
      <div class="model-icon-left">
        ${getProviderIcon(model.provider)}
      </div>
      <div class="model-info">
        <div class="model-header">
           <h3 class="model-name">${model.name || 'Unnamed Model'}</h3>
           ${isActive ? html`<span class="badge-active" title="Fallback model when no role is assigned">Default</span>` : ''}
        </div>
        <div class="model-details">
           <span class="model-provider-name">${model.provider}</span>
           <span class="badge-auth-type ${model.authType === 'oauth' ? 'oauth' : 'apikey'}">
             ${model.authType === 'oauth'
      ? (view.verifiedModelIds.has(model.id) ? '🔐 OAuth' : '👤 OAuth')
      : '🔑 API Key'}
           </span>
           ${view.verifiedModelIds.has(model.id) ? html`
             <span class="badge-verified">✓ Verified</span>
           ` : nothing}
        </div>
      </div>
      <div class="model-actions">
        ${!isActive ? html`
          <button class="action-btn select" @click=${(e: Event) => {
        e.stopPropagation();
        view.userActionSelected(model.id);
      }} title="Use as default fallback model">
            Set Default
          </button>
        ` : ''}
        <button class="action-btn edit" @click=${(e: Event) => {
      e.stopPropagation();
      view.userActionEdited(model.id);
    }} title="Edit model">
          Edit
        </button>
        ${!isActive ? html`
          <button 
            class="action-btn delete ${view.pendingDeleteId === model.id ? 'confirm-delete' : ''}" 
            @click=${(e: Event) => {
        e.stopPropagation();
        view.userActionDeleted(model.id);
      }} 
            title="${view.pendingDeleteId === model.id ? 'Click again to confirm' : 'Delete model'}"
          >
            ${view.pendingDeleteId === model.id ? 'Confirm' : 'Delete'}
          </button>
        ` : ''}
      </div>
    </div>
  `;
}
