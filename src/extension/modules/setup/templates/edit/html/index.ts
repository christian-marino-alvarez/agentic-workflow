import { html } from 'lit';

export function renderEdit(model: any, provider: string, actions: { update: () => void, cancel: () => void, changeProvider: (e: Event) => void }) {
  if (!model) {
    return html`<div>Modelo no encontrado</div>`;
  }

  return html`
    <div class="field">
      <label class="label">Nombre del Perfil</label>
      <input id="edit-name" class="input" type="text" .value=${model.name}>
    </div>
    <div class="field">
      <label class="label">Proveedor</label>
      <select id="edit-provider" class="select" @change=${(e: Event) => actions.changeProvider(e)}>
        <option value="openai" ?selected=${provider === 'openai'}>OpenAI</option>
        <option value="gemini" ?selected=${provider === 'gemini'}>Gemini</option>
        <option value="custom" ?selected=${provider === 'custom'}>Custom</option>
      </select>
    </div>
    <div class="field">
      <label class="label">Modelo ID</label>
      <input id="edit-model" class="input" type="text" .value=${model.modelId}>
    </div>
    <div class="field">
      <label class="label">API Key</label>
      <input id="edit-key" class="input" type="password" placeholder="•••••••• (Dejar vacío para mantener)">
    </div>
    ${provider === 'custom' ? html`
      <div class="field">
        <label class="label">Endpoint URL</label>
        <input id="edit-endpoint" class="input" type="text" .value=${model.baseUrl || ''}>
      </div>
    ` : ''}
    <div class="form-actions">
      <button class="btn btn--primary" @click=${actions.update}>Actualizar Perfil</button>
      <button class="btn btn--secondary" @click=${actions.cancel}>Cancelar</button>
    </div>
  `;
}
