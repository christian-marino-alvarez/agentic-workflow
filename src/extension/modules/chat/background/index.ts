
import * as vscode from 'vscode';
import * as path from 'path';
import { Background, Message, ViewHtml, MessageOrigin } from '../../core/index.js';
import { NAME, MESSAGES } from '../constants.js';
import { API_ENDPOINTS, SIDECAR_BASE_URL, DEFAULT_MODELS } from '../../llm/constants.js';
import { MESSAGES as SETTINGS_MESSAGES } from '../../settings/constants.js';
import { MESSAGES as RUNTIME_MESSAGES } from '../../runtime/constants.js';
import { behavioralPreamble, workflowStartPrompt, A2UI_INSTRUCTIONS } from '../prompts/index.js';
import { tryParseStructuredResponse } from '../../llm/backend/tools/response-schema.js';
import { randomUUID } from 'crypto';


export class ChatBackground extends Background {

  /** Matches agent identity prefixes like "🏛️ **architect-agent**:", "🔬 researcher-agent:" etc. */
  private static readonly AGENT_PREFIX_REGEX = /^\s*(?:[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200d\uFE0F]+\s*)?(?:\*{1,2})?\s*\w[\w-]*(?:-agent)?\s*(?:\*{1,2})?\s*:\s*/gmu;
  private static readonly SESSIONS_KEY = 'chat.sessions';
  private static readonly LAST_SESSION_KEY = 'chat.lastSessionId';
  private static readonly LANGUAGE_KEY = 'chat.conversationLanguage';
  private vscodeContext: vscode.ExtensionContext;
  private conversationLanguage: string | null = null;


  constructor(context: vscode.ExtensionContext) {
    super(NAME, context.extensionUri, `${NAME}-view`);
    this.vscodeContext = context;
    // Restore persisted language preference
    this.conversationLanguage = context.workspaceState.get<string>(ChatBackground.LANGUAGE_KEY) || null;
    if (this.conversationLanguage) {
      this.log(`Language restored from state: ${this.conversationLanguage}`);
    }
    try {
      const ext = vscode.extensions.getExtension('christian-marino-alvarez.agentic-workflow');
      this.appVersion = ext?.packageJSON?.version || '0.0.0-error';
    } catch (e) {
      this.appVersion = '0.0.0-ex';
    }
    this.log('Initialized v' + this.appVersion);
  }

