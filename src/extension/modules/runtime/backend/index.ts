
import { AbstractBackend } from '../../core/backend/index.js';
import { IndexParser } from './index-parser.js';
import { WorkflowEngine } from './workflow-engine.js';
import { WorkflowPersistence } from './persistence.js';
import { RPC_COMMANDS, RPC_NOTIFICATIONS, LISTENER_EVENTS, ENGINE_STATUS } from '../constants.js';

export const NAME = 'RuntimeSidecar';

export class RuntimeServer extends AbstractBackend {
  private indexParser: IndexParser;
  private workflowEngine: WorkflowEngine;
  private workflowPersistence: WorkflowPersistence;

  constructor() {
    super('runtime', { name: NAME });

    const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd();

    this.indexParser = new IndexParser(workspaceRoot);
    this.workflowPersistence = new WorkflowPersistence(workspaceRoot);
    this.workflowEngine = new WorkflowEngine(workspaceRoot, this.workflowPersistence);

    this.enableRpc([
      RPC_COMMANDS.INITIALIZE,
      RPC_COMMANDS.WORKFLOW_LOAD,
      RPC_COMMANDS.WORKFLOW_LOAD_ALL,
      RPC_COMMANDS.WORKFLOW_START,
      RPC_COMMANDS.WORKFLOW_STEP_COMPLETE,
      RPC_COMMANDS.WORKFLOW_GATE_RESPOND,
      RPC_COMMANDS.WORKFLOW_STATUS,
      RPC_COMMANDS.WORKFLOW_RELOAD,
      RPC_COMMANDS.WORKFLOW_AGENTS,
      RPC_COMMANDS.WORKFLOW_AGENTS_REFRESH,
    ]);

    this.setupEngineNotifications();
  }



  private setupEngineNotifications(): void {
    for (const eventType of Object.values(LISTENER_EVENTS)) {
      this.workflowEngine.on(eventType, (data) => {
        this.notify(RPC_NOTIFICATIONS.WORKFLOW_EVENT, data);
      });
    }
  }



  private async handleSystemCommand(command: string, data: any): Promise<any> {
    if (command === RPC_COMMANDS.STATUS) {
      return { status: ENGINE_STATUS.RUNNING, rpc: this.rpcEnabled, workflow: this.workflowEngine.getState() };
    }
    if (command === RPC_COMMANDS.INITIALIZE) {
      this.indexParser = new IndexParser(data.workspaceRoot);
      await this.indexParser.parse();
      return { initialized: true };
    }
    return null;
  }

  private async handleWorkflowCommand(command: string, data: any): Promise<any> {
    switch (command) {
      case RPC_COMMANDS.WORKFLOW_LOAD: {
        const def = await this.workflowEngine.loadWorkflow(data.filePath);
        return { id: def.id, owner: def.owner, steps: def.steps.length, blocking: def.blocking };
      }
      case RPC_COMMANDS.WORKFLOW_LOAD_ALL: {
        const workflows = await this.workflowEngine.loadAllWorkflows(data.dirPath);
        return Array.from(workflows.entries()).map(([id, def]) => ({
          id, owner: def.owner, steps: def.steps.length,
        }));
      }
      case RPC_COMMANDS.WORKFLOW_START: {
        const def = await this.workflowEngine.start(data);
        return { started: true, workflowId: def.id, owner: def.owner };
      }

      case RPC_COMMANDS.WORKFLOW_STEP_COMPLETE:
        this.workflowEngine.stepComplete();
        return { completed: true };

      case RPC_COMMANDS.WORKFLOW_GATE_RESPOND:
        this.workflowEngine.respondToGate(data);
        return { responded: true };

      case RPC_COMMANDS.WORKFLOW_STATUS:
        return this.workflowEngine.getState();

      case RPC_COMMANDS.WORKFLOW_RELOAD:
        await this.workflowEngine.reload(data.filePath);
        return { reloaded: true };

      case RPC_COMMANDS.WORKFLOW_AGENTS:
        return this.workflowEngine.getAgents();

      case RPC_COMMANDS.WORKFLOW_AGENTS_REFRESH:
        await this.workflowEngine.refreshAgentRegistry();
        return { refreshed: true, count: this.workflowEngine.getAgents().length };

      default:
        return null;
    }
  }



  public override async start(): Promise<void> {
    await this.workflowEngine.initialize();
    console.log(`[${NAME}] Engine initialized`);
    await super.start();
  }

  protected async listen(command: string, data: any): Promise<any> {
    console.log(`[${NAME}] Command: ${command}`);

    const systemResult = await this.handleSystemCommand(command, data);
    if (systemResult !== null) {
      return systemResult;
    }

    const workflowResult = await this.handleWorkflowCommand(command, data);
    if (workflowResult !== null) {
      return workflowResult;
    }

    return { error: `Unknown command: ${command}`, code: 404 };
  }
}

new RuntimeServer().start();
