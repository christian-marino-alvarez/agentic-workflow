import { View } from '../../core/view/index.js';
import { customElement, state } from 'lit/decorators.js';
import { LLMModelConfig } from '../types.js';
import { templates } from './templates/index.js';
import { MESSAGES, SCOPES, NAME, DELETE_TIMEOUT, AUTH_TYPES, PROVIDERS, ViewState } from '../constants.js';
import { styles } from './templates/css.js';

const GOOGLE_CLIENT_ID_KEY = 'agenticWorkflow.googleClientId';
const GOOGLE_CLIENT_SECRET_KEY = 'agenticWorkflow.googleClientSecret';
const OPENAI_CLIENT_ID_KEY = 'agenticWorkflow.openaiClientId';

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

  private deleteTimeout: any; // Timer for auto-cancel delete

  static override styles = styles;
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
    await this.loadModels();
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
      this.log('Response received:', data);
      this.log('Models loaded:', data.models?.length, 'active:', data.activeModelId);
      this.models = data.models || [];
      this.activeModelId = data.activeModelId;

      // Navigate to List if not already there (unless we are in form handling?)
      // Actually, loadModels usually implies a refresh or init.
      // If we were in FORM, we probably stay there? No, usually refresh goes to list.
      if (this.viewState === ViewState.LOADING) {
        this.viewState = ViewState.LIST;
      }

      // Auto-verify OAuth session for the active model on startup
      const activeModel = this.models.find(m => m.id === this.activeModelId);
      if (activeModel?.authType === 'oauth') {
        this.autoVerifyOAuth(activeModel);
      }
    } catch (error: any) {
      this.log('Error loading models:', error.message, error);
      this.viewState = ViewState.LIST; // Fallback to list even on error
    } finally {
      this.log('loadModels() finished. viewState =', this.viewState);
    }
  }

  /**
   * Helper to update the secure state (badge + title) based on verification.
   */
  private setSecureState(isSecure: boolean) {
    // Notify App View (badge in tab bar)
    this.dispatchEvent(new CustomEvent('secure-state-changed', {
      bubbles: true,
      composed: true,
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
    await this.loadModels();
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
    }
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

  async userActionSelected(id: string) {
    this.log('userActionSelected:', id);
    // Optimistic update
    const previousId = this.activeModelId;
    this.activeModelId = id;

    // Update secure state based on verification status
    const isVerified = this.verifiedModelIds.has(id);
    this.setSecureState(isVerified);

    try {
      await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.SELECT_REQUEST, id);
    } catch (error: any) {
      this.log('Error selecting model:', error.message);
      // Revert on error
      this.activeModelId = previousId;
      // Revert secure state? Probably
      if (previousId) {
        const keyVerified = this.verifiedModelIds.has(previousId);
        this.setSecureState(keyVerified);
      } else {
        this.setSecureState(false);
      }
    }
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
      const result = await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.TEST_CONNECTION_REQUEST, testModel);
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
      modelName: name, // Simplified mapping for now
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
    this.sendMessage(SCOPES.BACKGROUND, 'OPEN_EXTERNAL', { url });
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
