import { html, nothing } from 'lit';
import { Settings } from '../../index.js';
import { LLMModelConfig } from '../../../types.js';
import { AUTH_TYPES, PROVIDERS } from '../../../constants.js';

export function renderForm(view: Settings) {
  const model = view.editingModel || {} as LLMModelConfig;
  const isEdit = !!view.editingModel;
  const currentAuthType = view.formAuthType;
  const currentProvider = view.formProvider || model.provider || PROVIDERS.GEMINI;
  const supportsOAuth = currentProvider === PROVIDERS.GEMINI || currentProvider === PROVIDERS.CODEX;
  const oauthProviderLabel = currentProvider === PROVIDERS.CODEX ? 'OpenAI' : 'Google';

  return html`
    <div class="form-container">
      <h2>${isEdit ? 'Edit Model' : 'Add Model'}</h2>
      
      ${view.errorMessage ? html`
        <div class="error-banner">
          ${view.errorMessage}
        </div>
      ` : ''}
      
      <form @submit=${(e: Event) => view.userActionAccepted(e)}>
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" .value=${model.name || ''} required placeholder="My Model">
        </div>

        <div class="form-group">
          <label for="provider">Provider</label>
          <select id="provider" name="provider" .value=${currentProvider}
            @change=${(e: Event) => view.userActionProviderChanged(e)}>
            <option value="gemini" ?selected=${currentProvider === 'gemini'}>Gemini</option>
            <option value="codex" ?selected=${currentProvider === 'codex'}>Codex (OpenAI)</option>
            <option value="claude" ?selected=${currentProvider === 'claude'}>Claude</option>
          </select>
        </div>

        ${supportsOAuth ? html`
          <div class="form-group">
            <label>Authentication Type</label>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" name="authType" value="${AUTH_TYPES.API_KEY}" 
                  ?checked=${currentAuthType === AUTH_TYPES.API_KEY}
                  @change=${(e: Event) => view.userActionAuthTypeChanged(e)}>
                API Key
              </label>
              <label class="radio-option">
                <input type="radio" name="authType" value="${AUTH_TYPES.OAUTH}" 
                  ?checked=${currentAuthType === AUTH_TYPES.OAUTH}
                  @change=${(e: Event) => view.userActionAuthTypeChanged(e)}>
                OAuth (${oauthProviderLabel})
              </label>
            </div>
          </div>
        ` : nothing}

        ${currentAuthType === AUTH_TYPES.API_KEY ? html`
          <div class="form-group">
            <label for="apiKey">API Key</label>
            <input type="password" id="apiKey" name="apiKey" .value=${model.apiKey || ''} placeholder="sk-...">
          </div>
        ` : ''}

        ${currentAuthType === AUTH_TYPES.OAUTH ? html`
            <div class="form-group">
              <label>${oauthProviderLabel} OAuth Credentials</label>
              ${currentProvider === PROVIDERS.CODEX ? html`
                <div class="oauth-credentials-status ${view.hasOpenAICredentials ? 'configured' : 'missing'}">
                  <div class="oauth-cred-info">
                    <span class="oauth-status-dot"></span>
                    <div>
                      ${view.hasOpenAICredentials ? html`
                        <span class="oauth-cred-label">Configured</span>
                        <span class="oauth-cred-id">${view.openaiClientIdInput
            ? view.openaiClientIdInput.substring(0, 12) + '…'
            : 'Client ID set'}</span>
                      ` : html`
                        <span class="oauth-cred-label">Not configured</span>
                        <span class="oauth-cred-id">Add your OpenAI Client ID to use OAuth</span>
                      `}
                    </div>
                  </div>
                  <div class="oauth-cred-actions">
                    <button type="button" class="btn-configure-oauth"
                      @click=${() => view.userActionOpenOpenAIOAuthSetup()}>
                      ${view.hasOpenAICredentials ? '✏ Edit' : '+ Configure'}
                    </button>
                    ${view.hasOpenAICredentials ? html`
                      <button type="button" class="btn-remove-oauth"
                        @click=${() => view.userActionRemoveOpenAICredentials()}>
                        Remove
                      </button>
                    ` : ''}
                  </div>
                </div>
                <p class="oauth-hint">Test Connection will open OpenAI sign-in in your browser.</p>
              ` : html`
              <div class="oauth-credentials-status ${view.oauthTokenExpired ? 'expired' : view.hasGoogleCredentials ? 'configured' : 'missing'}">
                <div class="oauth-cred-info">
                  <span class="oauth-status-dot"></span>
                  <div>
                    ${view.oauthTokenExpired ? html`
                      <span class="oauth-cred-label">Session expired</span>
                      <span class="oauth-cred-id">Re-authenticate to continue using OAuth</span>
                    ` : view.hasGoogleCredentials ? html`
                      <span class="oauth-cred-label">Configured</span>
                      <span class="oauth-cred-id">${view.googleClientIdInput
            ? view.googleClientIdInput.substring(0, 12) + '…'
            : 'Client ID set'}</span>
                    ` : html`
                      <span class="oauth-cred-label">Not configured</span>
                      <span class="oauth-cred-id">Add your Client ID & Secret to use OAuth</span>
                    `}
                  </div>
                </div>
                <div class="oauth-cred-actions">
                  <button type="button" class="btn-configure-oauth"
                    @click=${() => view.userActionOpenOAuthSetup()}>
                    ${view.hasGoogleCredentials ? '✏ Edit' : '+ Configure'}
                  </button>
                  ${view.hasGoogleCredentials ? html`
                    <button type="button" class="btn-remove-oauth"
                      @click=${() => view.userActionRemoveGoogleCredentials()}>
                      Remove
                    </button>
                  ` : ''}
                </div>
              </div>
              <p class="oauth-hint">Test Connection will open Google sign-in in your browser.</p>
              `}
            </div>
        ` : ''}

        <div class="connection-test-section">
            <button type="button" class="btn-test" 
                @click=${() => view.userActionTestConnection()} 
                ?disabled=${view.isTestingConnection}>
                ${view.isTestingConnection ? 'Testing...' : 'Test Connection'}
            </button>
            
            ${view.connectionTestResult ? html`
                <div class="test-status ${view.connectionTestResult.success ? 'success' : 'error'}">
                    ${view.connectionTestResult.success ?
        html`<span class="codicon codicon-check"></span> Success` :
        html`<span class="codicon codicon-error"></span> Failed`}
                </div>
            ` : ''}
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click=${() => view.userActionCancelled()}>
            Cancel
          </button>
          <button type="submit" class="btn-save">
            Save Model
          </button>
        </div>
      </form>
    </div>
  `;
}
