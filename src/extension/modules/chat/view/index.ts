import { View } from '../../core/view/index.js';
import { state } from 'lit/decorators.js';
import { styles } from './templates/css.js';
import { render } from './templates/html.js';
import { MESSAGES, USER_ACTIONS, NAME, STEP_STATUS } from '../constants.js';
import { MESSAGES as SETTINGS_MESSAGES } from '../../settings/constants.js';
import { parseA2UI, A2UIBlock, isDisplayBlock } from './templates/a2ui/html.js';

console.log('[chat::view] Module loading...');

export class ChatView extends View {
  static override styles = styles;
  protected override readonly moduleName = NAME;

  constructor() {
    super();
  }

  @state()
  public history: Array<{ sender: string, text: string, role?: string, status?: string, isStreaming?: boolean, phase?: string, toolEvents?: Array<any>, isDelegation?: boolean, delegationAgent?: string, delegationStatus?: string, delegationResult?: string, isGate?: boolean, gateId?: string, gateDecision?: 'approve' | 'reject', a2uiAnswers?: Record<string, string>, a2uiDismissed?: boolean, isError?: boolean }> = [];

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
  public availableAgents: Array<{ name: string; icon?: string; model?: { provider?: string; id?: string }; capabilities?: Record<string, boolean>; context?: string[] }> = [];
  // Note: populated dynamically from the runtime backend via LIST_AGENTS_RESPONSE / AGENTS_REFRESHED

  public isLoading: boolean = false;

  /** Queue for silent messages — ensures sequential LLM calls (no concurrent skeleton merging) */
  private silentMessageQueue: string[] = [];
  private silentMessageProcessing: boolean = false;

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

  protected override getSessionId(): string {
    return this.currentSessionId;
  }

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

  @state()
  public showWelcome: boolean = false;

  /** Rich workflow details: gate requirements, context files, next step etc. */
  @state()
  public workflowDetails: {
    workflowId?: string;
    version?: string;
    type?: 'static' | 'dynamic';
    owner?: string;
    model?: string;
    contextFiles?: string[];
    gateRequirements?: string[];
    nextStep?: string;
    nextStepIndex?: number;
    pass?: { nextTarget: string | null; actions: string[]; rawContent: string } | null;
    fail?: { behavior: 'block' | 'retry'; cases: string[]; rawContent: string } | null;
    inputs?: string[];
    outputs?: string[];
    objective?: string;
    instructions?: string;
    currentPhaseLabel?: string;
  } = {};

  /** Tracks the pending A2UI confirmation from the last assistant message */
  @state()
  public pendingA2UI: {
    type: string; blockId: string; label: string; artifactContent?: string; options: string[];
    msgIndex: number;
    blockIndex: number;
    artifacts?: { path: string; label: string }[];
  } | null = null;

  /** Skeleton loading state for input area transitions */
  @state()
  public inputSkeleton: boolean = false;
  private skeletonTimer: ReturnType<typeof setTimeout> | null = null;

  // Execution timer
  @state()
  public elapsedSeconds: number = 0;

  @state()
  public activeTask: string = '';

  @state()
  public activeActivity: string = '';

