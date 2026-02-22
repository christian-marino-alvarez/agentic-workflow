
import * as vscode from 'vscode';
import * as path from 'path';
import { Background, Message, ViewHtml, MessageOrigin } from '../../core/index.js';
import { NAME, MESSAGES } from '../constants.js';
import { API_ENDPOINTS, SIDECAR_BASE_URL, DEFAULT_MODELS } from '../../llm/constants.js';
import { MESSAGES as SETTINGS_MESSAGES } from '../../settings/constants.js';
import { MESSAGES as RUNTIME_MESSAGES } from '../../runtime/constants.js';
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

      case MESSAGES.GATE_REQUEST:
        return this.handleGateRequest(message.payload.data);
      case MESSAGES.GATE_RESPONSE:
        return this.handleGateResponse(message.payload.data);
      case MESSAGES.WORKFLOW_STATE_UPDATE:
        return this.handleWorkflowStateUpdate(message.payload.data);

      default:
        return super.listen(message);
    }
  }

  private async handleSendMessage(data: { text: string, agentRole: string, modelId?: string, history?: Array<{ role: string, text: string }>, attachments?: Array<{ _title: string, _path: string }> }): Promise<any> {
    let role = data.agentRole || 'backend';

    // Detect slash commands — trigger workflow start and prompt the workflow's owner
    const textTrimmed = data.text.trim();
    if (textTrimmed.startsWith('/')) {
      const commandId = textTrimmed.split(' ')[0].substring(1); // e.g. "/init" -> "init"
      const initResult = await this.handleWorkflowCommand(commandId);

      if (!initResult.success) {
        return initResult; // Stop if init failed
      }

      // Override text and role to have the workflow owner explain the workflow
      if (initResult.owner) {
        role = initResult.owner;
      }

      data.text = `Acabo de lanzar el comando /${commandId}. Por favor, actúa como el agente asignado (owner). Hemos iniciado este flujo. Saluda brevemente y **formula de inmediato la primera pregunta o solicitud de información requerida en las instrucciones del workflow**. No relates de qué trata el workflow, simplemente toma el control y pide directamente al usuario lo necesario para completar el Step 1 (por ejemplo, idioma, estrategia o el objetivo principal). Sé muy conciso (1-2 frases máximo), cercano y conversacional. MUY IMPORTANTE: NO uses tools ahora, solo dialoga.`;
    }

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

        // 2. Resolve model for this agent role via bindings
        const bindingsResponse = await this.sendMessage('settings', SETTINGS_MESSAGES.GET_BINDING);
        const bindings = bindingsResponse?.bindings || {};
        const boundModelId = bindings[role] || data.modelId;

        // Lookup by config UUID first, then by API model name (modelName), then by display name
        const config = boundModelId
          ? models.find((m: any) => m.id === boundModelId)
          || models.find((m: any) => m.modelName === boundModelId)
          || models.find((m: any) => m.name === boundModelId)
          : models.find((m: any) => Boolean(m.active));

        if (config) {
          apiKey = config.apiKey || null;
          provider = config.provider || 'gemini';
          modelName = config.modelName || config.name || DEFAULT_MODELS.GEMINI;
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
      try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
          const rolePath = path.join(workspaceFolders[0].uri.fsPath, '.agent', 'rules', 'roles', `${role}.md`);
          const fs = await import('fs/promises');
          const roleContent = await fs.readFile(rolePath, 'utf-8');
          instructions = roleContent;
          this.log(`Loaded role persona for "${role}" (${roleContent.length} chars)`);
        }
      } catch (err: any) {
        this.log(`No role file found for "${role}", using default persona: ${err.message}`);
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
      this.log('Gate response from user', data);
      const result = await this.sendMessage('Runtime', RUNTIME_MESSAGES.WORKFLOW_GATE_RESPONSE, data);
      return { success: true, ...result };
    } catch (error: any) {
      this.log('Failed to forward gate response', error);
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

  private async handleSaveSession(data: { sessionId?: string, messages: any[], taskTitle?: string, elapsedSeconds?: number, progress?: number, accessLevel?: string, securityScore?: number }): Promise<any> {
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
