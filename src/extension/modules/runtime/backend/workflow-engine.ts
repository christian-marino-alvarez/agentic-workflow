import { setup, createActor, type AnyActorRef } from 'xstate';
import { WorkflowParser } from './workflow-parser.js';
import { WorkflowPersistence } from './persistence.js';
import { ENGINE_EVENTS, WORKFLOW_STATES, LISTENER_EVENTS, ENGINE_STATUS } from '../constants.js';
import type {
  WorkflowDef,
  WorkflowEngineState,
  AgentRole,
  StartWorkflowInput,
  GateResponseInput,
  EmitInput,
  WorkflowEvent,
  WorkflowContext,
  WorkflowEventType,
  WorkflowEventListener,
  WorkflowStatesConfig,
} from '../types.js';

export type { StartWorkflowInput, GateResponseInput, WorkflowEventType, WorkflowEventListener };

export class WorkflowEngine {
  private parser: WorkflowParser;
  private persistence: WorkflowPersistence;
  private actor: AnyActorRef | null = null;
  private agentRegistry: Map<string, AgentRole> = new Map();
  private workflows: Map<string, WorkflowDef> = new Map();
  private listeners: Map<WorkflowEventType, Set<WorkflowEventListener>> = new Map();

  constructor(workspaceRoot: string, persistence: WorkflowPersistence) {
    this.parser = new WorkflowParser(workspaceRoot);
    this.persistence = persistence;
  }



  private async discoverAndRegisterAgents(): Promise<void> {
    const agents = await this.parser.discoverAgents();
    this.agentRegistry.clear();
    for (const agent of agents) {
      this.agentRegistry.set(agent.id, agent);
    }
  }

  private async restorePersistedState(): Promise<void> {
    const savedState = await this.persistence.loadState();
    if (savedState) {
      console.log(`[WorkflowEngine] Restored: task=${savedState.taskId}`);
    }
  }

  private validateWorkflowOwner(def: WorkflowDef): void {
    if (!this.agentRegistry.has(def.owner)) {
      const available = Array.from(this.agentRegistry.keys()).join(', ');
      throw new Error(
        `[WorkflowEngine] Unknown owner "${def.owner}". Available: [${available}]`
      );
    }
  }

  private emit(input: EmitInput): void {
    const listeners = this.listeners.get(input.eventType);
    if (!listeners) {
      return;
    }
    for (const listener of listeners) {
      try {
        listener({ type: input.eventType, state: input.state, payload: input.payload });
      } catch (err) {
        console.error(`[WorkflowEngine] Listener error for "${input.eventType}":`, err);
      }
    }
  }

  private emitStateChange(): void {
    const state = this.getState();
    if (!state) {
      return;
    }
    this.emit({ eventType: LISTENER_EVENTS.STATE_CHANGE, state });
    this.persistence.saveState(state).catch((err: Error) => {
      console.error('[WorkflowEngine] Failed to persist state:', err);
    });
  }

  private buildStates(): WorkflowStatesConfig {
    return {
      [WORKFLOW_STATES.IDLE]: {
        on: { [ENGINE_EVENTS.START]: { target: WORKFLOW_STATES.EXECUTING } },
      },
      [WORKFLOW_STATES.EXECUTING]: {
        on: {
          [ENGINE_EVENTS.STEP_COMPLETE]: [
            { target: WORKFLOW_STATES.WAITING_GATE, guard: 'hasGate' },
            { target: WORKFLOW_STATES.COMPLETED },
          ],
          [ENGINE_EVENTS.ERROR]: { target: WORKFLOW_STATES.FAILED },
        },
      },
      [WORKFLOW_STATES.WAITING_GATE]: {
        on: {
          [ENGINE_EVENTS.GATE_APPROVE]: { target: WORKFLOW_STATES.COMPLETED },
          [ENGINE_EVENTS.GATE_REJECT]: { target: WORKFLOW_STATES.FAILED },
        },
        entry: ['notifyGateRequest'],
      },
      [WORKFLOW_STATES.COMPLETED]: {
        type: 'final' as const,
        entry: ['notifyPhaseComplete'],
      },
      [WORKFLOW_STATES.FAILED]: {
        on: { [ENGINE_EVENTS.RELOAD]: { target: WORKFLOW_STATES.EXECUTING } },
        entry: ['notifyError'],
      },
    };
  }

