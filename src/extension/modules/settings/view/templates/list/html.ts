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

function getModelDescription(modelName: string): string {
  const descriptions: Record<string, string> = {
    // Google
    'gemini-2.5-pro': 'Advanced reasoning & coding — best for complex tasks',
    'gemini-2.5-flash': 'Fast & efficient — great for quick tasks & drafts',
    'gemini-2.0-flash': 'Previous gen fast model — good balance of speed & quality',
    'gemini-1.5-pro': 'Strong general purpose — documents & long context',
    'gemini-1.5-flash': 'Lightweight & fast — ideal for simple queries',
    // OpenAI
    'gpt-4o': 'Multimodal powerhouse — text, vision, audio',
    'gpt-4o-mini': 'Cost-efficient — fast responses, good quality',
    'gpt-4-turbo': 'High capability — complex reasoning & code',
    'o1': 'Deep reasoning — excels at math & science',
    'o1-mini': 'Fast reasoning — good for STEM tasks',
    'o3-mini': 'Next-gen reasoning — balanced speed & depth',
    // Anthropic
    'claude-sonnet-4-20250514': 'Latest Sonnet — excellent coding & analysis',
    'claude-3-7-sonnet-20250219': 'Extended thinking — deep analysis & planning',
    'claude-3-5-sonnet-20241022': 'Strong all-rounder — coding, writing, reasoning',
    'claude-3-5-haiku-20241022': 'Ultra-fast — quick responses, good quality',
    'claude-3-opus-20240229': 'Most capable — complex tasks & nuanced writing',
    // Codex
    'codex-mini-latest': 'Code specialist — optimized for programming tasks',
  };
  // Try exact match, then partial match
  if (descriptions[modelName]) { return descriptions[modelName]; }
  for (const [key, desc] of Object.entries(descriptions)) {
    if (modelName.includes(key) || key.includes(modelName)) { return desc; }
  }
  return 'Custom model configuration';
}

function renderModelCard(view: Settings, model: LLMModelConfig) {
  const description = getModelDescription(model.modelName || model.name);
  return html`
    <div class="model-card">
      <div class="model-icon-left">
        ${getProviderIcon(model.provider)}
      </div>
      <div class="model-info">
        <div class="model-header">
           <h3 class="model-name">${model.name || 'Unnamed Model'}</h3>
        </div>
        <div class="model-description">${description}</div>
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
        <button class="action-btn edit" @click=${(e: Event) => {
      e.stopPropagation();
      view.userActionEdited(model.id);
    }} title="Edit model">
          Edit
        </button>
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
      </div>
    </div>
  `;
}