  /** Remove agent identity prefix and system JSON blocks from LLM response. */
  private cleanMessageText(text: string): string {
    let cleanText = text.replace(ChatBackground.AGENT_PREFIX_REGEX, '');

    // 1. Strip fully closed markdown code blocks that contain "current_phase" 
    //    (Using negative lookahead (?!```) to ensure we don't accidentally match across multiple different code blocks)
    cleanText = cleanText.replace(/```[^\n]*\n(?:(?!```)[\s\S])*?"current_phase"(?:(?!```)[\s\S])*?```\n?/g, '');

    // 2. Strip partial markdown code blocks that contain "current_phase" (happens during streaming)
    const partialMatch = cleanText.match(/```[^\n]*\n(?:(?!```)[\s\S])*?"current_phase"[\s\S]*$/);
    if (partialMatch && partialMatch.index !== undefined) {
      cleanText = cleanText.substring(0, partialMatch.index);
    }

    // 3. Fallback: Catch raw JSON without markdown blocks at the very beginning of the message
    if (/^\s*\{[\s\S]*?"current_phase"/.test(cleanText)) {
      const lastBrace = cleanText.lastIndexOf('}');
      if (lastBrace !== -1) {
        cleanText = cleanText.substring(lastBrace + 1);
      } else {
        cleanText = ''; // streaming partial raw JSON
      }
    } else if (/^\s*\{/.test(cleanText) && !cleanText.includes('}')) {
      // Streaming partial raw JSON that hasn't revealed "current_phase" yet.
      // Hides the ugly `{\n  "` from the UI while the agent is "Thinking..."
      cleanText = '';
    }

    // 4. Normalize escaped newlines: some APIs return literal \\n instead of actual newlines
    cleanText = cleanText.replace(/\\n/g, '\n');

    return cleanText.trimStart();
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
    switch (message.payload.command) {
      case MESSAGES.SEND_MESSAGE:
        return this.handleSendMessage(message.payload.data);
      case MESSAGES.LOAD_INIT:
        return this.handleLoadInit();
      case MESSAGES.SELECT_FILES:
        return this.handleSelectFiles();
      case MESSAGES.SAVE_SESSION:
        return this.handleSaveSession(message.payload.data);
      case MESSAGES.LOAD_SESSION:
        return this.handleLoadSession(message.payload.data);
      case MESSAGES.LIST_SESSIONS:
        return this.handleListSessions();
      case MESSAGES.DELETE_SESSION:
        return this.handleDeleteSession(message.payload.data);
      case MESSAGES.NEW_SESSION:
        return this.handleNewSession();
      case 'ROLES_CHANGED':
        return this.handleRolesChanged();
      case 'OPEN_FILE':
        return this.handleOpenFile(message.payload.data);

      case MESSAGES.GATE_REQUEST:
        return this.handleGateRequest(message.payload.data);
      case MESSAGES.GATE_RESPONSE:
        return this.handleGateResponse(message.payload.data);
      case MESSAGES.WORKFLOW_STATE_UPDATE:
        // If from view (request), fetch and return; if from runtime (push), forward
        if (message.origin === MessageOrigin.View || message.from?.includes('view')) {
          return this.getWorkflowState();
        }
        return this.handleWorkflowStateUpdate(message.payload.data);

      case MESSAGES.LIFECYCLE_PHASES_REQUEST:
        return this.handleLifecyclePhasesRequest(message.payload.data);

      case MESSAGES.SWITCH_STRATEGY:
        return this.handleSwitchStrategy(message.payload.data);

      default:
        return super.listen(message);
    }
  }

  private async handleSendMessage(data: { text: string, agentRole: string, modelId?: string, history?: Array<{ role: string, text: string }>, attachments?: Array<{ _title: string, _path: string }> }): Promise<any> {
    let role = data.agentRole || 'backend';

    // Detect slash commands — trigger workflow start and prompt the workflow's owner
    // Only match short commands like /init, /phase-1-brief — NOT file paths like /Users/...
    const textTrimmed = data.text.trim();
    const slashToken = textTrimmed.split(' ')[0]; // e.g. "/init" or "/Users/milos/..."
    const isSlashCommand = textTrimmed.startsWith('/') && !slashToken.includes('/', 1);
    if (isSlashCommand) {
      const commandId = slashToken.substring(1); // e.g. "/init" -> "init"

      // New task = fresh language selection
      if (commandId === 'init') {
        this.conversationLanguage = null;
        this.vscodeContext.workspaceState.update(ChatBackground.LANGUAGE_KEY, undefined);
        this.log('Language reset for new task');
      }

      const initResult = await this.handleWorkflowCommand(commandId);

      if (!initResult.success) {
        return initResult; // Stop if init failed
      }

      // Override text and role to have the workflow owner explain the workflow
      if (initResult.owner) {
        role = initResult.owner;
      }

      data.text = workflowStartPrompt(commandId);
    }

    // Workflow transitions are handled by handleGateResponse — no hardcoded logic here.
    // The LLM detects gate completion, presents A2UI gate confirmation, user validates, extension transitions.

    this.log(`Message for role "${role}": ${data.text.substring(0, 50)}...`);

    // Detect language selection from user messages or A2UI responses
    // Matches: "Español", "language: Español", "idioma: español", etc.
    const textLower = data.text.toLowerCase();
    if (!this.conversationLanguage) {
      if (/español|spanish/i.test(textLower)) {
        this.conversationLanguage = 'es';
        this.vscodeContext.workspaceState.update(ChatBackground.LANGUAGE_KEY, 'es');
        this.log('Language detected: Spanish');
      } else if (/\benglish\b|inglés/i.test(textLower)) {
        this.conversationLanguage = 'en';
        this.vscodeContext.workspaceState.update(ChatBackground.LANGUAGE_KEY, 'en');
        this.log('Language detected: English');
      }
    }


    try {
      // 1. Fetch settings + roles + bindings in PARALLEL (saves ~500ms vs sequential)
      const [settingsResponse, rolesResponse, bindingsResponse] = await Promise.all([
        this.sendMessage('settings', SETTINGS_MESSAGES.GET_REQUEST),
        this.sendMessage('settings', SETTINGS_MESSAGES.GET_ROLES),
        this.sendMessage('settings', SETTINGS_MESSAGES.GET_BINDING),
      ]);

      let modelName = DEFAULT_MODELS.GEMINI;
      let apiKey = null;
      let provider = 'gemini';
      let roleConfig: any = null;

      if (settingsResponse && settingsResponse.success && settingsResponse.models) {
        const models = settingsResponse.models;

        // 2. Determine model routing context: "routing" (fast) vs "default" (thinking)
        const taskType = await this.resolveTaskType(data.text);

        // 3. Resolve model for this agent role via multiple sources (priority order):
        //    a) Role definition `models: { default, routing }` (new schema — task-aware routing)
        //    b) VS Code settings bindings (roleBindings — static per-role override)
        //    c) Role definition `model: { id }` (legacy single model)
        roleConfig = rolesResponse?.roles?.find((r: any) => r.name === role);
        let boundModelId: string | undefined;

        // Priority 1: Task-aware routing via `models: { default, routing }`
        if (roleConfig?.models) {
          const routedModel = taskType === 'routing'
            ? (roleConfig.models.routing || roleConfig.models.default)
            : roleConfig.models.default;
          if (routedModel) {
            boundModelId = routedModel;
            this.log(`Model routing: taskType=${taskType}, resolved=${routedModel}`);
          }
        }

        // Priority 2: VS Code settings bindings (static per-role override)
        if (!boundModelId) {
          const bindings = bindingsResponse?.bindings || {};
          boundModelId = bindings[role] || data.modelId;
        }

        // Priority 3: Legacy single model config from role frontmatter
        if (!boundModelId && roleConfig?.model?.id) {
          boundModelId = roleConfig.model.id;
          if (roleConfig.model.provider) {
            provider = roleConfig.model.provider;
          }
        }

        // Lookup by config UUID first, then by API model name (modelName), then by display name
        const config = boundModelId
          ? models.find((m: any) => m.id === boundModelId)
          || models.find((m: any) => m.modelName === boundModelId)
          || models.find((m: any) => m.name === boundModelId)
          : models.find((m: any) => Boolean(m.active));

        if (config) {
          apiKey = config.apiKey || null;
          provider = config.provider || provider || 'gemini';
          modelName = config.modelName || config.name || DEFAULT_MODELS.GEMINI;
        } else if (boundModelId) {
          // No config match found — use boundModelId directly as model name
          // This happens when the role specifies a model not in the Settings list
          modelName = boundModelId;
          this.log(`No config match for "${boundModelId}", using as direct model name`);
        }

        // Fallback: if no API key found, try any model with same provider that has a key
        if (!apiKey && provider) {
          const fallback = models.find((m: any) => m.provider === provider && m.apiKey);
          if (fallback) {
            apiKey = fallback.apiKey;
            this.log(`API key resolved via provider fallback (${provider})`);
          }
        }
      }

      this.log(`Resolved model for ${role}: ${modelName} (provider: ${provider})`);

      // 3. Build AgenticContext for dynamic instructions
      const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';

      // Load role persona + workflow status in PARALLEL
      const [rolePersona, rawWorkflowState] = await Promise.all([
        (async () => {
          if (!workspacePath) { return ''; }
          try {
            const fs = await import('fs/promises');
            const rolePath = path.join(workspacePath, '.agent', 'rules', 'roles', `${role}.md`);
            const content = await fs.readFile(rolePath, 'utf-8');
            this.log(`Loaded role persona for "${role}" (${content.length} chars)`);
            return content;
          } catch {
            this.log(`No role file found for "${role}", using default persona`);
            return '';
          }
        })(),
        this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_STATUS).catch(() => null),
      ]);

      // Prepend preamble + A2UI (static first for prefix caching), then role persona (semi-static), then dynamic state
      const workspaceFolderName = vscode.workspace.workspaceFolders?.[0]?.name || 'project';
      let fullPersona = behavioralPreamble(workspaceFolderName, this.conversationLanguage)
        + A2UI_INSTRUCTIONS
        + '\n\n' + rolePersona
        + (this.conversationLanguage
          ? `\n\n### PRE-ESTABLISHED STATE\n- Conversation language: **${this.conversationLanguage === 'es' ? 'Español' : 'English'}** (already confirmed by the user — do NOT ask again, skip any workflow step about language selection)\n`
          : '');

      // 4. Build workflow snapshot for context
      let workflowSnapshot: any = null;
      let constitutionContents: string[] = [];
      try {
        const workflowState = rawWorkflowState?.result || rawWorkflowState;
        if (workflowState?.workflow) {
          const wf = workflowState.workflow;
          workflowSnapshot = {
            id: wf.id || workflowState.currentWorkflowId,
            status: workflowState.status,
            owner: wf.owner,
            // Only structured data — rawContent excluded to reduce prompt size
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
          this.log(`Injected workflow context (${workflowState.currentPhaseId || wf.id}) into LLM instructions`);



          // 5. Load constitution files referenced in the workflow
          const constitutionRefs: string[] = wf.constitutions || [];
          if (constitutionRefs.length > 0 && workspacePath) {
            const fs = await import('fs/promises');
            const baseDir = path.join(workspacePath, '.agent', 'rules', 'constitution');

            let aliasMap: Record<string, string> = {};
            try {
              const indexContent = await fs.readFile(path.join(baseDir, 'index.md'), 'utf-8');
              const aliasRegex = /^\s+(\w+):\s+(.+\.md)\s*$/gm;
              let aliasMatch;
              while ((aliasMatch = aliasRegex.exec(indexContent)) !== null) {
                aliasMap[aliasMatch[1]] = aliasMatch[2];
              }
            } catch { /* no index file */ }

            for (const ref of constitutionRefs) {
              let loaded = false;

              // Case 1: Direct file path (starts with .agent/ or /)
              if (ref.startsWith('.agent/') || ref.startsWith('/')) {
                const directPath = ref.startsWith('/')
                  ? ref
                  : path.join(workspacePath, ref);
                try {
                  const content = await fs.readFile(directPath, 'utf-8');
                  constitutionContents.push(`\n### ${ref}\n${content}`);
                  this.log(`Loaded constitution: ${ref} (direct path, ${content.length} chars)`);
                  loaded = true;
                } catch { /* file not found */ }
              }

              // Case 2: Alias pattern (constitution.X)
              if (!loaded) {
                const aliasName = ref.replace(/^constitution\./, '');

                if (aliasMap[aliasName]) {
                  const resolvedPath = path.join(workspacePath, aliasMap[aliasName]);
                  try {
                    const content = await fs.readFile(resolvedPath, 'utf-8');
                    constitutionContents.push(`\n### ${ref}\n${content}`);
                    this.log(`Loaded constitution: ${ref} via index (${content.length} chars)`);
                    loaded = true;
                  } catch { /* not found via index */ }
                }
              }

              // Case 3: Fallback candidate paths
              if (!loaded) {
                const aliasName = ref.replace(/^constitution\./, '');
                const candidates = [
                  aliasName.replace(/_/g, '-') + '.md',
                  aliasName.replace(/_/g, '.') + '.md',
                  aliasName.replace(/_/g, '-') + '/index.md',
                  aliasName + '.md',
                ];

                for (const candidate of candidates) {
                  try {
                    const content = await fs.readFile(path.join(baseDir, candidate), 'utf-8');
                    constitutionContents.push(`\n### ${ref}\n${content}`);
                    this.log(`Loaded constitution: ${ref} → ${candidate} (${content.length} chars)`);
                    loaded = true;
                    break;
                  } catch { /* try next */ }
                }
              }

              if (!loaded) {
                this.log(`Constitution not resolved: ${ref}`);
              }
            }
          }
        }
      } catch (err: any) {
        this.log(`Could not fetch workflow state for LLM context: ${err.message}`);
      }

      // 5b. Load agent-level context (from role's context: [] frontmatter)
      if (roleConfig?.context && Array.isArray(roleConfig.context) && roleConfig.context.length > 0 && workspacePath) {
        const fs = await import('fs/promises');
        const baseDir = path.join(workspacePath, '.agent', 'rules', 'constitution');

        for (const ref of roleConfig.context) {
          // Check if already loaded from workflow constitutions
          if (constitutionContents.some(c => c.includes(`### ${ref}`))) {
            this.log(`Agent context already loaded (from workflow): ${ref}`);
            continue;
          }

          let loaded = false;

          // Case 1: Direct file path
          if (ref.startsWith('.agent/') || ref.startsWith('/')) {
            const directPath = ref.startsWith('/') ? ref : path.join(workspacePath, ref);
            try {
              const content = await fs.readFile(directPath, 'utf-8');
              constitutionContents.push(`\n### ${ref}\n${content}`);
              this.log(`Loaded agent context: ${ref} (direct path, ${content.length} chars)`);
              loaded = true;
            } catch { /* file not found */ }
          }

          // Case 2: Alias pattern (constitution.X)
          if (!loaded && ref.startsWith('constitution.')) {
            const aliasName = ref.replace(/^constitution\./, '');
            const candidates = [
              aliasName.replace(/_/g, '-') + '.md',
              aliasName + '.md',
              aliasName.replace(/_/g, '-') + '/index.md',
            ];
            for (const candidate of candidates) {
              try {
                const content = await fs.readFile(path.join(baseDir, candidate), 'utf-8');
                constitutionContents.push(`\n### ${ref}\n${content}`);
                this.log(`Loaded agent context: ${ref} → ${candidate} (${content.length} chars)`);
                loaded = true;
                break;
              } catch { /* try next */ }
            }
          }

          if (!loaded) {
            this.log(`Agent context not resolved: ${ref}`);
          }
        }
      }

      // 6. Build conversation messages as multi-turn array
      const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];
      if (data.history && data.history.length > 0) {
        for (const msg of data.history) {
          const turnRole = msg.role === 'user' ? 'user' as const : 'assistant' as const;
          messages.push({ role: turnRole, content: msg.text });
        }
      }
      // Add current message as last user turn
      messages.push({ role: 'user', content: data.text });

      // 7. Build progress summary from conversation history
      // Extract user decisions so the LLM knows which workflow steps are completed
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

      // Inject progress into the workflow persona if there are completed decisions
      if (decisions.length > 0) {
        const progressNote = `\n\n### WORKFLOW PROGRESS (DO NOT repeat these steps)\nThe following decisions are ALREADY confirmed by the user:\n${decisions.join('\n')}\n\nStart from the FIRST incomplete step. If all steps before the Gate are done, present the Gate evaluation immediately.\n`;
        fullPersona += progressNote;
        this.log(`Injected ${decisions.length} completed decisions into prompt`);
      }

      // 7. Build AgenticContext
      const agenticContext = {
        workspacePath,
        role,
        language: (this.conversationLanguage as 'es' | 'en' | null) || null,
        workflow: workflowSnapshot,
        constitutions: constitutionContents,
        rolePersona: fullPersona,
        skills: [], // TODO: Task 4 — load from .agent/skills/
        accessLevel: 'sandbox' as const,
        apiKey: apiKey || undefined,
        provider,
      };

      // Create request payload with new AgenticContext mode
      const payload = {
        role,
        messages,
        agenticContext,
        binding: { [role]: modelName },
        apiKey,
        provider,
        context: data.attachments ? data.attachments.map(att => ({ title: att._title, url: att._path })) : []
      };

      const url = `${SIDECAR_BASE_URL}${API_ENDPOINTS.STREAM}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Sidecar HTTP error: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No stream available from sidecar');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamText = '';
      let jsonSkeletonSent = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr.trim() === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                this.emitAgentResponse(role, `**Error:** ${parsed.error}`);
                return { success: false, error: parsed.error };
              }

              if (parsed.type === 'content') {
                streamText += parsed.content;
                // Detect JSON mode: if response starts with '{', it's structured JSON
                // Don't show raw JSON to the user — wait for completion to parse
                const isJsonMode = streamText.trimStart().startsWith('{');
                if (!isJsonMode) {
                  // Plain text mode: stream normally
                  this.messenger.emit({
                    id: randomUUID(),
                    from: `${NAME}::background`,
                    to: `${NAME}::view`,
                    timestamp: Date.now(),
                    origin: MessageOrigin.Server,
                    payload: {
                      command: MESSAGES.RECEIVE_MESSAGE,
                      data: { text: this.cleanMessageText(streamText), agentRole: role, isStreaming: true }
                    }
                  });
                } else if (!jsonSkeletonSent) {
                  // JSON mode: send skeleton indicator once
                  jsonSkeletonSent = true;
                  this.log(`JSON mode detected — sending skeleton (streamText starts: "${streamText.substring(0, 20)}...")`);
                  this.messenger.emit({
                    id: randomUUID(),
                    from: `${NAME}::background`,
                    to: `${NAME}::view`,
                    timestamp: Date.now(),
                    origin: MessageOrigin.Server,
                    payload: {
                      command: MESSAGES.RECEIVE_MESSAGE,
                      data: { text: '', agentRole: role, isStreaming: true, showSkeleton: true }
                    }
                  });
                }
                // JSON mode with skeleton sent: silently accumulate
              } else if (parsed.type === 'tool_call' || parsed.type === 'tool_result') {
                // Detect delegation events and emit them separately
                const isDelegation = parsed.name === 'delegateTask';
                if (isDelegation) {
                  this.messenger.emit({
                    id: randomUUID(),
                    from: `${NAME}::background`,
                    to: `${NAME}::view`,
                    timestamp: Date.now(),
                    origin: MessageOrigin.Server,
                    payload: {
                      command: MESSAGES.DELEGATION_EVENT,
                      data: {
                        type: parsed.type, // 'tool_call' or 'tool_result'
                        agentRole: role,
                        targetAgent: parsed.type === 'tool_call' ? this.parseDelegationArgs(parsed.arguments)?.agent : undefined,
                        taskDescription: parsed.type === 'tool_call' ? this.parseDelegationArgs(parsed.arguments)?.task : undefined,
                        result: parsed.type === 'tool_result' ? parsed.output : undefined,
                        status: parsed.type === 'tool_call' ? 'pending' : 'completed',
                      }
                    }
                  });
                }
                // Also emit as regular tool event for the streaming view
                this.messenger.emit({
                  id: randomUUID(),
                  from: `${NAME}::background`,
                  to: `${NAME}::view`,
                  timestamp: Date.now(),
                  origin: MessageOrigin.Server,
                  payload: {
                    command: MESSAGES.RECEIVE_MESSAGE,
                    data: {
                      text: '',
                      agentRole: role,
                      isStreaming: true,
                      toolEvent: parsed,
                    }
                  }
                });
              } else if (parsed.type === 'usage') {
                // Forward token usage to the View for display
                this.messenger.emit({
                  id: randomUUID(),
                  from: `${NAME}::background`,
                  to: `${NAME}::view`,
                  timestamp: Date.now(),
                  origin: MessageOrigin.Server,
                  payload: {
                    command: MESSAGES.USAGE_UPDATE,
                    data: {
                      model: parsed.model,
                      provider: parsed.provider,
                      role: parsed.role,
                      inputTokens: parsed.inputTokens || 0,
                      outputTokens: parsed.outputTokens || 0,
                      totalTokens: parsed.totalTokens || 0,
                    }
                  }
                });
              }
            } catch (e) {
              // Ignore partial chunk JSON parse errors
            }
          }
        }
      }

      // Try to parse as structured JSON response (Zod-validated)
      let structured = tryParseStructuredResponse(streamText);

      // If JSON-like but validation failed, retry once with a correction request
      if (!structured && streamText.trimStart().startsWith('{')) {
        this.log('Structured response validation failed, retrying with correction prompt...');

        // Append a correction message to the conversation
        const retryMessages = [
          ...messages,
          { role: 'assistant' as const, content: streamText },
          { role: 'user' as const, content: 'Your previous response was invalid JSON (likely truncated). Please respond again with ONLY a valid, complete JSON object matching the response schema. Keep the text short and include all ui_intent components. Do NOT wrap in code fences.' },
        ];

        const retryPayload = { ...payload, messages: retryMessages };
        try {
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(retryPayload),
          });

          if (retryResponse.ok && retryResponse.body) {
            const retryReader = retryResponse.body.getReader();
            const retryDecoder = new TextDecoder();
            let retryText = '';

            while (true) {
              const { done, value } = await retryReader.read();
              if (done) { break; }
              const chunk = retryDecoder.decode(value, { stream: true });
              for (const line of chunk.split('\n')) {
                if (line.startsWith('data: ')) {
                  const d = line.slice(6).trim();
                  if (d === '[DONE]') { continue; }
                  try {
                    const p = JSON.parse(d);
                    if (p.type === 'content') { retryText += p.content; }
                  } catch { /* skip */ }
                }
              }
            }

            const retryStructured = tryParseStructuredResponse(retryText);
            if (retryStructured) {
              this.log('Retry succeeded — structured response validated');
              structured = retryStructured;
            } else {
              this.log('Retry also failed — falling back to error message');
            }
          }
        } catch (retryErr: any) {
          this.log('Retry request failed:', retryErr.message);
        }
      }

      let displayText: string;

      if (structured) {
        this.log(`Structured response validated: text=${structured.text.length} chars, ui_intent=${structured.ui_intent?.length || 0} components`);
        // Use the validated text field
        displayText = structured.text;

        // Forward workflow_state if present
        if (structured.workflow_state) {
          this.messenger.emit({
            id: randomUUID(),
            from: `${NAME}::background`,
            to: `${NAME}::view`,
            timestamp: Date.now(),
            origin: MessageOrigin.Server,
            payload: {
              command: MESSAGES.WORKFLOW_STATE_UPDATE,
              data: structured.workflow_state,
            }
          });
        }

        // Convert ui_intent to legacy a2ui format for backward-compatible rendering
        if (structured.ui_intent && structured.ui_intent.length > 0) {
          const a2uiBlocks = structured.ui_intent.map(c => {
            if (c.type === 'artifact') {
              return `<a2ui type="${c.type}" id="${c.id}" label="${c.label}"${c.path ? ` path="${c.path}"` : ''}>${c.content || ''}</a2ui>`;
            }
            const optionLines = (c.options || []).map((opt, i) =>
              i === c.preselected ? `- [x] ${opt}` : `- [ ] ${opt}`
            ).join('\n');
            return `<a2ui type="${c.type}" id="${c.id}" label="${c.label}">\n${optionLines}\n</a2ui>`;
          });
          displayText = displayText + '\n\n' + a2uiBlocks.join('\n\n');
        }
      } else if (streamText.trimStart().startsWith('{')) {
        // JSON mode but all parsing/retry failed — show system error
        this.log('All structured response attempts failed — showing error');
        displayText = `**⚠️ System Error:** The model returned an invalid response format. Please try again.\n\n> The response could not be parsed as structured JSON. This may be due to the model running out of output tokens.`;
      } else {
        // Fallback: treat as plain text (legacy a2ui tags will be parsed by the view)
        displayText = streamText;
      }

      // Process artifacts: create physical files and replace content with summary
      const finalText = this.cleanMessageText(displayText);
      const processedText = await this.processArtifacts(finalText);

      // Send final completion message
      this.messenger.emit({
        id: randomUUID(),
        from: `${NAME}::background`,
        to: `${NAME}::view`,
        timestamp: Date.now(),
        origin: MessageOrigin.Server,
        payload: {
          command: MESSAGES.RECEIVE_MESSAGE,
          data: { text: processedText, agentRole: role, isStreaming: false }
        }
      });

      return { success: true };

    } catch (error: any) {
      this.log('Failed to stream from sidecar', error);
      this.emitAgentResponse(role, `**System Error:** ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  private async handleLoadInit(): Promise<any> {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        return { error: 'No workspace open' };
      }

      const rootPath = workspaceFolders[0].uri.fsPath;
      const initPath = vscode.Uri.file(path.join(rootPath, '.agent', 'workflows', 'init.md'));

      const content = await vscode.workspace.fs.readFile(initPath);

      // Read package.json for version
      const packageJsonPath = vscode.Uri.joinPath(this._extensionUri, 'package.json');
      const packageJson = JSON.parse((await vscode.workspace.fs.readFile(packageJsonPath)).toString());

      return { success: true, content: content.toString(), version: packageJson.version };
    } catch (error) {
      this.log('Error loading init.md', error);
      return { error: 'Failed to load init.md' };
    }
  }

  private async handleSelectFiles(): Promise<any> {
    const files = await vscode.window.showOpenDialog({
      canSelectMany: true,
      openLabel: 'Attach',
      filters: {
        'Code Files': ['ts', 'js', 'json', 'md', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'go', 'rs', 'php', 'html', 'css', 'scss', 'xml', 'yaml', 'yml', 'sql', 'txt']
      }
    });

    if (files && files.length > 0) {
      this.messenger.emit({
        id: randomUUID(),
        from: `${NAME}::background`,
        to: `${NAME}::view`,
        timestamp: Date.now(),
        origin: MessageOrigin.Server,
        payload: {
          command: MESSAGES.SELECT_FILES_RESPONSE,
          data: { files: files.map(f => f.fsPath) }
        }
      });
    }
    return { success: true };
  }

  /**
   * Process artifact A2UI blocks in the final message text.
   * Creates physical files on disk and replaces artifact content with a brief summary.
   */
  private async processArtifacts(text: string): Promise<string> {
    const artifactRegex = /<a2ui\s+([^>]*)type="artifact"([^>]*)>([\s\S]*?)<\/a2ui>/gi;
    let result = text;
    let match;

    // Collect all artifact matches first (to avoid regex state issues)
    const artifacts: Array<{ fullMatch: string; attrs: string; content: string }> = [];
    while ((match = artifactRegex.exec(text)) !== null) {
      artifacts.push({
        fullMatch: match[0],
        attrs: match[1] + match[2],
        content: match[3].trim(),
      });
    }

    if (artifacts.length === 0) { return text; }

    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspacePath) { return text; }

    const fs = await import('fs/promises');

    for (const artifact of artifacts) {
      const pathMatch = artifact.attrs.match(/path="([^"]+)"/);
      const labelMatch = artifact.attrs.match(/label="([^"]+)"/);
      const idMatch = artifact.attrs.match(/id="([^"]+)"/);

      if (!pathMatch) { continue; }

      const artifactPath = pathMatch[1];
      const label = labelMatch?.[1] || artifactPath.split('/').pop() || 'Document';
      const id = idMatch?.[1] || `artifact-${Date.now()}`;

      // Resolve absolute path
      const absolutePath = path.isAbsolute(artifactPath)
        ? artifactPath
        : path.join(workspacePath, artifactPath);

      // Create directory if needed
      try {
        await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      } catch { /* directory exists */ }

      // Write the artifact file
      try {
        await fs.writeFile(absolutePath, artifact.content, 'utf-8');
        this.log(`Artifact created: ${artifactPath} (${artifact.content.length} chars)`);
      } catch (err: any) {
        this.log(`Failed to create artifact ${artifactPath}: ${err.message}`);
        continue;
      }

      // Detect purely internal bootstrap artifacts that don't need developer review.
      // Review artifacts (analysis, planning, acceptance, etc.) MUST remain visible
      // so the developer can inspect them before approving the gate.
      const fileName = path.basename(artifactPath);
      const INTERNAL_ARTIFACTS = ['init.md', 'task.md'];
      const isInternalArtifact = (artifactPath.startsWith('.agent/') || absolutePath.includes('/.agent/'))
        && INTERNAL_ARTIFACTS.includes(fileName);

      if (isInternalArtifact) {
        // Internal bootstrap artifact: replace with brief inline notification (no card)
        const inlineNotice = `\n> ✅ **${fileName}** created\n`;
        result = result.replace(artifact.fullMatch, inlineNotice);
        this.log(`Internal artifact (hidden from chat): ${artifactPath}`);
      } else {
        // Review/user-facing artifact: show card with summary and Open button.
        // IMPORTANT: The summary stored in the message must NOT include visual hints
        // like "... click to view full document" — those are for the renderer only.
        // If the LLM sees that text in its context, it copies it into the next artifact.
        const lines = artifact.content.split('\n').filter(l => l.trim().length > 0);
        const summaryLines = lines.slice(0, 5);
        const summary = summaryLines.join('\n');

        const summaryBlock = `<a2ui type="artifact" id="${id}" label="${label}" path="${artifactPath}">\n${summary}\n</a2ui>`;
        result = result.replace(artifact.fullMatch, summaryBlock);
      }
    }

    return result;
  }

  /**
   * Open a file in VS Code editor from a chat file link.
   */
  private async handleOpenFile(data: { path: string }): Promise<any> {
    try {
      const filePath = data.path;
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) { return { success: false, error: 'No workspace' }; }

      const wsRoot = workspaceFolders[0].uri.fsPath;

      // Build candidate paths in priority order
      const candidates: string[] = [];

      if (path.isAbsolute(filePath)) {
        candidates.push(filePath);
      } else {
        // 1. Direct path relative to workspace
        candidates.push(path.join(wsRoot, filePath));
        // 2. Prepend .agent/ (LLM often says "artifacts/..." instead of ".agent/artifacts/...")
        candidates.push(path.join(wsRoot, '.agent', filePath));
        // 3. Just the filename in .agent/artifacts/
        const basename = path.basename(filePath);
        candidates.push(path.join(wsRoot, '.agent', 'artifacts', '**', basename));
      }

      // Try direct candidates first
      for (const candidate of candidates) {
        if (!candidate.includes('*')) {
          try {
            const uri = vscode.Uri.file(candidate);
            const doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc, { preview: true });
            return { success: true };
          } catch {
            // Try next candidate
          }
        }
      }

      // Fallback: glob search for the filename in the workspace
      const basename = path.basename(filePath);
      const globPattern = new vscode.RelativePattern(wsRoot, `**/${basename}`);
      const found = await vscode.workspace.findFiles(globPattern, '**/node_modules/**', 1);
      if (found.length > 0) {
        const doc = await vscode.workspace.openTextDocument(found[0]);
        await vscode.window.showTextDocument(doc, { preview: true });
        return { success: true };
      }

      this.log(`File not found: ${filePath} (tried ${candidates.length} candidates + glob)`);
      return { success: false, error: `File not found: ${filePath}` };
    } catch (err: any) {
      this.log(`Failed to open file: ${err.message}`);
      return { success: false, error: err.message };
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
      this.log(`→ WORKFLOW_STATUS`, state ? `workflowId=${state.currentWorkflowId}, status=${state.status}` : 'null');
      return state;
    } catch (err: any) {
      this.log(`→ WORKFLOW_STATUS failed: ${err?.message}`);
      return null;
    }
  }

  /**
   * Read lifecycle phases dynamically from the workflow directory.
   * Source of truth: .agent/workflows/tasklifecycle-{long|short}/*.md
   */
  private async handleLifecyclePhasesRequest(data: { strategy: string }): Promise<any> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) { return { phases: [] }; }

    const strategy = data.strategy || 'long';
    const dirName = `tasklifecycle-${strategy}`;
    const dirPath = vscode.Uri.joinPath(workspaceFolders[0].uri, '.agent', 'workflows', dirName);

    try {
      const fs = await import('fs/promises');
      const entries = await fs.readdir(dirPath.fsPath);
      const mdFiles = entries
        .filter((f: string) => f.endsWith('.md') && /phase-\d+/.test(f))
        .sort();

      const phases = mdFiles.map((filename: string) => {
        const id = filename.replace('.md', '');
        const labelPart = id
          .replace(/^(short-)?phase-\d+-/, '')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        return { id, label: labelPart };
      });

      this.log(`Loaded ${phases.length} phases for ${strategy}: ${phases.map(p => p.id).join(', ')}`);
      return { strategy, phases };
    } catch (err: any) {
      this.log(`Failed to read lifecycle phases for ${strategy}: ${err.message}`);
      return { strategy, phases: [] };
    }
  }

  /**
   * Create init.md artifact for the init workflow gate.
   */
  // createInitArtifact removed — LLM is responsible for creating artifacts via tools.
  // The extension only interprets the workflow schema (gates, pass, fail).

  /**
   * Handle roles changed notification from Settings background.
   * Fetches fresh roles and pushes them to Chat view.
   */
  private async handleRolesChanged(): Promise<any> {
    try {
      const result = await this.sendMessage('settings', SETTINGS_MESSAGES.GET_ROLES);
      if (result?.success && result.roles) {
        this.messenger.emit({
          id: randomUUID(),
          from: `${NAME}::background`,
          to: `${NAME}::view`,
          timestamp: Date.now(),
          origin: MessageOrigin.Server,
          payload: {
            command: 'REFRESH_AGENTS',
            data: { agents: result.roles }
          }
        });
      }
    } catch (error) {
      this.log('Error handling roles changed', error);
    }
    return { success: true };
  }

  /**
   * Format conversation history + current message into a single input string.
   * Gives the LLM memory of the conversation so it can recall names, topics, etc.
   */
  private formatInputWithHistory(currentText: string, history?: Array<{ role: string, text: string }>): string {
    if (!history || history.length <= 1) {
      return currentText;
    }

    // Format previous messages (exclude the last one which is the current message)
    const previousMessages = history.slice(0, -1)
      .filter(m => m.text && m.text.trim())
      .map(m => {
        const label = m.role === 'user' ? 'User' : m.role.charAt(0).toUpperCase() + m.role.slice(1);
        return `${label}: ${m.text}`;
      })
      .join('\n');

    if (!previousMessages) {
      return currentText;
    }

    return `[Conversation history]\n${previousMessages}\n\n[Current message]\nUser: ${currentText}`;
  }

  protected getHtmlForWebview(webview: vscode.Webview): string {
    const scriptPath = 'dist/extension/modules/chat/view/index.js';
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath, this.appVersion);
  }

  private emitStatus(status: string) {
    this.messenger.emit({
      id: randomUUID(),
      from: `${NAME}::background`,
      to: `${NAME}::view`,
      timestamp: Date.now(),
      origin: MessageOrigin.Server,
      payload: {
        command: 'AGENT_STATUS',
        data: { status }
      }
    });
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
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceRoot) {
        this.emitAgentResponse('system', '**Error:** No workspace open');
        return { success: false, error: 'No workspace open' };
      }

      // Auto-create new session if there's existing history
      this.emitToView('NEW_SESSION_AUTO', {});

      const rawResult = await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_START, {
        workflowId: commandId,
        taskId: `task-${Date.now()}`,
        dirPath: `${workspaceRoot}/.agent/workflows`,
      }, 45_000);

      // Unwrap the nested result from the sidecar JSON RPC format
      const result = rawResult?.result || rawResult;

      // Clean owner name ('architect-agent' -> 'architect') so it matches personas and routing
      const owner = result?.owner ? result.owner.replace(/-agent$/, '') : undefined;

      return { success: true, owner, workflowId: result?.workflowId || commandId };
    } catch (error: any) {
      this.log('Failed to start workflow', error);
      this.emitAgentResponse('system', `**Error starting workflow:** ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  private async handleGateRequest(data: any): Promise<any> {
    this.log('Gate request received', data);
    this.emitToView(MESSAGES.GATE_REQUEST, data);
    return { success: true };
  }

  private async handleGateResponse(data: any): Promise<any> {
    try {
      this.log('Gate response from user', JSON.stringify(data));

      // 1. Read current workflow state to get pass target BEFORE sending gate response
      const workflowState = await this.getWorkflowState();
      const passTarget = workflowState?.workflow?.pass?.nextTarget;
      const strategy = data.strategy || (workflowState?.workflow?.id?.includes('short') ? 'short' : 'long');

      // 2. Advance workflow: step complete → gate approve/reject
      if (data.decision === 'SI') {
        try {
          await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_STEP_COMPLETE);
        } catch { /* step may already be at gate */ }
        await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_GATE_RESPONSE, {
          gateId: data.gateId || 'gate',
          decision: 'SI',
        });
        this.log(`Gate approved. passTarget=${passTarget}`);

        // 3. Auto-transition to next workflow via passTarget (data-driven)
        if (passTarget) {
          // passTarget formats (from YAML frontmatter):
          //   - Simple: "tasklifecycle-long"
          //   - Conditional: "long:tasklifecycle-long | short:tasklifecycle-short"
          let nextWorkflowId: string;
          const targets = passTarget.split('|').map((t: string) => t.trim());

          if (targets[0].includes(':')) {
            // Conditional map: resolve by strategy key
            const targetMap = new Map(
              targets.map((t: string) => {
                const [key, val] = t.split(':').map(s => s.trim());
                return [key, val] as [string, string];
              })
            );
            nextWorkflowId = targetMap.get(strategy) || targetMap.values().next().value || targets[0];
          } else {
            // Simple string or legacy format: pick by strategy match
            nextWorkflowId = targets.find((t: string) => t.includes(strategy)) || targets[0];
          }

          // Clean any legacy workflow./workflows. prefix if present
          const cleanId = nextWorkflowId.replace(/^workflows?\./, '');
          this.log(`Auto-transitioning to next workflow: ${cleanId} (strategy: ${strategy})`);
          try {
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_START, {
              workflowId: cleanId,
              taskId: data.taskTitle || 'task',
              strategy,
              dirPath: workspaceRoot ? `${workspaceRoot}/.agent/workflows` : undefined,
            });
            this.log(`Successfully started next workflow: ${cleanId}`);

            // Auto-kickoff: tell the view to send a silent message to start the new phase
            // Small delay to let the engine state settle before the view queries it
            setTimeout(() => {
              this.emitToView(MESSAGES.PHASE_AUTO_START, {
                phaseId: cleanId,
                owner: workflowState.workflow?.owner?.replace(/-agent$/, '') || 'architect',
              });
              this.log(`Emitted PHASE_AUTO_START for ${cleanId}`);
            }, 500);
          } catch (err: any) {
            this.log(`Failed to start next workflow: ${err.message}`);
          }
        } else {
          // No explicit passTarget — could be a lifecycle phase gate (engine handles transition)
          // or a simple internal gate (no transition).
          // Wait for the engine to process, then check if phase advanced.
          const previousPhaseId = workflowState?.workflow?.id;
          const gateAnswerText = data.gateAnswerText || 'Gate approved. Continue with the workflow.';

          setTimeout(async () => {
            try {
              const newState = await this.getWorkflowState();
              const newPhaseId = newState?.workflow?.id;

              if (newPhaseId && newPhaseId !== previousPhaseId) {
                // Engine advanced to a new phase — trigger auto-start
                const owner = newState.workflow?.owner?.replace(/-agent$/, '') || 'architect';
                this.emitToView(MESSAGES.PHASE_AUTO_START, {
                  phaseId: newPhaseId,
                  owner,
                });
                this.log(`Phase advanced: ${previousPhaseId} → ${newPhaseId}. Emitted PHASE_AUTO_START`);
              } else {
                // Same phase — internal gate, emit GATE_CONTINUE
                this.emitToView(MESSAGES.GATE_CONTINUE, { gateAnswerText });
                this.log(`Emitted GATE_CONTINUE (no transition, internal gate)`);
              }
            } catch {
              this.emitToView(MESSAGES.GATE_CONTINUE, { gateAnswerText });
              this.log(`Emitted GATE_CONTINUE (fallback after error)`);
            }
          }, 500);
        }
      } else {
        // Gate rejected
        await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_GATE_RESPONSE, {
          gateId: data.gateId || 'gate',
          decision: 'NO',
          reason: data.reason,
        });
        this.log('Gate rejected by user');
      }

      return { success: true };
    } catch (error: any) {
      this.log('Failed to handle gate response', error);
      return { success: false, error: error.message };
    }
  }

  private async handleSwitchStrategy(data: { strategy: 'long' | 'short' }): Promise<any> {
    try {
      const newStrategy = data.strategy;
      this.log(`Switching strategy to: ${newStrategy}`);

      // 1. Call runtime to switch the lifecycle engine
      const rawResult = await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_SWITCH_STRATEGY, {
        strategy: newStrategy,
      }, 15_000);

      const result = rawResult?.result || rawResult;
      this.log(`Strategy switched: ${JSON.stringify(result)}`);

      // 2. Create a new blank session — discard all previous conversation
      await this.handleNewSession();
      this.log('New session created for strategy switch (previous conversation discarded)');

      // 3. Tell the view to reset its local state (clear history, update strategy)
      const strategyLabel = newStrategy === 'long' ? 'Long (9 phases)' : 'Short (3 phases)';
      this.emitToView(MESSAGES.STRATEGY_SWITCHED, {
        strategy: newStrategy,
        label: strategyLabel,
      });

      // 4. Auto-start the first phase of the new lifecycle (after a delay for UI to settle)
      const owner = result?.owner ? result.owner.replace(/-agent$/, '') : 'architect';
      setTimeout(() => {
        this.emitToView(MESSAGES.PHASE_AUTO_START, {
          phaseId: result?.workflowId || newStrategy,
          owner,
        });
        this.log(`Emitted PHASE_AUTO_START for switched strategy: ${newStrategy}`);
      }, 800);

      return { success: true, strategy: newStrategy };
    } catch (error: any) {
      this.log(`Failed to switch strategy: ${error.message}`);
      this.emitAgentResponse('system', `❌ **Error switching strategy:** ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  private async handleWorkflowStateUpdate(data: any): Promise<any> {
    this.log('Workflow state update', data);
    this.emitToView(MESSAGES.WORKFLOW_STATE_UPDATE, data);
    return { success: true };
  }

  private emitToView(command: string, data: any): void {
    this.messenger.emit({
      id: randomUUID(),
      from: `${NAME}::background`,
      to: `${NAME}::view`,
      timestamp: Date.now(),
      origin: MessageOrigin.Server,
      payload: { command, data }
    });
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

  private async handleSaveSession(data: { sessionId?: string, messages: any[], taskTitle?: string, elapsedSeconds?: number, progress?: number, lifecycleStrategy?: string, tokenUsage?: any, accessLevel?: string, securityScore?: number, taskSteps?: any[] }): Promise<any> {
    // Skip saving sessions that have no meaningful content (no user interaction)
    const hasUserInteraction = data.messages.some((m: any) =>
      m.role === 'user' || (m.a2uiAnswers && Object.keys(m.a2uiAnswers).length > 0)
    );
    if (!hasUserInteraction) {
      this.log('Skipping save — no user interaction in session');
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
      lifecycleStrategy: data.lifecycleStrategy || undefined,
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
    this.log(`Session saved: ${id} ("${data.taskTitle || title}")`);
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
      this.log(`Session not found: ${targetId}`);
      return { success: false, error: 'Session not found' };
    }

    await this.setLastSessionId(session.id);

    this.messenger.emit({
      id: randomUUID(),
      from: `${NAME}::background`,
      to: `${NAME}::view`,
      timestamp: Date.now(),
      origin: MessageOrigin.Server,
      payload: {
        command: MESSAGES.LOAD_SESSION_RESPONSE,
        data: { session }
      }
    });

    this.log(`Session loaded: ${session.id} ("${session.title}")`);
    return { success: true };
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

    this.messenger.emit({
      id: randomUUID(),
      from: `${NAME}::background`,
      to: `${NAME}::view`,
      timestamp: Date.now(),
      origin: MessageOrigin.Server,
      payload: {
        command: MESSAGES.LIST_SESSIONS_RESPONSE,
        data: { sessions }
      }
    });

    return { success: true, count: sessions.length };
  }

  private async handleDeleteSession(data: { sessionId: string }): Promise<any> {
    let sessions = this.getSessions();
    sessions = sessions.filter(s => s.id !== data.sessionId);
    await this.saveSessions(sessions);

    const lastId = this.getLastSessionId();
    if (lastId === data.sessionId) {
      await this.setLastSessionId(sessions.length > 0 ? sessions[0].id : null);
    }

    this.log(`Session deleted: ${data.sessionId}`);
    return { success: true };
  }

  private async handleNewSession(): Promise<any> {
    const id = randomUUID();
    await this.setLastSessionId(id);
    this.log(`New session started: ${id}`);
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
