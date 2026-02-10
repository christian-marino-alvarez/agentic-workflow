import { html } from 'lit';

export function renderNotFound() {
  return html`
    <div class="empty-state animate-fade">
      <div class="glass-card">
        <p>Vista no encontrada</p>
        <small>Parece que el estado del router es inválido.</small>
      </div>
    </div>
  `;
}
