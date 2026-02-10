import * as cp from 'node:child_process';
import path from 'node:path';
import type { ExtensionContext } from 'vscode';

export class ChatSidecarManager {
  private sidecarProcess?: cp.ChildProcess;
  private bridgeConfig?: { sessionKey: string; bridgeToken: string; port: number };

  public constructor(private readonly context: ExtensionContext) { }

  public setBridgeConfig(config: { sessionKey: string; bridgeToken: string; port: number }): void {
    this.bridgeConfig = config;
    // If sidecar is already running, we might need to restart it with new config.
    // For now, assume it's set before start.
  }

  public getSessionKey(): string | undefined {
    return this.bridgeConfig?.sessionKey;
  }

  public async start(): Promise<void> {
    if (this.sidecarProcess) {
      return;
    }

    const backendPath = path.resolve(this.context.extensionPath, 'dist-backend', 'backend', 'index.js');
    console.log(`[ChatSidecarManager] Spawning sidecar: ${backendPath}`);

    this.sidecarProcess = cp.fork(backendPath, [], {
      env: {
        ...process.env,
        PORT: '3000', // Default Fastify port
        AGW_SESSION_KEY: this.bridgeConfig?.sessionKey,
        AGW_BRIDGE_TOKEN: this.bridgeConfig?.bridgeToken,
        AGW_BRIDGE_PORT: this.bridgeConfig?.port.toString()
      },
      stdio: 'pipe'
    });

    this.sidecarProcess.stdout?.on('data', (data) => console.log(`[Backend-STDOUT] ${data.toString().trim()}`));
    this.sidecarProcess.stderr?.on('data', (data) => console.error(`[Backend-STDERR] ${data.toString().trim()}`));

    this.sidecarProcess.on('exit', (code) => {
      console.log(`[ChatSidecarManager] Sidecar exited with code ${code}`);
      this.sidecarProcess = undefined;
    });
  }

  public dispose(): void {
    if (this.sidecarProcess) {
      this.sidecarProcess.kill();
      this.sidecarProcess = undefined;
    }
  }
}
