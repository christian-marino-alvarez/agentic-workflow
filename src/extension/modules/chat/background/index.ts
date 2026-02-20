
import * as vscode from 'vscode';
import * as path from 'path';
import { Background, Message, ViewHtml, MessageOrigin } from '../../core/index.js';
import { NAME, MESSAGES } from '../constants.js';
import { API_ENDPOINTS, SIDECAR_BASE_URL, DEFAULT_MODELS } from '../../llm/constants.js';
import { MESSAGES as SETTINGS_MESSAGES } from '../../settings/constants.js';
import { randomUUID } from 'crypto';

export class ChatBackground extends Background {

  /** Matches agent identity prefixes like "🏛️ **architect-agent**:" at the start of responses. */
  private static readonly AGENT_PREFIX_REGEX = /^\s*(?:[\p{Emoji}\u200d]+\s*)?\*{0,2}\w[\w-]*(?:-agent)?\*{0,2}\s*:\s*/u;
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

  /** Remove agent identity prefix from LLM response (the Chat UI bubble already shows the sender). */
  private stripAgentPrefix(text: string): string {
    return text.replace(ChatBackground.AGENT_PREFIX_REGEX, '');
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
      default:
        return super.listen(message);
    }
  }

  private async handleSendMessage(data: { text: string, agentRole: string, modelId?: string, history?: Array<{ role: string, text: string }> }): Promise<any> {
    const role = data.agentRole || 'backend';
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

      // Create request payload matching AgentRequest interface
      const payload = {
        role,
        input: inputWithHistory,
        binding: { [role]: modelName },
        apiKey,
        provider,
        context: []
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
                    data: { text: this.stripAgentPrefix(streamText), agentRole: role, isStreaming: true }
                  }
                });
              } else if (parsed.type === 'tool_call' || parsed.type === 'tool_result') {
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
          data: { text: this.stripAgentPrefix(streamText), agentRole: role, isStreaming: false }
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

  private async handleSaveSession(data: { sessionId?: string, messages: any[] }): Promise<any> {
    const sessions = this.getSessions();
    const id = data.sessionId || randomUUID();

    // Derive title from first user message
    const firstUserMsg = data.messages.find((m: any) => m.role === 'user');
    const title = firstUserMsg?.text?.substring(0, 60) || 'New conversation';

    const existing = sessions.findIndex(s => s.id === id);
    const session = {
      id,
      title,
      timestamp: Date.now(),
      messages: data.messages,
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
    this.log(`Session saved: ${id} ("${title}")`);
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
      timestamp: s.timestamp,
      messageCount: s.messages?.length || 0,
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
