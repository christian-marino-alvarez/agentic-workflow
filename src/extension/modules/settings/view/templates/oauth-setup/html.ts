import { html } from 'lit';
import { Settings } from '../../index.js';

/**
 * OAuth Setup Wizard View.
 * Guides the user through configuring a Google OAuth Client ID.
 */
export function renderOAuthSetup(view: Settings) {
  return html`
    <div class="oauth-setup">
      <div class="oauth-setup-header">
        <span class="oauth-setup-icon">🔑</span>
        <h2>Google OAuth Setup</h2>
      </div>

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
