import { Agent, run, RunState } from '@openai/agents';
import { AgentRegistryService } from './registry.js';
import { PersistenceService } from './persistence.js';

export class WorkflowRuntimeService {
  constructor(
    private registry: AgentRegistryService,
    private persistence: PersistenceService
  ) { }

  /**
   * Processes a user message within a session.
   * If the session is new, it initializes it with the specified start agent.
   * If the session exists, it resumes execution.
   */
  async processMessage(
    sessionId: string,
    text: string,
    startAgentId: string = 'role.architect-agent'
  ): Promise<any> {

    // 1. Load existing state or initialize new
    let state: RunState<any, any> | undefined;
    const serializedState = await this.persistence.loadSession(sessionId);

    const initialAgent = this.registry.getAgent(startAgentId);
    if (!initialAgent) {
      throw new Error(`Start agent ${startAgentId} not found in registry.`);
    }

    if (serializedState) {
      state = await RunState.fromString(initialAgent, serializedState);
    }

    const runInput = state || text;

    // 2. Execute Run
    const result = await run(state?.currentAgent || initialAgent, runInput, {
      context: {},
    });

    // 3. Save State
    if (result.state) {
      const newStateSerialized = result.state.toString();
      await this.persistence.saveSession(sessionId, newStateSerialized);
    }

    return result;
  }

  /**
   * Approves a pending tool interruption.
   */
  async approve(sessionId: string, callId: string): Promise<any> {
    return this.handleDecision(sessionId, callId, 'approve');
  }

  /**
   * Rejects a pending tool interruption.
   */
  async reject(sessionId: string, callId: string): Promise<any> {
    return this.handleDecision(sessionId, callId, 'reject');
  }

  private async handleDecision(sessionId: string, callId: string, decision: 'approve' | 'reject'): Promise<any> {
    const serializedState = await this.persistence.loadSession(sessionId);
    if (!serializedState) {
      throw new Error(`Session ${sessionId} not found.`);
    }

    // We need an agent to hydrate the state
    // For now, we assume we can use the architect agent as a base for hydration
    const baseAgent = this.registry.getAgent('role.architect-agent');
    if (!baseAgent) {
      throw new Error('Base agent not found');
    }

    const state = await RunState.fromString(baseAgent, serializedState);

    // Find the interruption
    const interruptions = state.getInterruptions();
    const item = interruptions.find((i: any) => (i.rawItem?.callId === callId || i.rawItem?.id === callId));

    if (!item) {
      throw new Error(`Interruption with callId ${callId} not found in session ${sessionId}.`);
    }

    // Apply decision
    if (decision === 'approve') {
      state.approve(item);
    } else {
      state.reject(item);
    }

    // Resume execution
    const result = await run(state.currentAgent, state);

    // Save updated state
    if (result.state) {
      await this.persistence.saveSession(sessionId, result.state.toString());
    }

    return result;
  }
}
