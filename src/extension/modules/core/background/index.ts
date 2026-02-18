import { randomUUID } from 'crypto';
import { spawn, ChildProcess, exec } from 'child_process';
import * as vscode from 'vscode';
import { MessagingBackground } from '../messaging/background.js';
import { MessageOrigin, LayerScope } from '../constants.js';
import { Message } from '../types.js';
import { Logger } from '../logger.js';

/** Default timeout for awaiting a response (ms) */
const REQUEST_TIMEOUT = 10_000;

/** Pending request entry */
interface PendingRequest {
  resolve: (data: any) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * Unified Background layer base (Logic + UI Controller).
 * Manages logic communication and acts as the Webview Provider.
 * Supports request-response pattern via correlation IDs.
 */
export abstract class Background implements vscode.WebviewViewProvider {
  protected messenger: MessagingBackground = new MessagingBackground();
  private sidecarProcess?: ChildProcess;
  private pendingRequests = new Map<string, PendingRequest>();
  protected disposables: { dispose: () => void }[] = [];
  protected readonly scope = LayerScope.Background;
  protected readonly identity: string;
  protected _webviewView?: vscode.WebviewView;

  constructor(
    protected readonly moduleName: string,
    protected readonly _extensionUri: vscode.Uri,
    protected readonly viewTagName: string
  ) {
    this.identity = `${this.moduleName}::${this.scope}`;

    // Wire message subscription → listen()
    this.messenger.subscribe(this.identity, async (msg: Message) => {
      // Check if this is a response to a pending request
      if (msg.correlationId && this.pendingRequests.has(msg.correlationId)) {
        const pending = this.pendingRequests.get(msg.correlationId)!;
        clearTimeout(pending.timer);
        this.pendingRequests.delete(msg.correlationId);
        pending.resolve(msg.payload?.data);
        return;
      }

      const { command } = msg.payload || {};

      // Native ping handler
      if (command === 'ping') {
        this.reply(
          msg.from || 'view',
          'ping::response',
          { pong: true, layer: 'background', module: this.moduleName, timestamp: Date.now() },
          msg.id
        );
        return;
      }

      // Native log handler
      if (command === 'log') {
        const { message, args } = msg.payload.data || {};
        // Forward to output channel via Logger, prefixed with [View]
        Logger.log(`[View] ${message}`, ...(args || []));
        return;
      }

      // Native SET_TITLE handler — updates the webview panel title
      if (command === 'SET_TITLE') {
        const { title } = msg.payload.data || {};
        if (this._webviewView && typeof title === 'string') {
          this._webviewView.title = title;
        }
        if (msg.id) {
          this.reply(msg.from || 'view', 'SET_TITLE::response', { success: true }, msg.id);
        }
        return;
      }

      // Native SET_BADGE handler — sets a badge on the webview panel
      if (command === 'SET_BADGE') {
        const { value, tooltip } = msg.payload.data || {};
        if (this._webviewView) {
          this._webviewView.badge = value !== null && value !== undefined
            ? { value: Number(value), tooltip: tooltip || '' }
            : undefined;
        }
        if (msg.id) {
          this.reply(msg.from || 'view', 'SET_BADGE::response', { success: true }, msg.id);
        }
        return;
      }

      // Native SET_DESCRIPTION handler — sets secondary text next to the panel title
      if (command === 'SET_DESCRIPTION') {
        const { description } = msg.payload.data || {};
        if (this._webviewView) {
          this._webviewView.description = typeof description === 'string' ? description : undefined;
        }
        if (msg.id) {
          this.reply(msg.from || 'view', 'SET_DESCRIPTION::response', { success: true }, msg.id);
        }
        return;
      }

      // Delegate to subclass listen() — if it returns data, auto-reply
      try {
        const result = await this.listen(msg);
        if (result !== undefined && msg.id) {
          this.reply(msg.from || 'view', `${command}::response`, result, msg.id);
        }
      } catch (error: any) {
        this.log(`Error in listen (${command}):`, error.message);
        if (msg.id) {
          this.reply(msg.from || 'view', `${command}::response`, { success: false, error: error.message }, msg.id);
        }
      }
    });
  }

  /**
   * Ping the Backend sidecar and await the pong response.
   * Native connectivity check.
   */
  public async ping(): Promise<any> {
    return this.sendMessage(`${this.moduleName}::backend`, 'ping');
  }

  /**
   * Override in subclasses to handle incoming messages.
   * Return data to auto-reply with correlationId, or void for no reply.
   */
  public listen(message: Message): Promise<any> | void {
    // Base implementation — no-op. Subclasses override.
  }

  /**
   * Run the Backend sidecar process for this module.
   * Standardizes lifecycle and logging for all node-based backends.
   */
  protected async runBackend(scriptPath: string, port: number = 3000): Promise<void> {
    if (this.sidecarProcess) {
      this.log('Backend sidecar already running, skipping spawn.');
      return;
    }

    await this.killPort(port);

    this.log(`Spawning sidecar: node ${scriptPath}`);
    this.sidecarProcess = spawn('node', [scriptPath], {
      env: { ...process.env, PORT: port.toString() }
    });

    this.sidecarProcess.stdout?.on('data', (data) => {
      // Direct log via Logger to use :backend tag instead of :background
      Logger.log(`[${this.moduleName}::backend] ${data.toString().trim()}`);
    });

    this.sidecarProcess.stderr?.on('data', (data) => {
      Logger.log(`[${this.moduleName}::backend] [ERROR] ${data.toString().trim()}`);
    });

    this.sidecarProcess.on('exit', (code) => {
      this.log(`Sidecar exited with code ${code}`);
      this.sidecarProcess = undefined;
    });

    // Automatically set the endpoint once spawned
    this.setEndpoint(`http://127.0.0.1:${port}`);
  }

