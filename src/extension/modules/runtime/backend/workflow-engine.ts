import { join } from 'node:path';
import { setup, createActor, type AnyActorRef } from 'xstate';
import { WorkflowParser } from './workflow-parser.js';
import { WorkflowPersistence } from './persistence.js';
import { ContextLoader } from './context-loader.js';
import { IntentResolver, tryParseStructuredResponse } from './intent-resolver.js';
import { buildPreamble, buildResponseSchema } from './prompt-schema.js';
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
  PrepareTurnInput,
  TurnPayload,
  ProcessedTurnResult,
} from '../types.js';

export type { StartWorkflowInput, GateResponseInput, WorkflowEventType, WorkflowEventListener };

export class WorkflowEngine {
  private parser: WorkflowParser;
  private persistence: WorkflowPersistence;
  private contextLoader: ContextLoader;
  private intentResolver: IntentResolver;
  private workspaceRoot: string;
  private actor: AnyActorRef | null = null;
  private agentRegistry: Map<string, AgentRole> = new Map();
  private workflows: Map<string, WorkflowDef> = new Map();
  private listeners: Map<WorkflowEventType, Set<WorkflowEventListener>> = new Map();
  private lastPersistedState: WorkflowEngineState | null = null;

  constructor(workspaceRoot: string, persistence: WorkflowPersistence) {
    this.workspaceRoot = workspaceRoot;
    this.parser = new WorkflowParser(workspaceRoot);
    this.persistence = persistence;
    this.contextLoader = new ContextLoader(workspaceRoot);
    this.intentResolver = new IntentResolver(workspaceRoot);
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
      this.lastPersistedState = savedState;
      console.log(`[#workflow] [WorkflowEngine] Restored: task=${savedState.taskId}`);
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
              pass: context.workflowDef?.pass,
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
      advancePhaseIndex: ({ context }: { context: WorkflowContext }) => {
        // Increment phase index for auto-transition tracking
        context.currentPhaseIndex = Math.min(
          context.currentPhaseIndex + 1,
          context.phases.length - 1
        );
        context.updatedAt = new Date().toISOString();
      },
    };
  }

  private createMachine(def: WorkflowDef): any {
    return setup({
      types: {
        context: {} as WorkflowContext,
        events: {} as WorkflowEvent,
        input: {} as { taskId: string; workflowDef: WorkflowDef },
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
        currentWorkflowId: def.id,
        isLifecycle: false,
        currentStepIndex: 0,
        currentPhaseIndex: 0,
        workflowDef: input.workflowDef,
        phases: [],
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

  /**
   * Build a hierarchical XState machine from lifecycle phase definitions.
   * Each phase becomes a state. Gate approval triggers auto-transition to the next phase.
   */
  private buildLifecycleMachine(phases: WorkflowDef[], lifecycleDef: WorkflowDef) {
    const phaseStates: Record<string, any> = {};

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const phaseKey = phase.id.replace(/\./g, '_');
      const hasGate = phase.gate !== null && phase.gate !== undefined;
      const nextPhaseKey = i < phases.length - 1
        ? phases[i + 1].id.replace(/\./g, '_')
        : 'lifecycle_completed';

      phaseStates[phaseKey] = {
        on: {
          [ENGINE_EVENTS.STEP_COMPLETE]: hasGate
            ? [{ target: `${phaseKey}` }]
            : [],
          // Gate events — auto-transition to next phase on approval
          ...(hasGate ? {
            [ENGINE_EVENTS.PHASE_GATE_APPROVE]: {
              target: nextPhaseKey,
              actions: ['advancePhaseIndex', 'notifyPhaseComplete'],
            },
            [ENGINE_EVENTS.PHASE_GATE_REJECT]: {
              actions: ['notifyError'],
            },
          } : {}),
          // Manual advance if no gate
          ...(!hasGate ? {
            [ENGINE_EVENTS.PHASE_ADVANCE]: {
              target: nextPhaseKey,
              actions: ['advancePhaseIndex', 'notifyPhaseComplete'],
            },
          } : {}),
          [ENGINE_EVENTS.ERROR]: {
            actions: ['notifyError'],
          },
        },
        entry: [() => {
          console.log(`[#workflow] [WorkflowEngine] Entered phase: ${phase.id} (owner: ${phase.owner})`);
        }],
      };
    }

    // Final state
    phaseStates['lifecycle_completed'] = {
      type: 'final' as const,
      entry: ['notifyPhaseComplete'],
    };

    return setup({
      types: {
        context: {} as WorkflowContext,
        events: {} as WorkflowEvent,
        input: {} as { taskId: string; workflowDef: WorkflowDef; phases: WorkflowDef[] },
      },
      guards: {
        hasGate: ({ context }) => {
          const currentPhase = context.phases[context.currentPhaseIndex];
          return currentPhase?.gate !== null && currentPhase?.gate !== undefined;
        },
      },
      actions: this.buildMachineActions(this),
    }).createMachine({
      id: lifecycleDef.id,
      initial: phases.length > 0 ? phases[0].id.replace(/\./g, '_') : 'lifecycle_completed',
      context: ({ input }) => ({
        taskId: input.taskId,
        currentWorkflowId: lifecycleDef.id,
        isLifecycle: true,
        currentStepIndex: 0,
        currentPhaseIndex: 0,
        workflowDef: input.workflowDef,
        phases: input.phases,
        gateResponses: {},
        error: null,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      states: phaseStates,
    });
  }

  /**
   * Detect if a workflow ID refers to a lifecycle (contains phases in a sub-directory).
   * Works by checking if a matching directory exists under .agent/workflows/.
   */
  private isLifecycleWorkflow(workflowId: string): boolean {
    // Data-driven: check if any loaded workflow's directory structure has phases
    // For now we check common naming conventions, but the real check is in start()
    // where we attempt to parse phase files from the directory.
    return this.parser.hasPhaseDirectory(workflowId);
  }

  /**
   * Resolve the lifecycle directory name from a workflow ID.
   * Strips common prefixes and normalizes.
   */
  private getLifecycleDirName(workflowId: string): string {
    // Remove trailing prefixes if present
    return workflowId.replace(/^workflow\./, '').replace(/^workflows\./, '');
  }

  // ─── Public API ───────────────────────────────────────────

  async initialize(): Promise<void> {
    console.log('[#workflow] [WorkflowEngine] Initializing...');
    await this.discoverAndRegisterAgents();
    await this.restorePersistedState();
    console.log(`[#workflow] [WorkflowEngine] Ready (${this.agentRegistry.size} agents)`);
  }

  async refreshAgentRegistry(): Promise<void> {
    await this.discoverAndRegisterAgents();
    console.log(`[#workflow] [WorkflowEngine] Registry refreshed: ${this.agentRegistry.size} agents`);
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
   * 3. Trigger command match (e.g., "/init" matches trigger: ["init", "/init"])
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

    // 3. Search by trigger array (string[] directly)
    const normalized = workflowId.replace(/^\//, '');
    for (const [, def] of this.workflows) {
      const triggers = def.trigger || [];
      if (triggers.some((cmd: string) => cmd.replace(/^\//, '') === normalized)) {
        return def;
      }
    }

    return undefined;
  }

  async start(input: StartWorkflowInput): Promise<WorkflowDef> {
    if (!input.taskId) {
      input.taskId = `task-${Date.now()}`;
    }

    // 1. Lifecycle workflows: build hierarchical machine from phase directory
    //    These aren't individual workflow files — they're directories of phases.
    if (this.isLifecycleWorkflow(input.workflowId)) {
      const dirName = this.getLifecycleDirName(input.workflowId);
      const lifecyclePath = join(this.parser['workspaceRoot'], '.agent', 'workflows', dirName);
      const phases = await this.parser.parsePhaseDirectory(lifecyclePath);

      if (phases.length > 0) {
        // Build a synthetic def for the lifecycle container
        const lifecycleDef: WorkflowDef = {
          id: `workflow.${dirName}`,
          description: `Lifecycle: ${dirName}`,
          owner: phases[0].owner,
          trigger: [dirName],
          type: 'static',
          constitutions: [],
          steps: [],
          gate: phases[0].gate,
          pass: null,
          fail: null,
          rawContent: '',
          sections: { inputs: [], outputs: [], objective: '', instructions: '', pass: '', fail: '' },
        };

        console.log(`[#workflow] [WorkflowEngine] Building lifecycle machine with ${phases.length} phases`);
        const machine = this.buildLifecycleMachine(phases, lifecycleDef);
        this.actor = createActor(machine, {
          input: { taskId: input.taskId, workflowDef: lifecycleDef, phases },
        });
        this.actor.subscribe(() => this.emitStateChange());
        this.actor.start();
        console.log(`[#workflow] [WorkflowEngine] Started lifecycle "${input.workflowId}" for task "${input.taskId}" (${phases.length} phases)`);
        return lifecycleDef;
      }
    }

    // 2. Simple workflows: resolve from loaded workflow definitions
    const def = this.resolveWorkflow(input.workflowId);
    if (!def) {
      const loaded = Array.from(this.workflows.keys());
      throw new Error(`[WorkflowEngine] Workflow "${input.workflowId}" not loaded. Available: [${loaded.join(', ')}]`);
    }

    const machine = this.createMachine(def);
    this.actor = createActor(machine, {
      input: { taskId: input.taskId, workflowDef: def },
    });

    this.actor.subscribe(() => this.emitStateChange());
    this.actor.start();
    this.actor.send({ type: ENGINE_EVENTS.START } as WorkflowEvent);
    console.log(`[#workflow] [WorkflowEngine] Started "${input.workflowId}" for task "${input.taskId}"`);
    return def;
  }

  /**
   * Start a dynamic subtask workflow within the current lifecycle.
   */
  async startSubtask(workflowId: string): Promise<WorkflowDef> {
    const def = this.resolveWorkflow(workflowId);
    if (!def) {
      throw new Error(`[WorkflowEngine] Subtask workflow "${workflowId}" not loaded.`);
    }

    if (def.type !== 'dynamic') {
      throw new Error(`[WorkflowEngine] Workflow "${workflowId}" is not dynamic (type=${def.type}).`);
    }

    const state = this.getState();
    if (state) {
      this.emit({
        eventType: LISTENER_EVENTS.SUBTASK_START,
        state,
        payload: { workflowId: def.id, owner: def.owner },
      });
    }

    console.log(`[#workflow] [WorkflowEngine] Started subtask "${workflowId}" (type: dynamic)`);
    return def;
  }

  /**
   * Complete a dynamic subtask workflow.
   */
  completeSubtask(workflowId: string): void {
    const state = this.getState();
    if (state) {
      this.emit({
        eventType: LISTENER_EVENTS.SUBTASK_COMPLETE,
        state,
        payload: { workflowId },
      });
    }
    console.log(`[#workflow] [WorkflowEngine] Subtask "${workflowId}" completed`);
  }


  /**
   * Get the currently active phase definition (for lifecycle workflows).
   */
  getCurrentPhase(): WorkflowDef | null {
    if (!this.actor) { return null; }
    const context = this.actor.getSnapshot().context as WorkflowContext;
    if (!context.phases || context.phases.length === 0) { return null; }
    return context.phases[context.currentPhaseIndex] || null;
  }

  stepComplete(): void {
    if (!this.actor) {
      throw new Error('[WorkflowEngine] No active workflow');
    }
    this.actor.send({ type: ENGINE_EVENTS.STEP_COMPLETE } as WorkflowEvent);
    console.log('[#workflow] [WorkflowEngine] Step completed');
  }

  /**
   * Respond to a gate. Automatically dispatches the correct event
   * based on whether the current workflow is a lifecycle (phase gate)
   * or a simple workflow (standard gate).
   */
  respondToGate(input: GateResponseInput): void {
    if (!this.actor) {
      throw new Error('[WorkflowEngine] No active workflow');
    }

    const context = this.actor.getSnapshot().context as WorkflowContext;
    const isLifecycle = context.isLifecycle;

    if (input.decision === 'SI') {
      if (isLifecycle) {
        this.actor.send({ type: ENGINE_EVENTS.PHASE_GATE_APPROVE, phaseId: input.gateId } as WorkflowEvent);
      } else {
        this.actor.send({ type: ENGINE_EVENTS.GATE_APPROVE, gateId: input.gateId } as WorkflowEvent);
      }
    } else {
      if (isLifecycle) {
        this.actor.send({ type: ENGINE_EVENTS.PHASE_GATE_REJECT, phaseId: input.gateId, reason: input.reason } as WorkflowEvent);
      } else {
        this.actor.send({ type: ENGINE_EVENTS.GATE_REJECT, gateId: input.gateId, reason: input.reason } as WorkflowEvent);
      }
    }
  }

  /**
   * Reset engine to a clean state: stop active actor, clear persistence.
   */
  async reset(): Promise<void> {
    if (this.actor) {
      this.actor.stop();
      this.actor = null;
    }
    this.lastPersistedState = null;
    await this.persistence.clear();
    console.log('[#workflow] [WorkflowEngine] Reset — all state cleared');
  }

  /**
   * Switch to a different task by loading its persisted state.
   * Stops the current actor (if any) and restores the snapshot for the target task.
   * The XState actor is NOT re-created — the snapshot is enough for UI rendering.
   * If the user continues working, the next start/stepComplete will re-create the actor.
   */
  async switchToTask(taskId: string): Promise<WorkflowEngineState | null> {
    if (this.actor) {
      this.actor.stop();
      this.actor = null;
    }

    const state = await this.persistence.loadTaskState(taskId);
    if (state) {
      this.lastPersistedState = state;
      await this.persistence.setActiveTask(taskId);
      console.log(`[#workflow] [WorkflowEngine] Switched to task: ${taskId}`);
    } else {
      this.lastPersistedState = null;
      console.log(`[#workflow] [WorkflowEngine] No state for task: ${taskId}`);
    }

    return state;
  }

  async reload(filePath: string): Promise<void> {
    const def = await this.parser.parse(filePath);
    this.workflows.set(def.id, def);
    console.log(`[#workflow] [WorkflowEngine] Reloaded workflow "${def.id}"`);
  }

  getState(): WorkflowEngineState | null {
    if (!this.actor) {
      return this.lastPersistedState || null;
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

    const currentPhase = context.phases.length > 0
      ? context.phases[context.currentPhaseIndex]
      : null;

    const phasesList = context.phases.map((phase, idx) => ({
      id: phase.id,
      label: phase.description || phase.id,
      owner: phase.owner,
      status: (idx < context.currentPhaseIndex ? 'completed'
        : idx === context.currentPhaseIndex ? 'active'
          : 'pending') as 'completed' | 'active' | 'pending' | 'failed',
    }));

    // For lifecycle workflows, expose the CURRENT PHASE as the active workflow
    // so the LLM receives phase-specific instructions, gate, and objectives.
    // For simple workflows, use the workflowDef directly.
    const activeWorkflow = currentPhase || context.workflowDef;

    return {
      taskId: context.taskId,
      currentPhase: context.currentWorkflowId,
      currentPhaseId: currentPhase?.id || context.currentWorkflowId,
      currentWorkflowId: context.currentWorkflowId,
      isLifecycle: context.isLifecycle,
      status: this.mapXStateStatus(String(snapshot.value)),
      gateResponses: context.gateResponses,
      startedAt: context.startedAt,
      updatedAt: new Date().toISOString(),
      ...(steps ? { steps } : {}),
      ...(phasesList.length > 0 ? { phases: phasesList } : {}),
      ...(currentPhase ? { parsedSections: currentPhase.sections } : {}),
      ...(activeWorkflow ? {
        workflow: {
          id: activeWorkflow.id,
          description: activeWorkflow.description,
          owner: activeWorkflow.owner,
          type: activeWorkflow.type,
          constitutions: activeWorkflow.constitutions,
          gate: activeWorkflow.gate,
          pass: activeWorkflow.pass,
          fail: activeWorkflow.fail,
          rawContent: activeWorkflow.rawContent,
          sections: activeWorkflow.sections,
        }
      } : {}),
    };
  }

  // ─── Runtime-Centric Turn Processing ─────────────────────────

  /**
   * Prepare a full LLM turn payload with all contexts loaded.
   * Chat receives this and just sends it to the LLM.
   */
  async prepareTurn(input: PrepareTurnInput): Promise<TurnPayload> {
    const state = this.getState();
    const currentPhase = state?.workflow || null;
    const owner = currentPhase?.owner || input.agentRole;

    // Load all context files
    const constitutionRefs = currentPhase?.constitutions || [];
    const workflowContextRefs: string[] = [];
    // Extract context refs from parsed sections if available
    if (state?.parsedSections?.inputs) {
      workflowContextRefs.push(...state.parsedSections.inputs.filter(i => i.startsWith('.agent/')));
    }

    const ctx = await this.contextLoader.loadAll(owner, constitutionRefs, workflowContextRefs);

    // Build system prompt — preamble + response schema FIRST (prefix caching)
    const systemParts: string[] = [
      buildPreamble(input.language),
      buildResponseSchema(),
    ];
    if (ctx.agentPersona) {
      systemParts.push(ctx.agentPersona);
    }
    if (ctx.constitutions.length > 0) {
      systemParts.push(`### CONSTITUTIONS\n${ctx.constitutions.join('\n')}`);
    }
    if (ctx.workflowContextFiles.length > 0) {
      systemParts.push(`### WORKFLOW CONTEXT\n${ctx.workflowContextFiles.join('\n')}`);
    }
    // Inject workflow instructions
    if (state?.parsedSections?.instructions) {
      systemParts.push(`### CURRENT PHASE INSTRUCTIONS\n${state.parsedSections.instructions}`);
    }
    if (state?.parsedSections?.objective) {
      systemParts.push(`### OBJECTIVE\n${state.parsedSections.objective}`);
    }
    if (currentPhase?.gate) {
      systemParts.push(`### GATE REQUIREMENTS\n${currentPhase.gate.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}`);
    }

    // Build messages
    const messages: TurnPayload['messages'] = [
      { role: 'system', content: systemParts.join('\n\n') },
      ...input.history,
      { role: 'user', content: input.text },
    ];

    return {
      systemPrompt: systemParts.join('\n\n'),
      messages,
      workflowContext: {
        phaseId: state?.currentPhaseId || '',
        phaseName: currentPhase?.description || '',
        owner,
        status: state?.status || 'idle',
        gate: currentPhase?.gate || null,
      },
      taskType: 'default',
    };
  }

  /**
   * Process LLM response: parse JSON, resolve intents, return display data.
   */
  async processResponse(llmText: string): Promise<ProcessedTurnResult> {
    const state = this.getState();
    const phaseId = state?.currentPhaseId || '';

    // Parse structured response
    const structured = tryParseStructuredResponse(llmText);
    if (!structured) {
      // Not structured JSON — pass raw text through
      return {
        displayText: llmText,
        a2ui: [],
        machineState: state,
        pendingActions: [],
      };
    }

    // Resolve intents via IntentResolver
    const intents = structured.intents || [];
    const resolution = this.intentResolver.resolve(intents, phaseId);

    return {
      displayText: structured.text,
      a2ui: resolution.a2ui,
      machineState: state,
      pendingActions: resolution.pendingActions,
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
