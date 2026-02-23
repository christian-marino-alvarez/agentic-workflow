import { View } from '../../core/view/index.js';
import { state } from 'lit/decorators.js';
import { styles } from './templates/css.js';
import { render } from './templates/html.js';
import { MESSAGES, NAME, STEP_STATUS } from '../constants.js';
import { MESSAGES as SETTINGS_MESSAGES } from '../../settings/constants.js';
import { parseA2UI, A2UIBlock } from './templates/a2ui/html.js';

console.log('[chat::view] Module loading...');

export class ChatView extends View {
  static override styles = styles;
  protected override readonly moduleName = NAME;

  constructor() {
    super();
  }

  @state()
  public history: Array<{ sender: string, text: string, role?: string, status?: string, isStreaming?: boolean, phase?: string, toolEvents?: Array<any>, isDelegation?: boolean, delegationAgent?: string, delegationStatus?: string, delegationResult?: string, isGate?: boolean, gateId?: string, gateDecision?: 'approve' | 'reject', a2uiAnswers?: Record<string, string>, a2uiDismissed?: boolean }> = [];

  @state()
  public inputText: string = '';

  @state()
  public models: Array<{ id: string, name: string, provider: string }> = [];

  @state()
  public attachments: string[] = [];

  private activeModelId: string = '';

  @state()
  public activeWorkflow: string = '';

  @state()
  public selectedAgent: string = 'architect';

  @state()
  public showAgentDropdown: boolean = false;

  @state()
  public availableAgents: Array<{ name: string; icon?: string; model?: { provider?: string; id?: string }; capabilities?: Record<string, boolean> }> = [];
  // Note: populated dynamically from the runtime backend via LIST_AGENTS_RESPONSE / AGENTS_REFRESHED

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
  public taskSteps: Array<{ id: string, label: string, status: 'pending' | 'active' | 'done' }> = [];

  @state()
  public activeWorkflowDef: any = null;

  @state()
  public showTimeline: boolean = true;

  @state()
  public showDetails: boolean = false;

  /** Rich workflow details: gate requirements, context files, next step etc. */
  @state()
  public workflowDetails: {
    workflowId?: string;
    version?: string;
    severity?: string;
    blocking?: boolean;
    owner?: string;
    model?: string;
    contextFiles?: string[];
    gateRequirements?: string[];
    nextStep?: string;
    nextStepIndex?: number;
    passTarget?: string;
    failBehavior?: string;
    inputs?: string[];
    outputs?: string[];
    templates?: string[];
    objective?: string;
    currentPhaseLabel?: string;
  } = {};

  /** Tracks the pending A2UI confirmation from the last assistant message */
  @state()
  public pendingA2UI: { blockId: string; label: string; options: string[]; msgIndex: number; blockIndex: number } | null = null;

  /** Skeleton loading state for input area transitions */
  @state()
  public inputSkeleton: boolean = false;
  private skeletonTimer: ReturnType<typeof setTimeout> | null = null;

  /** Selected lifecycle strategy — persisted in session */
  @state()
  public lifecycleStrategy: 'long' | 'short' | null = null;

  // Execution timer
  @state()
  public elapsedSeconds: number = 0;

  @state()
  public activeTask: string = '';

  @state()
  public activeActivity: string = '';

