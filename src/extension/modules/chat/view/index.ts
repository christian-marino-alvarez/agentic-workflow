import { View } from '../../core/view/index.js';
import { state } from 'lit/decorators.js';
import { html } from 'lit';
import { styles } from './templates/css.js';
import { render } from './templates/html.js';
import { MESSAGES, NAME } from '../constants.js';
import { MESSAGES as SETTINGS_MESSAGES } from '../../settings/constants.js';
import { getRoleIcon } from '../../settings/view/templates/icons.js';

console.log('[chat::view] Module loading...');

export class ChatView extends View {
  static override styles = styles;
  protected override readonly moduleName = NAME;

  constructor() {
    super();
    console.log('[chat::view] Constructor called');
  }

  @state()
  public history: Array<{ sender: string, text: string, role?: string, status?: string }> = [
    { sender: 'Architect', text: 'I am the Architect Agent. I am ready to help you manage your workflow.', role: 'architect' }
  ];

  @state()
  public inputText: string = '';

  @state()
  public models: Array<{ id: string, name: string, provider: string }> = [];

  @state()
  public attachments: string[] = [];

  @state()
  public selectedModelId: string = '';

  @state()
  public agentFilter: string = 'all';

  @state()
  public activeWorkflow: string = 'T032: Runtime Server & Action Sandbox';

  @state()
  public isLoading: boolean = false;

  @state()
  public appVersion: string = '';

  @state()
  public agentPermissions: Record<string, 'sandbox' | 'full'> = {
    'architect': 'sandbox'
  };

  public togglePermission(role: string) {
    const current = this.agentPermissions[role] || 'sandbox';
    const next = current === 'sandbox' ? 'full' : 'sandbox';
    this.agentPermissions = { ...this.agentPermissions, [role]: next };
    this.log(`Permission toggled for ${role}: ${next}`);
  }

  private get participatingRoles(): string[] {
    const roles = new Set(this.history.map(m => m.role).filter(r => r && r !== 'user' && r !== 'system') as string[]);
    return Array.from(roles);
  }

  override firstUpdated() {
    this.log('Chat view mounted');
    this.initWorkflow();
    this.loadModels();
  }

  /**
   * Load available models from Settings backend
   */
  private async loadModels() {
    this.isLoading = true;
    try {
      const data = await this.sendMessage('settings', SETTINGS_MESSAGES.GET_REQUEST);
      if (data && data.models) {
        this.models = data.models;
        this.selectedModelId = data.activeModelId || (data.models[0]?.id ?? '');
        this.log('Models loaded:', this.models.length);
      }
    } catch (error) {
      this.log('Error loading models', error);
    } finally {
      this.isLoading = false;
    }
  }

  public handleModelChange(e: Event) {
    this.selectedModelId = (e.target as HTMLSelectElement).value;
    const model = this.models.find(m => m.id === this.selectedModelId);
    this.log('Model changed to:', model?.name || this.selectedModelId);
  }

  public handleFilterChange(e: Event) {
    this.agentFilter = (e.target as HTMLSelectElement).value;
    this.requestUpdate();
  }

  /**
   * Initialize workflow by requesting init.md content
   */
  private async initWorkflow() {
    try {
      const response = await this.sendMessage(NAME, MESSAGES.LOAD_INIT);
      if (response && response.content) {
        this.appVersion = response.version || '';
        const snippet = response.content.substring(0, 100) + '...';
        this.history = [...this.history, { sender: 'Architect', text: `I have loaded your workflow context:\n\n${snippet}`, role: 'architect' }];
      }
    } catch (error) {
      this.log('Error loading init workflow', error);
      this.history = [...this.history, { sender: 'System', text: 'Error loading workflow context.', role: 'system' }];
    }
  }

  /**
   * Handle incoming messages from Background (Event stream)
   */
  public override listen(message: any): void {
    const command = message.payload?.command || message.command;
    const data = message.payload?.data || message.data;

    if (command === MESSAGES.RECEIVE_MESSAGE) {
      this.isLoading = false;
      if (data && data.text) {
        const lastMsg = this.history[this.history.length - 1];
        if (lastMsg && lastMsg.role === 'architect' && lastMsg.status) {
          // Merge into existing status message
          this.history = [
            ...this.history.slice(0, -1),
            { ...lastMsg, text: data.text, status: undefined }
          ];
        } else {
          // Append new message
          this.history = [...this.history, { sender: 'Architect', text: data.text, role: 'architect' }];
        }
      }
    }

    if (command === 'SELECT_FILES_RESPONSE') {
      const { files } = data;
      if (files && Array.isArray(files)) {
        // Add unique files
        const newFiles = files.filter((f: string) => !this.attachments.includes(f));
        this.attachments = [...this.attachments, ...newFiles];
      }
    }

    if (command === 'AGENT_STATUS') {
      const { status } = data;
      this.isLoading = false; // Stop skeleton, show status on message

      const lastMsg = this.history[this.history.length - 1];
      if (lastMsg && lastMsg.role === 'architect') {
        // Update existing agent message status
        this.history = [
          ...this.history.slice(0, -1),
          { ...lastMsg, status }
        ];
      } else {
        // Create new agent message with status
        this.history = [...this.history, { sender: 'Architect', text: '', role: 'architect', status }];
      }
    }
  }

  public handleInput(e: InputEvent) {
    this.inputText = (e.target as HTMLInputElement).value;
  }

  public handleAttachFile() {
    this.sendMessage(NAME, 'SELECT_FILES');
  }

  public removeAttachment(path: string) {
    this.attachments = this.attachments.filter(f => f !== path);
  }

  public handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.sendChatMessage();
    }
  }

  public async sendChatMessage() {
    if (!this.inputText.trim() && this.attachments.length === 0) { return; }

    const text = this.inputText;
    this.history = [...this.history, { sender: 'Me', text, role: 'user' }];
    this.inputText = '';

    try {
      this.isLoading = true;
      // Send and await ACK (success: true)
      await this.sendMessage(NAME, MESSAGES.SEND_MESSAGE, {
        text,
        agentRole: 'architect',
        modelId: this.selectedModelId,
        agentFilter: this.agentFilter,
        workflow: this.activeWorkflow,
        attachments: this.attachments
      });

      this.attachments = [];
    } catch (error) {
      this.isLoading = false;
      this.log('Error sending message', error);
      this.history = [...this.history, { sender: 'System', text: 'Error sending message', role: 'system' }];
    }
  }



  override render() {
    console.log('[chat::view] render() called');
    return render(this);
  }
}

// Manual registration to avoid decorator issues
console.log(`[chat::view] Registering custom element: ${NAME}-view`);
customElements.define(`${NAME}-view`, ChatView);