  private buildMachineActions(engine: WorkflowEngine): Record<string, any> {
    return {
      notifyGateRequest: ({ context }: { context: WorkflowContext }) => {
        const state = engine.getState();
        if (state) {
          engine.emit({
            eventType: LISTENER_EVENTS.GATE_REQUEST,
            state,
            payload: {
              workflowId: context.currentWorkflowId,
              owner: context.workflowDef?.owner,
              requirements: context.workflowDef?.gate?.requirements,
            },
          });
        }
      },
      notifyPhaseComplete: ({ context }: { context: WorkflowContext }) => {
        const state = engine.getState();
        if (state) {
          engine.emit({
            eventType: LISTENER_EVENTS.PHASE_COMPLETE,
            state,
            payload: {
              workflowId: context.currentWorkflowId,
              passTarget: context.workflowDef?.passTarget,
            },
          });
        }
      },
      notifyError: ({ context }: { context: WorkflowContext }) => {
        const state = engine.getState();
        if (state) {
          engine.emit({ eventType: LISTENER_EVENTS.ERROR, state, payload: { error: context.error } });
        }
      },
    };
  }

  private createMachine(def: WorkflowDef): any {
    return setup({
      types: {
        context: {} as WorkflowContext,
        events: {} as WorkflowEvent,
        input: {} as { taskId: string; strategy: string; workflowDef: WorkflowDef },
      },
      guards: {
        hasGate: ({ context }) => {
          return context.workflowDef?.gate !== null && context.workflowDef?.gate !== undefined;
        },
      },
      actions: this.buildMachineActions(this),
    }).createMachine({
      id: def.id,
      initial: WORKFLOW_STATES.IDLE,
      context: ({ input }) => ({
        taskId: input.taskId,
        strategy: input.strategy,
        currentWorkflowId: def.id,
        currentStepIndex: 0,
        workflowDef: input.workflowDef,
        gateResponses: {},
        error: null,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      states: this.buildStates(),
    });
  }

  private mapXStateStatus(value: string): WorkflowEngineState['status'] {
    const statusMap: Record<string, WorkflowEngineState['status']> = {
      [WORKFLOW_STATES.IDLE]: ENGINE_STATUS.IDLE,
      [WORKFLOW_STATES.EXECUTING]: ENGINE_STATUS.RUNNING,
      [WORKFLOW_STATES.WAITING_GATE]: ENGINE_STATUS.WAITING_GATE,
      [WORKFLOW_STATES.COMPLETED]: ENGINE_STATUS.COMPLETED,
      [WORKFLOW_STATES.FAILED]: ENGINE_STATUS.FAILED,
    };
    return statusMap[value] ?? ENGINE_STATUS.RUNNING;
  }

  async initialize(): Promise<void> {
    console.log('[WorkflowEngine] Initializing...');
    await this.discoverAndRegisterAgents();
    await this.restorePersistedState();
    console.log(`[WorkflowEngine] Ready (${this.agentRegistry.size} agents)`);
  }

  async refreshAgentRegistry(): Promise<void> {
    await this.discoverAndRegisterAgents();
    console.log(`[WorkflowEngine] Registry refreshed: ${this.agentRegistry.size} agents`);
  }

  async loadWorkflow(filePath: string): Promise<WorkflowDef> {
    const def = await this.parser.parse(filePath);
    this.validateWorkflowOwner(def);
    this.workflows.set(def.id, def);
    return def;
  }

  async loadAllWorkflows(dirPath: string): Promise<Map<string, WorkflowDef>> {
    this.workflows = await this.parser.parseDirectory(dirPath);
    return this.workflows;
  }

  /**
   * Resolve a workflow by ID with fallback strategies:
   * 1. Exact match (e.g., "workflow.init")
   * 2. Prefixed match (e.g., "init" → "workflow.init")
   * 3. Trigger command match (e.g., "/init" matches trigger.commands: ["init", "/init"])
   */
  private resolveWorkflow(workflowId: string): WorkflowDef | undefined {
    // 1. Exact match
    if (this.workflows.has(workflowId)) {
      return this.workflows.get(workflowId);
    }

    // 2. Try with "workflow." prefix
    const prefixed = `workflow.${workflowId}`;
    if (this.workflows.has(prefixed)) {
      return this.workflows.get(prefixed);
    }

    // 3. Search by trigger commands
    const normalized = workflowId.replace(/^\//, ''); // strip leading /
    for (const [, def] of this.workflows) {
      const triggers = def.trigger?.commands || [];
      if (triggers.some((cmd: string) => cmd.replace(/^\//, '') === normalized)) {
        return def;
      }
    }

    return undefined;
  }

  async start(input: StartWorkflowInput): Promise<WorkflowDef> {
    const def = this.resolveWorkflow(input.workflowId);
    if (!def) {
      const loaded = Array.from(this.workflows.keys());
      throw new Error(`[WorkflowEngine] Workflow "${input.workflowId}" not loaded. Available: [${loaded.join(', ')}]`);
    }

    const machine = this.createMachine(def);
    this.actor = createActor(machine, {
      input: { taskId: input.taskId, strategy: input.strategy, workflowDef: def },
    });

    this.actor.subscribe(() => this.emitStateChange());
    this.actor.start();
    // Transition from IDLE → EXECUTING
    this.actor.send({ type: ENGINE_EVENTS.START } as WorkflowEvent);
    console.log(`[WorkflowEngine] Started "${input.workflowId}" for task "${input.taskId}"`);
    return def;
  }

  stepComplete(): void {
    if (!this.actor) {
      throw new Error('[WorkflowEngine] No active workflow');
    }
    this.actor.send({ type: ENGINE_EVENTS.STEP_COMPLETE } as WorkflowEvent);
    console.log('[WorkflowEngine] Step completed');
  }

  respondToGate(input: GateResponseInput): void {
    if (!this.actor) {
      throw new Error('[WorkflowEngine] No active workflow');
    }

    if (input.decision === 'SI') {
      this.actor.send({ type: ENGINE_EVENTS.GATE_APPROVE, gateId: input.gateId } as WorkflowEvent);
    } else {
      this.actor.send({ type: ENGINE_EVENTS.GATE_REJECT, gateId: input.gateId, reason: input.reason } as WorkflowEvent);
    }
  }

  async reload(filePath: string): Promise<void> {
    const def = await this.parser.parse(filePath);
    this.workflows.set(def.id, def);
    console.log(`[WorkflowEngine] Reloaded workflow "${def.id}"`);
  }

  getState(): WorkflowEngineState | null {
    if (!this.actor) {
      return null;
    }

    const snapshot = this.actor.getSnapshot();
    const context = snapshot.context as WorkflowContext;

    const steps = context.workflowDef?.steps.map((step, idx) => ({
      id: String(step.number),
      label: step.title,
      status: (idx < context.currentStepIndex ? 'completed'
        : idx === context.currentStepIndex ? 'active'
          : 'pending') as 'completed' | 'active' | 'pending'
    }));

    return {
      taskId: context.taskId,
      currentPhase: context.currentWorkflowId,
      currentWorkflowId: context.currentWorkflowId,
      status: this.mapXStateStatus(String(snapshot.value)),
      gateResponses: context.gateResponses,
      startedAt: context.startedAt,
      updatedAt: new Date().toISOString(),
      ...(steps ? { steps } : {}),
      ...(context.workflowDef ? {
        workflow: context.workflowDef
      } : {})
    };
  }

  getWorkflow(workflowId: string): WorkflowDef | undefined {
    return this.workflows.get(workflowId);
  }

  getAgents(): AgentRole[] {
    return Array.from(this.agentRegistry.values());
  }

  hasAgent(agentId: string): boolean {
    return this.agentRegistry.has(agentId);
  }

  on(event: WorkflowEventType, listener: WorkflowEventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: WorkflowEventType, listener: WorkflowEventListener): void {
    this.listeners.get(event)?.delete(listener);
  }
}
