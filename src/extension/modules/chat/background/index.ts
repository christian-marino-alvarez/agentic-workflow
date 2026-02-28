
import * as vscode from 'vscode';
import * as path from 'path';
import { Background, Message, ViewHtml, MessageOrigin, Logger } from '../../core/index.js';
import { NAME, MESSAGES, USER_ACTIONS, SERVER_EVENTS, SESSION_ACTIONS, WORKFLOW_ACTIONS, LANGUAGE_MAP, type ResolvedA2UIBlock, type ChatMessagePayload, type IntentResolution, type ProcessedResponse } from '../constants.js';
import { API_ENDPOINTS, SIDECAR_BASE_URL } from '../../llm/constants.js';
import { MESSAGES as SETTINGS_MESSAGES } from '../../settings/constants.js';
import { MESSAGES as RUNTIME_MESSAGES } from '../../runtime/constants.js';
import { PromptPipeline } from '../prompts/prompt-pipeline.js';
import { behavioralPreamble, FORMAT_CORRECTION_PROMPT } from '../prompts/index.js';
import { tryParseStructuredResponse, IntentType, IntentAction, IntentComponent, type AgentStructuredResponse, type Intent } from '../../llm/backend/tools/response-schema.js';
import { defineResponseSchema } from '../prompts/response-format.js';
import { SSEParserTransform, type SSEEvent } from './transforms/sse-parser.js';
import { createErrorHandler, createToolEventAccumulator, createUsageAccumulator, createTextAccumulator, type ToolEventData, type DelegationData, type UsageData } from './transforms/event-emitters.js';
import { randomUUID } from 'crypto';

/** Variables resolved from candidate/task.md for workflow template population. */
interface WorkflowVars {
  TS: string;
  TASK: string;
  taskId: string;
  taskTitle: string;
  taskObjective: string;
  titleShort: string;
  language: string;
  'ISO-8601': string;
  criteria: string[];
  [key: string]: string | string[]; // allow dynamic access
}

export class ChatBackground extends Background {


  private static readonly SESSIONS_KEY = 'chat.sessions';
  private static readonly LAST_SESSION_KEY = 'chat.lastSessionId';
  private static readonly LANGUAGE_KEY = 'chat.conversationLanguage';
  private vscodeContext: vscode.ExtensionContext;
  private conversationLanguage: string | null = null;

  // ─── Settings Cache ─────────────────────────────────────────────────────
  private cachedModels: any[] | null = null;
  private cachedRoles: any[] | null = null;
  private cachedBindings: Record<string, string> | null = null;


  constructor(context: vscode.ExtensionContext) {
    super(NAME, context.extensionUri, `${NAME}-view`);
    this.vscodeContext = context;
    // Restore persisted language preference
    this.conversationLanguage = context.workspaceState.get<string>(ChatBackground.LANGUAGE_KEY) || null;
    if (this.conversationLanguage) {
      this.logTagged('#system', `Language restored from state: ${this.conversationLanguage}`);
    }
    try {
      const ext = vscode.extensions.getExtension('christian-marino-alvarez.agentic-workflow');
      this.appVersion = ext?.packageJSON?.version || '0.0.0-error';
    } catch (e) {
      this.appVersion = '0.0.0-ex';
    }
    this.logTagged('#system', 'Initialized v' + this.appVersion);
  }



  /** Parse delegateTask tool call arguments safely. */
  private parseDelegationArgs(argsStr?: string): { agent?: string, task?: string } | undefined {
    if (!argsStr) { return undefined; }
    try {
      return JSON.parse(argsStr);
    } catch {
      return undefined;
    }
  }

  public override async listen(message: Message): Promise<any> {
    if (message.origin === MessageOrigin.View) {
      return this.listenView(message);
    } else {
      return this.listenBackground(message);
    }
  }

  private async listenView(message: Message): Promise<any> {
    const command = message.payload.command;
    const data = message.payload.data;

    if (this.isUserAction(command)) {
      return this.handleUserAction(command as any, data);
    }

    if (this.isSessionState(command)) {
      return this.handleSessionState(command as any, data);
    }

    if (this.isWorkflowState(command)) {
      return this.handleWorkflowState(command as any, data);
    }

    // Pass unhandled view messages to the super layer
    return super.listen(message);
  }

  // ─── Message Grouping Helpers ─────────────────────────────────────────────

  private isUserAction(command: string): boolean {
    return (Object.values(USER_ACTIONS) as string[]).includes(command);
  }

  private isSessionState(command: string): boolean {
    return (Object.values(SESSION_ACTIONS) as string[]).includes(command);
  }

  private isWorkflowState(command: string): boolean {
    return (Object.values(WORKFLOW_ACTIONS) as string[]).includes(command);
  }

  // ─── Message Group Handlers ───────────────────────────────────────────────

  private async handleUserAction(command: string, data: any): Promise<ChatMessagePayload> {
    switch (command) {
      case USER_ACTIONS.SEND:
        return this.handleSendMessage(data);
      case USER_ACTIONS.SELECTED:
        return this.handleSelection(data);
      case USER_ACTIONS.ACCEPTED:
        return this.handleAcceptance(data);
      case USER_ACTIONS.DENIED:
        return this.handleDenial(data);
      case USER_ACTIONS.SELECT_FILES:
        return this.handleSelectFiles();
      case USER_ACTIONS.OPEN_FOLDER:
        return this.handleOpenFolder();
      case USER_ACTIONS.OPEN_FILE:
        return this.handleOpenFile(data);
      default:
        throw new Error(`Unhandled User Action: ${command}`);
    }
  }

  // ─── New User Action Handlers ─────────────────────────────────────────────

  private setLanguage(response: string): void {
    const langCode = LANGUAGE_MAP[response.toLowerCase()];
    if (langCode) {
      this.conversationLanguage = langCode;
      this.vscodeContext.workspaceState.update(ChatBackground.LANGUAGE_KEY, langCode);
      this.logTagged('#config', `Language set: ${langCode}`);
    }
  }

  private async handleSelection(data: any): Promise<ChatMessagePayload> {
    this.logTagged('#msg', `Selection received: type=${data.type}, response=${data.response}`);

    if (data.type === 'language') {
      this.setLanguage(data.response);
    }

    // Forward to LLM as a regular message with the selection context
    return this.handleSendMessage({
      text: `${data.type}: ${data.response}`,
      agentRole: data.target,
      history: data.history,
      attachments: [],
    });
  }

  private async handleAcceptance(data: any): Promise<ChatMessagePayload> {
    this.logTagged('#gate', `Gate accepted: type=${data.type}, target=${data.target}`);
    return this.handleGateResponse({
      gateId: data.type,
      decision: 'SI',
      gateAnswerText: data.response || '',
    });
  }

  private async handleDenial(data: any): Promise<ChatMessagePayload> {
    this.logTagged('#gate', `Gate denied: type=${data.type}, target=${data.target}, reason=${data.response}`);
    return this.handleGateResponse({
      gateId: data.type,
      decision: 'NO',
      gateAnswerText: data.response || '',
    });
  }

  private async handleSessionState(command: string, data: any): Promise<any> {
    switch (command) {
      case SESSION_ACTIONS.SAVE:
        return this.handleSaveSession(data);
      case SESSION_ACTIONS.LOAD:
        return this.handleLoadSession(data);
      case SESSION_ACTIONS.LIST:
        return this.handleListSessions();
      case SESSION_ACTIONS.DELETE:
        return this.handleDeleteSession(data);
      case SESSION_ACTIONS.NEW:
        return this.handleNewSession();
      default:
        throw new Error(`Unhandled Session State action: ${command}`);
    }
  }

  private async handleWorkflowState(command: string, data: any): Promise<any> {
    switch (command) {
      case WORKFLOW_ACTIONS.LOAD_INIT:
        return this.handleLoadInit();
      case WORKFLOW_ACTIONS.STATE_UPDATE:
        return this.getWorkflowState();
      case WORKFLOW_ACTIONS.LIFECYCLE_PHASES_REQUEST:
        return this.handleLifecyclePhasesRequest(data);
      default:
        throw new Error(`Unhandled Workflow State action: ${command}`);
    }
  }

  private async listenBackground(message: Message): Promise<any> {
    switch (message.payload.command) {
      case 'ROLES_CHANGED':
        return this.handleRolesChanged();
      default:
        return super.listen(message);
    }
  }

  // ─── Settings Cache Methods ──────────────────────────────────────────────

  private async loadSettings(): Promise<void> {
    const [settingsResponse, rolesResponse, bindingsResponse] = await Promise.all([
      this.sendMessage('settings', SETTINGS_MESSAGES.GET_REQUEST),
      this.sendMessage('settings', SETTINGS_MESSAGES.GET_ROLES),
      this.sendMessage('settings', SETTINGS_MESSAGES.GET_BINDING),
    ]);

    this.cachedModels = settingsResponse?.success ? settingsResponse.models : [];
    this.cachedRoles = rolesResponse?.success ? rolesResponse.roles : [];
    this.cachedBindings = bindingsResponse?.success ? (bindingsResponse.bindings || {}) : {};
    this.logTagged('#config', 'Settings cache loaded');
  }

  private async getSettings(): Promise<{ models: any[]; roles: any[]; bindings: Record<string, string> }> {
    if (!this.cachedModels || !this.cachedRoles || !this.cachedBindings) {
      await this.loadSettings();
    }
    return {
      models: this.cachedModels!,
      roles: this.cachedRoles!,
      bindings: this.cachedBindings!,
    };
  }

