import { View } from '../../core/view/index.js';
import { customElement, state } from 'lit/decorators.js';
import { LLMModelConfig } from '../types.js';
import { templates } from './templates/index.js';
import { MESSAGES, SCOPES, NAME, DELETE_TIMEOUT, AUTH_TYPES, PROVIDERS, ViewState, OAUTH_SETTINGS_KEYS } from '../constants.js';
import { styles } from './templates/css.js';

import { styles as roleBindingStyles } from './templates/role-binding/index.js';

@customElement(`${NAME}-view`)
export class Settings extends View {
  @state() accessor models: LLMModelConfig[] = [];
  @state() accessor activeModelId: string | undefined;
  @state() accessor editingModel: LLMModelConfig | undefined;
  @state() accessor viewState: ViewState = ViewState.LOADING;
  @state() accessor pendingDeleteId: string | undefined;
  @state() accessor errorMessage: string | undefined;

  // New State for Form & Validation
  @state() accessor formAuthType: string = AUTH_TYPES.API_KEY;
  @state() accessor formProvider: string = PROVIDERS.GEMINI;
  @state() accessor isTestingConnection = false;
  @state() accessor connectionTestResult: { success: boolean, message?: string } | undefined;

  // Role Binding State
  @state() accessor roles: { name: string, icon?: string, description?: string, model?: { provider?: string, id?: string }, capabilities?: Record<string, boolean> }[] = [];
  @state() accessor roleBindings: Record<string, string> = {};
  @state() accessor disabledRoles: Set<string> = new Set();
  // Per-provider discovered models cache (from API discovery)
  @state() accessor providerDiscoveredModels: Record<string, Array<{ id: string; displayName: string }>> = {};

  // OAuth Setup Wizard state
  @state() accessor googleClientIdInput: string = '';
  @state() accessor googleClientSecretInput: string = '';
  @state() accessor oauthSetupMessage: string | undefined;
  @state() accessor oauthSetupSuccess: boolean = false;
  @state() accessor oauthTokenExpired: boolean = false;

  // OpenAI OAuth state
  @state() accessor openaiClientIdInput: string = '';

  // Track verified models for visual badge in list
  @state() accessor verifiedModelIds: Set<string> = new Set();

  // Discovered models from provider API (available after test connection)
  @state() accessor discoveredModels: Array<{ id: string; displayName: string }> = [];
  @state() accessor selectedModelId: string = '';

  private deleteTimeout: any; // Timer for auto-cancel delete
  @state() accessor pendingToggleRole: string | undefined;
  private toggleTimeout: any; // Timer for auto-cancel toggle

  static override styles = [styles, roleBindingStyles];
  protected override readonly moduleName = NAME;

  /**
   * Handle incoming broadcast/event messages.
   */
  public override listen(message: any): void {
    const { command } = message.payload || {};
    if (command) {
      this.log('Event:', command);
    }
  }

  /**
   * After first render (skeleton visible), fetch providers from backend.
   */
  override async firstUpdated() {
    this.log('First render complete, requesting providers...');
    await Promise.all([
      this.loadModels(),
      this.refreshRoles(),
      this.loadBindings(),
      this.loadDisabledRoles()
    ]);
  }

  // --- Data Operations (Request-Response) ---

  private async loadModels(): Promise<void> {
    this.log('Starting loadModels()...');

    // Only set loading if we are not already in form or list (initial load)
    if (this.viewState === ViewState.LOADING) {
      // Keep loading
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // Force 1s delay for skeleton
    try {
      this.log('Sending GET_REQUEST to background...');
      const data = await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.GET_REQUEST);
      this.log('Response received:', { success: data.success, modelCount: data.models?.length, activeModelId: data.activeModelId });
      this.log('Models loaded:', data.models?.length, 'active:', data.activeModelId);
      this.models = data.models || [];
      this.activeModelId = data.activeModelId;

      // Navigate to List if not already there
      if (this.viewState === ViewState.LOADING) {
        this.viewState = ViewState.LIST;
      }
    } catch (error: any) {
      this.log('Error loading models:', error.message, error);
      this.viewState = ViewState.LIST; // Fallback to list even on error
    } finally {
      this.log('loadModels() finished. viewState =', this.viewState);
    }
  }

