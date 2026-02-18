import { html } from 'lit';
import { Settings } from '../../index.js';
import { PROVIDERS } from '../../../constants.js';

/**
 * OAuth Setup Wizard View.
 * Guides the user through configuring OAuth credentials.
 * Detects the current provider to show the correct wizard.
 */
export function renderOAuthSetup(view: Settings) {
  const isOpenAI = view.formProvider === PROVIDERS.CODEX;

  return html`
    <div class="oauth-setup">
      <div class="oauth-setup-header">
        <span class="oauth-setup-icon">🔑</span>
        <h2>${isOpenAI ? 'OpenAI OAuth Setup' : 'Google OAuth Setup'}</h2>
      </div>

      ${isOpenAI ? renderOpenAISetup(view) : renderGoogleSetup(view)}

      ${view.oauthSetupMessage ? html`
        <div class="oauth-setup-result ${view.oauthSetupSuccess ? 'success' : 'error'}">
          ${view.oauthSetupMessage}
        </div>
      ` : ''}

      <div class="oauth-setup-footer">
        <button type="button" class="button-secondary"
          @click=${() => view.userActionBackToForm()}>
          ← Back to Settings
        </button>
      </div>
    </div>
  `;
}

function renderGoogleSetup(view: Settings) {
  return html`
    <p class="oauth-setup-desc">
      To use OAuth authentication with Gemini, you need a Google Cloud OAuth Client ID.
    </p>

    <div class="oauth-steps">
      <div class="oauth-step">
        <span class="step-number">1</span>
        <div class="step-content">
          <strong>Create OAuth Credentials</strong>
          <p>Go to Google Cloud Console → APIs & Credentials and create an <strong>OAuth 2.0 Client ID</strong> (<strong>Desktop app</strong> type — required for PKCE with localhost).</p>
          <button type="button" class="button-secondary" 
            @click=${() => view.userActionOpenExternal('https://console.cloud.google.com/apis/credentials')}>
            Open Google Cloud Console ↗
          </button>
        </div>
      </div>

      <div class="oauth-step">
        <span class="step-number">2</span>
        <div class="step-content">
          <strong>Enable APIs</strong>
          <p>In the API Library, enable the <strong>Generative Language API</strong> for your project.</p>
        </div>
      </div>

      <div class="oauth-step">
        <span class="step-number">3</span>
        <div class="step-content">
          <strong>Paste your credentials</strong>
          <p>Copy the Client ID and Client Secret from Google Cloud Console.</p>
          <div class="oauth-input-group">
            <input type="text" 
              id="googleClientId" 
              placeholder="Client ID (XXXXX.apps.googleusercontent.com)" 
              class="oauth-client-input"
              .value=${view.googleClientIdInput || ''}>
          </div>
          <div class="oauth-input-group">
            <input type="password" 
              id="googleClientSecret" 
              placeholder="Client Secret" 
              class="oauth-client-input"
              .value=${view.googleClientSecretInput || ''}>
          </div>
          <button type="button" class="button-primary"
            @click=${() => view.userActionSaveGoogleCredentials()}>
            Save Credentials
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderOpenAISetup(view: Settings) {
  return html`
    <p class="oauth-setup-desc">
      To use OAuth authentication with OpenAI, you need an OAuth Client ID from the OpenAI platform.
      OpenAI uses PKCE (public client) — no Client Secret is needed.
    </p>

    <div class="oauth-steps">
      <div class="oauth-step">
        <span class="step-number">1</span>
        <div class="step-content">
          <strong>Get your OAuth Client ID</strong>
          <p>Go to the OpenAI Platform → Settings → OAuth and copy your Client ID.</p>
          <button type="button" class="button-secondary" 
            @click=${() => view.userActionOpenExternal('https://platform.openai.com/settings')}>
            Open OpenAI Platform ↗
          </button>
        </div>
      </div>

      <div class="oauth-step">
        <span class="step-number">2</span>
        <div class="step-content">
          <strong>Paste your Client ID</strong>
          <p>Only a Client ID is needed — OpenAI uses PKCE (no secret required).</p>
          <div class="oauth-input-group">
            <input type="text" 
              id="openaiClientId" 
              placeholder="OpenAI Client ID" 
              class="oauth-client-input"
              .value=${view.openaiClientIdInput || ''}>
          </div>
          <button type="button" class="button-primary"
            @click=${() => view.userActionSaveOpenAICredentials()}>
            Save Client ID
          </button>
        </div>
      </div>
    </div>
  `;
}
