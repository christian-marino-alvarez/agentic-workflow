import { html } from 'lit';

export function renderHost(
  tab: string,
  renderContent: () => any,
  setTab: (tab: any) => void,
  environment: 'dev' | 'pro',
  onEnvironmentChange: (env: 'dev' | 'pro') => void
) {
  console.log('[renderHost] Current tab:', tab);
  return html`
    <div class="env-bar">
      <label for="env-select">Entorno:</label>
      <select id="env-select" @change=${(e: Event) => onEnvironmentChange((e.target as HTMLSelectElement).value as 'dev' | 'pro')}>
        <option value="dev" ?selected=${environment === 'dev'}>DEV</option>
        <option value="pro" ?selected=${environment === 'pro'}>PRO</option>
      </select>
    </div>
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
