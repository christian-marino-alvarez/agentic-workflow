
import * as vscode from 'vscode';
import * as path from 'path';
import { Background, Message, ViewHtml, MessageOrigin } from '../../core/index.js';
import { NAME, MESSAGES } from '../constants.js';
import { API_ENDPOINTS, SIDECAR_BASE_URL, DEFAULT_MODELS } from '../../llm/constants.js';
import { MESSAGES as SETTINGS_MESSAGES } from '../../settings/constants.js';
import { MESSAGES as RUNTIME_MESSAGES } from '../../runtime/constants.js';
import { behavioralPreamble, workflowStartPrompt, A2UI_INSTRUCTIONS } from '../prompts/index.js';
import { randomUUID } from 'crypto';


export class ChatBackground extends Background {

  /** Matches agent identity prefixes like "🏛️ **architect-agent**:", "🔬 researcher-agent:" etc. */
  private static readonly AGENT_PREFIX_REGEX = /^\s*(?:[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200d\uFE0F]+\s*)?(?:\*{1,2})?\s*\w[\w-]*(?:-agent)?\s*(?:\*{1,2})?\s*:\s*/gmu;
  private static readonly SESSIONS_KEY = 'chat.sessions';
  private static readonly LAST_SESSION_KEY = 'chat.lastSessionId';
  private vscodeContext: vscode.ExtensionContext;


  constructor(context: vscode.ExtensionContext) {
    super(NAME, context.extensionUri, `${NAME}-view`);
    this.vscodeContext = context;
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
    }

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

    // Format conversation history for LLM context
    const inputWithHistory = this.formatInputWithHistory(data.text, data.history);