  // --- Role Binding Operations ---

  async refreshRoles() {
    try {
      const result = await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.REFRESH_ROLES);
      if (result && result.roles) {
        this.roles = result.roles;

        // Auto-discover models for all providers already assigned to roles
        const providers = new Set<string>();
        for (const role of this.roles) {
          if (role.model?.provider && !this.providerDiscoveredModels[role.model.provider]) {
            providers.add(role.model.provider);
          }
        }
        // Await all discoveries so dropdowns are populated before render
        await Promise.all(
          Array.from(providers).map(p => this.discoverModelsForProvider(p))
        );
      }
    } catch (error: any) {
      this.log('Error refreshing roles:', error);
    }
  }

  async loadBindings() {
    try {
      const result = await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.GET_BINDING);
      if (result && result.bindings) {
        this.roleBindings = result.bindings;
      }
    } catch (error: any) {
      this.log('Error loading bindings:', error);
    }
  }

  async loadDisabledRoles() {
    try {
      const result = await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.GET_DISABLED_ROLES);
      if (result && result.disabledRoles) {
        this.disabledRoles = new Set(result.disabledRoles);
      }
    } catch (error: any) {
      this.log('Error loading disabled roles:', error);
    }
  }

  async toggleRole(role: string) {
    // Clear any existing timeout
    if (this.toggleTimeout) {
      clearTimeout(this.toggleTimeout);
      this.toggleTimeout = undefined;
    }

    if (this.pendingToggleRole === role) {
      // Second click — confirm the toggle
      this.pendingToggleRole = undefined;
      const newDisabled = new Set(this.disabledRoles);
      if (newDisabled.has(role)) {
        newDisabled.delete(role);
      } else {
        newDisabled.add(role);
      }
      this.disabledRoles = newDisabled;
      await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.SAVE_DISABLED_ROLES, Array.from(newDisabled));
    } else {
      // First click — enter pending state
      this.pendingToggleRole = role;
      this.toggleTimeout = setTimeout(() => {
        if (this.pendingToggleRole === role) {
          this.pendingToggleRole = undefined;
        }
      }, 3000);
    }
  }

  async updateBinding(role: string, modelId: string) {
    const newBindings = { ...this.roleBindings, [role]: modelId };
    this.roleBindings = newBindings;
    await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.SAVE_BINDING, newBindings);

    // Re-evaluate secure state: if the active model changed to unverified, clear secure
    if (modelId === this.activeModelId || this.roleBindings[role] === this.activeModelId) {
      if (!this.verifiedModelIds.has(modelId)) {
        this.setSecureState(false);
      }
    }
  }

  /**
   * Save model and capabilities config for a role.
   * Persists to both the role markdown YAML and VS Code settings.
   */
  async saveRoleConfig(role: string, model: { provider?: string, id?: string }, capabilities?: Record<string, boolean>) {
    // Update local state
    this.roles = this.roles.map(r =>
      r.name === role ? { ...r, model, capabilities: capabilities ?? r.capabilities } : r
    );

    // Also update the binding in local state
    if (model.id) {
      this.roleBindings = { ...this.roleBindings, [role]: model.id };
    }

    // Persist to backend (writes markdown YAML + VS Code settings)
    await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.SAVE_ROLE_CONFIG, {
      role,
      model,
      capabilities: capabilities ?? this.roles.find(r => r.name === role)?.capabilities
    });
  }

  /**
   * Toggle a single capability for a role and persist.
   */
  async toggleCapability(role: string, capability: string) {
    const roleData = this.roles.find(r => r.name === role);
    if (!roleData) { return; }

    const caps = { ...(roleData.capabilities || {}) };
    caps[capability] = !caps[capability];

    this.roles = this.roles.map(r =>
      r.name === role ? { ...r, capabilities: caps } : r
    );

    await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.SAVE_ROLE_CONFIG, {
      role,
      capabilities: caps
    });
  }

  /**
   * Handle provider selection change for a role (from template).
   * Triggers model discovery for the selected provider.
   */
  async userActionProviderChangedForRole(role: string, e: Event) {
    const provider = (e.target as HTMLSelectElement).value;
    this.saveRoleConfig(role, { provider, id: undefined });

    // Trigger model discovery if we don't have cached results for this provider
    if (provider && !this.providerDiscoveredModels[provider]) {
      await this.discoverModelsForProvider(provider);
    }
  }

  /**
   * Handle model selection change for a role (from template).
   */
  userActionModelChangedForRole(role: string, provider: string, e: Event) {
    const modelId = (e.target as HTMLSelectElement).value;
    this.saveRoleConfig(role, { provider, id: modelId || undefined });
  }

  /**
   * Discover available models from a provider API and cache results.
   * Uses the API key from the first registered model for that provider.
   */
  async discoverModelsForProvider(provider: string) {
    try {
      const result = await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.LIST_AVAILABLE_MODELS, { provider });
      if (result?.success && result.models?.length > 0) {
        this.providerDiscoveredModels = {
          ...this.providerDiscoveredModels,
          [provider]: result.models
        };
        this.log(`Discovered ${result.models.length} models for provider ${provider}`);
      }
    } catch (e: any) {
      this.log('Error discovering models for provider:', e.message);
    }
  }

  /**
   * Helper to update the secure state (badge + title) based on verification.
   */
  private setSecureState(isSecure: boolean) {
    // Notify App View (badge in tab bar) — DOM event
    this.dispatchEvent(new CustomEvent('secure-state-changed', {
      bubbles: true,
      composed: true,
      detail: { secure: isSecure }
    }));

    // Notify all views in the webview — window-level event
    window.dispatchEvent(new CustomEvent('secure-state-changed', {
      detail: { secure: isSecure }
    }));

    // Notify Background (panel title)
    this.sendMessage(SCOPES.BACKGROUND, 'SET_TITLE', {
      title: isSecure ? '🔒 Secure' : 'Agent Chat'
    });
  }

  /**
   * Silently verify OAuth session on startup — dispatches secure event if valid.
   */
  private async autoVerifyOAuth(model: any): Promise<void> {
    try {
      const result = await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.TEST_CONNECTION_REQUEST, {
        provider: model.provider,
        authType: model.authType,
        apiKey: null,
      });
      if (result?.success) {
        this.verifiedModelIds = new Set([...this.verifiedModelIds, model.id]);
        this.setSecureState(true);
      }
    } catch {
      // Silent — don't block startup
    }
  }

  // --- User Actions ---

  async userActionRefresh() {
    this.log('userActionRefresh');
    this.viewState = ViewState.LOADING;
    await Promise.all([
      this.loadModels(),
      this.refreshRoles(),
      this.loadBindings()
    ]);
  }

  userActionAdded() {
    this.log('userActionAdded');
    this.editingModel = undefined;
    this.errorMessage = undefined;
    this.connectionTestResult = undefined;
    this.formAuthType = AUTH_TYPES.API_KEY;
    this.formProvider = PROVIDERS.GEMINI;
    this.viewState = ViewState.FORM;
    this.loadGoogleCredentials();
    this.loadOpenAICredentials();
  }

  userActionEdited(id: string) {
    this.log('userActionEdited:', id);
    this.errorMessage = undefined;
    this.connectionTestResult = undefined;
    this.editingModel = this.models.find(m => m.id === id);
    if (this.editingModel) {
      this.formAuthType = this.editingModel.authType || AUTH_TYPES.API_KEY;
      this.formProvider = this.editingModel.provider || PROVIDERS.GEMINI;
      this.selectedModelId = this.editingModel.modelName || '';
    }
    this.discoveredModels = [];
    this.viewState = ViewState.FORM;
    this.loadGoogleCredentials();
    this.loadOpenAICredentials();
  }

  private async loadGoogleCredentials() {
    try {
      const result = await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.GET_GOOGLE_CREDENTIALS, {});
      if (result) {
        this.googleClientIdInput = result.clientId || '';
        this.googleClientSecretInput = result.clientSecret || '';
      }
    } catch {
      // Non-critical — credentials just won't show as configured
    }
  }

  async userActionDeleted(id: string) {
    // Clear any existing timeout when user interacts
    if (this.deleteTimeout) {
      clearTimeout(this.deleteTimeout);
      this.deleteTimeout = undefined;
    }

    if (this.pendingDeleteId === id) {
      this.log('Confirming delete:', id);
      this.pendingDeleteId = undefined;
      // Optimistic update or show loading?
      // For delete, maybe just stay in List but show busy?
      // Let's just await.
      try {
        await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.DELETE_REQUEST, id);
        this.viewState = ViewState.LOADING; // Show loading during reload
        await this.loadModels();
      } catch (error: any) {
        this.log('Error deleting model:', error.message);
      }
    } else {
      this.pendingDeleteId = id;
      this.log('Pending delete:', id);

      // Auto-cancel after 3 seconds
      this.deleteTimeout = setTimeout(() => {
        if (this.pendingDeleteId === id) {
          this.log('Auto-cancelling delete for:', id);
          this.pendingDeleteId = undefined;
        }
      }, 3000);
    }
  }

  userActionCancelDelete() {
    if (this.deleteTimeout) {
      clearTimeout(this.deleteTimeout);
      this.deleteTimeout = undefined;
    }
    this.pendingDeleteId = undefined;
  }

  userActionCancelled() {
    this.viewState = ViewState.LIST;
    this.editingModel = undefined;
    this.connectionTestResult = undefined;
  }

  userActionAuthTypeChanged(e: Event) {
    const target = e.target as HTMLInputElement;
    this.formAuthType = target.value;
  }

  userActionProviderChanged(e: Event) {
    const target = e.target as HTMLSelectElement;
    this.formProvider = target.value;
    // Auto-set to API Key for providers that don't support OAuth
    if (target.value !== PROVIDERS.GEMINI) {
      this.formAuthType = AUTH_TYPES.API_KEY;
    }
    this.connectionTestResult = undefined;
  }

  async userActionTestConnection() {
    // Construct partial model from form data for testing
    const form = this.shadowRoot?.querySelector('form');
    if (!form) {
      return;
    }

    const formData = new FormData(form);
    const testModel: Partial<LLMModelConfig> = {
      provider: formData.get('provider') as any,
      authType: this.formAuthType as any,
      apiKey: formData.get('apiKey') as string,
    };

    this.log('Testing connection...', testModel);
    this.isTestingConnection = true;
    this.connectionTestResult = undefined;

    try {
      // OAuth flows open a browser for login — much longer than 10s default timeout
      const timeout = testModel.authType === 'oauth' ? 120_000 : undefined;
      const result = await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.TEST_CONNECTION_REQUEST, testModel, timeout);
      // If auth module signals setup is needed, navigate to wizard
      if (result?.message?.includes('OAUTH_SETUP_REQUIRED')) {
        this.viewState = ViewState.OAUTH_SETUP;
        return;
      }
      // Detect expired token
      if (!result?.success && result?.message?.toLowerCase().includes('expir')) {
        this.oauthTokenExpired = true;
      } else {
        this.oauthTokenExpired = false;
      }
      this.connectionTestResult = result;
      // Mark model as verified if test succeeded
      if (result?.success && this.editingModel?.id) {
        this.verifiedModelIds = new Set([...this.verifiedModelIds, this.editingModel.id]);

        // If testing active model, set secure
        if (this.editingModel.id === this.activeModelId) {
          this.setSecureState(true);
        }
      } else if (this.editingModel?.id) {
        // Test failed -> Clear verified status
        const newSet = new Set(this.verifiedModelIds);
        if (newSet.has(this.editingModel.id)) {
          newSet.delete(this.editingModel.id);
          this.verifiedModelIds = newSet;
        }

        // If active model failed, clear secure
        if (this.editingModel.id === this.activeModelId) {
          this.setSecureState(false);
        }
      }

      // Fetch available models after successful test connection
      if (result?.success) {
        this.fetchDiscoveredModels();
      }
    } catch (error: any) {
      this.log('Error testing connection:', error.message);
      this.errorMessage = error.message;
      this.connectionTestResult = { success: false, message: error.message };

      // Also clear secure state on error
      if (this.editingModel?.id && this.editingModel.id === this.activeModelId) {
        this.setSecureState(false);
      }
      // Also check thrown errors for setup required signal
      if (error.message?.includes('OAUTH_SETUP_REQUIRED')) {
        this.viewState = ViewState.OAUTH_SETUP;
        return;
      }
      this.connectionTestResult = { success: false, message: error.message };
    } finally {
      this.isTestingConnection = false;
    }
  }

  /**
   * Fetch discovered models from the provider API via background.
   */
  async fetchDiscoveredModels() {
    try {
      const provider = this.formProvider;
      const result = await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.LIST_AVAILABLE_MODELS, { provider });
      if (result?.success && result.models?.length > 0) {
        this.discoveredModels = result.models;
        // Auto-select first model if none selected
        if (!this.selectedModelId) {
          this.selectedModelId = result.models[0].id;
        }
        this.log(`Discovered ${result.models.length} models for ${provider}`);
      }
    } catch (e: any) {
      this.log('Error fetching discovered models:', e.message);
    }
  }

  async userActionAccepted(e: Event) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const provider = formData.get('provider') as any;
    const name = formData.get('name') as string;
    // authType is tracked in state formAuthType

    // Validation: Check for duplicate names
    const isDuplicate = this.models.some(m =>
      m.name.toLowerCase() === name.toLowerCase() &&
      m.id !== this.editingModel?.id
    );

    if (isDuplicate) {
      this.errorMessage = `A model with name "${name}" already exists. Please choose a different name.`;
      this.log('Validation Error:', this.errorMessage);
      return;
    }

    const model: LLMModelConfig = {
      id: this.editingModel?.id || '', // Let backend generate ID if empty
      name: name,
      modelName: this.selectedModelId || name, // Use discovered model ID or fallback to name
      provider: provider,
      authType: this.formAuthType as any,
      apiKey: formData.get('apiKey') as string,
      maxTokens: 4096,
      temperature: 0.7,
    };

    try {
      const result = await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.SAVE_REQUEST, model);

      // If we authenticated successfully during editing, mark as verified immediately
      if (this.connectionTestResult?.success && result?.id) {
        this.verifiedModelIds = new Set([...this.verifiedModelIds, result.id]);
      }

      this.viewState = ViewState.LOADING; // Show loading while reloading
      this.editingModel = undefined;
      this.connectionTestResult = undefined;
      await this.loadModels();
    } catch (error: any) {
      this.log('Error saving model:', error.message);
      this.errorMessage = error.message;
    }
  }

  // --- OAuth Setup Wizard Actions ---

  /** True if Google OAuth credentials are stored in VS Code settings */
  get hasGoogleCredentials(): boolean {
    return !!(this.googleClientIdInput || this.googleClientSecretInput);
  }

  /** True if OpenAI OAuth Client ID is configured */
  get hasOpenAICredentials(): boolean {
    return !!this.openaiClientIdInput;
  }

  userActionOpenOAuthSetup() {
    this.oauthSetupMessage = undefined;
    this.viewState = ViewState.OAUTH_SETUP;
  }

  async userActionRemoveGoogleCredentials() {
    try {
      await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.REMOVE_GOOGLE_CREDENTIALS, {});
      this.googleClientIdInput = '';
      this.googleClientSecretInput = '';
      this.oauthTokenExpired = false;

      // Clear verified state for all OAuth models
      const newVerifiedSet = new Set(this.verifiedModelIds);
      this.models.forEach(m => {
        if (m.authType === AUTH_TYPES.OAUTH) {
          newVerifiedSet.delete(m.id);
        }
      });
      this.verifiedModelIds = newVerifiedSet;

      // If active model was OAuth, clear global secure state
      const activeModel = this.models.find(m => m.id === this.activeModelId);
      if (activeModel?.authType === AUTH_TYPES.OAUTH) {
        this.setSecureState(false);
      }
    } catch (error: any) {
      this.log('Failed to remove credentials:', error.message);
    }
  }

  userActionOpenExternal(url: string) {
    this.log('Opening external URL:', url);
    // Post to background to open external URL via vscode.env.openExternal
    this.sendMessage(SCOPES.BACKGROUND, MESSAGES.OPEN_EXTERNAL, { url });
  }

  async userActionSaveGoogleCredentials() {
    const idInput = this.shadowRoot?.querySelector('#googleClientId') as HTMLInputElement;
    const secretInput = this.shadowRoot?.querySelector('#googleClientSecret') as HTMLInputElement;
    const clientId = idInput?.value?.trim();
    const clientSecret = secretInput?.value?.trim();

    if (!clientId || !clientId.includes('.apps.googleusercontent.com')) {
      this.oauthSetupSuccess = false;
      this.oauthSetupMessage = 'Invalid Client ID. It should end with .apps.googleusercontent.com';
      return;
    }

    if (!clientSecret) {
      this.oauthSetupSuccess = false;
      this.oauthSetupMessage = 'Client Secret is required.';
      return;
    }

    try {
      await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.SAVE_GOOGLE_CLIENT_ID, { clientId, clientSecret });
      this.oauthSetupSuccess = true;
      this.oauthSetupMessage = '✅ Credentials saved! You can now use OAuth with Gemini.';
      this.googleClientIdInput = clientId;
      this.googleClientSecretInput = clientSecret;

      // Auto-navigate back to form after 1.5s
      setTimeout(() => {
        this.oauthSetupMessage = undefined;
        this.viewState = ViewState.FORM;
      }, 1500);
    } catch (error: any) {
      this.oauthSetupSuccess = false;
      this.oauthSetupMessage = `Failed to save: ${error.message}`;
    }
  }

  userActionBackToForm() {
    this.oauthSetupMessage = undefined;
    this.viewState = ViewState.FORM;
  }

  // --- OpenAI OAuth Actions ---

  private async loadOpenAICredentials() {
    try {
      const result = await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.GET_OPENAI_CREDENTIALS, {});
      if (result) {
        this.openaiClientIdInput = result.clientId || '';
      }
    } catch {
      // Non-critical
    }
  }

  userActionOpenOpenAIOAuthSetup() {
    this.oauthSetupMessage = undefined;
    // Reuse the same OAUTH_SETUP ViewState — the wizard template can detect provider
    this.viewState = ViewState.OAUTH_SETUP;
  }

  async userActionRemoveOpenAICredentials() {
    try {
      await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.REMOVE_OPENAI_CREDENTIALS, {});
      this.openaiClientIdInput = '';

      // Clear verified state for OpenAI OAuth models
      const newVerifiedSet = new Set(this.verifiedModelIds);
      this.models.forEach(m => {
        if (m.authType === AUTH_TYPES.OAUTH && m.provider === PROVIDERS.CODEX) {
          newVerifiedSet.delete(m.id);
        }
      });
      this.verifiedModelIds = newVerifiedSet;

      const activeModel = this.models.find(m => m.id === this.activeModelId);
      if (activeModel?.authType === AUTH_TYPES.OAUTH && activeModel?.provider === PROVIDERS.CODEX) {
        this.setSecureState(false);
      }
    } catch (error: any) {
      this.log('Failed to remove OpenAI credentials:', error.message);
    }
  }

  async userActionSaveOpenAICredentials() {
    const idInput = this.shadowRoot?.querySelector('#openaiClientId') as HTMLInputElement;
    const clientId = idInput?.value?.trim();

    if (!clientId) {
      this.oauthSetupSuccess = false;
      this.oauthSetupMessage = 'Client ID is required.';
      return;
    }

    try {
      await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.SAVE_OPENAI_CLIENT_ID, { clientId });
      this.oauthSetupSuccess = true;
      this.oauthSetupMessage = '✅ Client ID saved! You can now use OAuth with OpenAI.';
      this.openaiClientIdInput = clientId;

      setTimeout(() => {
        this.oauthSetupMessage = undefined;
        this.viewState = ViewState.FORM;
      }, 1500);
    } catch (error: any) {
      this.oauthSetupSuccess = false;
      this.oauthSetupMessage = `Failed to save: ${error.message}`;
    }
  }

  override render() {
    this.log('Rendering Settings view. State:', this.viewState, 'Models:', this.models.length);
    return templates.main.render(this);
  }
}