  /** Cumulative token usage for the current session */
  @state()
  public tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
    requests: number;
    byModel: Record<string, { inputTokens: number; outputTokens: number; cost: number; requests: number }>;
  } = { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCost: 0, requests: 0, byModel: {} };

  /** Whether the usage stats panel is open */
  @state()
  public showUsagePanel: boolean = false;

  private timerInterval: ReturnType<typeof setInterval> | null = null;

  /** Cached pricing config from Settings (loaded lazily on first usage) */
  private _pricingCache: Record<string, { input: number; output: number }> | null = null;

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

  public toggleUsagePanel() {
    this.showUsagePanel = !this.showUsagePanel;
  }

  /**
   * Whether the currently selected agent is disabled (no model assigned).
   */
  get agentDisabled(): boolean {
    // Only disabled if no agents are available at all
    // Model resolution happens in the background via Settings bindings
    if (this.availableAgents.length === 0) { return false; } // Don't block before agents load
    const agent = this.availableAgents.find(a => a.name === this.selectedAgent);
    return !agent;
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
    this.logTagged('#config', `Permission toggled for ${role}: ${next}`);
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
    this.logTagged('#system', 'Chat view mounted');

    // Run init tasks in parallel, then load session once ready
    Promise.all([
      this.initWorkflow(),
      this.loadModels(),
      this.loadAgents(),
    ]).then(() => {
      this.initialLoading = false;
      this.loadLastSession();
    });

    // Listen for secure state changes from Settings
    window.addEventListener('secure-state-changed', ((e: CustomEvent) => {
      const isSecure = e.detail?.secure || false;
      this.isSecure = isSecure;
      if (isSecure && this.activeModelId) {
        this.verifiedModelIds.add(this.activeModelId);
      }
      this.logTagged('#system', `Secure state updated: ${this.isSecure}`);
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
   * Always show the welcome screen on startup.
   * Fetches session list to show resume options if sessions exist.
   */
  private async loadLastSession() {
    // Fetch existing sessions to populate the welcome screen
    try {
      const result = await this.sendMessage(NAME, MESSAGES.LIST_SESSIONS);
      if (result?.sessions) {
        this.handleListSessionsResponse({ sessions: result.sessions });
      }
    } catch { /* silent */ }

    this.showWelcome = true;
    this.isLoading = false;
    this.logTagged('#session', `Welcome screen shown (${this.sessionList.length} sessions available)`);
  }

  /**
   * Show welcome screen (called from catch paths).
   */
  private autoStartInit() {
    this.showWelcome = true;
    this.isLoading = false;
  }

  /**
   * Start a new task from the welcome screen.
   * Creates a session, hides welcome, and sends /init.
   */
  public async startNewTask() {
    this.showWelcome = false;
    this.isLoading = true;

    try {
      const result = await this.sendMessage(NAME, MESSAGES.NEW_SESSION);
      if (result?.sessionId) {
        this.currentSessionId = result.sessionId;
        this.logTagged('#session', `Session created for new task: ${result.sessionId}`);
      }
    } catch { /* proceed anyway */ }

    this.inputText = '/init';
    await this.sendChatMessage();
    this.inputText = '';
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
        this.logTagged('#config', 'Models loaded:', this.models.length);
      }
    } catch (error) {
      this.logTagged('#config', 'Error loading models', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load agents (roles) with their model/capabilities from Settings.
   */
  private async loadAgents() {
    try {
      this.logTagged('#config', 'loadAgents: requesting roles from settings...');
      const [result, disabledResult] = await Promise.all([
        this.sendMessage('settings', SETTINGS_MESSAGES.GET_ROLES),
        this.sendMessage('settings', SETTINGS_MESSAGES.GET_DISABLED_ROLES).catch(() => ({ success: false, disabledRoles: [] }))
      ]);
      this.logTagged('#config', 'loadAgents: raw result:', JSON.stringify(result));
      if (result?.success && result.roles) {
        const disabledSet = new Set<string>(disabledResult?.disabledRoles || []);
        const activeRoles = result.roles.filter((r: any) => !disabledSet.has(r.name));
        this.logTagged('#config', 'loadAgents: received', result.roles.length, 'roles, disabled:', Array.from(disabledSet).join(','), ', showing:', activeRoles.length);
        this.availableAgents = activeRoles.map((r: any) => ({
          name: r.name,
          icon: r.icon,
          model: r.model,
          capabilities: r.capabilities,
          context: r.context
        }));
        this.logTagged('#config', 'Agents loaded:', this.availableAgents.length);
      } else {
        this.logTagged('#config', 'loadAgents: result was empty or not successful, keeping defaults. result:', result);
      }
    } catch (error) {
      this.logTagged('#config', 'Error loading agents (keeping defaults):', error);
    }
  }


  /**
   * Test connection for the currently selected model (triggered from badge button)
   */
  public async testConnection() {
    const model = this.models.find(m => m.id === this.activeModelId) as any;
    if (!model) { return; }

    this.isTesting = true;
    this.logTagged('#llm', 'Testing connection from Chat for:', model.name);

    try {
      const result = await this.sendMessage('settings', SETTINGS_MESSAGES.TEST_CONNECTION_REQUEST, {
        provider: model.provider,
        authType: model.authType || 'apiKey',
        apiKey: model.apiKey || null,
      });

      if (result?.success) {
        this.verifiedModelIds.add(this.activeModelId);
        this.isSecure = true;
        this.logTagged('#llm', 'Connection verified ✓');
        // Emit secure state for the tab bar badge
        window.dispatchEvent(new CustomEvent('secure-state-changed', {
          detail: { secure: true }
        }));
      } else {
        this.isSecure = false;
        this.logTagged('#llm', 'Connection failed:', result?.error);
      }
    } catch (error: any) {
      this.isSecure = false;
      this.logTagged('#llm', 'Test connection error:', error.message);
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
        this.logTagged('#workflow', 'Workflow context loaded silently');
      }
    } catch (error) {
      this.logTagged('#workflow', 'Error loading init workflow', error);
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
          this.processPayload({ workflowState: stateResponse });
          this.logTagged('#workflow', `Workflow state loaded on mount (workflowId: ${stateResponse.currentWorkflowId || 'unknown'})`);
          return;
        } else {
          this.logTagged('#workflow', `Workflow state fetch attempt ${attempt + 1}/${retries}: no useful data`);
        }
      } catch {
        this.logTagged('#workflow', `Workflow state fetch attempt ${attempt + 1}/${retries} failed`);
      }
    }
  }

  // No listen() override needed — all data flows through return payloads from sendMessage.
  // Push events eliminated: RECEIVE_MESSAGE, DELEGATION_EVENT, USAGE_UPDATE, AGENT_STATUS,
  // GATE_REQUEST, WORKFLOW_STATE_UPDATE, NEW_SESSION_AUTO, PHASE_AUTO_START, GATE_CONTINUE,
  // REFRESH_AGENTS, LOAD_SESSION_RESPONSE, LIST_SESSIONS_RESPONSE, SELECT_FILES_RESPONSE.


  private handleDelegationEvent(data: any): void {
    if (data?.type === 'tool_call' && data?.status === 'pending') {
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

  private handleUsageUpdate(data: any): void {
    const input = data?.inputTokens || 0;
    const output = data?.outputTokens || 0;
    const model = (data?.model || '').toLowerCase();

    // Load pricing from Settings (cached after first call)
    if (!this._pricingCache) {
      this.sendMessage('settings', SETTINGS_MESSAGES.GET_PRICING)
        .then((res: any) => { this._pricingCache = res?.pricing || {}; })
        .catch(() => { this._pricingCache = {}; });
    }

    // Resolve rate: find first pricing key that matches the model name
    const pricing = this._pricingCache || {};
    const matchedKey = Object.keys(pricing).find(k => k !== 'default' && model.includes(k));
    const rate = pricing[matchedKey || ''] || pricing['default'] || { input: 0.30, output: 2.50 };

    const cost = (input * rate.input + output * rate.output) / 1_000_000;

    // Update per-model breakdown
    const prevModel = this.tokenUsage.byModel[model] || { inputTokens: 0, outputTokens: 0, cost: 0, requests: 0 };
    const byModel = {
      ...this.tokenUsage.byModel,
      [model]: {
        inputTokens: prevModel.inputTokens + input,
        outputTokens: prevModel.outputTokens + output,
        cost: prevModel.cost + cost,
        requests: prevModel.requests + 1,
      },
    };

    this.tokenUsage = {
      inputTokens: this.tokenUsage.inputTokens + input,
      outputTokens: this.tokenUsage.outputTokens + output,
      totalTokens: this.tokenUsage.totalTokens + input + output,
      estimatedCost: this.tokenUsage.estimatedCost + cost,
      requests: this.tokenUsage.requests + 1,
      byModel,
    };

    // Stamp cost onto the last agent message in history
    if (input > 0 || output > 0) {
      const historyCopy = [...this.history];
      for (let i = historyCopy.length - 1; i >= 0; i--) {
        const msg = historyCopy[i];
        if (msg.role && msg.role !== 'user' && !msg.isDelegation) {
          (msg as any).tokenCost = { inputTokens: input, outputTokens: output, cost, model };
          this.history = historyCopy;
          break;
        }
      }
    }

    // Persist to monthly usage tracking (fire-and-forget)
    this.sendMessage('settings', SETTINGS_MESSAGES.TRACK_USAGE, {
      inputTokens: input, outputTokens: output, cost, model,
    }).then((res: any) => {
      this.logTagged('#config', 'TRACK_USAGE result:', res);
    }).catch((err: any) => {
      this.logTagged('#config', 'TRACK_USAGE error:', err?.message || err);
    });
  }



  private handleRefreshAgents(data: any): void {
    if (data?.agents) {
      this.availableAgents = data.agents.map((r: any) => ({
        name: r.name,
        icon: r.icon,
        model: r.model,
        capabilities: r.capabilities,
        context: r.context
      }));
      this.logTagged('#config', 'Agents refreshed:', this.availableAgents.length);
    }
  }

  private handleLoadSessionResponse(data: any): void {
    if (!data?.session?.messages) { return; }

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
      ...(m.tokenCost ? { tokenCost: m.tokenCost } : {}),
    }));
    this.logTagged('#session', `Session restored: ${data.session.id} (${this.history.length} messages)`);

    // Restore task metadata
    if (data.session.taskTitle) {
      this.activeWorkflow = data.session.taskTitle;
    }
    if (data.session.elapsedSeconds) {
      this.elapsedSeconds = data.session.elapsedSeconds;
    }

    // Restore token usage totals
    if (data.session.tokenUsage) {
      this.tokenUsage = {
        inputTokens: data.session.tokenUsage.inputTokens || 0,
        outputTokens: data.session.tokenUsage.outputTokens || 0,
        totalTokens: data.session.tokenUsage.totalTokens || 0,
        estimatedCost: data.session.tokenUsage.estimatedCost || 0,
        requests: data.session.tokenUsage.requests || 0,
        byModel: data.session.tokenUsage.byModel || {},
      };
    } else {
      // Backward compat: reconstruct from per-message tokenCost
      let totalIn = 0, totalOut = 0, totalCost = 0, totalReqs = 0;
      const byModel: Record<string, { inputTokens: number; outputTokens: number; cost: number; requests: number }> = {};
      for (const m of this.history) {
        const tc = (m as any).tokenCost;
        if (!tc) { continue; }
        totalIn += tc.inputTokens || 0;
        totalOut += tc.outputTokens || 0;
        totalCost += tc.cost || 0;
        totalReqs++;
        const model = tc.model || 'unknown';
        if (!byModel[model]) { byModel[model] = { inputTokens: 0, outputTokens: 0, cost: 0, requests: 0 }; }
        byModel[model].inputTokens += tc.inputTokens || 0;
        byModel[model].outputTokens += tc.outputTokens || 0;
        byModel[model].cost += tc.cost || 0;
        byModel[model].requests++;
      }
      if (totalReqs > 0) {
        this.tokenUsage = {
          inputTokens: totalIn, outputTokens: totalOut,
          totalTokens: totalIn + totalOut,
          estimatedCost: totalCost, requests: totalReqs, byModel,
        };
      }
    }

    // Restore lifecycle phases
    if (data.session.taskSteps && data.session.taskSteps.length > 0) {
      this.taskSteps = data.session.taskSteps;
    } else {
      this.loadLifecyclePhases();
    }
  }

  private handleListSessionsResponse(data: any): void {
    if (data?.sessions) {
      this.sessionList = data.sessions;
      this.logTagged('#session', `Session list loaded: ${data.sessions.length} sessions`);
      this.dispatchEvent(new CustomEvent('sessions-updated', {
        bubbles: true, composed: true,
        detail: { sessions: data.sessions }
      }));
    }
  }

  private handleGateRequest(data: any): void {
    this.isLoading = false;
    this.history = [...this.history, {
      sender: '🚦 Gate',
      text: data?.question || data?.label || `Gate approval required: **${data?.stepId || 'unknown'}**`,
      role: 'gate',
      isGate: true,
      gateId: data?.gateId || data?.stepId || 'unknown',
    }];
  }

  private handleWorkflowStateUpdate(data: any): void {
    const statusText = data?.status || 'unknown';

    // Reset loading state on terminal workflow statuses
    if (statusText === 'completed' || statusText === 'failed') {
      this.isLoading = false;
    }

    // Update taskSteps from engine state if available
    const isInitWorkflow = data?.currentWorkflowId === 'workflow.init';

    // Lifecycle workflows: update from phases (Brief, Implementation, Closure)
    if (data?.phases && Array.isArray(data.phases) && data.phases.length > 0) {
      this.taskSteps = data.phases.map((p: any) => {
        const rawId = p.id || p.label || '';
        const lastSegment = rawId.split('.').pop() || rawId;
        const cleanLabel = lastSegment
          .replace(/^\d{2}-/, '')
          .replace(/^phase-\d+-/, '')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase());
        return {
          id: rawId,
          label: cleanLabel || rawId,
          status: p.status === 'completed' ? STEP_STATUS.DONE
            : p.status === 'active' || p.status === 'executing' ? STEP_STATUS.ACTIVE
              : p.status === 'failed' ? STEP_STATUS.DONE
                : STEP_STATUS.PENDING,
        };
      });
    } else if (data?.steps && Array.isArray(data.steps) && !isInitWorkflow) {
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

      // Merge workflow constitutions + agent context (deduplicated)
      const workflowCtx: string[] = data?.workflow?.constitutions || [];
      const agentCtx: string[] = activeAgent?.context || [];
      const mergedContext = [...workflowCtx];
      for (const c of agentCtx) {
        if (!mergedContext.includes(c)) {
          mergedContext.push(c);
        }
      }

      this.workflowDetails = {
        workflowId: data?.currentWorkflowId || data?.workflow?.description || '',
        version: data?.workflow?.version,
        type: data?.workflow?.type,
        owner: data?.workflow?.owner,
        model: activeAgent?.model?.id ? (this.models.find(m => m.id === activeAgent.model!.id)?.name || activeAgent.model.id) : undefined,
        contextFiles: mergedContext,
        gateRequirements: data?.workflow?.gate?.requirements || [],
        nextStep: nextStepObj?.label,
        nextStepIndex: nextStepIdx >= 0 ? nextStepIdx + 1 : undefined,
        pass: data?.workflow?.pass || undefined,
        fail: data?.workflow?.fail || undefined,
        inputs: data?.parsedSections?.inputs || data?.workflow?.sections?.inputs || [],
        outputs: data?.parsedSections?.outputs || data?.workflow?.sections?.outputs || [],
        objective: data?.parsedSections?.objective || data?.workflow?.sections?.objective || '',
        instructions: data?.parsedSections?.instructions || data?.workflow?.sections?.instructions || '',
        currentPhaseLabel: data?.phases?.find((p: any) => p.status === 'active')?.id || '',
      };
    }
  }

  private handleNewSessionAuto(): void {
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

    this.sendMessage(NAME, MESSAGES.NEW_SESSION).then((result: any) => {
      if (result?.sessionId) {
        this.currentSessionId = result.sessionId;
        this.logTagged('#session', `Auto-session ID assigned: ${result.sessionId}`);
      }
    }).catch(() => { /* silent */ });
    this.showTimeline = true;
    this.showDetails = false;
    this.isLoading = true;
  }

  private handlePhaseAutoStart(data: any): void {
    const phaseId = data?.phaseId || '';
    const owner = data?.owner || 'architect';
    const createdArtifacts: string[] = data?.createdArtifacts || [];
    this.logTagged('#lifecycle', `Phase auto-start received: ${phaseId} (owner: ${owner}, artifacts: ${createdArtifacts.length})`);

    if (owner && this.availableAgents.some(a => a.name === owner)) {
      this.selectedAgent = owner;
    }

    let kickoffMsg = `Phase ${phaseId} has started. Begin executing the workflow instructions for this phase.`;
    if (createdArtifacts.length > 0) {
      kickoffMsg += `\n\nThe following artifacts were already created automatically by pass actions and do NOT require review or re-creation: ${createdArtifacts.join(', ')}. Proceed directly with the phase instructions.`;
    }

    this.sendSilentMessage(kickoffMsg);
  }

  private handleGateContinue(data: any): void {
    const answerText = data?.gateAnswerText || 'Gate approved.';
    this.logTagged('#gate', `Gate continue received, sending answer to LLM: ${answerText.substring(0, 60)}...`);
    this.sendSilentMessage(answerText);
  }

  public handleInput(e: InputEvent) {
    this.inputText = (e.target as HTMLInputElement).value;
  }

  public async handleAttachFile() {
    const payload = await this.sendMessage(NAME, 'SELECT_FILES');
    if (payload?.files && Array.isArray(payload.files)) {
      const newFiles = payload.files.filter((f: string) => !this.attachments.includes(f));
      this.attachments = [...this.attachments, ...newFiles];
    }
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
    this.logTagged('#config', `Agent switched to: ${role}`);
  }

  public async handleGateResponse(gateId: string, decision: 'approve' | 'reject') {
    // Update the gate card in history to show the decision
    const historyCopy = [...this.history];
    const gateMsg = historyCopy.find(m => m.isGate && m.gateId === gateId && !m.gateDecision);
    if (gateMsg) {
      gateMsg.gateDecision = decision;
      this.history = historyCopy;
    }

    // Send structured user action to background and process the return
    const command = decision === 'approve' ? USER_ACTIONS.ACCEPTED : USER_ACTIONS.DENIED;
    try {
      const payload = await this.sendMessage(NAME, command, {
        target: this.selectedAgent,
        type: gateId,
        response: '',
      });
      this.processPayload(payload);
    } catch (err) {
      this.logTagged('#gate', 'Error sending gate response', err);
    }
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
    const allBlocks: A2UIBlock[] = segments.filter((s: any) => s.type === 'a2ui' && s.block).map((s: any) => s.block!);
    // Filter out artifact blocks and display blocks — they don't need answers
    const blocks = allBlocks.filter((b: A2UIBlock) => b.type !== 'artifact' && !isDisplayBlock(b.type));

    // Store answer
    if (!msg.a2uiAnswers) { msg.a2uiAnswers = {}; }
    msg.a2uiAnswers[blockId] = option;

    // Check if all interactive blocks are resolved
    const allResolved = blocks.every((b: A2UIBlock) => msg.a2uiAnswers[b.id] !== undefined);

    // Detect if any block is an explicit gate type.
    // ONLY type="gate" triggers engine phase transitions.
    // SI/NO choices (type="choice") are inline approvals — they do NOT advance the workflow.
    const isGateBlock = (b: A2UIBlock) => {
      return b.type === 'gate';
    };
    const gateBlock = blocks.find(isGateBlock);
    const hasGateBlock = !!gateBlock;

    if (allResolved) {
      if (hasGateBlock) {
        // Gate A2UI: send ACCEPTED/DENIED to background
        const gateAnswer = msg.a2uiAnswers[gateBlock!.id];
        const decision = /^si$/i.test(gateAnswer) ? 'SI' : 'NO';

        // Build the answer text from all A2UI blocks
        const parts: string[] = [];
        for (const b of blocks) {
          const ans = msg.a2uiAnswers[b.id];
          if (ans) { parts.push(`${b.label || b.id}: ${ans}`); }
        }
        const gateAnswerText = parts.join('\n');

        const command = decision === 'SI' ? USER_ACTIONS.ACCEPTED : USER_ACTIONS.DENIED;
        this.logTagged('#gate', `Gate A2UI confirmed: decision=${decision}`);
        // Await response and process payload (contains phaseAutoStart for workflow transitions)
        this.sendMessage(NAME, command, {
          target: this.selectedAgent,
          type: gateBlock!.id,
          response: gateAnswerText,
        }).then((payload: any) => {
          if (payload) { this.processPayload(payload); }
        }).catch((err: any) => {
          this.logTagged('#gate', `Error processing gate response: ${err}`);
        });
      } else {
        // Regular A2UI: combine all answers into a single message
        const parts: string[] = [];
        for (const b of blocks) {
          const ans = msg.a2uiAnswers[b.id];
          if (ans) { parts.push(`${b.label || b.id}: ${ans}`); }
        }
        this.sendSilentMessage(parts.join('\n'));
      }
    }



    // Detect task title — update header when user provides the task name
    if (/task.?title/i.test(blockId) && option.trim()) {
      this.activeWorkflow = option.trim();
      this.logTagged('#workflow', `Task title updated: "${this.activeWorkflow}"`);
    }

    // Trigger re-render
    const historyCopy = [...this.history];
    historyCopy[msgIndex] = { ...historyCopy[msgIndex], a2uiAnswers: { ...msg.a2uiAnswers } };
    this.history = historyCopy;
  }

  /**
   * Request lifecycle phases from filesystem and populate timeline.
   */
  private async loadLifecyclePhases(): Promise<void> {
    try {
      const result = await this.sendMessage(NAME, MESSAGES.LIFECYCLE_PHASES_REQUEST, { strategy: 'tasklifecycle' });
      const phases: Array<{ id: string; label: string }> = result?.phases || [];
      if (phases.length > 0) {
        this.taskSteps = phases.map((p, i) => ({
          id: p.id,
          label: p.label,
          status: i === 0 ? (STEP_STATUS.ACTIVE as 'active') : (STEP_STATUS.PENDING as 'pending')
        }));
        this.logTagged('#lifecycle', `Timeline loaded: ${phases.length} phases`);
      }
    } catch (err: any) {
      this.logTagged('#lifecycle', `Failed to load lifecycle phases: ${err.message}`);
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

  /**
   * Build conversation history for the LLM, injecting A2UI answers as synthetic user turns.
   * This ensures the LLM sees user responses to A2UI choices/gates.
   */
  private buildLLMHistory(): Array<{ role: string; text: string }> {
    const result: Array<{ role: string; text: string }> = [];
    for (const m of this.history.slice(-20)) {
      // Skip empty, skeleton, or still-streaming messages
      if (m.isStreaming || (m as any).showSkeleton) { continue; }
      if (!m.text && !m.isDelegation) { continue; }

      // Skip system messages (they're injected elsewhere)
      if (m.role === 'system') { continue; }

      // Include delegation results as assistant context
      if (m.isDelegation || m.role === 'delegation') {
        const delegationSummary = m.delegationResult
          ? `[Delegation to ${m.delegationAgent}] Task: ${m.text}\nResult: ${m.delegationResult}`
          : `[Delegation to ${m.delegationAgent}] Task: ${m.text} (in progress)`;
        result.push({ role: 'assistant', text: delegationSummary });
        continue;
      }

      // Clean a2ui tags from agent responses — send only the text content
      let cleanText = m.text;
      if (m.role !== 'user') {
        cleanText = cleanText.replace(/<a2ui[^>]*>[\s\S]*?<\/a2ui>/gi, '').trim();
      }
      if (!cleanText) { continue; }

      result.push({ role: m.role || 'user', text: cleanText });

      // Inject A2UI answers as synthetic user turns
      if (m.a2uiAnswers && Object.keys(m.a2uiAnswers).length > 0) {
        const answers = Object.entries(m.a2uiAnswers)
          .map(([key, val]) => `${key}: ${val}`)
          .join('\n');
        result.push({ role: 'user', text: answers });
      }
    }
    return result;
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
      const payload = await this.sendMessage(NAME, USER_ACTIONS.SEND, {
        text,
        agentRole: this.selectedAgent,
        workflow: this.activeWorkflow,
        attachments: this.attachments,
        history: this.buildLLMHistory()
      }, 120_000);

      this.isLoading = false;
      this.activeActivity = '';
      this.pauseTimer();
      this.attachments = [];

      this.processPayload(payload);
    } catch (error: any) {
      this.isLoading = false;
      this.activeActivity = '';
      this.pauseTimer();
      const errorMsg = error?.message || 'Unknown error';
      this.logTagged('#msg', 'Error sending message', error);
      this.history = [...this.history, {
        sender: '⚠️ System',
        text: `**Error:** ${errorMsg}\n\nThe request could not be completed. Please try again.`,
        role: 'system',
        isError: true,
        phase: this.currentPhase
      }];
    }
  }

  /**
   * Process a ChatMessagePayload returned from the Background.
   * Handles all side-effects: history, delegations, usage, workflow state, gates, etc.
   */
  private processPayload(payload: any): void {
    if (!payload) { return; }

    // New session signal
    if (payload.newSession) {
      this.handleNewSessionAuto();
    }

    // Main message — check for string type (not truthiness) because text="" with A2UI blocks is valid
    if (typeof payload.text === 'string' || (payload.a2ui && payload.a2ui.length > 0)) {
      // Serialize resolved A2UI blocks from intents into markup.
      // The LLM now provides id, label, and options via enriched intents.
      let displayText = payload.text;
      if (payload.a2ui && payload.a2ui.length > 0) {
        const a2uiMarkup = payload.a2ui.map((block: any) => {
          const attrs = [`type="${block.type}"`, `id="${block.id}"`];
          if (block.label) { attrs.push(`label="${block.label}"`); }
          if (block.path) { attrs.push(`path="${block.path}"`); }
          let body = '';
          if (block.options && block.options.length > 0) {
            body = block.options.map((opt: string, i: number) =>
              `- [${i === block.preselected ? 'x' : ' '}] ${opt}`
            ).join('\n');
          } else if (block.content) {
            body = block.content;
          }
          return `<a2ui ${attrs.join(' ')}>\n${body}\n</a2ui>`;
        }).join('\n\n');
        displayText = `${displayText}\n\n${a2uiMarkup}`;
      }

      this.history = [...this.history, {
        sender: payload.agentRole ? payload.agentRole.charAt(0).toUpperCase() + payload.agentRole.slice(1) : 'Agent',
        text: displayText,
        role: payload.agentRole,
        isStreaming: false,
        phase: this.currentPhase,
        ...(payload.toolEvents && payload.toolEvents.length > 0 ? { toolEvents: payload.toolEvents } : {}),
      }];
    }

    // Delegations
    if (payload.delegations) {
      for (const d of payload.delegations) {
        this.handleDelegationEvent(d);
      }
    }

    // Usage
    if (payload.usage) {
      this.handleUsageUpdate(payload.usage);
    }

    // Workflow state update
    if (payload.workflowState) {
      this.handleWorkflowStateUpdate(payload.workflowState);
    }

    // Gate request
    if (payload.gate) {
      this.handleGateRequest(payload.gate);
    }

    // Phase auto-start
    if (payload.phaseAutoStart) {
      this.handlePhaseAutoStart(payload.phaseAutoStart);
    }

    // Gate continue (internal gate, no phase transition)
    if (payload.gateContinue) {
      this.handleGateContinue(payload.gateContinue);
    }

    // Side-effect messages (workflow state updates from intents, etc.)
    if (payload.messages) {
      for (const msg of payload.messages) {
        if (msg.command === 'WORKFLOW_STATE_UPDATE') {
          this.processPayload({ workflowState: msg.data });
        } else {
          this.logTagged('#system', `Unhandled side-effect command: ${msg.command}`);
        }
      }
    }

    this.saveCurrentSession();
  }

  /**
   * Send a message to the agent without showing it in the chat history.
   * Used by A2UI confirmations so the answer appears as a confirmed element,
   * not as a separate user message bubble.
   */
  public sendSilentMessage(text: string) {
    // Enqueue message — prevents concurrent LLM calls from merging into the same skeleton bubble
    this.silentMessageQueue.push(text);
    this.logTagged('#msg', `Silent message enqueued (queue depth: ${this.silentMessageQueue.length})`);
    if (!this.silentMessageProcessing) {
      void this.drainSilentMessageQueue();
    }
  }

  private async drainSilentMessageQueue(): Promise<void> {
    this.silentMessageProcessing = true;
    while (this.silentMessageQueue.length > 0) {
      const text = this.silentMessageQueue.shift()!;
      this.logTagged('#msg', `Silent message dequeued — sending (remaining: ${this.silentMessageQueue.length})`);
      await this.executeSilentMessage(text);
    }
    this.silentMessageProcessing = false;
  }

  private async executeSilentMessage(text: string): Promise<void> {
    this.activeActivity = 'Thinking...';
    this.startTimer();

    try {
      this.isLoading = true;
      const payload = await this.sendMessage(NAME, USER_ACTIONS.SEND, {
        text,
        agentRole: this.selectedAgent,
        workflow: this.activeWorkflow,
        attachments: [],
        history: this.buildLLMHistory()
      }, 120_000);

      this.isLoading = false;
      this.activeActivity = '';
      this.pauseTimer();

      this.processPayload(payload);
    } catch (error: any) {
      this.isLoading = false;
      this.activeActivity = '';
      const errorMsg = error?.message || 'Unknown error';
      this.logTagged('#msg', 'Error sending silent message', error);
      this.history = [...this.history, {
        sender: '⚠️ System',
        text: `**Error:** ${errorMsg}\n\nThe request could not be completed. Please try again.`,
        role: 'system',
        isError: true,
        phase: this.currentPhase
      }];
    }
  }

  /**
   * Save current session to persistent storage.
   */
  public async saveCurrentSession(): Promise<void> {
    // Don't create orphan sessions: wait until currentSessionId is established
    if (!this.currentSessionId) { return; }
    const messages = this.history.map(m => ({
      sender: m.sender,
      text: m.text,
      role: m.role,
      ...(m.a2uiAnswers ? { a2uiAnswers: m.a2uiAnswers } : {}),
      ...(m.a2uiDismissed ? { a2uiDismissed: true } : {}),
      ...((m as any).tokenCost ? { tokenCost: (m as any).tokenCost } : {}),
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

        tokenUsage: this.tokenUsage,
        taskSteps: this.taskSteps,
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
    this.showWelcome = false;

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
  public async requestSessions() {
    try {
      const result = await this.sendMessage(NAME, MESSAGES.LIST_SESSIONS);
      if (result?.sessions) {
        this.handleListSessionsResponse({ sessions: result.sessions });
      }
    } catch { /* silent */ }
  }

  /**
   * Load a specific session by id.
   */
  public async loadSession(sessionId: string) {
    this.showWelcome = false;
    try {
      const result = await this.sendMessage(NAME, MESSAGES.LOAD_SESSION, { sessionId });
      if (result?.success && result.session) {
        this.handleLoadSessionResponse({ session: result.session });
        // Workflow state will arrive via push event (emitWorkflowState)
      }
    } catch { /* silent */ }
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

      // Filter out artifact blocks and display-only blocks — they are informational, not interactive
      const interactiveBlocks = blocks.filter((b: A2UIBlock) => b.type !== 'artifact' && !isDisplayBlock(b.type));
      if (interactiveBlocks.length === 0) { break; }

      const answers: Record<string, string> = msg.a2uiAnswers || {};
      const unresolved = interactiveBlocks.find((b: A2UIBlock) => answers[b.id] === undefined);
      if (!unresolved) { break; }

      // 1. Artifacts from A2UI blocks with explicit `path` attributes
      const blocksWithPaths = blocks.filter((b: A2UIBlock) => !!b.path);
      let artifacts = blocksWithPaths.map(b => ({
        path: b.path || '',
        label: b.label || b.path?.split('/').pop() || 'Document'
      }));

      // 2. Auto-detect artifact paths from message text when gate has no explicit paths
      const hasGate = interactiveBlocks.some(b => b.type === 'gate');
      if (hasGate && artifacts.length === 0) {
        const msgText = msg.text || '';
        // Pattern: .agent/artifacts/<path>.md
        const pathMatches = msgText.match(/\.agent\/artifacts\/[^\s`\)]+\.md/g) || [];
        // Pattern: `filename.md` for known artifact names
        const knownArtifacts = ['init.md', 'acceptance.md', 'analysis.md', 'planning.md', 'verification.md', 'results.md', 'research.md', 'qa-report.md', 'performance-report.md'];
        const fileMatches = (msgText.match(/`([^`]+\.md)`/g) || [])
          .map((m: string) => m.replace(/`/g, ''))
          .filter((f: string) => knownArtifacts.some(k => f.endsWith(k)));

        // Deduplicate and build artifact references
        const seenPaths = new Set<string>();
        for (const p of [...pathMatches, ...fileMatches]) {
          if (!seenPaths.has(p)) {
            seenPaths.add(p);
            artifacts.push({
              path: p,
              label: p.split('/').pop() || 'Document'
            });
          }
        }
      }

      newPending = {
        type: unresolved.type,
        blockId: unresolved.id,
        label: unresolved.label || unresolved.id,
        artifactContent: unresolved.artifactContent,
        options: unresolved.options,
        msgIndex: i,
        blockIndex: interactiveBlocks.indexOf(unresolved),
        artifacts,
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
