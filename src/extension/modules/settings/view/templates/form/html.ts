import { html } from 'lit';
import { Settings } from '../../index.js';
import { LLMModelConfig } from '../../../types.js';

export function renderForm(view: Settings) {
  const model = view.editingModel || {} as LLMModelConfig;
  const isEdit = !!view.editingModel;

  return html`
    <div class="form-container">
      <h2>${isEdit ? 'Edit Model' : 'Add Model'}</h2>
      
      ${view.errorMessage ? html`
        <div class="error-banner">
          ${view.errorMessage}
        </div>
      ` : ''}
      
      <form @submit=${(e: Event) => view.userActionAccepted(e)}>
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" .value=${model.name || ''} required>
        </div>

        <div class="form-group">
          <label for="provider">Provider</label>
          <select id="provider" name="provider" .value=${model.provider || 'openai'}>
            <option value="gemini">Gemini</option>
            <option value="codex">Codex (OpenAI)</option>
            <option value="claude">Claude</option>
          </select>
        </div>

        <div class="form-group">
          <label for="apiKey">API Key</label>
          <input type="password" id="apiKey" name="apiKey" .value=${model.apiKey || ''}>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click=${() => view.userActionCancelled()}>
            Cancel
          </button>
          <button type="submit" class="btn-save">
            Save Model
          </button>
        </div>
      </form>
    </div>
  `;
}