  /** Cumulative token usage for the current session */
  @state()
  public tokenUsage: { inputTokens: number; outputTokens: number; totalTokens: number; estimatedCost: number } = { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCost: 0 };

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
    if (this.showTimeline) {
      this.showDetails = false;
    }
  }

  public toggleDetails() {
    this.showDetails = !this.showDetails;
    if (this.showDetails) {
      this.showTimeline = false;
    }
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

    // Delegated click handler for file links in rendered markdown
    this.renderRoot.addEventListener('click', (e: Event) => {
      const target = (e.target as HTMLElement).closest('.file-link') as HTMLElement;
      if (target?.dataset?.filePath) {
        e.preventDefault();
        this.sendMessage(NAME, 'OPEN_FILE', { path: target.dataset.filePath });
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
      const result = await this.sendMessage(NAME, MESSAGES.LOAD_SESSION, { sessionId: '__last__' });
      if (!result?.success) {
        // No saved session — auto-start /init after runtime is ready
        this.log('No last session found, will auto-start /init');
        setTimeout(async () => {
          this.inputText = '/init';
          await this.sendChatMessage();
          this.inputText = '';
        }, 2000);
      }
    } catch {
      // No last session — auto-start /init after runtime is ready
      this.log('No last session, will auto-start /init');
      setTimeout(async () => {
        this.inputText = '/init';
        await this.sendChatMessage();
        this.inputText = '';
      }, 2000);
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

    // Fetch current workflow state with delay (sidecar needs ~2s to start)
    this.fetchWorkflowStateWithRetry(3);
  }

  private async fetchWorkflowStateWithRetry(retries: number): Promise<void> {
    for (let attempt = 0; attempt < retries; attempt++) {
      // Wait before first attempt to give sidecar time to initialize
      await new Promise(r => setTimeout(r, attempt === 0 ? 3000 : 2000));
      try {
        const stateResponse = await this.sendMessage(NAME, MESSAGES.WORKFLOW_STATE_UPDATE);
        // Accept any response that has meaningful workflow data
        if (stateResponse && (stateResponse.workflow || stateResponse.phases || stateResponse.steps || stateResponse.currentWorkflowId)) {
          this.listen({
            payload: { command: MESSAGES.WORKFLOW_STATE_UPDATE, data: stateResponse },
          });
          this.log(`Workflow state loaded on mount (workflowId: ${stateResponse.currentWorkflowId || 'unknown'})`);
          return;
        } else {
          this.log(`Workflow state fetch attempt ${attempt + 1}/${retries}: no useful data`);
        }
      } catch {
        this.log(`Workflow state fetch attempt ${attempt + 1}/${retries} failed`);
      }
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
        const te = data.toolEvent;
        // Show activity feedback for tool execution
        if (te.type === 'tool_call') {
          const toolLabel = te.name === 'writeFile' ? 'Writing...' : te.name === 'readFile' ? 'Reading...' : 'Thinking...';
          this.activeActivity = toolLabel;
        } else if (te.type === 'tool_result') {
          this.activeActivity = 'Thinking...';
        }
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

    // Token usage tracking
    if (command === MESSAGES.USAGE_UPDATE) {
      const input = data?.inputTokens || 0;
      const output = data?.outputTokens || 0;
      const model = (data?.model || '').toLowerCase();

      // Approximate cost per 1M tokens (EUR)
      let inputRate = 0.07;   // default: gemini flash
      let outputRate = 0.28;
      if (model.includes('pro')) {
        inputRate = 1.15; outputRate = 4.60;
      } else if (model.includes('gpt') || model.includes('codex') || model.includes('o1') || model.includes('o3') || model.includes('o4')) {
        inputRate = 1.85; outputRate = 7.40;
      } else if (model.includes('claude')) {
        inputRate = 2.75; outputRate = 13.80;
      }

      const cost = (input * inputRate + output * outputRate) / 1_000_000;

      this.tokenUsage = {
        inputTokens: this.tokenUsage.inputTokens + input,
        outputTokens: this.tokenUsage.outputTokens + output,
        totalTokens: this.tokenUsage.totalTokens + input + output,
        estimatedCost: this.tokenUsage.estimatedCost + cost,
      };
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
          ...(m.a2uiAnswers ? { a2uiAnswers: m.a2uiAnswers } : {}),
          ...(m.a2uiDismissed ? { a2uiDismissed: true } : {}),
        }));
        this.log(`Session restored: ${data.session.id} (${this.history.length} messages)`);

        // Restore task metadata
        if (data.session.taskTitle) {
          this.activeWorkflow = data.session.taskTitle;
        }
        if (data.session.elapsedSeconds) {
          this.elapsedSeconds = data.session.elapsedSeconds;
        }

        // Restore lifecycle strategy and reload phases
        if (data.session.lifecycleStrategy) {
          this.lifecycleStrategy = data.session.lifecycleStrategy;
          this.loadLifecyclePhases(data.session.lifecycleStrategy);
        }
      }
    }

    // Handle session list for History tab
    if (command === MESSAGES.LIST_SESSIONS_RESPONSE) {
      if (data?.sessions) {
        this.sessionList = data.sessions;
        this.log(`Session list loaded: ${data.sessions.length} sessions`);
      }
    }

    // Handle gate request from workflow engine
    if (command === MESSAGES.GATE_REQUEST) {
      this.isLoading = false;
      this.history = [...this.history, {
        sender: '🚦 Gate',
        text: data?.question || data?.label || `Gate approval required: **${data?.stepId || 'unknown'}**`,
        role: 'gate',
        isGate: true,
        gateId: data?.gateId || data?.stepId || 'unknown',
      }];
    }

    // Handle workflow state updates — update taskSteps + show message
    if (command === MESSAGES.WORKFLOW_STATE_UPDATE) {
      const statusText = data?.status || 'unknown';
      const phase = data?.currentStep?.label || data?.currentPhase || '';

      // Update taskSteps from engine state if available
      // Skip internal init workflow steps — only show lifecycle phases
      const isInitWorkflow = data?.currentWorkflowId === 'workflow.init';

      // Lifecycle workflows: update from phases (Brief, Implementation, Closure)
      if (data?.phases && Array.isArray(data.phases) && data.phases.length > 0) {
        this.taskSteps = data.phases.map((p: any) => ({
          id: p.id || p.label,
          label: p.label || p.id,
          status: p.status === 'completed' ? STEP_STATUS.DONE
            : p.status === 'active' || p.status === 'executing' ? STEP_STATUS.ACTIVE
              : p.status === 'failed' ? STEP_STATUS.DONE  // show failed as done with different styling later
                : STEP_STATUS.PENDING,
        }));
      } else if (data?.steps && Array.isArray(data.steps) && !isInitWorkflow) {
        // Simple workflows: update from steps
        this.taskSteps = data.steps.map((s: any) => ({
          id: s.id || s.stepId,
          label: s.label || s.id,
          status: s.status === 'completed' ? STEP_STATUS.DONE
            : s.status === 'active' || s.status === 'executing' ? STEP_STATUS.ACTIVE
              : STEP_STATUS.PENDING,
        }));
      }

      // Update workflow title from engine state
      if (data?.taskTitle || data?.workflowId) {
        this.activeWorkflow = data.taskTitle || data.workflowId;
      }

      // Store workflow details if provided
      if (data?.workflow) {
        this.activeWorkflowDef = data.workflow;
      }

      if (data?.steps && data.steps.length > 0 && !this.showTimeline) {
        this.showTimeline = true;
      }

      // Build rich workflowDetails for the Details panel
      if (data?.workflow || data?.steps) {
        const steps: Array<{ id: string, label: string, status: string }> = data?.steps || [];
        const nextStepObj = steps.find((s: any) => s.status === 'pending');
        const nextStepIdx = nextStepObj ? steps.indexOf(nextStepObj) : -1;
        const activeAgent = this.availableAgents.find(a => a.name === data?.workflow?.owner?.replace(/-agent$/, ''));

        this.workflowDetails = {
          workflowId: data?.currentWorkflowId || data?.workflow?.description || '',
          version: data?.workflow?.version,
          severity: data?.workflow?.severity,
          blocking: data?.workflow?.blocking,
          owner: data?.workflow?.owner,
          model: activeAgent?.model?.id ? (this.models.find(m => m.id === activeAgent.model!.id)?.name || activeAgent.model.id) : undefined,
          contextFiles: data?.workflow?.constitutions || [],
          gateRequirements: data?.workflow?.gate?.requirements || [],
          nextStep: nextStepObj?.label,
          nextStepIndex: nextStepIdx >= 0 ? nextStepIdx + 1 : undefined,
          passTarget: data?.workflow?.passTarget || undefined,
          failBehavior: data?.workflow?.failBehavior || undefined,
          // Sections: prefer active phase sections, fallback to workflow-level sections
          inputs: data?.parsedSections?.inputs || data?.workflow?.sections?.inputs || [],
          outputs: data?.parsedSections?.outputs || data?.workflow?.sections?.outputs || [],
          templates: data?.parsedSections?.templates || data?.workflow?.sections?.templates || [],
          objective: data?.parsedSections?.objective || data?.workflow?.sections?.objective || '',
          currentPhaseLabel: data?.phases?.find((p: any) => p.status === 'active')?.label || '',
        };
      }

      // Engine status is reflected in the header/timeline/details — no chat message needed
    }

    // Auto-new-session triggered by /init
    if (command === 'NEW_SESSION_AUTO') {
      if (this.history.length > 0) {
        this.saveCurrentSession();
      }
      this.history = [];
      this.currentSessionId = '';
      this.elapsedSeconds = 0;
      this.activeActivity = '';
      this.activeWorkflow = '🔄 Initializing task...';
      this.taskSteps = [];
      this.activeWorkflowDef = null;
      this.showTimeline = true;
      this.showDetails = false;
      this.isLoading = true;
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

  public handleGateResponse(gateId: string, decision: 'approve' | 'reject') {
    // Update the gate card in history to show the decision
    const historyCopy = [...this.history];
    const gateMsg = historyCopy.find(m => m.isGate && m.gateId === gateId && !m.gateDecision);
    if (gateMsg) {
      gateMsg.gateDecision = decision;
      this.history = historyCopy;
    }

    // Send the gate response to background
    this.sendMessage(NAME, MESSAGES.GATE_RESPONSE, {
      gateId,
      decision,
    }).catch((err) => {
      this.log('Error sending gate response', err);
    });
  }

  /**
   * Confirm an A2UI option from the input area buttons.
   */
  public confirmA2UIOption(option: string): void {
    if (!this.pendingA2UI || !option) { return; }
    const { msgIndex, blockId } = this.pendingA2UI;
    const msg = this.history[msgIndex] as any;
    if (!msg) { return; }

    // Parse all blocks to check if this is the last one
    const segments = parseA2UI(msg.text || '');
    const blocks: A2UIBlock[] = segments.filter((s: any) => s.type === 'a2ui' && s.block).map((s: any) => s.block!);

    // Store answer
    if (!msg.a2uiAnswers) { msg.a2uiAnswers = {}; }
    msg.a2uiAnswers[blockId] = option;

    // Check if all blocks are resolved
    const allResolved = blocks.every((b: A2UIBlock) => msg.a2uiAnswers[b.id] !== undefined);

    // Detect if any block is a gate type
    const gateBlock = blocks.find(b => b.type === 'gate');
    const hasGateBlock = !!gateBlock;

    if (allResolved) {
      if (hasGateBlock) {
        // Gate A2UI: send GATE_RESPONSE command to background (data-driven workflow transition)
        const gateAnswer = msg.a2uiAnswers[gateBlock!.id];
        const decision = /^si$/i.test(gateAnswer) ? 'SI' : 'NO';

        // Extract strategy from other A2UI answers if available
        const strategyAnswer = Object.values(msg.a2uiAnswers as Record<string, string>).find(
          (v: string) => /long|short/i.test(v)
        );
        const strategy = strategyAnswer && /short/i.test(strategyAnswer) ? 'short' : 'long';

        this.log(`Gate A2UI confirmed: decision=${decision}, strategy=${strategy}`);
        this.sendMessage(NAME, MESSAGES.GATE_RESPONSE, {
          gateId: gateBlock!.id,
          decision,
          strategy,
        });

        // Also send as silent message for LLM context
        const parts: string[] = [];
        for (const b of blocks) {
          const ans = msg.a2uiAnswers[b.id];
          if (ans) { parts.push(`${b.label || b.id}: ${ans}`); }
        }
        this.sendSilentMessage(parts.join('\n'));
      } else {
        // Regular A2UI: send all answers as silent message
        const parts: string[] = [];
        for (const b of blocks) {
          const ans = msg.a2uiAnswers[b.id];
          if (ans) { parts.push(`${b.label || b.id}: ${ans}`); }
        }
        this.sendSilentMessage(parts.join('\n'));
      }
    }

    // Detect strategy selection — request phases dynamically from filesystem
    const isStrategyOption = /long|short/i.test(option);
    if (isStrategyOption) {
      const strategy = /short/i.test(option) ? 'short' as const : 'long' as const;
      this.lifecycleStrategy = strategy;
      this.loadLifecyclePhases(strategy);
    }

    // Trigger re-render
    const historyCopy = [...this.history];
    historyCopy[msgIndex] = { ...historyCopy[msgIndex], a2uiAnswers: { ...msg.a2uiAnswers } };
    this.history = historyCopy;
  }

  /**
   * Request lifecycle phases from filesystem and populate timeline.
   */
  private async loadLifecyclePhases(strategy: string): Promise<void> {
    try {
      const result = await this.sendMessage(NAME, MESSAGES.LIFECYCLE_PHASES_REQUEST, { strategy });
      const phases: Array<{ id: string; label: string }> = result?.phases || [];
      if (phases.length > 0) {
        this.taskSteps = phases.map(p => ({ id: p.id, label: p.label, status: STEP_STATUS.PENDING as 'pending' }));
        this.log(`Timeline loaded: ${phases.length} phases for ${strategy}`);
      }
    } catch (err: any) {
      this.log(`Failed to load lifecycle phases: ${err.message}`);
    }
  }

  /**
   * Cancel/dismiss a pending A2UI sequence.
   */
  public cancelA2UI(): void {
    if (!this.pendingA2UI) { return; }
    const { msgIndex } = this.pendingA2UI;
    const historyCopy = [...this.history];
    (historyCopy[msgIndex] as any).a2uiDismissed = true;
    this.history = historyCopy;
  }

  public async sendChatMessage() {
    if (!this.inputText.trim() && this.attachments.length === 0) { return; }

    const text = this.inputText;
    const isCommand = text.trim().startsWith('/');
    this.inputText = '';

    // Record the user message (if it is not a slash command)
    if (!isCommand) {
      this.history = [...this.history, { sender: 'Me', text, role: 'user', phase: this.currentPhase }];
    }

    // Start processing state and timer
    this.activeActivity = 'Thinking...';
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

      // Session is saved when stream response completes (RECEIVE_MESSAGE handler)
    } catch (error) {
      this.isLoading = false;
      // Log silently — non-blocking errors should not pollute the chat
      this.log('Error sending message', error);
    }
  }

  /**
   * Send a message to the agent without showing it in the chat history.
   * Used by A2UI confirmations so the answer appears as a confirmed element,
   * not as a separate user message bubble.
   */
  public async sendSilentMessage(text: string) {
    this.activeActivity = 'Thinking...';
    this.startTimer();

    try {
      this.isLoading = true;
      await this.sendMessage(NAME, MESSAGES.SEND_MESSAGE, {
        text,
        agentRole: this.selectedAgent,
        workflow: this.activeWorkflow,
        attachments: [],
        history: this.history.slice(-20).map(m => ({ role: m.role || 'user', text: m.text }))
      });
    } catch (error) {
      this.isLoading = false;
      this.log('Error sending silent message', error);
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
      ...(m.a2uiAnswers ? { a2uiAnswers: m.a2uiAnswers } : {}),
      ...(m.a2uiDismissed ? { a2uiDismissed: true } : {}),
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
        lifecycleStrategy: this.lifecycleStrategy || undefined,
        accessLevel: Object.values(this.agentPermissions).includes('full') ? 'full' : 'sandbox',
        securityScore: (() => {
          const perms = Object.values(this.agentPermissions);
          if (perms.length === 0) { return 100; }
          const sandboxCount = perms.filter(p => p !== 'full').length;
          return Math.round((sandboxCount / perms.length) * 100);
        })(),
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
    this.elapsedSeconds = 0;
    this.activeActivity = '';
    this.activeWorkflow = '';
    this.taskSteps = [];
    this.activeWorkflowDef = null;
    this.showTimeline = true;
    this.showDetails = false;

    try {
      const result = await this.sendMessage(NAME, MESSAGES.NEW_SESSION);
      if (result?.sessionId) {
        this.currentSessionId = result.sessionId;
      }

      // Auto-trigger INIT workflow!
      this.inputText = '/init';
      await this.sendChatMessage();
      this.inputText = '';
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
        // If deleting the current session, clear the ID to prevent re-save
        if (this.currentSessionId === sessionId) {
          this.currentSessionId = '';
        }
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
      this.updateComplete.then(() => {
        setTimeout(() => {
          const container = this.renderRoot?.querySelector('.chat-container');
          if (!container) { return; }
          container.scrollTop = container.scrollHeight;
        }, 100);
      });

      // Detect pending A2UI confirmation in the last assistant message
      this.detectPendingA2UI();
    }
  }

  /**
   * Scan history for unresolved A2UI blocks and set pendingA2UI state.
   */
  private detectPendingA2UI(): void {
    const previousA2UI = this.pendingA2UI;

    // Find the last assistant/agent message with A2UI blocks
    let newPending: typeof this.pendingA2UI = null;
    for (let i = this.history.length - 1; i >= 0; i--) {
      const msg = this.history[i] as any;
      if (msg.sender === 'Me' || msg.sender === 'System' || msg.role === 'user') { continue; }
      if (msg.isStreaming) { continue; }
      if (msg.a2uiDismissed) { break; }

      const segments = parseA2UI(msg.text || '');
      const blocks: A2UIBlock[] = segments.filter((s: any) => s.type === 'a2ui' && s.block).map((s: any) => s.block!);
      if (blocks.length === 0) { break; }

      const answers: Record<string, string> = msg.a2uiAnswers || {};
      const unresolved = blocks.find((b: A2UIBlock) => answers[b.id] === undefined);
      if (!unresolved) { break; }

      newPending = {
        blockId: unresolved.id,
        label: unresolved.label || unresolved.id,
        options: unresolved.options,
        msgIndex: i,
        blockIndex: blocks.indexOf(unresolved),
      };
      break;
    }

    // Detect state change — show skeleton transition
    const wasA2UI = previousA2UI !== null;
    const isA2UI = newPending !== null;
    const blockChanged = wasA2UI && isA2UI && previousA2UI.blockId !== newPending!.blockId;

    if ((wasA2UI !== isA2UI) || blockChanged) {
      // State changed — show skeleton for 1 second
      if (this.skeletonTimer) { clearTimeout(this.skeletonTimer); }
      this.inputSkeleton = true;
      this.pendingA2UI = null; // hide during skeleton
      this.skeletonTimer = setTimeout(() => {
        this.inputSkeleton = false;
        this.pendingA2UI = newPending;
      }, 800);
    } else {
      this.pendingA2UI = newPending;
    }
  }

  override render() {
    return render(this);
  }
}

// Manual registration to avoid decorator issues
console.log(`[chat::view] Registering custom element: ${NAME}-view`);
customElements.define(`${NAME}-view`, ChatView);
