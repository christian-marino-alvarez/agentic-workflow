
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

  constructor(context: vscode.ExtensionContext) {
    super(NAME, context.extensionUri, `${NAME}-view`);
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
      case 'ROLES_CHANGED':
        return this.handleRolesChanged();
      default:
        return super.listen(message);
    }
  }

  private async handleSendMessage(data: { text: string, agentRole: string, modelId?: string }): Promise<any> {
    const role = data.agentRole || 'backend';
    this.log(`Message for role "${role}": ${data.text.substring(0, 50)}...`);

    // Emit "thinking" status
    this.emitStatus('Contacting LLM Sidecar...');

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
        input: data.text,
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
                // Emit each chunk incrementally (or emit full so far if ChatView expects it)
                // For now, re-emitting full text based on expected format.
                // Assuming ChatView handles incremental updates correctly.
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
}
