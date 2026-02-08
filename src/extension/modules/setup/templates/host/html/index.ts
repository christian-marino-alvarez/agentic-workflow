import { html } from 'lit';

export function renderHost(tab: string, renderContent: () => any, setTab: (tab: any) => void) {
  console.log('[renderHost] Current tab:', tab);
  return html`
    <div class="tabs">
      <div class="tab ${tab === 'list' ? 'active' : ''}" @click=${() => setTab('list')}>Modelos</div>
      <div class="tab ${tab === 'new' ? 'active' : ''}" @click=${() => setTab('new')}>Añadir</div>
      ${tab === 'edit' ? html`<div class="tab active">Configurar</div>` : ''}
    </div>
    <div class="container">
      ${renderContent()}
    </div>
  `;
}
