import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import * as rpc from 'vscode-jsonrpc/node.js';
import { COMMANDS } from '../constants.js';

export interface ServerOptions {
  port?: number;
  host?: string;
  name?: string;
}

/**
 * Abstract implementation of a Backend Server sidecar.
 * Handles lifecycle, messaging bridge, and standard middleware.
 *
 * Supports two transport modes (composable):
 * - **HTTP** (Fastify): Always active. POST /command → listen(command, data).
 * - **RPC** (JSON-RPC over stdio): Optional. Call enableRpc() to activate.
 *   All RPC requests are bridged to the same listen(command, data) handler.
 *
 * Subclasses only implement listen() — the core handles transport routing.
 */
export abstract class AbstractBackend {
  public server: FastifyInstance;
  protected readonly port: number;
  protected readonly host: string;
  protected readonly name: string;

  // RPC transport (optional, activated via enableRpc)
  private rpcConnection: rpc.MessageConnection | null = null;
  private rpcCommands: string[] = [];

  constructor(protected readonly moduleName: string, options: ServerOptions = {}) {
    this.name = options.name || `${moduleName}-backend`;
    this.port = options.port || Number(process.env.PORT) || 3000;
    this.host = options.host || '127.0.0.1';

    this.server = fastify({
      logger: false
    });

    this.configureHttp();
  }

  // ─── Private: HTTP Transport ──────────────────────────────

  private configureHttp(): void {
    this.server.register(cors, { origin: true });

    this.server.get('/health', async () => {
      return { status: 'ok', name: this.name, module: this.moduleName, timestamp: new Date().toISOString() };
    });

    this.server.setErrorHandler((error, request: FastifyRequest, reply: FastifyReply) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[${this.name}] Error:`, error);
      reply.status(500).send({ error: 'Internal Server Error', message: errorMessage });
    });

    this.server.post('/command', async (request: FastifyRequest, reply: FastifyReply) => {
      const { command, data } = request.body as any;
      try {
        if (command === COMMANDS.PING) {
          return { success: true, result: { pong: true, layer: 'backend', module: this.moduleName, timestamp: Date.now() } };
        }
        const result = await this.listen(command, data);
        return { success: true, result };
      } catch (error) {
        console.error(`[${this.name}] Command Error (${command}):`, error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });
  }

  // ─── Protected: RPC Transport ─────────────────────────────

  /**
   * Enable JSON-RPC transport over stdio.
   * Bridged commands are routed to the same listen(command, data) handler.
   * Call this in the subclass constructor before start().
   *
   * @param commands List of command names to bridge from RPC to listen().
   */
  protected enableRpc(commands: string[]): void {
    this.rpcConnection = rpc.createMessageConnection(
      new rpc.StreamMessageReader(process.stdin),
      new rpc.StreamMessageWriter(process.stdout)
    );
    this.rpcCommands = commands;

    // Native ping
    this.rpcConnection.onRequest(COMMANDS.PING, () => 'pong');

    // Bridge each command: RPC → listen() → response
    for (const cmd of commands) {
      this.rpcConnection.onRequest(cmd, async (params: any) => {
        try {
          return await this.listen(cmd, params ?? {});
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { error: message, code: 500 };
        }
      });
    }
  }

  /**
   * Send a JSON-RPC notification to the extension host.
   * Requires enableRpc() to have been called first.
   *
   * @param channel Notification channel name.
   * @param data Payload data.
   */
  protected notify(channel: string, data: any): void {
    if (!this.rpcConnection) {
      console.warn(`[${this.name}] notify() called without RPC enabled`);
      return;
    }
    this.rpcConnection.sendNotification(channel, data);
  }

  /**
   * Check if RPC transport is active.
   */
  protected get rpcEnabled(): boolean {
    return this.rpcConnection !== null;
  }

  // ─── Protected: Command Handler ───────────────────────────

  /**
   * Handle incoming commands from the Extension Host.
   * Override in subclasses to process commands.
   * Both HTTP and RPC route through this single handler.
   */
  protected abstract listen(command: string, data: any): Promise<any>;

  // ─── Public: Lifecycle ────────────────────────────────────

  public async start(): Promise<void> {
    // Start RPC listener if enabled
    if (this.rpcConnection) {
      this.rpcConnection.listen();
      console.log(`[${this.moduleName}::backend] RPC listening (${this.rpcCommands.length} commands bridged)`);
    }

    // Start HTTP server
    try {
      await this.server.listen({ port: this.port, host: this.host });
      console.log(`[${this.moduleName}::backend] HTTP listening on http://${this.host}:${this.port}`);
    } catch (err) {
      console.error(`[${this.moduleName}::backend] Fatal Error:`, err);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    if (this.rpcConnection) {
      this.rpcConnection.dispose();
    }
    await this.server.close();
  }
}
