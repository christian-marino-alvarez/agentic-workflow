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
  public history: Array<{ sender: string, text: string, role?: string, status?: string, isStreaming?: boolean, phase?: string, toolEvents?: Array<any>, isDelegation?: boolean, delegationAgent?: string, delegationStatus?: string, delegationResult?: string }> = [];

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

  public isLoading: boolean = false;

  @state()
  public initialLoading: boolean = true;

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

  @state()
  public currentSessionId: string = '';

  @state()
  public sessionList: Array<{ id: string, title: string, timestamp: number, messageCount: number }> = [];

  @state()
  public pendingDeleteSessionId: string | undefined;

  @state()
  public taskSteps: Array<{ id: string, label: string, status: 'pending' | 'active' | 'done' }> = [
    { id: 'acceptance', label: 'Acceptance', status: 'done' },
    { id: 'research', label: 'Research', status: 'done' },
    { id: 'analysis', label: 'Analysis', status: 'done' },
    { id: 'planning', label: 'Planning', status: 'done' },
    { id: 'implementation', label: 'Implementation', status: 'active' },
    { id: 'verification', label: 'Verification', status: 'pending' },
    { id: 'results', label: 'Results', status: 'pending' },
    { id: 'commit', label: 'Commit & Push', status: 'pending' },
  ];

  @state()
  public showTimeline: boolean = false;

  // Execution timer
  @state()
  public elapsedSeconds: number = 0;

  @state()
  public activeTask: string = '';

  @state()
  public activeActivity: string = '';

  private timerInterval: ReturnType<typeof setInterval> | null = null;

  public startTimer() {
    if (this.timerInterval) { return; }
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      this.requestUpdate();
    }, 1000);
  }

  public pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public toggleTimeline() {
    this.showTimeline = !this.showTimeline;
  }

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

  /** Current active phase label from taskSteps */
  get currentPhase(): string {
    const active = this.taskSteps.find(s => s.status === 'active');
    return active?.label || '';
  }

  override firstUpdated() {
    this.log('Chat view mounted');

    // Run init tasks in parallel
    this.initWorkflow();
    this.loadModels();
    this.loadAgents();
    this.loadLastSession();

    // Guarantee 1s skeleton preload on initial mount
    setTimeout(() => {
      this.initialLoading = false;
    }, 1000);

    // Listen for secure state changes from Settings
    window.addEventListener('secure-state-changed', ((e: CustomEvent) => {
      const isSecure = e.detail?.secure || false;
      this.isSecure = isSecure;
      if (isSecure && this.activeModelId) {
        this.verifiedModelIds.add(this.activeModelId);
      }
      this.log(`Secure state updated: ${this.isSecure}`);
    }) as EventListener);

    // Auto-save session when user leaves the tab or window loses focus
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.history.length > 1) {
        this.saveCurrentSession();
      }
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Last-chance save before view is destroyed
    if (this.history.length > 1) {
      this.saveCurrentSession();
    }
  }

  /**
   * Load the last session from persistent storage.
   */
  private async loadLastSession() {
    try {
      await this.sendMessage(NAME, MESSAGES.LOAD_SESSION, { sessionId: '__last__' });
    } catch {
      // No last session, use default history
    }
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
      this.log('loadAgents: requesting roles from settings...');
      const [result, disabledResult] = await Promise.all([
        this.sendMessage('settings', SETTINGS_MESSAGES.GET_ROLES),
        this.sendMessage('settings', SETTINGS_MESSAGES.GET_DISABLED_ROLES).catch(() => ({ success: false, disabledRoles: [] }))
      ]);
      this.log('loadAgents: raw result:', JSON.stringify(result));
      if (result?.success && result.roles) {
        const disabledSet = new Set<string>(disabledResult?.disabledRoles || []);
        const activeRoles = result.roles.filter((r: any) => !disabledSet.has(r.name));
        this.log('loadAgents: received', result.roles.length, 'roles, disabled:', Array.from(disabledSet).join(','), ', showing:', activeRoles.length);
        this.availableAgents = activeRoles.map((r: any) => ({
          name: r.name,
          icon: r.icon,
          model: r.model,
          capabilities: r.capabilities
        }));
        this.log('Agents loaded:', this.availableAgents.length);
      } else {
        this.log('loadAgents: result was empty or not successful, keeping defaults. result:', result);
      }
    } catch (error) {
      this.log('Error loading agents (keeping defaults):', error);
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
        this.log('Workflow context loaded silently');
      }
    } catch (error) {
      this.log('Error loading init workflow', error);
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

      // Handle tool events (tool_call / tool_result)
      if (data?.toolEvent) {
        const historyCopy = [...this.history];
        const lastMsg = historyCopy.length > 0 ? historyCopy[historyCopy.length - 1] : null;
        if (lastMsg && lastMsg.role === data.agentRole) {
          if (!lastMsg.toolEvents) { lastMsg.toolEvents = []; }
          lastMsg.toolEvents.push(data.toolEvent);
          this.history = historyCopy;
        }
        return;
      }

      if (data && data.text) {
        const isStreaming = data.isStreaming === true;

        const historyCopy = [...this.history];
        const lastMsg = historyCopy.length > 0 ? historyCopy[historyCopy.length - 1] : null;

        if (lastMsg && lastMsg.role === data.agentRole && lastMsg.isStreaming) {
          lastMsg.text = data.text;
          lastMsg.isStreaming = isStreaming;
          lastMsg.status = undefined;
          this.history = historyCopy;
          // Auto-save when streaming completes
          if (!isStreaming) {
            this.saveCurrentSession();
            this.activeActivity = '';
            this.pauseTimer();
          }
        } else {
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
              isStreaming,
              phase: this.currentPhase
            }];
          }
        }
      }
    }

    // Handle delegation events (delegation card with agent info + result)
    if (command === MESSAGES.DELEGATION_EVENT) {
      if (data?.type === 'tool_call' && data?.status === 'pending') {
        // Show delegation card
        this.history = [...this.history, {
          sender: `🔀 Delegación → ${data.targetAgent || 'agente'}`,
          text: `**Tarea delegada**: ${data.taskDescription || '(sin descripción)'}`,
          role: 'delegation',
          isDelegation: true,
          delegationAgent: data.targetAgent,
          delegationStatus: 'pending',
          isStreaming: true,
        }];
      } else if (data?.type === 'tool_result' && data?.result) {
        // Update the last delegation card with the result
        const historyCopy = [...this.history];
        const delegationMsg = historyCopy.reverse().find((m: any) => m.isDelegation && m.delegationStatus === 'pending');
        if (delegationMsg) {
          delegationMsg.delegationStatus = 'completed';
          delegationMsg.delegationResult = data.result;
          delegationMsg.isStreaming = false;
          this.history = [...historyCopy.reverse()];
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

    // Handle session loaded from persistence
    if (command === MESSAGES.LOAD_SESSION_RESPONSE) {
      if (data?.session?.messages) {
        this.currentSessionId = data.session.id;

        // Filter out legacy auto-generated context messages
        const contextPhrases = ['I have loaded your workflow context', 'I am the Architect Agent', 'Error loading workflow context'];
        const filtered = data.session.messages.filter((m: any) =>
          !contextPhrases.some(phrase => m.text?.startsWith(phrase))
        );

        this.history = filtered.map((m: any) => ({
          sender: m.sender || (m.role === 'user' ? 'Me' : m.role?.charAt(0).toUpperCase() + m.role?.slice(1)),
          text: m.text,
          role: m.role,
        }));
        this.log(`Session restored: ${data.session.id} (${this.history.length} messages)`);
      }
    }

    // Handle session list for History tab
    if (command === MESSAGES.LIST_SESSIONS_RESPONSE) {
      if (data?.sessions) {
        this.sessionList = data.sessions;
        this.log(`Session list loaded: ${data.sessions.length} sessions`);
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
    this.history = [...this.history, { sender: 'Me', text, role: 'user', phase: this.currentPhase }];
    this.inputText = '';
    this.activeActivity = 'Procesando...';
    this.startTimer();

    try {
      this.isLoading = true;
      await this.sendMessage(NAME, MESSAGES.SEND_MESSAGE, {
        text,
        agentRole: this.selectedAgent,
        workflow: this.activeWorkflow,
        attachments: this.attachments,
        history: this.history.slice(-20).map(m => ({ role: m.role || 'user', text: m.text }))
      });

      this.attachments = [];

      // Auto-save session after sending
      this.saveCurrentSession();
    } catch (error) {
      this.isLoading = false;
      this.log('Error sending message', error);
      this.history = [...this.history, { sender: 'System', text: 'Error sending message', role: 'system' }];
    }
  }

  /**
   * Save current session to persistent storage.
   */
  public async saveCurrentSession(): Promise<void> {
    const messages = this.history.map(m => ({
      sender: m.sender,
      text: m.text,
      role: m.role,
    }));
    const done = this.taskSteps.filter(s => s.status === 'done').length;
    const total = this.taskSteps.length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    try {
      const result = await this.sendMessage(NAME, MESSAGES.SAVE_SESSION, {
        sessionId: this.currentSessionId || undefined,
        messages,
        taskTitle: this.activeWorkflow || undefined,
        elapsedSeconds: this.elapsedSeconds || 0,
        progress,
        accessLevel: Object.values(this.agentPermissions).includes('full') ? 'full' : 'sandbox',
      });
      if (result?.sessionId) {
        this.currentSessionId = result.sessionId;
      }
    } catch { /* silent */ }
  }

  /**
   * Start a new chat session.
   */
  public async newSession() {
    // Save current session to history before resetting
    if (this.history.length > 1) {
      await this.saveCurrentSession();
    }

    // Start fresh
    this.history = [];
    this.currentSessionId = '';
    try {
      const result = await this.sendMessage(NAME, MESSAGES.NEW_SESSION);
      if (result?.sessionId) {
        this.currentSessionId = result.sessionId;
      }
    } catch { /* silent */ }
  }

  /**
   * Request session list from background.
   */
  public requestSessions() {
    this.sendMessage(NAME, MESSAGES.LIST_SESSIONS).catch(() => { /* silent */ });
  }

  /**
   * Load a specific session by id.
   */
  public loadSession(sessionId: string) {
    this.sendMessage(NAME, MESSAGES.LOAD_SESSION, { sessionId }).catch(() => { /* silent */ });
  }

  /**
   * Delete a session.
   */
  public handleDeleteSession(sessionId: string) {
    if (this.pendingDeleteSessionId === sessionId) {
      // Second click — confirm delete
      this.sendMessage(NAME, MESSAGES.DELETE_SESSION, { sessionId }).then(() => {
        this.sessionList = this.sessionList.filter(s => s.id !== sessionId);
      }).catch(() => { /* silent */ });
      this.pendingDeleteSessionId = undefined;
      return;
    }

    // First click — mark as pending
    this.pendingDeleteSessionId = sessionId;

    // Auto-reset after 3 seconds
    setTimeout(() => {
      if (this.pendingDeleteSessionId === sessionId) {
        this.pendingDeleteSessionId = undefined;
      }
    }, 3000);
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
