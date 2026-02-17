import { html } from 'lit';
import { Settings } from '../../index.js';
import { renderSkeleton } from '../skeleton/html.js';
import { renderList } from '../list/html.js';
import { renderForm } from '../form/html.js';

export function render(view: Settings) {
  const handleAdd = () => {
    view.userActionAdded();
  };

  if (view.isLoading) {
    return html`
      <div class="settings-container">
        <div class="header-actions">
          <h2>Managed Models</h2>
        </div>
        <div class="main-content">
          ${renderSkeleton()}
        </div>
      </div>
    `;
  }

  return html`
    <div class="settings-container">
      ${!view.showForm ? html`
        ${view.models.length > 0 ? html`
          <div class="header-actions">
            <h2>Managed Models</h2>
            <div class="actions-group">
              <button class="icon-btn" @click=${() => view.userActionRefresh()} title="Refresh">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                  <path d="M16 21h5v-5"/>
                </svg>
              </button>
              <button class="icon-btn" @click=${handleAdd} title="Add new model">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        ` : ''}
        <div class="main-content">
          ${renderList(view)}
        </div>
      ` : html`
        <div class="main-content">
          ${renderForm(view)}
        </div>
      `}
    </div>
  `;
}
