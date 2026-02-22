/**
 * Workflow Types
 *
 * Pure type declarations for the workflow execution engine.
 * Shared across parser, engine, and persistence layers.
 */

// ─── Workflow Definition Types ─────────────────────────────

export interface TriggerDef {
  commands?: string[];
}

export interface Frontmatter {
  id: string;
  description?: string;
  owner: string;
  version?: string;
  severity?: typeof import('./constants.js').SEVERITY[keyof typeof import('./constants.js').SEVERITY];
  trigger?: TriggerDef;
  blocking: boolean;
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

export interface WorkflowDef {
  id: string;
  description?: string;
  owner: string;
  version?: string;
  severity?: string;
  trigger?: TriggerDef;
  blocking: boolean;
  constitutions: string[];
  steps: WorkflowStep[];
  gate: GateDef | null;
  passTarget: string | null;
  failBehavior: typeof import('./constants.js').FAIL_BEHAVIOR[keyof typeof import('./constants.js').FAIL_BEHAVIOR];
  rawContent: string;
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
  currentWorkflowId: string;
  status: typeof import('./constants.js').ENGINE_STATUS[keyof typeof import('./constants.js').ENGINE_STATUS];
  gateResponses: Record<string, { decision: string; date: string }>;
  startedAt: string;
  updatedAt: string;
  steps?: Array<{
    id: string;
    label: string;
    status: 'pending' | 'active' | 'completed';
  }>;
  workflow?: {
    description?: string;
    owner: string;
    severity?: string;
    constitutions: string[];
    blocking: boolean;
  };
}

// ─── Engine Input Types (object params per clean-code §2.2) ──

export interface StartWorkflowInput {
  taskId: string;
  strategy: string;
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
  | { type: typeof import('./constants.js').ENGINE_EVENTS.START; taskId: string; strategy: string }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.STEP_COMPLETE; stepNumber: number }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.GATE_APPROVE; gateId: string }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.GATE_REJECT; gateId: string; reason?: string }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.PHASE_COMPLETE }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.RELOAD }
  | { type: typeof import('./constants.js').ENGINE_EVENTS.ERROR; message: string };

export interface WorkflowContext {
  taskId: string;
  strategy: string;
  currentWorkflowId: string;
  currentStepIndex: number;
  workflowDef: WorkflowDef | null;
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

export type WorkflowStatesConfig = Record<WorkflowStateName, WorkflowStateNode>;

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
