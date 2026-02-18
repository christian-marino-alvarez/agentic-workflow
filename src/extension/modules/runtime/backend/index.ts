
import { AbstractBackend } from '../../core/backend/index.js';
import * as rpc from 'vscode-jsonrpc/node.js';
import { IndexParser } from './index-parser.js';

export const NAME = 'RuntimeSidecar';

/**
 * Runtime Server (Sidecar 2).
 * Extends Core AbstractBackend for lifecycle management and consistency.
 * Uses JSON-RPC over stdio for high-performance Action execution.
 */
export class RuntimeServer extends AbstractBackend {
  private connection: rpc.MessageConnection;
  private indexParser: IndexParser;

  constructor() {
    super('runtime', { name: NAME });

    // Initialize JSON-RPC connection over Stdio
    // This runs IN PARALLEL to the Fastify HTTP server provided by AbstractBackend
    this.connection = rpc.createMessageConnection(
      new rpc.StreamMessageReader(process.stdin),
      new rpc.StreamMessageWriter(process.stdout)
    );

    this.indexParser = new IndexParser(process.cwd()); // CWD is workspace root when spawned
  }

  // Override start to initialize RPC
  public override async start(): Promise<void> {
    this.setupRpcHandlers();
    this.connection.listen();
    console.log(`[${NAME}] JSON-RPC listener started`);

    // Start the HTTP server (Health checks, etc)
    await super.start();
  }

  private setupRpcHandlers(): void {
    this.connection.onRequest('ping', () => 'pong');

    this.connection.onNotification('initialize', async (params: { workspaceRoot: string }) => {
      console.log(`[${NAME}] Initializing index with root:`, params.workspaceRoot);
      this.indexParser = new IndexParser(params.workspaceRoot);
      await this.indexParser.parse();
    });
  }

  // Implement abstract method from AbstractBackend
  // This handles HTTP /command requests (legacy/fallback)
  protected async listen(command: string, data: any): Promise<any> {
    console.log(`[${NAME}] HTTP Command received: ${command}`);
    if (command === 'status') {
      return { status: 'running', rpc: 'active' };
    }
    return { error: 'Use JSON-RPC for runtime actions' };
  }
}

// Auto-start
new RuntimeServer().start();
