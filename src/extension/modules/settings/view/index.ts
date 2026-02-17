import { View } from '../../core/view/index.js';
import { customElement, state } from 'lit/decorators.js';
import { LLMModelConfig } from '../types.js';
import { templates } from './templates/index.js';
import { MESSAGES, SCOPES, NAME, DELETE_TIMEOUT } from '../constants.js';
import { styles } from './templates/css.js';

@customElement(`${NAME}-view`)
export class Settings extends View {
  @state() accessor models: LLMModelConfig[] = [];
  @state() accessor activeModelId: string | undefined;
  @state() accessor editingModel: LLMModelConfig | undefined;
  @state() accessor showForm = false;
  @state() accessor isLoading = true;
  @state() accessor pendingDeleteId: string | undefined;
  @state() accessor errorMessage: string | undefined;

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
    this.isLoading = true;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Force 1s delay for skeleton
    try {
      this.log('Sending GET_REQUEST to background...');
      const data = await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.GET_REQUEST);
      this.log('Response received:', data);
      this.log('Models loaded:', data.models?.length, 'active:', data.activeModelId);
      this.models = data.models || [];
      this.activeModelId = data.activeModelId;
    } catch (error: any) {
      this.log('Error loading models:', error.message, error);
    } finally {
      this.isLoading = false;
      this.log('loadModels() finished. isLoading =', this.isLoading);
      // requestUpdate removed
    }
  }

  // --- User Actions ---

  async userActionRefresh() {
    this.log('userActionRefresh');
    await this.loadModels();
  }

  userActionAdded() {
    this.log('userActionAdded');
    this.editingModel = undefined;
    this.errorMessage = undefined;
    this.showForm = true;
  }

  userActionEdited(id: string) {
    this.log('userActionEdited:', id);
    this.errorMessage = undefined;
    this.editingModel = this.models.find(m => m.id === id);
    this.showForm = true;
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
      this.isLoading = true; // Show loading effect
      await new Promise(resolve => setTimeout(resolve, 1000)); // Force visible delay (1s)
      try {
        await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.DELETE_REQUEST, id);
        await this.loadModels(); // This will eventually set isLoading = false and update
      } catch (error: any) {
        this.log('Error deleting model:', error.message);
        this.isLoading = false;
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
    // this.requestUpdate(); // Removed: Redundant with @state

    try {
      await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.SELECT_REQUEST, id);
    } catch (error: any) {
      this.log('Error selecting model:', error.message);
      // Revert on error
      this.activeModelId = previousId;
    }
  }

  userActionCancelled() {
    this.showForm = false;
    this.editingModel = undefined;
  }

  async userActionAccepted(e: Event) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const provider = formData.get('provider') as 'gemini' | 'codex' | 'claude';
    const name = formData.get('name') as string;

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
      modelName: name,
      provider: provider,
      apiKey: formData.get('apiKey') as string,
      maxTokens: 4096,
      temperature: 0.7,
    };

    try {
      await this.sendMessage(SCOPES.BACKGROUND, MESSAGES.SAVE_REQUEST, model);
      this.showForm = false;
      this.editingModel = undefined;
      await this.loadModels();
    } catch (error: any) {
      this.log('Error saving model:', error.message);
    }
  }

  override render() {
    this.log('Rendering Settings view. isLoading:', this.isLoading, 'Models:', this.models.length, 'ShowForm:', this.showForm);
    return templates.main.render(this);
  }
}
