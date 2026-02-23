
export const NAME = 'Runtime';

/**
 * Root paths for .agent/ directory structure.
 * Single source of truth — modify here to update all consumers.
 */
export const PATHS = {
  AGENT_ROOT: '.agent',
  WORKFLOWS_DIR: '.agent/workflows',
  WORKFLOWS_GLOB: '.agent/workflows/**/*.md',
  ROLES_DIR: '.agent/rules/roles',
  ROLES_GLOB: '.agent/rules/roles/*.md',
  STATE_FILE: '.agent/workflow-state.json',
} as const;

/**
 * Rule severity levels.
 */
export const SEVERITY = {
  PERMANENT: 'PERMANENT',
  MEMORY: 'MEMORY',
  INJECTED: 'INJECTED',
  RECOMMENDED: 'RECOMMENDED',
} as const;

/**
 * Workflow engine status values.
 */
export const ENGINE_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  WAITING_GATE: 'waiting-gate',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

/**
 * Workflow fail behavior options.
 */
export const FAIL_BEHAVIOR = {
  BLOCK: 'block',
  RETRY: 'retry',
} as const;

/**
 * Message types for Background ↔ View communication.
 */
export const MESSAGES = {
  EXECUTE_ACTION: 'EXECUTE_ACTION',
  WORKFLOW_LOAD: 'WORKFLOW_LOAD',
  WORKFLOW_START: 'WORKFLOW_START',
  WORKFLOW_GATE_REQUEST: 'WORKFLOW_GATE_REQUEST',
  WORKFLOW_GATE_RESPONSE: 'WORKFLOW_GATE_RESPONSE',
  WORKFLOW_STATE_UPDATE: 'WORKFLOW_STATE_UPDATE',
  WORKFLOW_STEP_COMPLETE: 'WORKFLOW_STEP_COMPLETE',
  WORKFLOW_RELOAD: 'WORKFLOW_RELOAD',
  WORKFLOW_STATUS: 'WORKFLOW_STATUS',
  WORKFLOW_AGENTS: 'WORKFLOW_AGENTS',
} as const;

/**
 * RPC command identifiers for Backend sidecar communication.
 * Used with core enableRpc() bridge.
 */
export const RPC_COMMANDS = {
  STATUS: 'status',
  INITIALIZE: 'initialize',
  WORKFLOW_LOAD: 'workflow.load',
  WORKFLOW_LOAD_ALL: 'workflow.loadAll',
  WORKFLOW_START: 'workflow.start',
  WORKFLOW_STEP_COMPLETE: 'workflow.stepComplete',
  WORKFLOW_GATE_RESPOND: 'workflow.gate.respond',
  WORKFLOW_STATUS: 'workflow.status',
  WORKFLOW_RELOAD: 'workflow.reload',
  WORKFLOW_AGENTS: 'workflow.agents',
  WORKFLOW_AGENTS_REFRESH: 'workflow.agents.refresh',
} as const;

/**
 * XState machine state names.
 */
export const WORKFLOW_STATES = {
  IDLE: 'idle',
  EXECUTING: 'executing',
  WAITING_GATE: 'waitingGate',
  COMPLETED: 'completed',
  FAILED: 'failed',
  // Phase-level sub-states
  PHASE_EXECUTING: 'phaseExecuting',
  PHASE_GATE: 'phaseGate',
  PHASE_DONE: 'phaseDone',
  PHASE_FAILED: 'phaseFailed',
} as const;

/**
 * XState machine event type identifiers.
 * Used in WorkflowEvent discriminated union.
 */
export const ENGINE_EVENTS = {
  START: 'START',
  STEP_COMPLETE: 'STEP_COMPLETE',
  GATE_APPROVE: 'GATE_APPROVE',
  GATE_REJECT: 'GATE_REJECT',
  PHASE_COMPLETE: 'PHASE_COMPLETE',
  PHASE_ADVANCE: 'PHASE_ADVANCE',
  PHASE_GATE_APPROVE: 'PHASE_GATE_APPROVE',
  PHASE_GATE_REJECT: 'PHASE_GATE_REJECT',
  RELOAD: 'RELOAD',
  ERROR: 'ERROR',
} as const;

/**
 * Engine listener event types (emitted to subscribers).
 */
export const LISTENER_EVENTS = {
  STATE_CHANGE: 'stateChange',
  GATE_REQUEST: 'gateRequest',
  STEP_EXECUTION: 'stepExecution',
  PHASE_COMPLETE: 'phaseComplete',
  ERROR: 'error',
} as const;

/**
 * RPC notification channels (outbound from sidecar → extension host).
 */
export const RPC_NOTIFICATIONS = {
  WORKFLOW_EVENT: 'workflow.event',
} as const;
