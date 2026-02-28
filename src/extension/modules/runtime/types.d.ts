/**
 * Workflow Types
 *
 * Pure type declarations for the workflow execution engine.
 * Shared across parser, engine, and persistence layers.
 *
 * Aligned with normalized workflow structure (T025/T026).
 */

// ─── Workflow Definition Types ─────────────────────────────

export interface Frontmatter {
  id: string;
  name?: string;
  description?: string;
  owner: string;
  version?: string;
  trigger: string[];
  type: 'static' | 'dynamic';
  objective?: string;
  context?: string[];
  input?: string[];
  output?: string[];
  pass?: {
    nextTarget?: string | Record<string, string>;
  };
}

export interface WorkflowStep {
  number: number;
  title: string;
  content: string;
  isGate: boolean;
}

export interface GateDef {
  requirements: string[];
  failStep: number | null;
}

export interface PassDef {
  nextTarget: string | null;
  actions: string[];
  rawContent: string;
}

export interface FailDef {
  behavior: 'block' | 'retry';
  cases: string[];
  rawContent: string;
}

export interface ParsedSections {
  inputs: string[];
  outputs: string[];
  objective: string;
  instructions: string;
  pass: string;
  fail: string;
}

export interface WorkflowDef {
  id: string;
  description?: string;
  owner: string;
  version?: string;
  trigger: string[];
  type: 'static' | 'dynamic';
  constitutions: string[];
  steps: WorkflowStep[];
  gate: GateDef | null;
  pass: PassDef | null;
  fail: FailDef | null;
  rawContent: string;
  sections: ParsedSections;
}

// ─── Agent Registry Types ─────────────────────────────────────

export interface AgentRole {
  id: string;
  name: string;
  filePath: string;
}

// ─── Workflow Engine State ────────────────────────────────────

export interface WorkflowEngineState {
  taskId: string;
  currentPhase: string;
  currentPhaseId: string;
  currentWorkflowId: string;
  /** True when running a multi-phase lifecycle (vs a simple single-workflow). */
  isLifecycle: boolean;
  status: typeof import('./constants.js').ENGINE_STATUS[keyof typeof import('./constants.js').ENGINE_STATUS];
  gateResponses: Record<string, { decision: string; date: string }>;
  startedAt: string;
  updatedAt: string;
  steps?: Array<{
    id: string;
    label: string;
    status: 'pending' | 'active' | 'completed';
  }>;
  phases?: Array<{
    id: string;
    label: string;
    owner: string;
    status: 'pending' | 'active' | 'completed' | 'failed';
  }>;
  parsedSections?: ParsedSections;
  workflow?: {
    id: string;
    description?: string;
    owner: string;
    type: 'static' | 'dynamic';
    constitutions: string[];
    gate?: GateDef | null;
    pass?: PassDef | null;
    fail?: FailDef | null;
    rawContent?: string;
    sections?: ParsedSections;
  };
}

// ─── Engine Input Types (object params per clean-code §2.2) ──

export interface StartWorkflowInput {
  taskId: string;
  workflowId: string;
}

export interface GateResponseInput {
  gateId: string;
  decision: 'SI' | 'NO';
  reason?: string;
}

export interface EmitInput {
  eventType: WorkflowEventType;
  state: WorkflowEngineState;
  payload?: Record<string, unknown>;
}

// ─── XState Machine Types ─────────────────────────────────────

export type WorkflowEvent =
  | { type: typeof import('./constants.js').ENGINE_EVENTS.START; taskId: string }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.STEP_COMPLETE; stepNumber: number }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.GATE_APPROVE; gateId: string }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.GATE_REJECT; gateId: string; reason?: string }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.PHASE_COMPLETE }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.PHASE_ADVANCE }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.PHASE_GATE_APPROVE; phaseId: string }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.PHASE_GATE_REJECT; phaseId: string; reason?: string }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.SUBTASK_START; workflowId: string }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.SUBTASK_COMPLETE; workflowId: string }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.RELOAD }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.ERROR; message: string };

export interface WorkflowContext {
  taskId: string;
  currentWorkflowId: string;
  /** True when running a multi-phase lifecycle (vs a simple single-workflow). */
  isLifecycle: boolean;
  currentStepIndex: number;
  currentPhaseIndex: number;
  workflowDef: WorkflowDef | null;
  phases: WorkflowDef[];
  gateResponses: Record<string, { decision: string; date: string }>;
  error: string | null;
  startedAt: string;
  updatedAt: string;
}

// ─── Machine Schema Types ─────────────────────────────────────

export type WorkflowStateName = typeof import('./constants.js').WORKFLOW_STATES[keyof typeof import('./constants.js').WORKFLOW_STATES];

export interface WorkflowTransition {
  target: WorkflowStateName;
  guard?: string;
}

export interface WorkflowStateNode {
  type?: 'final';
  on?: Record<string, WorkflowTransition | WorkflowTransition[]>;
  entry?: string[];
}

export type WorkflowStatesConfig = Partial<Record<WorkflowStateName, WorkflowStateNode>> & Record<string, WorkflowStateNode>;

// ─── Event Listener Types ─────────────────────────────────────

export type WorkflowEventType = typeof import('./constants.js').LISTENER_EVENTS[keyof typeof import('./constants.js').LISTENER_EVENTS];

export type WorkflowEventListener = (data: {
  type: WorkflowEventType;
  state: WorkflowEngineState;
  payload?: Record<string, unknown>;
}) => void;

// ─── Persistence Types ────────────────────────────────────────

export interface WorkflowStateDB {
  version: number;
  activeTask: string | null;
  states: Record<string, WorkflowEngineState>;
  lastUpdated: string;
}

// ─── Runtime-Centric Turn Types ───────────────────────────────

/**
 * Input for prepareTurn: Chat sends user text + history to Runtime.
 */
export interface PrepareTurnInput {
  text: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  agentRole: string;
  language: string | null;
}

/**
 * What Runtime gives back to Chat so Chat can send to LLM.
 * Contains the fully composed prompt with all contexts loaded.
 */
export interface TurnPayload {
  /** System prompt: persona + constitutions + workflow instructions */
  systemPrompt: string;
  /** Conversation messages ready for LLM API */
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  /** Current workflow context for intent resolution */
  workflowContext: {
    phaseId: string;
    phaseName: string;
    owner: string;
    status: string;
    gate: GateDef | null;
  };
  /** Metadata for routing */
  taskType: 'routing' | 'default';
}

/**
 * A2UI block returned from Runtime after processing LLM response.
 */
export interface ResolvedA2UIBlock {
  type: string;
  id: string;
  label?: string;
  path?: string;
  content?: string;
  options?: string[];
  preselected?: number;
}

/**
 * Result of Runtime processing the LLM response.
 * Chat just renders this directly.
 */
export interface ProcessedTurnResult {
  /** Text to display in chat bubble */
  displayText: string;
  /** A2UI blocks to render (artifact cards, gates, etc.) */
  a2ui: ResolvedA2UIBlock[];
  /** Updated machine state */
  machineState: WorkflowEngineState | null;
  /** Messages to send back to Runtime (workflow transitions, etc.) */
  pendingActions: Array<{ type: string; data?: any }>;
}