  private invalidateSettingsCache(): void {
    this.cachedModels = null;
    this.cachedRoles = null;
    this.cachedBindings = null;
    this.logTagged('#config', 'Settings cache invalidated');
  }

  // ─── Model Resolution ───────────────────────────────────────────────────

  private async resolveModelConfig(role: string, text: string, overrideModelId?: string): Promise<{ modelName: string; apiKey: string | null; provider: string; roleConfig: any }> {
    const { models, roles, bindings } = await this.getSettings();

    // Defaults from Settings (first active model or first in list)
    const defaultModel = models.find((m: any) => Boolean(m.active)) || models[0];
    let modelName = defaultModel?.modelName || defaultModel?.name || '';
    let apiKey = defaultModel?.apiKey || null;
    let provider = defaultModel?.provider || 'gemini';
    let roleConfig: any = null;

    if (models.length > 0) {
      const taskType = await this.resolveTaskType(text);

      // Resolve model via priority: role routing → bindings → legacy → active
      roleConfig = roles.find((r: any) => r.name === role);
      let boundModelId: string | undefined;

      // Priority 1: Task-aware routing via `models: { default, routing }`
      if (roleConfig?.models) {
        const routedModel = taskType === 'routing'
          ? (roleConfig.models.routing || roleConfig.models.default)
          : roleConfig.models.default;
        if (routedModel) {
          boundModelId = routedModel;
          this.logTagged('#config', `Model routing: taskType=${taskType}, resolved=${routedModel}`);
        }
      }

      // Priority 2: VS Code settings bindings
      if (!boundModelId) {
        boundModelId = bindings[role] || overrideModelId;
      }

      // Priority 3: Legacy single model config from role frontmatter
      if (!boundModelId && roleConfig?.model?.id) {
        boundModelId = roleConfig.model.id;
        if (roleConfig.model.provider) {
          provider = roleConfig.model.provider;
        }
      }

      // Lookup by UUID → modelName → display name → active
      const config = boundModelId
        ? models.find((m: any) => m.id === boundModelId)
        || models.find((m: any) => m.modelName === boundModelId)
        || models.find((m: any) => m.name === boundModelId)
        : models.find((m: any) => Boolean(m.active));

      if (config) {
        apiKey = config.apiKey || null;
        provider = config.provider || provider || 'gemini';
        modelName = config.modelName || config.name || defaultModel?.modelName || '';
      } else if (boundModelId) {
        modelName = boundModelId;
        this.logTagged('#config', `No config match for "${boundModelId}", using as direct model name`);
      }

      // Fallback: if no API key, try any model with same provider that has one
      if (!apiKey && provider) {
        const fallback = models.find((m: any) => m.provider === provider && m.apiKey);
        if (fallback) {
          apiKey = fallback.apiKey;
          this.logTagged('#config', `API key resolved via provider fallback (${provider})`);
        }
      }
    }

    this.logTagged('#config', `Resolved model for ${role}: ${modelName} (provider: ${provider})`);
    return { modelName, apiKey, provider, roleConfig };
  }

  // ─── Prompt Data Resolution ─────────────────────────────────────────────

  /** Build a structured workflow snapshot for the agenticContext. */
  private buildWorkflowSnapshot(workflowState: any): any | null {
    if (!workflowState?.workflow) { return null; }
    const wf = workflowState.workflow;
    this.logTagged('#workflow', `Injected workflow context (${workflowState.currentPhaseId || wf.id}) into LLM instructions`);

    // Extract clean phase id: "workflow.init" → "init"
    const rawId = wf.id || workflowState.currentWorkflowId || '';
    const currentPhase = workflowState.currentPhaseId || rawId.replace(/^workflow\./, '');

    return {
      id: rawId,
      status: workflowState.status,
      owner: wf.owner,
      currentPhase,
      taskId: workflowState.taskId || null,
      gate: wf.gate ? { requirements: wf.gate.requirements } : undefined,
      pass: wf.pass ? { nextTarget: wf.pass.nextTarget } : undefined,
      fail: wf.fail ? { behavior: wf.fail.behavior } : undefined,
      sections: workflowState.parsedSections ? {
        objective: workflowState.parsedSections.objective,
        instructions: workflowState.parsedSections.instructions,
        inputs: workflowState.parsedSections.inputs || [],
        outputs: workflowState.parsedSections.outputs || [],
      } : wf.sections ? {
        objective: wf.sections.objective,
        instructions: wf.sections.instructions,
        inputs: wf.sections.inputs || [],
        outputs: wf.sections.outputs || [],
      } : undefined,
      phases: workflowState.phases,
    };
  }