    try {
      // 1. Fetch available models and API keys from SettingsBackground
      const settingsResponse = await this.sendMessage('settings', SETTINGS_MESSAGES.GET_REQUEST);
      let modelName = DEFAULT_MODELS.GEMINI;
      let apiKey = null;
      let provider = 'gemini';

      if (settingsResponse && settingsResponse.success && settingsResponse.models) {
        const models = settingsResponse.models;

        // 2. Resolve model for this agent role via multiple sources:
        //    a) VS Code settings bindings (roleBindings)
        //    b) Role definition file frontmatter (model.id)
        const bindingsResponse = await this.sendMessage('settings', SETTINGS_MESSAGES.GET_BINDING);
        const bindings = bindingsResponse?.bindings || {};
        let boundModelId = bindings[role] || data.modelId;

        // If no binding, check the role definition file for a model config
        if (!boundModelId) {
          const rolesResponse = await this.sendMessage('settings', SETTINGS_MESSAGES.GET_ROLES);
          if (rolesResponse?.success && rolesResponse.roles) {
            const roleConfig = rolesResponse.roles.find((r: any) => r.name === role);
            if (roleConfig?.model?.id) {
              boundModelId = roleConfig.model.id;
              // Also use provider from role config
              if (roleConfig.model.provider) {
                provider = roleConfig.model.provider;
              }
            }
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

      // 3. Load agent persona from the role definition file
      let instructions: string | undefined;
      // Critical behavioral preamble — placed FIRST so models prioritize it
      const workspaceFolderName = vscode.workspace.workspaceFolders?.[0]?.name || 'project';
      const BEHAVIORAL_PREAMBLE = behavioralPreamble(workspaceFolderName);
      instructions = BEHAVIORAL_PREAMBLE;
      try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
          const fs = await import('fs/promises');

          // Load role persona
          const rolePath = path.join(workspaceFolders[0].uri.fsPath, '.agent', 'rules', 'roles', `${role}.md`);
          try {
            const roleContent = await fs.readFile(rolePath, 'utf-8');
            instructions = (instructions || '') + '\n\n' + roleContent;
            this.log(`Loaded role persona for "${role}" (${roleContent.length} chars)`);
          } catch {
            this.log(`No role file found for "${role}", using default persona`);
          }

          // Inject A2UI interactive component instructions (inline — always available)
          instructions = (instructions || '') + A2UI_INSTRUCTIONS;
        }
      } catch (err: any) {
        this.log(`Failed to load instructions: ${err.message}`);
      }

      // 4. Inject active workflow as context into the LLM instructions
      try {
        const rawWorkflowState = await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_STATUS);
        const workflowState = rawWorkflowState?.result || rawWorkflowState;
        if (workflowState?.workflow) {
          // Build structured context from parsed sections if available
          let phaseContext: string;
          const sections = workflowState.parsedSections;
          const currentPhaseId = workflowState.currentPhaseId || '';
          const phases = workflowState.phases;

          if (sections && currentPhaseId) {
            // Lifecycle workflow with parsed phases — inject structured sections
            const activePhase = phases?.find((p: any) => p.status === 'active');
            phaseContext = [
              `\n\n---\n## ACTIVE PHASE: ${activePhase?.label || currentPhaseId}`,
              `**Owner**: ${activePhase?.owner || workflowState.workflow.owner}`,
              sections.objective ? `**Objective**: ${sections.objective}` : '',
              '',
              sections.inputs.length > 0 ? `### Required Inputs\n${sections.inputs.map((i: string) => `- ${i}`).join('\n')}` : '',
              sections.outputs.length > 0 ? `### Expected Outputs\n${sections.outputs.map((o: string) => `- ${o}`).join('\n')}` : '',
              sections.templates.length > 0 ? `### Required Templates\n${sections.templates.map((t: string) => `- ${t}`).join('\n')}` : '',
              '',
              workflowState.steps ? `### Instructions (Steps)\n${workflowState.steps.map((s: any) => `${s.id}. ${s.label} [${s.status}]`).join('\n')}` : '',
              '',
              workflowState.workflow.gate ? `### Gate Requirements (ALL mandatory)\n${workflowState.workflow.gate.requirements.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}` : '',
              '',
              workflowState.workflow.passTarget ? `### On PASS → ${workflowState.workflow.passTarget}` : '',
              `\nCurrent status: ${workflowState.status}`,
              phases?.length > 0 ? `\nPhases: ${phases.map((p: any) => `${p.label} [${p.status}]`).join(' → ')}` : '',
              '\n---',
            ].filter(Boolean).join('\n');
          } else if (workflowState.workflow.rawContent) {
            // Simple workflow (init, coding) — use raw content + structured gate info
            const gate = workflowState.workflow.gate;
            const gateSection = gate ? [
              '\n### ⚠️ GATE REQUIREMENTS (ALL must be satisfied before advancing)',
              ...gate.requirements.map((r: string, i: number) => `${i + 1}. ${r}`),
              '',
              'When you believe ALL gate requirements are met:',
              '1. Create required artifacts via writeFile',
              '2. Present a <a2ui type="gate" id="gate-eval" label="Gate Evaluation"> with SI/NO options',
              '3. DO NOT advance past the gate without user confirmation',
            ].join('\n') : '';

            const passSection = workflowState.workflow.passTarget
              ? `\n### PASS → ${workflowState.workflow.passTarget} (automatic transition on gate SI)`
              : '';
            const failSection = workflowState.workflow.failBehavior
              ? `\n### FAIL → ${workflowState.workflow.failBehavior}`
              : '';

            phaseContext = [
              '\n\n---\n## ACTIVE WORKFLOW (MANDATORY — follow these instructions step by step)\n',
              workflowState.workflow.rawContent,
              gateSection,
              passSection,
              failSection,
              '\n---\n',
              `Current status: ${workflowState.status}`,
              workflowState.steps ? `\nSteps: ${workflowState.steps.map((s: any) => `${s.id}. ${s.label} [${s.status}]`).join(' | ')}` : '',
            ].join('\n');
          } else {
            phaseContext = '';
          }

          const behavioralRules = [
            '\n\n## BEHAVIORAL RULES (MANDATORY — VIOLATION = SYSTEM FAILURE)',
            '',
            '### Rule 0: PROJECT IDENTITY',
            `This project is called "${vscode.workspace.workspaceFolders?.[0]?.name || 'agentic-workflow'}". Do NOT invent or hallucinate a product name (e.g. "Extensio"). Refer to it by its real name or generically.`,
            '',
            '### Rule 1: SILENT EXECUTION',
            'ALL internal operations MUST be executed SILENTLY via tools. This includes:',
            '- Creating/writing files (init.md, artifacts, etc.) → use writeFile tool IMMEDIATELY',
            '- Loading/reading files (indexes, constitutions, templates) → use readFile tool',
            '- Any workflow step that does not require user input',
            '',
            '### Rule 2: NEVER NARRATE PROCESS',
            'FORBIDDEN sentences (examples — do NOT output anything similar):',
            '- ❌ "Voy a crear el archivo init.md..."',
            '- ❌ "Ahora voy a generar..."',
            '- ❌ "Let me create the artifact..."',
            '- ❌ "I will now write/save/load/evaluate..."',
            '- ❌ "Procedemos a evaluar el gate..."',
            '',
            'CORRECT behavior:',
            '- ✅ Execute the tool call directly, then report the RESULT to the user',
            '',
            '### Rule 3: GATE EVALUATION (CRITICAL)',
            'When a workflow has a Gate section, you MUST follow this exact protocol:',
            '1. Execute all required steps (create artifacts, etc.) via tools SILENTLY',
            '2. Evaluate each gate requirement internally',
            '3. Present the gate evaluation to the user using <a2ui type="gate">:',
            '',
            '<a2ui type="gate" id="gate-eval" label="Gate Evaluation: [summary of results]">',
            '- [ ] SI',
            '- [ ] NO',
            '</a2ui>',
            '',
            'The extension handles the workflow transition AUTOMATICALLY when the user confirms.',
            'You must NOT skip the gate confirmation. You must NOT advance beyond the gate without it.',
            'You must NOT ask "¿Qué tarea quieres iniciar?" until the user has confirmed the gate.',
            '',
            '### Rule 4: ACT THEN ADVANCE',
            'When you receive user confirmation (like language + strategy):',
            '1. IMMEDIATELY call writeFile to create the required artifact (e.g. init.md)',
            '2. Evaluate the gate requirements',
            '3. Present <a2ui type="gate"> with the evaluation result',
            '4. Wait for user confirmation before proceeding',
            'ALL of this (steps 1-3) happens in ONE response turn. Do NOT just acknowledge.',
            '',
            '### Rule 5: NEVER STOP MID-WORKFLOW',
            'After receiving user input, chain ALL remaining steps until the next step that requires user input or a gate confirmation.',
            'A response that only says Registrado/Entendido/OK without advancing the workflow is a FAILURE.',
            'You MUST continue executing steps (via tools) and arrive at the next user-facing question or gate.',
          ].join('\n');

          instructions = (instructions || '') + phaseContext + behavioralRules;
          this.log(`Injected workflow context (${workflowState.currentPhaseId || workflowState.workflow.id}) into LLM instructions`);

          // 5. Load constitution files referenced in the workflow
          const constitutions: string[] = workflowState.workflow.constitutions || [];
          if (constitutions.length > 0) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders) {
              const fs = await import('fs/promises');
              const baseDir = path.join(workspaceFolders[0].uri.fsPath, '.agent', 'rules', 'constitution');
              const constitutionContents: string[] = [];

              // Try to load the constitution index for alias resolution
              let aliasMap: Record<string, string> = {};
              try {
                const indexContent = await fs.readFile(path.join(baseDir, 'index.md'), 'utf-8');
                // Parse YAML-like entries: "alias_name: path/to/file.md"
                const aliasRegex = /^\s+(\w+):\s+(.+\.md)\s*$/gm;
                let aliasMatch;
                while ((aliasMatch = aliasRegex.exec(indexContent)) !== null) {
                  aliasMap[aliasMatch[1]] = aliasMatch[2];
                }
              } catch { /* no index file */ }

              for (const ref of constitutions) {
                const aliasName = ref.replace(/^constitution\./, '');
                let loaded = false;

                // Strategy 1: Resolve via index.md alias map
                if (aliasMap[aliasName]) {
                  const resolvedPath = path.join(workspaceFolders[0].uri.fsPath, aliasMap[aliasName]);
                  try {
                    const content = await fs.readFile(resolvedPath, 'utf-8');
                    constitutionContents.push(`\n### ${ref}\n${content}`);
                    this.log(`Loaded constitution: ${ref} via index (${content.length} chars)`);
                    loaded = true;
                  } catch { /* not found via index */ }
                }

                // Strategy 2: Direct name variations
                if (!loaded) {
                  const candidates = [
                    aliasName.replace(/_/g, '-') + '.md',                      // clean_code → clean-code.md
                    aliasName.replace(/_/g, '.') + '.md',                      // GEMINI_location → GEMINI.location.md
                    aliasName.replace(/_/g, '-') + '/index.md',                // extensio_architecture → extensio-architecture/index.md
                    aliasName + '.md',                                          // exact match
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

              if (constitutionContents.length > 0) {
                instructions += '\n\n---\n## LOADED CONSTITUTIONS (MANDATORY rules you must follow)\n' + constitutionContents.join('\n') + '\n---\n';
              }
            }
          }
        }
      } catch (err: any) {
        this.log(`Could not fetch workflow state for LLM context: ${err.message}`);
      }

      // Create request payload matching AgentRequest interface
      const payload = {
        role,
        input: inputWithHistory,
        binding: { [role]: modelName },
        apiKey,
        provider,
        instructions,
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

      // Send final completion message
      this.messenger.emit({
        id: randomUUID(),
        from: `${NAME}::background`,
        to: `${NAME}::view`,
        timestamp: Date.now(),
        origin: MessageOrigin.Server,
        payload: {
          command: MESSAGES.RECEIVE_MESSAGE,
          data: { text: this.cleanMessageText(streamText), agentRole: role, isStreaming: false }
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
   * Open a file in VS Code editor from a chat file link.
   */
  private async handleOpenFile(data: { path: string }): Promise<any> {
    try {
      const filePath = data.path;
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) { return { success: false, error: 'No workspace' }; }

      // Resolve relative paths against workspace root
      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(workspaceFolders[0].uri.fsPath, filePath);

      const uri = vscode.Uri.file(fullPath);
      const doc = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(doc, { preview: true });
      return { success: true };
    } catch (err: any) {
      this.log(`Failed to open file: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get current workflow state from Runtime.
   */
  private async getWorkflowState(): Promise<any> {
    try {
      return await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_STATUS);
    } catch {
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
  // The extension only interprets the workflow schema (gates, passTarget, failBehavior).

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

      // 1. Read current workflow state to get passTarget BEFORE sending gate response
      const workflowState = await this.getWorkflowState();
      const passTarget = workflowState?.workflow?.passTarget;
      const strategy = data.strategy || workflowState?.workflow?.id?.includes('short') ? 'short' : 'long';

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
          // passTarget may be "workflow.tasklifecycle-long | workflow.tasklifecycle-short"
          // Resolve which one based on strategy
          const targets = passTarget.split('|').map((t: string) => t.trim());
          let nextWorkflowId = targets[0];
          if (targets.length > 1 && strategy) {
            nextWorkflowId = targets.find((t: string) => t.includes(strategy)) || targets[0];
          }

          // Clean workflow. prefix if present for matching
          const cleanId = nextWorkflowId.replace(/^workflow\./, '');
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
          } catch (err: any) {
            this.log(`Failed to start next workflow: ${err.message}`);
          }
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

  private async handleSaveSession(data: { sessionId?: string, messages: any[], taskTitle?: string, elapsedSeconds?: number, progress?: number, lifecycleStrategy?: string, accessLevel?: string, securityScore?: number }): Promise<any> {
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
