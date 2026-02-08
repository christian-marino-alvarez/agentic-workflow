import { html } from 'lit';

export function renderNew(provider: string, actions: { create: () => void, changeProvider: (e: Event) => void }) {
  return html`
    <div class="field">
      <label class="label">Nombre del Perfil</label>
      <input id="new-name" class="input" type="text" placeholder="Ej: Mi GPT-4">
    </div>
    <div class="field">
      <label class="label">Proveedor</label>
      <select id="new-provider" class="select" @change=${(e: Event) => actions.changeProvider(e)}>
        <option value="openai" ?selected=${provider === 'openai'}>OpenAI</option>
        <option value="gemini" ?selected=${provider === 'gemini'}>Gemini</option>
        <option value="custom" ?selected=${provider === 'custom'}>Custom</option>
      </select>
    </div>
    <div class="field">
      <label class="label">Modelo ID</label>
      <input id="new-model" class="input" type="text" placeholder="Ej: gpt-4o">
    </div>
    <div class="field">
      <label class="label">API Key</label>
      <input id="new-key" class="input" type="password" placeholder="sk-...">
    </div>
    ${provider === 'custom' ? html`
      <div class="field">
        <label class="label">Endpoint URL</label>
        <input id="new-endpoint" class="input" type="text" placeholder="https://api.example.com/v1">
      </div>
    ` : ''}
    <div class="form-actions">
      <button class="btn btn--primary" @click=${actions.create}>Guardar Configuración</button>
    </div>
  `;
}