  /** Fetch workflow state from Runtime and build the structured snapshot. */
  private async fetchWorkflowData(): Promise<{ snapshot: any | null; constitutionRefs: string[]; state: any }> {
    const rawState = await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_STATUS).catch(() => null);
    const state = rawState?.result || rawState;
    const snapshot = this.buildWorkflowSnapshot(state);
    const constitutionRefs: string[] = state?.workflow?.constitutions || [];
    return { snapshot, constitutionRefs, state };
  }

  /** Load constitution files from workflow + agent role context definitions. */
  private async loadConstitutions(constitutionRefs: string[], roleConfig: any): Promise<string[]> {
    const workspacePath = this.workspacePath;
    if (!workspacePath) { return []; }

    const contents: string[] = [];
    const fs = await import('fs/promises');
    const baseDir = path.join(workspacePath, '.agent', 'rules', 'constitution');

    // Lazy resolver for <TASK>, <TS>, <title-short> placeholders
    let workflowVars: WorkflowVars | null = null;
    const resolveRef = async (ref: string): Promise<string> => {
      if (!ref.includes('<')) { return ref; }
      if (!workflowVars) {
        workflowVars = await this.resolveWorkflowVariables(workspacePath);
      }
      return this.resolvePathPlaceholders(ref, workflowVars);
    };

    // Build alias map from constitution index
    let aliasMap: Record<string, string> = {};
    try {
      const indexContent = await fs.readFile(path.join(baseDir, 'index.md'), 'utf-8');
      const aliasRegex = /^\s+(\w+):\s+(.+\.md)\s*$/gm;
      let aliasMatch;
      while ((aliasMatch = aliasRegex.exec(indexContent)) !== null) {
        aliasMap[aliasMatch[1]] = aliasMatch[2];
      }
    } catch { /* no index file */ }

    /** Resolve a single constitution reference against multiple candidate paths. */
    const loadRef = async (rawRef: string, source: string): Promise<void> => {
      const ref = await resolveRef(rawRef);

      // Skip if already loaded (deduplication)
      if (contents.some(c => c.includes(`### ${ref}`) || c.includes(`### ${rawRef}`))) {
        this.logTagged('#prompt', `${source} already loaded: ${ref}`);
        return;
      }

      // Case 1: Direct file path
      if (ref.startsWith('.agent/') || ref.startsWith('/')) {
        const directPath = ref.startsWith('/') ? ref : path.join(workspacePath, ref);
        try {
          const content = await fs.readFile(directPath, 'utf-8');
          contents.push(`\n### ${ref}\n${content}`);
          this.logTagged('#prompt', `Loaded ${source}: ${ref} (${content.length} chars)`);
          return;
        } catch { /* file not found */ }
      }

      // Case 2: Alias via index
      const aliasName = ref.replace(/^constitution\./, '');
      if (aliasMap[aliasName]) {
        try {
          const content = await fs.readFile(path.join(workspacePath, aliasMap[aliasName]), 'utf-8');
          contents.push(`\n### ${ref}\n${content}`);
          this.logTagged('#prompt', `Loaded ${source}: ${ref} via index (${content.length} chars)`);
          return;
        } catch { /* not found */ }
      }

      // Case 3: Fallback candidate paths
      const candidates = [
        aliasName.replace(/_/g, '-') + '.md',
        aliasName.replace(/_/g, '.') + '.md',
        aliasName.replace(/_/g, '-') + '/index.md',
        aliasName + '.md',
      ];
      for (const candidate of candidates) {
        try {
          const content = await fs.readFile(path.join(baseDir, candidate), 'utf-8');
          contents.push(`\n### ${ref}\n${content}`);
          this.logTagged('#prompt', `Loaded ${source}: ${ref} → ${candidate} (${content.length} chars)`);
          return;
        } catch { /* try next */ }
      }

      this.logTagged('#prompt', `${source} not resolved: ${ref}`);
    };

    // 1. Workflow-level constitutions
    try {
      for (const ref of constitutionRefs) {
        await loadRef(ref, 'constitution');
      }
    } catch (err: any) {
      this.logTagged('#prompt', `Error loading workflow constitutions: ${err.message}`);
    }

    // 2. Agent-level context (from role frontmatter context: [])
    if (roleConfig?.context && Array.isArray(roleConfig.context)) {
      for (const ref of roleConfig.context) {
        await loadRef(ref, 'agent-context');
      }
    }

    return contents;
  }

  /** Extract user decisions from conversation history for progress tracking. */
  private buildProgressBlock(messages: Array<{ role: string; content: string }>): string {
    const allUserText = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n');

    const decisions: string[] = [];

    if (this.conversationLanguage) {
      decisions.push(`- Language: ${this.conversationLanguage === 'es' ? 'Español' : 'English'} ✓`);
    }
    if (/corta|short|larga|long/i.test(allUserText)) {
      const match = allUserText.match(/(corta|short|larga|long)\s*(\([^)]*\))?/i);
      if (match) { decisions.push(`- Strategy: ${match[0]} ✓`); }
    }
    if (/task.?title|título/i.test(allUserText)) {
      const titleMatch = allUserText.match(/(?:task.?title|título)[^:]*:\s*(.+)/i);
      if (titleMatch) { decisions.push(`- Task title: "${titleMatch[1].trim()}" ✓`); }
    }
    if (/task.?objective|objetivo/i.test(allUserText)) {
      const objMatch = allUserText.match(/(?:task.?objective|objetivo)[^:]*:\s*(.+)/i);
      if (objMatch) { decisions.push(`- Task objective: "${objMatch[1].trim()}" ✓`); }
    }

    if (decisions.length === 0) { return ''; }

    this.logTagged('#prompt', `Injected ${decisions.length} completed decisions into prompt`);
    return `### WORKFLOW PROGRESS (DO NOT repeat these steps)\nThe following decisions are ALREADY confirmed by the user:\n${decisions.join('\n')}\n\nStart from the FIRST incomplete step. If all steps before the Gate are done, present the Gate evaluation immediately.`;
  }

  /** Build multi-turn conversation messages from history + current text. */
  private buildMessages(text: string, history?: Array<{ role: string; text: string }>): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
    const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];
    if (history && history.length > 0) {
      for (const msg of history) {
        const turnRole = msg.role === 'user' ? 'user' as const : 'assistant' as const;
        messages.push({ role: turnRole, content: msg.text });
      }
    }
    messages.push({ role: 'user', content: text });
    return messages;
  }

  // ─── Prompt Composition ─────────────────────────────────────────────────

  /**
   * Build the complete LLM prompt from message data and role config.
   * Returns only LLM-relevant data — no API keys or transport config.
   */
  private async buildPrompt(
    role: string,
    data: {
      text: string;
      history?: Array<{ role: string; text: string }>;
      attachments?: Array<{ _title: string; _path: string }>
    },
    roleConfig: any,
  ): Promise<{ messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>; context: { rolePersona: string; workflow: any; constitutions: string[]; workspacePath: string; role: string; language: string | null } }> {
    const rolePersona = roleConfig?.persona || '';
    const {
      snapshot,
      constitutionRefs
    } = await this.fetchWorkflowData();
    const constitutionContents = await this.loadConstitutions(constitutionRefs, roleConfig);

    // Build conversation messages
    const messages = this.buildMessages(data.text, data.history);

    // Build progress from conversation history
    const progressBlock = this.buildProgressBlock(messages);

    // Compose system prompt via pipeline
    const pipeline = new PromptPipeline()
      .add('preamble', behavioralPreamble(this.workspaceName, this.conversationLanguage))
      .add('instructions', defineResponseSchema())
      .add('persona', rolePersona)
      .addIf(!!this.conversationLanguage, 'language',
        `### PRE-ESTABLISHED STATE\n- Conversation language: **${this.conversationLanguage === 'es' ? 'Español' : 'English'}** (already confirmed by the user — do NOT ask again, skip any workflow step about language selection)`)
      .addIf(constitutionContents.length > 0, 'constitutions',
        `### CONSTITUTIONS\n${constitutionContents.join('\n')}`)
      .addIf(!!progressBlock, 'progress', progressBlock);

    const fullPersona = pipeline.build();

    // Diagnostic logging
    for (const seg of pipeline.debug()) {
      this.logTagged('#prompt', `[PROMPT] ${seg.name}: ${seg.chars} chars`);
    }

    return {
      messages,
      context: {
        rolePersona: fullPersona,
        workflow: snapshot,
        constitutions: constitutionContents,
        workspacePath: this.workspacePath,
        role,
        language: (this.conversationLanguage as 'es' | 'en' | null) || null,
      },
    };
  }

  // ─── Stream Reading ─────────────────────────────────────────────────────

  /** Retryable error patterns (case-insensitive). */
  private static readonly RETRYABLE_ERRORS = [
    'rate limit', '429', '503', 'overloaded', 'timeout', 'ECONNREFUSED', 'ECONNRESET',
  ];

  /**
   * POST payload to the sidecar. Returns the raw Response.
   */
  private async sendRequest(payload: any, signal?: AbortSignal): Promise<Response> {
    const url = `${SIDECAR_BASE_URL}${API_ENDPOINTS.STREAM}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Sidecar HTTP error: ${response.statusText}`);
    }
    if (!response.body) {
      throw new Error('No stream available from sidecar');
    }

    return response;
  }

  /**
   * Read an SSE stream from a sidecar Response via TransformStream pipeline.
   *
   * Pipeline:
   *   response.body → TextDecoder → SSEParser → ErrorHandler → ToolAccumulator → UsageAccumulator → TextAccumulator
   *
   * All data is accumulated and returned — no mid-request push to View.
   */
  private async readResponse(response: Response, role: string, signal?: AbortSignal): Promise<{
    text: string;
    toolEvents: ToolEventData[];
    delegations: DelegationData[];
    usage: UsageData | null;
  }> {
    // Create accumulators
    const toolAccumulator = createToolEventAccumulator(role, this.parseDelegationArgs.bind(this));
    const usageAccumulator = createUsageAccumulator();

    // Compose the pipeline
    const eventStream = response.body!
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new SSEParserTransform())
      .pipeThrough(createErrorHandler(role, this.emitAgentResponse.bind(this)))
      .pipeThrough(toolAccumulator.transform)
      .pipeThrough(usageAccumulator.transform);

    // Sink: accumulate text
    const textAccumulator = createTextAccumulator();
    await eventStream.pipeTo(textAccumulator.writable, { signal });

    return {
      text: textAccumulator.getText(),
      toolEvents: toolAccumulator.getToolEvents(),
      delegations: toolAccumulator.getDelegations(),
      usage: usageAccumulator.getUsage(),
    };
  }

  // ─── Zod Validation ─────────────────────────────────────────────────────

  /** Validate raw LLM response text against the structured JSON schema (Zod). */
  private validateZod(json: string) {
    return tryParseStructuredResponse(json);
  }

  // ─── Response Processing ──────────────────────────────────────────────

  /** Process a validated structured LLM response → resolve intents */
  private processStructuredResponse(structured: AgentStructuredResponse, prompt: any): ProcessedResponse {
    this.logTagged('#llm', `Structured response validated: text=${structured.text.length} chars, intents=${structured.intents?.length || 0}`);

    const result: ProcessedResponse = {
      displayText: structured.text,
      code: structured.code || undefined,
      a2ui: [],
      messages: [],
    };

    if (structured.intents && structured.intents.length > 0) {
      const resolution = this.resolveIntents(structured.intents, prompt);
      result.a2ui = resolution.a2ui;
      result.messages = resolution.messages;
    }

    return result;
  }

  /** Process a failed validation → error A2UI block */
  private processResponseError(streamText: string): ProcessedResponse {
    this.logTagged('#llm', 'All structured response attempts failed — emitting error block');
    return {
      displayText: streamText || '',
      a2ui: [{ type: 'error', id: `error-${Date.now()}`, label: 'Invalid response format — please try again' }],
      messages: [],
    };
  }

  // ─── Intent Resolution ──────────────────────────────────────────────────

  /**
   * Resolve declared intents into a unified IntentResolution.
   * Pure data — no side-effects. The caller emits messages.
   */
  private resolveIntents(intents: Intent[], prompt: any): IntentResolution {
    const resolution: IntentResolution = { a2ui: [], messages: [] };

    for (const intent of intents) {
      const key = `${intent.type}:${intent.action}:${intent.component}`;
      this.logTagged('#intent', `Resolving: ${key}`);

      switch (intent.type) {
        case IntentType.A2UI: {
          const block = this.resolveA2UIIntent(intent, prompt);
          if (block) {
            resolution.a2ui.push(block);
          }
          break;
        }
        case IntentType.WORKFLOW: {
          const messages = this.resolveWorkflowIntent(intent, prompt);
          if (messages.length > 0) {
            resolution.messages.push(...messages);
          }
          break;
        }
        case IntentType.AGENT:
        case IntentType.SESSION: {
          const messages = this.resolveAgentSessionIntent(intent);
          if (messages.length > 0) {
            resolution.messages.push(...messages);
          }
          break;
        }
        default:
          this.logTagged('#intent', `Unknown namespace: ${intent.type}`);
      }
    }

    return resolution;
  }

  /** Resolve A2UI intents → ResolvedA2UIBlock | null */
  private resolveA2UIIntent(intent: Intent, prompt: any): ResolvedA2UIBlock | null {
    if (intent.action === IntentAction.SHOW) {
      switch (intent.component) {
        case IntentComponent.ARTIFACT:
        case IntentComponent.RESULTS: {
          const artifact = this.resolveCurrentArtifact(prompt);
          if (artifact) {
            const type = intent.component === IntentComponent.ARTIFACT ? 'artifact' : 'results' as const;
            return {
              type, id: `${type}-${artifact.id}`,
              label: artifact.label,
              path: artifact.path,
              content: artifact.content,
            };
          }
          return null;
        }
        case IntentComponent.ERROR:
        case IntentComponent.WARNING:
        case IntentComponent.INFO: {
          const type = intent.component.toLowerCase() as 'error' | 'warning' | 'info';
          return { type, id: `${type}-${Date.now()}`, label: type };
        }
        default:
          this.logTagged('#intent', `Unknown SHOW component: ${intent.component}`);
          return null;
      }
    }

    if (intent.action === IntentAction.REQUEST) {
      const id = intent.id || `${intent.component.toLowerCase()}-${Date.now()}`;
      const label = intent.label || intent.component.charAt(0) + intent.component.slice(1).toLowerCase();
      switch (intent.component) {
        case IntentComponent.GATE:
          return { type: 'gate', id, label, options: intent.options || ['SI', 'NO'], preselected: 0 };
        case IntentComponent.CHOICE:
          return { type: 'choice', id, label, options: intent.options || ['SI', 'NO'], preselected: 0 };
        case IntentComponent.CONFIRM:
          return { type: 'confirm', id, label };
        case IntentComponent.INPUT:
          return { type: 'input', id, label };
        case IntentComponent.MULTI_SELECT:
          return { type: 'multi', id, label, options: intent.options || [] };
        default:
          this.logTagged('#intent', `Unknown REQUEST component: ${intent.component}`);
          return null;
      }
    }

    return null;
  }

  /** Resolve WORKFLOW intents → declarative messages (no side-effects) */
  private resolveWorkflowIntent(intent: Intent, prompt: any): Array<{ command: string; data: any }> {
    const messages: Array<{ command: string; data: any }> = [];

    if (intent.action === IntentAction.UPDATE && intent.component === IntentComponent.STATE) {
      const workflow = prompt.context?.workflow;
      if (workflow) {
        messages.push({
          command: MESSAGES.WORKFLOW_STATE_UPDATE,
          data: {
            current_phase: workflow.currentPhase || workflow.id,
            progress: workflow.progress || 0,
            requires_approval: true,
          },
        });
      }
    } else if (intent.action === IntentAction.COMPLETE && intent.component === IntentComponent.PHASE) {
      this.logTagged('#lifecycle', 'Phase completion requested');
    } else if (intent.action === IntentAction.START && intent.component === IntentComponent.PHASE) {
      this.logTagged('#lifecycle', 'Phase start requested');
    }

    return messages;
  }

  /** Resolve AGENT / SESSION intents — currently deferred */
  private resolveAgentSessionIntent(intent: Intent): Array<{ command: string; data: any }> {
    this.logTagged('#intent', `${intent.type} intents handled externally`);
    return [];
  }

  /**
   * Resolve the current artifact from the workflow context.
   * Returns artifact metadata (path, label, content preview) or null.
   */
  private resolveCurrentArtifact(prompt: any): { id: string; label: string; path: string; content?: string } | null {
    const workflow = prompt.context?.workflow;
    if (!workflow) { return null; }

    // Extract clean phase keyword from IDs like:
    //   "workflow.init" → "init"
    //   "workflow.tasklifecycle.01-init" → "init"
    //   "tasklifecycle.02-analysis" → "analysis"
    const rawPhase = workflow.currentPhase || workflow.id?.replace(/^workflow\./, '') || 'init';
    // Strip everything up to and including "NN-" prefix (e.g. "tasklifecycle.01-init" → "init")
    const phase = rawPhase.replace(/^(?:tasklifecycle\.)?(?:\d{2}-)?/, '');

    // Common artifact patterns per phase
    const artifactMap: Record<string, { file: string; label: string }> = {
      init: { file: 'task.md', label: 'task.md' },
      analysis: { file: 'architect/analysis-v1.md', label: 'Analysis' },
      planning: { file: 'architect/planning-v1.md', label: 'Planning' },
      implementation: { file: 'architect/implementation.md', label: 'Implementation' },
      verification: { file: 'architect/verification-v1.md', label: 'Verification' },
      results: { file: 'architect/results-v1.md', label: 'Results' },
      review: { file: 'architect/results-v1.md', label: 'Results' },
    };

    const mapping = artifactMap[phase];
    const file = mapping?.file || `${phase}.md`;
    const label = mapping?.label || phase;

    // Resolve the real task folder in .agent/artifacts/
    // Pass-actions create folders like "20260228-task" but engine taskId can be different
    const taskFolder = this.resolveTaskArtifactFolder();

    const artifactPath = (phase === 'init' && !taskFolder)
      ? `.agent/artifacts/${file}`
      : `.agent/artifacts/${taskFolder || 'task'}/${file}`;

    return { id: `${phase}-artifact`, label, path: artifactPath };
  }

  /**
   * Find the most recent task folder in .agent/artifacts/.
   * Pass-actions create folders like "20260228-<title-short>".
   * Returns the folder name or null if not found.
   */
  private resolveTaskArtifactFolder(): string | null {
    try {
      const fs = require('fs');
      const artifactsRoot = this.workspacePath
        ? require('path').join(this.workspacePath, '.agent', 'artifacts')
        : null;
      if (!artifactsRoot || !fs.existsSync(artifactsRoot)) { return null; }

      const entries = fs.readdirSync(artifactsRoot, { withFileTypes: true }) as any[];
      // Find directories matching YYYYMMDD-* pattern (task folders)
      const taskDirs = entries
        .filter((e: any) => e.isDirectory() && /^\d{8}-/.test(e.name))
        .map((e: any) => e.name)
        .sort()
        .reverse(); // Most recent first

      return taskDirs.length > 0 ? taskDirs[0] : null;
    } catch {
      return null;
    }
  }

  /**
   * Send request + read response with automatic retry for transient errors.
   * Each retry creates a fresh AbortController so the previous stream is cleanly aborted.
   */
  private async sendWithRetry(payload: any, role: string, maxRetries = 2): Promise<{
    text: string;
    toolEvents: ToolEventData[];
    delegations: DelegationData[];
    usage: UsageData | null;
  }> {
    let lastError: Error = new Error('No attempts made');

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const abort = new AbortController();

      try {
        const response = await this.sendRequest(payload, abort.signal);
        return await this.readResponse(response, role, abort.signal);
      } catch (err: any) {
        abort.abort(); // clean up the in-flight stream
        lastError = err;

        const msg = (err.message || '').toLowerCase();
        const isRetryable = ChatBackground.RETRYABLE_ERRORS.some(p => msg.includes(p.toLowerCase()));

        if (!isRetryable || attempt === maxRetries) { throw err; }

        const delay = 1000 * (attempt + 1);
        this.logTagged('#llm', `Attempt ${attempt + 1} failed (${err.message}). Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }

    throw lastError;
  }

  /**
   * Retry with a correction prompt.
   * Appends the failed response + correction message to the conversation,
   * sends a new request, and validates the result against Zod.
   *
   * Reusable for: validation failures, transform errors, format correction.
   */
  private async retryWithCorrection(
    payload: any,
    messages: any[],
    failedText: string,
    role: string,
    correctionPrompt: string,
  ): Promise<AgentStructuredResponse | null> {
    const retryMessages = [
      ...messages,
      { role: 'assistant' as const, content: failedText },
      { role: 'user' as const, content: correctionPrompt },
    ];

    try {
      const retryResult = await this.sendWithRetry({ ...payload, messages: retryMessages }, role);
      const structured = this.validateZod(retryResult.text);
      if (structured) {
        this.logTagged('#llm', 'Retry correction succeeded');
      } else {
        this.logTagged('#llm', 'Retry correction also failed');
      }
      return structured;
    } catch (err: any) {
      this.logTagged('#llm', `Retry correction request failed: ${err.message}`);
      return null;
    }
  }

  // ─── Payload Construction ───────────────────────────────────────────────

  /** Merge prompt data with transport config into sidecar payload. */
  private buildPayload(
    role: string,
    prompt: { messages: any[]; context: any },
    modelName: string,
    apiKey: string | null,
    provider: string,
    attachments?: Array<{ _title: string; _path: string }>,
  ): any {
    return {
      role,
      messages: prompt.messages,
      agenticContext: {
        ...prompt.context,
        apiKey: apiKey || undefined,
        provider,
        accessLevel: 'sandbox' as const,
        skills: [],
      },
      binding: { [role]: modelName },
      apiKey,
      provider,
      context: attachments ? attachments.map(att => ({ title: att._title, url: att._path })) : [],
      // Disable tools during workflow conversations to avoid Gemini MALFORMED_FUNCTION_CALL
      disableTools: !!prompt.context?.workflow,
    };
  }

  // ─── handleSendMessage ──────────────────────────────────────────────────

  private async handleSendMessage(data: { text: string, agentRole: string, modelId?: string, history?: Array<{ role: string, text: string }>, attachments?: Array<{ _title: string, _path: string }> }): Promise<ChatMessagePayload> {
    const role = data.agentRole || 'backend';

    this.logTagged('#msg', `Message for role "${role}": ${data.text.substring(0, 50)}...`);

    // Detect slash commands (e.g. /init) and ensure the workflow is started in the engine
    const trimmedText = data.text.trim();
    if (trimmedText.startsWith('/') && !trimmedText.includes(' ')) {
      const commandId = trimmedText.slice(1); // "init"
      const currentState = await this.getWorkflowState();
      // Only start if no workflow is already running
      if (!currentState || currentState.status === 'completed' || !currentState.currentWorkflowId) {
        this.logTagged('#workflow', `Slash command detected: /${commandId} — starting workflow`);
        try {
          await this.handleWorkflowCommand(commandId);
        } catch (err: any) {
          this.logTagged('#workflow', `Warning: Workflow start for /${commandId} failed: ${err.message}`);
        }
      }
    }

    try {
      // 1. Resolve model config for this role
      const { modelName, apiKey, provider, roleConfig } = await this.resolveModelConfig(role, data.text, data.modelId);
      // 2. Build LLM prompt (pure prompt data, no transport keys)
      const prompt = await this.buildPrompt(role, data, roleConfig);
      // 3. Build sidecar payload
      const payload = this.buildPayload(role, prompt, modelName, apiKey, provider, data.attachments);
      const streamResult = await this.sendWithRetry(payload, role);
      const streamText = streamResult.text;
      // ─── Diagnostic: log raw stream result ───
      this.logTagged('#llm', `Stream completed: ${streamText.length} chars, starts with: "${streamText.substring(0, 80)}..."`);
      // ─── End diagnostic ───      // Validate response against Zod schema
      let structured = this.validateZod(streamText);

      // If validation failed and workflow is active, retry once
      if (!structured && prompt.context?.workflow) {
        this.logTagged('#llm', 'Validation failed during workflow — retrying...');
        structured = await this.retryWithCorrection(
          payload,
          prompt.messages,
          streamText,
          role,
          FORMAT_CORRECTION_PROMPT,
        );
      }

      let result: ProcessedResponse;

      if (structured) {
        result = this.processStructuredResponse(structured, prompt);
      } else if (prompt.context?.workflow) {
        result = this.processResponseError(streamText);
      } else {
        result = { displayText: streamText, a2ui: [], messages: [] };
      }

      // Send final structured message to View
      const messagePayload: ChatMessagePayload = {
        text: result.displayText,
        ...(result.code ? { code: result.code } : {}),
        ...(result.a2ui.length > 0 ? { a2ui: result.a2ui } : {}),
        ...(result.messages.length > 0 ? { messages: result.messages } : {}),
        ...(streamResult.toolEvents.length > 0 ? { toolEvents: streamResult.toolEvents } : {}),
        ...(streamResult.delegations.length > 0 ? { delegations: streamResult.delegations } : {}),
        ...(streamResult.usage ? { usage: streamResult.usage } : {}),
        agentRole: role,
        isStreaming: false,
      };

      return messagePayload;

    } catch (error: any) {
      this.logTagged('#llm', 'Failed to stream from sidecar', error);
      return {
        text: `**System Error:** ${error.message}`,
        a2ui: [{ type: 'error', id: `error-${Date.now()}`, label: error.message }],
        agentRole: 'system',
        isStreaming: false,
      } as ChatMessagePayload;
    }
  }

  private async handleLoadInit(): Promise<any> {
    try {
      const rootPath = this.workspacePath;
      if (!rootPath) {
        return { error: 'No workspace open' };
      }
      const initPath = vscode.Uri.file(path.join(rootPath, '.agent', 'workflows', 'init.md'));

      const content = await vscode.workspace.fs.readFile(initPath);

      // Read package.json for version
      const packageJsonPath = vscode.Uri.joinPath(this._extensionUri, 'package.json');
      const packageJson = JSON.parse((await vscode.workspace.fs.readFile(packageJsonPath)).toString());

      return { success: true, content: content.toString(), version: packageJson.version };
    } catch (error) {
      this.logTagged('#system', 'Error loading init.md', error);
      return { error: 'Failed to load init.md' };
    }
  }

  private async handleSelectFiles(): Promise<ChatMessagePayload> {
    const files = await vscode.window.showOpenDialog({
      canSelectMany: true,
      openLabel: 'Attach',
      filters: {
        'Code Files': ['ts', 'js', 'json', 'md', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'go', 'rs', 'php', 'html', 'css', 'scss', 'xml', 'yaml', 'yml', 'sql', 'txt']
      }
    });

    const paths = files?.map(f => f.fsPath) || [];
    return {
      text: paths.length > 0 ? `📎 ${paths.length} file(s) attached` : '',
      a2ui: [],
      agentRole: 'system',
      isStreaming: false,
      files: paths,
    };
  }

  private async handleOpenFolder(): Promise<ChatMessagePayload> {
    vscode.commands.executeCommand('vscode.openFolder');
    return { text: '', a2ui: [], agentRole: 'system', isStreaming: false };
  }


  // ─── Generic Workflow Pass Action System ───────────────────────────────────

  /**
   * Resolve workflow variables from the most recent candidate and/or active task.md.
   * Variables are used to populate template placeholders and resolve output paths.
   *
   * Sources (in priority order):
   * 1. Most recent candidate in .agent/artifacts/candidate/
   * 2. Most recent task.md in .agent/artifacts/<taskId>/
   *
   * Returns a WorkflowVars with string fields + criteria array.
   */
  private async resolveWorkflowVariables(workspaceRoot: string): Promise<WorkflowVars> {
    const fs = await import('fs/promises');
    const vars: WorkflowVars = {
      TS: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      TASK: '',
      taskId: '',
      taskTitle: 'Untitled',
      taskObjective: '',
      titleShort: 'task',
      language: 'Español',
      'ISO-8601': new Date().toISOString(),
      criteria: [],
    };

    // 1. Try to read the most recent candidate
    const candidateDir = path.join(workspaceRoot, '.agent', 'artifacts', 'candidate');
    try {
      const files = await fs.readdir(candidateDir);
      const candidates = files
        .filter((f: string) => f.endsWith('-candidate.md'))
        .sort()
        .reverse();

      if (candidates.length > 0) {
        const candidateFile = path.join(candidateDir, candidates[0]);
        const content = await fs.readFile(candidateFile, 'utf-8');

        // Extract timestamp from filename
        const tsMatch = candidates[0].match(/^(\d{8})/);
        if (tsMatch) { vars.TS = tsMatch[1]; }

        // Extract titleShort from filename: "20240515-test-candidate.md" → "test"
        const nameSlugMatch = candidates[0].match(/^\d{8}-(.+)-candidate\.md$/);
        if (nameSlugMatch) {
          vars.titleShort = nameSlugMatch[1];
        }

        // Extract structured fields — bilingual support (EN/ES)
        const langMatch = content.match(/##\s*(?:Language|Idioma)\s*\n+([^\n]+)/i);
        if (langMatch) { vars.language = langMatch[1].trim(); }

        const titleMatch = content.match(/\*\*(?:Title|Título)\*\*:\s*(.+)/i);
        if (titleMatch) { vars.taskTitle = titleMatch[1].trim(); }

        const objMatch = content.match(/\*\*(?:Objective|Objetivo)\*\*:\s*(.+)/i);
        if (objMatch) { vars.taskObjective = objMatch[1].trim(); }

        const shortMatch = content.match(/\*\*(?:Title Short|Título Corto)\*\*:\s*(.+)/i);
        if (shortMatch) {
          vars.titleShort = shortMatch[1].trim();
        } else if (!nameSlugMatch) {
          // Derive from taskTitle only if filename didn't have it
          vars.titleShort = vars.taskTitle
            .toLowerCase()
            .replace(/[^a-z0-9áéíóúñü\s-]/gi, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);
        }

        // Extract acceptance criteria — bilingual section heading
        const criteriaSection = content.match(/##\s*(?:Acceptance Criteria|Criterios de Aceptación)\s*\n([\s\S]*?)(?=\n---|$)/i);
        if (criteriaSection) {
          const lines = criteriaSection[1].split('\n');
          for (const line of lines) {
            const m = line.match(/^\d+\.\s+(.+)/);
            if (m) { vars.criteria.push(m[1].trim()); }
          }
        }

        this.logTagged('#lifecycle', `resolveWorkflowVariables: candidate parsed — title="${vars.taskTitle}", TS=${vars.TS}`);
      }
    } catch { /* candidate dir may not exist yet */ }

    // Compute derived variables
    vars.taskId = `${vars.TS}-${vars.titleShort}`;
    vars.TASK = vars.taskId;

    // 2. Try to find active task folder (may override some vars)
    const artifactsDir = path.join(workspaceRoot, '.agent', 'artifacts');
    try {
      const entries = await fs.readdir(artifactsDir);
      // Find task folders (format: YYYYMMDD-slug, exclude "candidate")
      const taskFolders = entries
        .filter((e: string) => /^\d{8}-.+/.test(e))
        .sort()
        .reverse();

      if (taskFolders.length > 0) {
        const activeTaskFolder = taskFolders[0];
        const taskMdPath = path.join(artifactsDir, activeTaskFolder, 'task.md');
        try {
          await fs.stat(taskMdPath);
          // task.md exists — use this task folder as TASK
          vars.TASK = activeTaskFolder;
          vars.taskId = activeTaskFolder;
          this.logTagged('#lifecycle', `resolveWorkflowVariables: active task found — ${activeTaskFolder}`);
        } catch { /* task.md doesn't exist yet — use candidate-derived values */ }
      }
    } catch { /* artifacts dir may not exist */ }

    return vars;
  }

  /**
   * Execute workflow pass actions generically.
   * Checks the workflow's output paths, resolves placeholders,
   * and creates missing artifacts from templates.
   *
   * Returns an array of created artifact paths.
   */
  private async executeWorkflowPassActions(workflowState: any): Promise<string[]> {
    const workspaceRoot = this.workspacePath;
    if (!workspaceRoot) { return []; }

    const fs = await import('fs/promises');
    const workflow = workflowState?.workflow;
    if (!workflow) { return []; }

    // Get output artifact paths from the workflow definition
    const rawOutputs: string[] = workflow.sections?.outputs || [];
    // Also extract backtick-wrapped paths from pass.actions
    const passActions: string[] = workflow.pass?.actions || [];

    // Resolve variables from candidate/task.md
    const vars = await this.resolveWorkflowVariables(workspaceRoot);

    // Collect all artifact file paths (.md) and folder paths from outputs + pass actions
    const outputPathSet = new Set<string>();

    // Helper: extract .agent/artifacts/... paths from text
    const extractArtifactPaths = (text: string) => {
      // Match backtick-wrapped or plain .agent/artifacts/...  paths ending in .md
      const mdRegex = /`?(\.agent\/artifacts\/[^\s)`]+\.md)`?/gi;
      let match;
      while ((match = mdRegex.exec(text)) !== null) {
        outputPathSet.add(match[1]);
      }
    };

    // Helper: extract and create folder paths
    const extractAndCreateFolders = async (text: string) => {
      const folderRegex = /`(\.agent\/artifacts\/[^`]+\/)`/g;
      let match;
      while ((match = folderRegex.exec(text)) !== null) {
        const resolved = this.resolvePathPlaceholders(match[1], vars);
        const abs = path.join(workspaceRoot, resolved);
        try {
          await fs.mkdir(abs, { recursive: true });
          this.logTagged('#lifecycle', `Pass action: created folder ${resolved}`);
        } catch { /* already exists */ }
      }
    };

    // From explicit outputs section
    for (const output of rawOutputs) {
      extractArtifactPaths(output);
    }

    // From pass actions: extract file paths and create folders
    for (const action of passActions) {
      extractArtifactPaths(action);
      await extractAndCreateFolders(action);
    }

    // Also extract folders from outputs section
    for (const output of rawOutputs) {
      await extractAndCreateFolders(output);
    }

    const outputPaths = Array.from(outputPathSet);
    this.logTagged('#lifecycle', `executeWorkflowPassActions: extracted ${outputPaths.length} paths: ${JSON.stringify(outputPaths)}`);

    if (outputPaths.length === 0) {
      this.logTagged('#lifecycle', 'executeWorkflowPassActions: no output artifacts to check');
      return [];
    }

    const created: string[] = [];

    for (const rawPath of outputPaths) {
      const resolvedPath = this.resolvePathPlaceholders(rawPath, vars);
      const absolutePath = path.join(workspaceRoot, resolvedPath);
      const basename = path.basename(absolutePath);
      this.logTagged('#lifecycle', `Pass action: processing "${rawPath}" → "${resolvedPath}" (abs: ${absolutePath})`);

      try {
        // Skip if file already exists with content
        try {
          const stat = await fs.stat(absolutePath);
          if (stat.size > 0) {
            this.logTagged('#lifecycle', `Pass action: artifact already exists — ${resolvedPath} (${stat.size} bytes)`);
            continue;
          }
        } catch {
          // File doesn't exist — proceed to create it
        }

        // Ensure parent directory exists
        await fs.mkdir(path.dirname(absolutePath), { recursive: true });
        this.logTagged('#lifecycle', `Pass action: [${basename}] directory ensured, resolving template...`);

        // Find matching template (strip version suffix: "analysis-v1.md" → "analysis.md")
        const templateName = basename.replace(/-v\d+\.md$/, '.md');
        const templatePath = path.join(workspaceRoot, '.agent', 'templates', 'lifecycle', templateName);
        this.logTagged('#lifecycle', `Pass action: [${basename}] looking for template at ${templatePath}`);

        let content: string;
        try {
          const template = await fs.readFile(templatePath, 'utf-8');
          content = this.populateTemplate(template, vars);
          this.logTagged('#lifecycle', `Pass action: [${basename}] populated from template "${templateName}" (${content.length} chars)`);
        } catch {
          content = `---\nartifact: ${templateName.replace('.md', '')}\nstatus: active\n---\n\n# ${basename}\n\n_Created automatically during workflow transition._\n`;
          this.logTagged('#lifecycle', `Pass action: [${basename}] no template found, using placeholder`);
        }

        await fs.writeFile(absolutePath, content, 'utf-8');
        this.logTagged('#lifecycle', `Pass action: ✅ wrote ${resolvedPath} (${content.length} bytes)`);
        created.push(resolvedPath);
      } catch (err: any) {
        this.logTagged('#lifecycle', `Pass action: ❌ ERROR creating ${resolvedPath}: ${err.message}\n${err.stack}`);
      }
    }

    return created;
  }

  /**
   * Resolve path placeholders like <TS>, <TASK>, <title-short> in artifact paths.
   */
  private resolvePathPlaceholders(rawPath: string, vars: WorkflowVars): string {
    return rawPath
      .replace(/<TS>/g, vars.TS || '')
      .replace(/<TASK>/g, vars.TASK || vars.taskId || '')
      .replace(/<title-short>/g, vars.titleShort || '')
      .replace(/<TIMESTAMP>/g, vars.TS || '');
  }

  /**
   * Populate a template with resolved variables.
   * Handles {{placeholder}} syntax and structured content blocks.
   */
  private populateTemplate(template: string, vars: WorkflowVars): string {
    const now = vars['ISO-8601'] || new Date().toISOString();

    // Replace standard {{placeholder}} variables
    let content = template
      .replace(/\{\{taskId\}\}/g, vars.taskId || '')
      .replace(/\{\{taskTitle\}\}/g, vars.taskTitle || '')
      .replace(/\{\{taskObjective\}\}/g, vars.taskObjective || '')
      .replace(/\{\{ISO-8601\}\}/g, now)
      .replace(/\{\{language\}\}/g, vars.language || '')
      .replace(/\{\{TASK\}\}/g, vars.TASK || '')
      .replace(/\{\{TS\}\}/g, vars.TS || '');

    // Replace acceptance criteria block if present in template
    if (vars.criteria && vars.criteria.length > 0) {
      const criteriaYaml = vars.criteria
        .map((c, i) => `  - id: AC-${i + 1}\n    description: "${c}"\n    status: pending`)
        .join('\n');

      content = content.replace(
        /```yaml\nacceptance_criteria:[\s\S]*?```/m,
        `\`\`\`yaml\nacceptance_criteria:\n${criteriaYaml}\n\`\`\``
      );
    }

    // Replace criterion placeholders ({{criterion-1}}, {{criterion-2}}, etc.)
    for (let i = 0; i < (vars.criteria?.length || 0); i++) {
      content = content.replace(
        new RegExp(`\\{\\{criterion-${i + 1}\\}\\}`, 'g'),
        vars.criteria[i]
      );
    }

    return content;
  }

  /**
   * Open a file in VS Code editor from a chat file link.
   */
  private async handleOpenFile(data: { path: string }): Promise<ChatMessagePayload> {
    const emptyPayload: ChatMessagePayload = { text: '', a2ui: [], agentRole: 'system', isStreaming: false };
    const errorPayload = (msg: string): ChatMessagePayload => ({
      text: `**Error:** ${msg}`,
      a2ui: [{ type: 'error', id: `error-${Date.now()}`, label: msg }],
      agentRole: 'system',
      isStreaming: false,
    });

    // Helper: try to open a file and return true if successful
    const tryOpen = async (absPath: string): Promise<boolean> => {
      try {
        const uri = vscode.Uri.file(absPath);
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc, { preview: true });
        return true;
      } catch { return false; }
    };

    try {
      const filePath = data.path.replace(/\s*\/\s*/g, '/').trim();
      const wsRoot = this.workspacePath;
      if (!wsRoot) { return errorPayload('No workspace'); }

      const basename = path.basename(filePath);
      const artifactsRoot = path.join(wsRoot, '.agent', 'artifacts');

      // ── Phase 1: Direct path resolution ─────────────────────
      const directCandidates: string[] = [];
      if (path.isAbsolute(filePath)) {
        directCandidates.push(filePath);
      } else {
        directCandidates.push(path.join(wsRoot, filePath));
        directCandidates.push(path.join(wsRoot, '.agent', filePath));
      }

      for (const c of directCandidates) {
        if (await tryOpen(c)) { return emptyPayload; }
      }

      // ── Phase 2: Artifact-aware search ──────────────────────
      // LLM often generates wrong folder names (session UUIDs, wrong timestamps).
      // Search across ALL subdirectories of .agent/artifacts/ for the target file.
      const fsP = await import('fs/promises');
      const basenameVariants = [basename];
      // Also try without "workflow." prefix (e.g. "workflow.init.md" → "init.md")
      const strippedBasename = basename.replace(/^workflow\./, '');
      if (strippedBasename !== basename) {
        basenameVariants.push(strippedBasename);
      }

      try {
        const artifactDirs = await fsP.readdir(artifactsRoot, { withFileTypes: true });
        for (const variant of basenameVariants) {
          // Try root of artifacts first
          const rootCandidate = path.join(artifactsRoot, variant);
          if (await tryOpen(rootCandidate)) {
            this.logTagged('#system', `File opened from artifacts root: ${variant} (requested: ${basename})`);
            return emptyPayload;
          }
          // Then try each subdirectory
          for (const entry of artifactDirs) {
            if (entry.isDirectory()) {
              const candidate = path.join(artifactsRoot, entry.name, variant);
              if (await tryOpen(candidate)) {
                this.logTagged('#system', `File opened from artifacts/${entry.name}/${variant} (requested: ${filePath})`);
                return emptyPayload;
              }
            }
          }
        }

        // Phase 2b: If basename not found, try finding ANY .md file in the parent dir 
        // (handles wrong filenames from LLM, e.g. "workflow.init.md" when file is "task.md")
        const pathSegments = filePath.replace(/\\/g, '/').split('/');
        // Look for a folder segment that matches a real artifact folder
        for (const entry of artifactDirs) {
          if (entry.isDirectory()) {
            // Check if any path segment partially matches this folder
            const dirName = entry.name;
            const hasMatch = pathSegments.some(s =>
              s === dirName || dirName.includes(s) || s.includes(dirName)
            );
            if (hasMatch) {
              const dirPath = path.join(artifactsRoot, dirName);
              const filesInDir = await fsP.readdir(dirPath);
              const ext = path.extname(basename) || '.md';
              const mdFiles = filesInDir.filter(f => f.endsWith(ext));
              if (mdFiles.length === 1) {
                // Only one matching file — open it
                if (await tryOpen(path.join(dirPath, mdFiles[0]))) {
                  this.logTagged('#system', `File opened via dir match: artifacts/${dirName}/${mdFiles[0]} (requested: ${filePath})`);
                  return emptyPayload;
                }
              }
            }
          }
        }
      } catch { /* artifacts dir may not exist yet */ }

      // ── Phase 3: Workspace-wide glob search ─────────────────
      for (const variant of basenameVariants) {
        const globPattern = new vscode.RelativePattern(wsRoot, `**/${variant}`);
        const found = await vscode.workspace.findFiles(globPattern, '**/node_modules/**', 1);
        if (found.length > 0) {
          const doc = await vscode.workspace.openTextDocument(found[0]);
          await vscode.window.showTextDocument(doc, { preview: true });
          if (variant !== basename) {
            this.logTagged('#system', `File opened via glob (variant: ${variant}, requested: ${basename})`);
          }
          return emptyPayload;
        }
      }

      this.logTagged('#system', `File not found: ${filePath} (tried direct + artifact scan + glob)`);
      return errorPayload(`File not found: ${filePath}`);
    } catch (err: any) {
      this.logTagged('#system', `Failed to open file: ${err.message}`);
      return errorPayload(err.message);
    }
  }

  /**
   * Determine model routing context: "routing" (fast) vs "default" (thinking).
   *
   * Routing signals (use fast model):
   * - Slash commands (/init, /phase-X)
   * - Active workflow is init (setup/transitions)
   * - A2UI responses (Language:, Strategy:, gate SI/NO)
   *
   * Default signals (use thinking model):
   * - Free-form user text within a phase workflow
   * - Analysis, planning, implementation tasks
   */
  private async resolveTaskType(userMessage: string): Promise<'routing' | 'default'> {
    const text = userMessage.trim();

    // Slash commands are always fast transitions
    if (text.startsWith('/') && !text.includes('/', 1)) {
      return 'routing';
    }

    // A2UI responses follow "Label: Value" pattern — quick confirmations
    const a2uiPatterns = [
      /^(Conversation Language|Idioma|Language):\s/i,
      /^(Estrategia|Strategy|Lifecycle).*:\s/i,
      /:\s*(SI|NO|Yes|No)\s*$/i,
    ];
    if (a2uiPatterns.some(p => p.test(text))) {
      return 'routing';
    }

    // Check if we're in the init workflow (all init interactions are transitions)
    try {
      const state = await this.getWorkflowState();
      if (state?.currentWorkflowId === 'workflow.init' && state?.status === 'running') {
        return 'routing';
      }
    } catch { /* fallback to default */ }

    return 'default';
  }

  /**
   * Get current workflow state from Runtime.
   */
  private async getWorkflowState(): Promise<any> {
    try {
      const state = await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_STATUS);
      this.logTagged('#workflow', `→ WORKFLOW_STATUS`, state ? `workflowId=${state.currentWorkflowId}, status=${state.status}` : 'null');
      return state;
    } catch (err: any) {
      this.logTagged('#workflow', `→ WORKFLOW_STATUS failed: ${err?.message}`);
      return null;
    }
  }

  /**
   * Read lifecycle phases dynamically from the workflow directory.
   * Source of truth: .agent/workflows/tasklifecycle/*.md
   */
  private async handleLifecyclePhasesRequest(data: { strategy: string }): Promise<any> {
    if (!this.workspacePath) { return { phases: [] }; }

    const dirName = data.strategy || 'tasklifecycle';
    const dirPath = vscode.Uri.joinPath(vscode.Uri.file(this.workspacePath), '.agent', 'workflows', dirName);

    try {
      const fs = await import('fs/promises');
      const entries = await fs.readdir(dirPath.fsPath);
      const mdFiles = entries
        .filter((f: string) => f.endsWith('.md') && (/phase-\d+/.test(f) || /^\d{2}-/.test(f)))
        .sort();

      const phases = mdFiles.map((filename: string) => {
        const id = filename.replace('.md', '');
        const labelPart = id
          .replace(/^(\d{2}-)/, '')        // strip NN- prefix
          .replace(/^(short-)?phase-\d+-/, '') // strip phase-N- prefix
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        return { id, label: labelPart };
      });

      this.logTagged('#lifecycle', `Loaded ${phases.length} phases for ${dirName}: ${phases.map(p => p.id).join(', ')}`);
      return { phases };
    } catch (err: any) {
      this.logTagged('#lifecycle', `Failed to read lifecycle phases for ${dirName}: ${err.message}`);
      return { phases: [] };
    }
  }

  /**
   * Handle roles changed notification from Settings background.
   * Fetches fresh roles and pushes them to Chat view.
   */
  private async handleRolesChanged(): Promise<any> {
    // Invalidate settings cache so next message picks up changes
    this.invalidateSettingsCache();
    this.logTagged('#config', 'Roles changed — settings cache invalidated');
    return { success: true };
  }

  protected getHtmlForWebview(webview: vscode.Webview): string {
    const scriptPath = 'dist/extension/modules/chat/view/index.js';
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath, this.appVersion);
  }



  private emitAgentResponse(role: string, text: string) {
    this.messenger.emit({
      id: randomUUID(),
      from: `${NAME}::background`,
      to: `${NAME}::view`,
      timestamp: Date.now(),
      origin: MessageOrigin.Server,
      payload: {
        command: MESSAGES.RECEIVE_MESSAGE,
        data: { text, agentRole: role }
      }
    });
  }

  // ─── Session Persistence (globalState) ──────────────────────

  // ─── Workflow & Gate Handlers ──────────────────────────────

  private async handleWorkflowCommand(commandId: string): Promise<any> {
    try {
      const workspaceRoot = this.workspacePath;
      if (!workspaceRoot) {
        return { success: false, error: 'No workspace open', errorText: '👋 **Welcome to Extensio!** Please open a folder or workspace to begin.' };
      }

      const rawResult = await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_START, {
        workflowId: commandId,
        taskId: this.getLastSessionId() || `task-${Date.now()}`,
        dirPath: `${workspaceRoot}/.agent/workflows`,
      }, 45_000);

      // Unwrap the nested result from the sidecar JSON RPC format
      const result = rawResult?.result || rawResult;

      // Clean owner name ('architect-agent' -> 'architect') so it matches personas and routing
      const owner = result?.owner ? result.owner.replace(/-agent$/, '') : undefined;

      // Extract workflowState directly from the command response (no polling needed)
      const state = result?.workflowState || await this.getWorkflowState();

      return {
        success: true,
        owner,
        workflowId: result?.workflowId || commandId,
        newSession: true,
        workflowState: state,
        gate: state?.currentGate || null,
      };
    } catch (error: any) {
      this.logTagged('#workflow', 'Failed to start workflow', error);
      return { success: false, error: error.message, errorText: `**Error starting workflow:** ${error.message}` };
    }
  }





  private async handleGateResponse(data: any): Promise<ChatMessagePayload> {
    try {
      this.logTagged('#gate', 'Gate response from user', JSON.stringify(data));

      // 1. Read current workflow state to get pass target BEFORE sending gate response
      const workflowState = await this.getWorkflowState();
      const passTarget = workflowState?.workflow?.pass?.nextTarget;

      // 2. Advance workflow: step complete → gate approve/reject
      if (data.decision === 'SI' || data.decision === 'approve') {
        try {
          await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_STEP_COMPLETE);
        } catch { /* step may already be at gate */ }
        await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_GATE_RESPONSE, {
          gateId: data.gateId || 'gate',
          decision: 'SI',
        });
        this.logTagged('#gate', `Gate approved. passTarget=${passTarget}`);

        // 2.5. Execute pass actions: ensure workflow output artifacts exist
        let createdArtifacts: string[] = [];
        try {
          createdArtifacts = await this.executeWorkflowPassActions(workflowState);
          if (createdArtifacts.length > 0) {
            this.logTagged('#lifecycle', `Pass actions created ${createdArtifacts.length} artifact(s): ${createdArtifacts.join(', ')}`);
          }
        } catch (err: any) {
          this.logTagged('#lifecycle', `Warning: Pass actions failed: ${err.message}`);
        }

        // 3. Auto-transition to next workflow via passTarget (data-driven)
        if (passTarget) {
          let nextWorkflowId: string;
          const targets = passTarget.split('|').map((t: string) => t.trim());

          if (targets[0].includes(':')) {
            const targetMap = new Map(
              targets.map((t: string) => {
                const [key, val] = t.split(':').map(s => s.trim());
                return [key, val] as [string, string];
              })
            );
            nextWorkflowId = targetMap.values().next().value || targets[0];
          } else {
            nextWorkflowId = targets[0];
          }

          const cleanId = nextWorkflowId.replace(/^workflows?\./, '');
          this.logTagged('#workflow', `Auto-transitioning to next workflow: ${cleanId}`);
          try {
            const workspaceRoot = this.workspacePath;
            const startResult = await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_START, {
              workflowId: cleanId,
              taskId: data.taskTitle || 'task',
              dirPath: workspaceRoot ? `${workspaceRoot}/.agent/workflows` : undefined,
            });
            this.logTagged('#workflow', `Successfully started next workflow: ${cleanId}`);

            // Extract workflowState from the start command response
            const newState = startResult?.workflowState || await this.getWorkflowState();

            return {
              text: 'Gate **approved**',
              a2ui: [],
              agentRole: 'system',
              isStreaming: false,
              phaseAutoStart: {
                phaseId: cleanId,
                owner: workflowState.workflow?.owner?.replace(/-agent$/, '') || 'architect',
                createdArtifacts,
              },
              workflowState: newState,
              gate: newState?.currentGate || null,
            };
          } catch (err: any) {
            this.logTagged('#workflow', `Failed to start next workflow: ${err.message}`);
          }
        } else {
          // No explicit passTarget — lifecycle internal gate or simple workflow gate
          const previousPhaseId = workflowState?.workflow?.id;
          const gateAnswerText = data.gateAnswerText || 'Gate approved. Continue with the workflow.';
          const isLifecycle = workflowState?.isLifecycle;
          const phases: any[] = workflowState?.phases || [];

          // For lifecycle workflows, try to advance to the next phase manually
          // (the engine's XState actor may not be alive after sidecar restart)
          if (isLifecycle && phases.length > 0) {
            const currentIdx = phases.findIndex((p: any) => p.status === 'active');
            const nextIdx = currentIdx >= 0 ? currentIdx + 1 : -1;

            if (nextIdx >= 0 && nextIdx < phases.length) {
              const nextPhase = phases[nextIdx];
              const owner = nextPhase.owner?.replace(/-agent$/, '') || workflowState.workflow?.owner?.replace(/-agent$/, '') || 'architect';
              this.logTagged('#lifecycle', `Lifecycle phase advance: ${phases[currentIdx]?.id} → ${nextPhase.id} (manual)`);

              // Try to tell the engine to advance (may fail if actor is null)
              try {
                await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_GATE_RESPONSE, {
                  gateId: data.gateId || 'gate',
                  decision: 'SI',
                });
              } catch { /* engine may not have active actor */ }

              return {
                text: 'Gate **approved**',
                a2ui: [],
                agentRole: 'system',
                isStreaming: false,
                phaseAutoStart: { phaseId: nextPhase.id, owner, createdArtifacts: createdArtifacts || [] },
                workflowState: workflowState,
              };
            }
          }

          // Get current state from the gate response (no polling needed)
          const newState = await this.getWorkflowState();
          const newPhaseId = newState?.workflow?.id;

          if (newPhaseId && newPhaseId !== previousPhaseId) {
            // Engine advanced to a new phase
            const owner = newState.workflow?.owner?.replace(/-agent$/, '') || 'architect';
            this.logTagged('#lifecycle', `Phase advanced: ${previousPhaseId} → ${newPhaseId}`);
            return {
              text: 'Gate **approved**',
              a2ui: [],
              agentRole: 'system',
              isStreaming: false,
              phaseAutoStart: { phaseId: newPhaseId, owner },
              workflowState: newState,
              gate: newState?.currentGate || null,
            };
          } else {
            // Same phase — internal gate
            this.logTagged('#gate', 'Internal gate — same phase, continue');
            return {
              text: 'Gate **approved**',
              a2ui: [],
              agentRole: 'system',
              isStreaming: false,
              gateContinue: { gateAnswerText },
              workflowState: newState,
            };
          }
        }
      } else {
        // Gate rejected
        await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_GATE_RESPONSE, {
          gateId: data.gateId || 'gate',
          decision: 'NO',
          reason: data.reason,
        });
        this.logTagged('#gate', 'Gate rejected by user');
      }

      const decision = data.decision === 'SI' || data.decision === 'approve' ? 'approved' : 'rejected';
      return {
        text: `Gate **${decision}**`,
        a2ui: [],
        agentRole: 'system',
        isStreaming: false,
      };
    } catch (error: any) {
      this.logTagged('#gate', 'Failed to handle gate response', error);
      return {
        text: `**Error:** ${error.message}`,
        a2ui: [{ type: 'error', id: `error-${Date.now()}`, label: error.message }],
        agentRole: 'system',
        isStreaming: false,
      };
    }
  }






  private getSessions(): any[] {
    return this.vscodeContext.globalState.get<any[]>(ChatBackground.SESSIONS_KEY) || [];
  }

  private async saveSessions(sessions: any[]): Promise<void> {
    await this.vscodeContext.globalState.update(ChatBackground.SESSIONS_KEY, sessions);
  }

  private async setLastSessionId(id: string | null): Promise<void> {
    await this.vscodeContext.globalState.update(ChatBackground.LAST_SESSION_KEY, id);
  }

  private getLastSessionId(): string | null {
    return this.vscodeContext.globalState.get<string>(ChatBackground.LAST_SESSION_KEY) || null;
  }

  private async handleSaveSession(data: { sessionId?: string, messages: any[], taskTitle?: string, elapsedSeconds?: number, progress?: number, tokenUsage?: any, accessLevel?: string, securityScore?: number, taskSteps?: any[] }): Promise<any> {
    // Skip saving truly empty sessions (no messages at all)
    if (!data.messages || data.messages.length === 0) {
      this.logTagged('#session', 'Skipping save — empty session');
      return { success: true, sessionId: data.sessionId };
    }

    const sessions = this.getSessions();
    const id = data.sessionId || randomUUID();

    // Derive title from taskTitle or first user message
    const firstUserMsg = data.messages.find((m: any) => m.role === 'user');
    const title = firstUserMsg?.text?.substring(0, 60) || 'New task';

    // Extract participating agents from messages
    const agentRoles = new Set<string>();
    for (const m of data.messages) {
      if (m.role && m.role !== 'user' && m.role !== 'system') {
        agentRoles.add(m.role);
      }
    }

    const existing = sessions.findIndex(s => s.id === id);
    const session = {
      id,
      title,
      taskTitle: data.taskTitle || undefined,
      timestamp: Date.now(),
      messages: data.messages,
      elapsedSeconds: data.elapsedSeconds || 0,
      progress: data.progress ?? 0,
      accessLevel: data.accessLevel || 'sandbox',
      securityScore: data.securityScore ?? 100,
      agents: Array.from(agentRoles),
      tokenUsage: data.tokenUsage || undefined,
      taskSteps: data.taskSteps || undefined,
    };

    if (existing >= 0) {
      sessions[existing] = session;
    } else {
      sessions.unshift(session); // newest first
    }

    // Cap at 50 sessions
    if (sessions.length > 50) { sessions.length = 50; }

    await this.saveSessions(sessions);
    await this.setLastSessionId(id);
    Logger.setSession(id);
    this.logTagged('#session', `Session saved: ${id} ("${data.taskTitle || title}")`);
    return { success: true, sessionId: id };
  }

  private async handleLoadSession(data: { sessionId: string }): Promise<any> {
    const sessions = this.getSessions();

    // Resolve __last__ to the last used session
    let targetId = data.sessionId;
    if (targetId === '__last__') {
      const lastId = this.getLastSessionId();
      if (!lastId) { return { success: false, error: 'No last session' }; }
      targetId = lastId;
    }

    const session = sessions.find(s => s.id === targetId);

    if (!session) {
      this.logTagged('#session', `Session not found: ${targetId}`);
      return { success: false, error: 'Session not found' };
    }

    await this.setLastSessionId(session.id);
    Logger.setSession(session.id);

    // Restore workflow state for this task (sessionId === taskId).
    // Fire-and-forget: do NOT block session load — sidecar may not be ready at startup.
    // The workflow state will arrive via emitWorkflowState → push to View.
    const taskId = session.id;
    this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_SWITCH_TASK, { taskId })
      .then((restored: any) => {
        if (restored?.workflowState) {
          this.logTagged('#workflow', `Workflow state restored for task: ${taskId}`);
        } else {
          this.logTagged('#workflow', `No workflow state for task: ${taskId}`);
        }
      })
      .catch(() => {
        this.logTagged('#workflow', `Could not restore workflow state for task: ${taskId}`);
      });

    this.logTagged('#session', `Session loaded: ${session.id} ("${session.title}")`);
    return { success: true, session };
  }

  private async handleListSessions(): Promise<any> {
    const sessions = this.getSessions().map(s => ({
      id: s.id,
      title: s.title,
      taskTitle: s.taskTitle || undefined,
      timestamp: s.timestamp,
      messageCount: s.messages?.length || 0,
      elapsedSeconds: s.elapsedSeconds || 0,
      progress: s.progress ?? 0,
      accessLevel: s.accessLevel || 'sandbox',
      securityScore: s.securityScore ?? 100,
      agents: s.agents || [],
      tokenUsage: s.tokenUsage ? {
        totalTokens: s.tokenUsage.totalTokens || 0,
        estimatedCost: s.tokenUsage.estimatedCost || 0,
        requests: s.tokenUsage.requests || 0,
      } : undefined,
    }));

    return { success: true, sessions };
  }

  private async handleDeleteSession(data: { sessionId: string }): Promise<any> {
    let sessions = this.getSessions();
    sessions = sessions.filter(s => s.id !== data.sessionId);
    await this.saveSessions(sessions);

    const lastId = this.getLastSessionId();
    if (lastId === data.sessionId) {
      await this.setLastSessionId(sessions.length > 0 ? sessions[0].id : null);
    }

    // Reset workflow engine to clean state for next session
    try {
      await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_RESET);
      this.logTagged('#workflow', `Workflow engine reset after session delete`);
    } catch (err: any) {
      this.logTagged('#workflow', `Warning: Workflow reset failed: ${err.message}`);
    }

    this.logTagged('#session', `Session deleted: ${data.sessionId}`);
    return { success: true };
  }

  private async handleNewSession(): Promise<any> {
    const id = randomUUID();
    await this.setLastSessionId(id);
    Logger.setSession(id);
    this.logTagged('#session', `New session started: ${id}`);
    return { success: true, sessionId: id };
  }

  /**
   * Get the last session's data for auto-load on startup.
   */
  public getLastSession(): any | null {
    const lastId = this.getLastSessionId();
    if (!lastId) { return null; }
    const sessions = this.getSessions();
    return sessions.find(s => s.id === lastId) || null;
  }
}
