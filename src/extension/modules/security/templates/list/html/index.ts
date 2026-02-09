import { html } from 'lit';

export function renderList(models: any[], activeModelId: string, actions: { setActive: (id: string) => void, editModel: (id: string) => void, deleteModel: (id: string) => void }) {
  return html`
    ${models.map(m => html`
      <div class="card ${activeModelId === m.id ? 'active' : ''}">
        <div class="card-header">
          <div>
            <div class="card-title">${m.name}</div>
            <div class="card-subtitle">${m.provider.toUpperCase()}</div>
          </div>
          <span class="status-badge ${m.hasApiKey ? 'present' : 'missing'}">
            ${m.hasApiKey ? 'Conectado' : 'Falta Key'}
          </span>
        </div>
        <div class="card-id">${m.modelId}</div>
        <div class="actions">
          ${activeModelId !== m.id
      ? html`<button class="btn btn--primary" @click=${() => actions.setActive(m.id)}>Activar</button>`
      : html`<span class="active-indicator">✓ Activo</span>`
    }
          <button class="btn btn--secondary" @click=${() => actions.editModel(m.id)}>Editar</button>
          <button class="btn btn--danger" @click=${() => actions.deleteModel(m.id)}>Borrar</button>
        </div>
      </div>
    `)}
    ${models.length === 0 ? html`<div class="empty-state">No existen modelos registrados. Comienza configurando uno en la pestaña 'Añadir'.</div>` : ''}
  `;
}