  /**
   * Configure the sidecar endpoint for this backend messenger.
   */
  protected setEndpoint(url: string): void {
    this.messenger.setEndpoint(url);
  }

  /**
   * Send a message and await the correlated response.
   *
   * @param to          Target scope
   * @param command     Command identifier
   * @param data        Payload data
   * @param timeout     Max wait time in ms (default 10s)
   * @returns           The response payload data
   */
  public sendMessage(to: string, command: string, data: any = {}, timeout = REQUEST_TIMEOUT): Promise<any> {
    const id = randomUUID();

    this.messenger.emit({
      id,
      from: this.identity,
      to,
      origin: MessageOrigin.Server,
      timestamp: Date.now(),
      payload: { command, data }
    });

    this.log(`→ ${command}`);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`[Background:${this.moduleName}] Timeout waiting for response to "${command}" (${timeout}ms)`));
      }, timeout);

      this.pendingRequests.set(id, { resolve, reject, timer });
    });
  }

  /**
   * Send a response message (fire-and-forget, no correlation needed).
   * Used internally by handle() to send responses back.
   */
  protected reply(to: string, command: string, data: any, correlationId: string): void {
    this.messenger.emit({
      id: randomUUID(),
      from: this.identity,
      to,
      origin: MessageOrigin.Server,
      timestamp: Date.now(),
      payload: { command, data },
      correlationId
    });
  }

  /**
   * Register a request-response handler for a specific command.
   * The handler receives the request data and returns the response data.
   * The response is automatically sent back with the correlationId.
   */
  public handle(command: string, handler: (data: any) => Promise<any>): { dispose: () => void } {
    return this.messenger.subscribe(this.identity, async (message: Message) => {
      if (message.payload.command !== command) { return; }

      this.log(`Handling: ${command}`);
      try {
        const result = await handler(message.payload.data);
        this.reply(
          message.from || 'view',
          `${command}::response`,
          result,
          message.id
        );
      } catch (error: any) {
        this.log(`Error handling ${command}:`, error.message);
        this.reply(
          message.from || 'view',
          `${command}::response`,
          { success: false, error: error.message },
          message.id
        );
      }
    });
  }

  // --- WebviewViewProvider Implementation ---

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this.log('resolveWebviewView called');
    this._webviewView = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    // Link the webview to our messenger (acting as bridge)
    this.messenger.setWebview(webviewView.webview);

    // Initial HTML setup
    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
    this.log('Webview HTML set');
  }

  /**
   * Generate initial HTML for the webview.
   * MUST be implemented by subclasses to provide the specific module bootloader.
   */
  protected abstract getHtmlForWebview(webview: vscode.Webview): string;

  public dispose(): void {
    this.log('Disposing...');
    if (this.sidecarProcess) {
      this.log('Killing sidecar process...');
      this.sidecarProcess.kill();
      this.sidecarProcess = undefined;
    }
    // Clear pending requests
    this.pendingRequests.forEach(({ timer, reject }) => {
      clearTimeout(timer);
      reject(new Error('Disposed'));
    });
    this.pendingRequests.clear();
    this.messenger.dispose();
    this.disposables.forEach(d => d.dispose());
  }

  /**
   * Force kill any process occupying the target port.
   * macOS/Linux specific implementation using lsof.
   */
  private killPort(port: number): Promise<void> {
    return new Promise((resolve) => {
      exec(`lsof -i :${port} -t`, (err, stdout) => {
        if (err || !stdout) {
          resolve();
          return;
        }

        const pids = stdout.trim().split('\n');
        this.log(`Cleaning up busy port ${port} (PIDs: ${pids.join(', ')})`);

        const killCmd = `kill -9 ${pids.join(' ')}`;
        exec(killCmd, (killErr) => {
          if (killErr) {
            this.log(`Failed to cleanup port ${port}: ${killErr.message}`);
          }
          resolve();
        });
      });
    });
  }

  /**
   * Standardized logger for the Background layer.
   */
  protected log(message: string, ...args: any[]): void {
    Logger.log(`[${this.moduleName}::background] ${message}`, ...args);
  }

  /**
   * Abstracted Authentication getter.
   * Allows modules to request sessions without importing 'vscode'.
   */
  protected async getSession(
    providerId: string,
    scopes: readonly string[],
    options?: { createIfNone?: boolean }
  ): Promise<import('../types.js').IAuthenticationSession | undefined> {
    const session = await vscode.authentication.getSession(providerId, scopes, options);
    if (!session) return undefined;

    return {
      id: session.id,
      accessToken: session.accessToken,
      account: { label: session.account.label, id: session.account.id },
      scopes: session.scopes
    };
  }
}
