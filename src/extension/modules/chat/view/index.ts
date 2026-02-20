import { View } from '../../core/view/index.js';
import { state } from 'lit/decorators.js';
import { styles } from './templates/css.js';
import { render } from './templates/html.js';
import { MESSAGES, NAME } from '../constants.js';
import { MESSAGES as SETTINGS_MESSAGES } from '../../settings/constants.js';

console.log('[chat::view] Module loading...');

export class ChatView extends View {
  static override styles = styles;
  protected override readonly moduleName = NAME;

  constructor() {
    super();
  }

  @state()
  public history: Array<{ sender: string, text: string, role?: string, status?: string, isStreaming?: boolean }> = [
    { sender: 'Architect', text: 'I am the Architect Agent. I am ready to help you manage your workflow.', role: 'architect', isStreaming: false }
  ];

  @state()
  public inputText: string = '';

  @state()
  public models: Array<{ id: string, name: string, provider: string }> = [];

  @state()
  public attachments: string[] = [];

  private activeModelId: string = '';

  @state()
  public activeWorkflow: string = 'T032: Runtime Server & Action Sandbox';

  @state()
  public selectedAgent: string = 'architect';

  @state()
  public showAgentDropdown: boolean = false;

  @state()
  public availableAgents: Array<{ name: string; icon?: string; model?: { provider?: string; id?: string }; capabilities?: Record<string, boolean> }> = [
    { name: 'architect' },
    { name: 'researcher' },
    { name: 'qa' },
    { name: 'engine' },
    { name: 'view' },
    { name: 'background' },
    { name: 'backend' },
  ];

  @state()
  public isLoading: boolean = false;

  @state()
  public appVersion: string = '';

  @state()
  public isSecure: boolean = false;

  @state()
  public isTesting: boolean = false;

  private verifiedModelIds: Set<string> = new Set();

  @state()
  public agentPermissions: Record<string, 'sandbox' | 'full'> = {
    'architect': 'sandbox'
  };

  /**
   * Whether the currently selected agent is disabled (no model assigned).
   */
  get agentDisabled(): boolean {
    const agent = this.availableAgents.find(a => a.name === this.selectedAgent);
    return !agent?.model?.id;
  }

  /**
   * Display name of the model assigned to the currently selected agent.
   */
  get agentModelName(): string {
    const agent = this.availableAgents.find(a => a.name === this.selectedAgent);
    if (!agent?.model?.id) { return ''; }
    const model = this.models.find(m => m.id === agent.model!.id);
    return model?.name || agent.model.id;
  }

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
    this.loadAgents();

    // Listen for secure state changes from Settings
    window.addEventListener('secure-state-changed', ((e: CustomEvent) => {
      const isSecure = e.detail?.secure || false;
      this.isSecure = isSecure;
      if (isSecure && this.activeModelId) {
        this.verifiedModelIds.add(this.activeModelId);
      }
      this.log(`Secure state updated: ${this.isSecure}`);
    }) as EventListener);
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
        this.activeModelId = data.activeModelId || (data.models[0]?.id ?? '');
        this.log('Models loaded:', this.models.length);
      }
    } catch (error) {
      this.log('Error loading models', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load agents (roles) with their model/capabilities from Settings.
   */
  private async loadAgents() {
    try {
      const result = await this.sendMessage('settings', SETTINGS_MESSAGES.GET_ROLES);
      if (result?.success && result.roles) {
        this.availableAgents = result.roles.map((r: any) => ({
          name: r.name,
          icon: r.icon,
          model: r.model,
          capabilities: r.capabilities
        }));
        this.log('Agents loaded:', this.availableAgents.length);
      }
    } catch (error) {
      this.log('Error loading agents', error);
    }
  }


  /**
   * Test connection for the currently selected model (triggered from badge button)
   */
  public async testConnection() {
    const model = this.models.find(m => m.id === this.activeModelId) as any;
    if (!model) { return; }

    this.isTesting = true;
    this.log('Testing connection from Chat for:', model.name);

    try {
      const result = await this.sendMessage('settings', SETTINGS_MESSAGES.TEST_CONNECTION_REQUEST, {
        provider: model.provider,
        authType: model.authType || 'apiKey',
        apiKey: model.apiKey || null,
      });

      if (result?.success) {
        this.verifiedModelIds.add(this.activeModelId);
        this.isSecure = true;
        this.log('Connection verified ✓');
        // Emit secure state for the tab bar badge
        window.dispatchEvent(new CustomEvent('secure-state-changed', {
          detail: { secure: true }
        }));
      } else {
        this.isSecure = false;
        this.log('Connection failed:', result?.error);
      }
    } catch (error: any) {
      this.isSecure = false;
      this.log('Test connection error:', error.message);
    } finally {
      this.isTesting = false;
    }
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
        const isStreaming = data.isStreaming === true;

        // Find if the last message in history is from the same role and currently streaming
        const historyCopy = [...this.history];
        const lastMsg = historyCopy.length > 0 ? historyCopy[historyCopy.length - 1] : null;

        if (lastMsg && lastMsg.role === data.agentRole && lastMsg.isStreaming) {
          // Accumulate the chunk
          lastMsg.text = data.text;
          lastMsg.isStreaming = isStreaming;
          lastMsg.status = undefined; // Clear "thinking" status once text arrives
          this.history = historyCopy;
        } else {
          // If the previous message was NOT a streaming message from the same agent, create a new message block
          // However, verify if background is just clearing out a 'status' message
          if (lastMsg && lastMsg.role === data.agentRole && lastMsg.status && lastMsg.text === '') {
            lastMsg.text = data.text;
            lastMsg.isStreaming = isStreaming;
            lastMsg.status = undefined;
            this.history = historyCopy;
          } else {
            this.history = [...this.history, {
              sender: data.agentRole ? data.agentRole.charAt(0).toUpperCase() + data.agentRole.slice(1) : 'Agent',
              text: data.text,
              role: data.agentRole,
              isStreaming
            }];
          }
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

      const historyCopy = [...this.history];
      const lastMsg = historyCopy.length > 0 ? historyCopy[historyCopy.length - 1] : null;

      // If the last message is from the SAME agent and it's either an empty status message or currently streaming, update it
      // For now, simplify logic to just append a new status container if the last message is User or a different role
      if (lastMsg && lastMsg.role !== 'user' && lastMsg.role !== 'system') {
        lastMsg.status = status;
        this.history = historyCopy;
      } else {
        this.history = [...this.history, { sender: 'System', text: '', role: 'system', status }];
      }
    }

    // Handle agent list refresh from Chat background (triggered by Settings role changes)
    if (command === 'REFRESH_AGENTS') {
      if (data?.agents) {
        this.availableAgents = data.agents.map((r: any) => ({
          name: r.name,
          icon: r.icon,
          model: r.model,
          capabilities: r.capabilities
        }));
        this.log('Agents refreshed:', this.availableAgents.length);
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

  public toggleAgentDropdown() {
    this.showAgentDropdown = !this.showAgentDropdown;
  }

  public handleAgentChange(role: string) {
    this.selectedAgent = role;
    this.showAgentDropdown = false;
    this.log(`Agent switched to: ${role}`);
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
        agentRole: this.selectedAgent,
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



  override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('history') || changedProperties.has('isLoading')) {
      requestAnimationFrame(() => {
        const container = this.renderRoot?.querySelector('.chat-container');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }

  override render() {
    return render(this);
  }
}

// Manual registration to avoid decorator issues
console.log(`[chat::view] Registering custom element: ${NAME}-view`);
customElements.define(`${NAME}-view`, ChatView);
