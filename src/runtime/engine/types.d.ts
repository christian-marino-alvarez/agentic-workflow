export type RuntimeEventType =
  | 'run_started'
  | 'workflow_loaded'
  | 'context_resolved'
  | 'step_started'
  | 'step_completed'
  | 'state_persisted'
  | 'phase_updated'
  | 'run_completed'
  | 'error'
  | 'chat_message';

export type RuntimeStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface RuntimeEvent {
  type: RuntimeEventType;
  timestamp: string;
  runId: string;
  workflowId?: string;
  phase?: string;
  stepId?: string;
  payload?: Record<string, unknown>;
}

export interface RuntimeStepState {
  id: string;
  status: RuntimeStatus;
}

export interface RuntimeState {
  version: 1;
  runId: string;
  taskId: string;
  taskTitle: string;
  taskPath: string;
  workflowId: string;
  workflowPath: string;
  phase: string;
  status: RuntimeStatus;
  steps: RuntimeStepState[];
  updatedAt: string;
}

export interface RuntimePaths {
  statePath: string;
  eventsPath?: string;
}

export interface RuntimeRunInput {
  taskPath: string;
  agent: string;
  workflow?: string;
  paths: RuntimePaths;
}
