import { spawn, ChildProcess, exec } from 'child_process';
import * as vscode from 'vscode';
import { MessagingBackground } from '../messaging/background.js';
import { MessageOrigin, LayerScope } from '../constants.js';
import { Message } from '../types.js';
import { Logger } from '../logger.js';

/**
 * Unified Background layer base (Logic + UI Controller).
 * Manages logic communication and acts as the Webview Provider.
 */
export abstract class Background implements vscode.WebviewViewProvider {
  private messenger: MessagingBackground = new MessagingBackground();
  private sidecarProcess?: ChildProcess;
  protected disposables: { dispose: () => void }[] = [];
  protected readonly scope = LayerScope.Background;
  protected readonly identity: string;

  constructor(
    protected readonly moduleName: string,
    protected readonly _extensionUri: vscode.Uri,
    protected readonly viewTagName: string
  ) {
    this.identity = `${this.moduleName}::${this.scope}`;
  }

  /**
   * Spawn a sidecar process for this backend.
   * Standardizes lifecycle and logging for all node-based backends.
   */
  protected async spawnSidecar(scriptPath: string, port: number = 3000): Promise<void> {
    if (this.sidecarProcess) {
      this.log('Sidecar already running, skipping spawn.');
      return;
    }

    await this.killPort(port);

    this.log(`Spawning sidecar: node ${scriptPath}`);
    this.sidecarProcess = spawn('node', [scriptPath], {
      env: { ...process.env, PORT: port.toString() }
    });

    this.sidecarProcess.stdout?.on('data', (data) => {
      this.log(`[Sidecar] ${data.toString().trim()}`);
    });

    this.sidecarProcess.stderr?.on('data', (data) => {
      this.log(`[Sidecar Error] ${data.toString().trim()}`);
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
   * Send a message through the private messenger.
   */
  public sendMessage(to: string, command: string, data: any = {}): void {
    this.messenger.emit({
      from: this.identity,
      to,
      origin: MessageOrigin.Server,
      timestamp: Date.now(),
      payload: { command, data }
    });
  }

  /**
   * Listen for messages targeted specifically to this identity.
   */
  public onMessage(handler: (message: Message) => void): { dispose: () => void } {
    return this.messenger.subscribe(this.identity, handler);
  }

  // --- WebviewViewProvider Implementation ---

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this.log('resolveWebviewView called');
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
          resolve(); // No process found or error finding/killing
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
    Logger.log(`[Background:${this.moduleName}] ${message}`, ...args);
  }
}
