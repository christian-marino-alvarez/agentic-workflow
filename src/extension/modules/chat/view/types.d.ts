import { TemplateResult } from 'lit';

export interface TaskStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done';
}

export interface WorkflowDetails {
  workflowId?: string;
  version?: string;
  type?: 'static' | 'dynamic';
  owner?: string;
  model?: string;
  contextFiles?: string[];
  gateRequirements?: string[];
  nextStep?: string;
  nextStepIndex?: number;
  pass?: { nextTarget: string | null; actions: string[]; rawContent: string } | null;
  fail?: { behavior: 'block' | 'retry'; cases: string[]; rawContent: string } | null;
  // Parsed sections from workflow markdown
  inputs?: string[];
  outputs?: string[];
  objective?: string;
  instructions?: string;
  currentPhaseLabel?: string;
}

export interface IChatView {
  history: Array<{ sender: string, text: string, role?: string, status?: string, isStreaming?: boolean, phase?: string }>;
  inputText: string;
  models: Array<{ id: string, name: string, provider: string }>;
  activeWorkflow: string;
  activeWorkflowDef?: any;
  isLoading: boolean;
  initialLoading: boolean;
  isSecure: boolean;
  isTesting: boolean;
  appVersion: string;
  attachments: string[];
  agentPermissions: Record<string, 'sandbox' | 'full'>;

  // Active agent (read-only status, no switching)
  selectedAgent: string;
  showAgentDropdown: boolean;
  availableAgents: Array<{ name: string; icon?: string; model?: { provider?: string; id?: string }; capabilities?: Record<string, boolean> }>;

  // Agent state derived from settings
  agentDisabled: boolean;
  agentModelName: string;

  // Task progress
  taskSteps: TaskStep[];
  showTimeline: boolean;
  showDetails: boolean;
  workflowDetails: WorkflowDetails;

  // Execution timer
  elapsedSeconds: number;
  activeTask: string;
  activeActivity: string;

  // Token usage
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
    requests: number;
    byModel: Record<string, { inputTokens: number; outputTokens: number; cost: number; requests: number }>;
  };
  showUsagePanel: boolean;

  // Pending A2UI confirmation (drives input area transformation)
  pendingA2UI: { type: string; blockId: string; label: string; artifactContent?: string; options: string[]; msgIndex: number; blockIndex: number; artifacts?: { path: string; label: string }[]; } | null;
  inputSkeleton: boolean;

  togglePermission(role: string): void;
  testConnection(): void;
  toggleTimeline(): void;
  toggleDetails(): void;
  toggleUsagePanel(): void;

  handleInput(e: InputEvent): void;
  handleKeyDown(e: KeyboardEvent): void;
  sendChatMessage(): void;
  sendSilentMessage(text: string): void;
  handleAttachFile(): void;
  removeAttachment(path: string): void;
  toggleAgentDropdown(): void;
  handleAgentChange(role: string): void;
  handleGateResponse(gateId: string, decision: 'approve' | 'reject'): void;
  confirmA2UIOption(option: string): void;
  cancelA2UI(): void;
  newSession(): void;
  sendMessage(target: string, command: string, data?: any, timeoutMs?: number): Promise<any>;
}
