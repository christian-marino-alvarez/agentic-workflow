import { html, TemplateResult } from 'lit';
import { Settings } from '../../index.js';
import { ViewState } from '../../../constants.js';
import { renderSkeleton } from '../skeleton/html.js';
import { renderList } from '../list/html.js';
import { renderForm } from '../form/html.js';
import { renderOAuthSetup } from '../oauth-setup/html.js';

// --- Template Functions ---

function templateLoading(view: Settings): TemplateResult {
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

function templateList(view: Settings): TemplateResult {
  const activeModel = view.models.find(m => m.id === view.activeModelId);
  const isOAuthVerified = activeModel?.authType === 'oauth' && view.verifiedModelIds.has(activeModel?.id ?? '');

  return html`
    <div class="settings-container">
      ${view.models.length > 0 ? html`
        <div class="header-actions">
          <h2>Managed Models</h2>
          <div class="actions-group">
            ${isOAuthVerified ? html`
              <span class="secure-badge" title="Active model authenticated via OAuth">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Secure
              </span>
            ` : ''}
            <button class="icon-btn" @click=${() => view.userActionRefresh()} title="Refresh">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                <path d="M16 21h5v-5"/>
              </svg>
            </button>
            <button class="icon-btn" @click=${() => view.userActionAdded()} title="Add new model">
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
    </div>
  `;
}

function templateForm(view: Settings): TemplateResult {
  return html`
    <div class="settings-container">
      <div class="main-content">
        ${renderForm(view)}
      </div>
    </div>
  `;
}

function templateOAuthSetup(view: Settings): TemplateResult {
  return html`
    <div class="settings-container">
      <div class="main-content">
        ${renderOAuthSetup(view)}
      </div>
    </div>
  `;
}

// Router Map Pattern
const ROUTES: Record<string, (view: Settings) => TemplateResult> = {
  [ViewState.LOADING]: templateLoading,
  [ViewState.LIST]: templateList,
  [ViewState.FORM]: templateForm,
  [ViewState.OAUTH_SETUP]: templateOAuthSetup,
};

export function render(view: Settings) {
  const route = ROUTES[view.viewState] || ROUTES[ViewState.LIST];
  return route(view);
}
