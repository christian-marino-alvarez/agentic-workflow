import { TemplateResult } from 'lit';

export interface TaskStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done';
}

export interface IChatView {
  history: Array<{ sender: string, text: string, role?: string, status?: string, isStreaming?: boolean, phase?: string }>;
  inputText: string;
  models: Array<{ id: string, name: string, provider: string }>;
  activeWorkflow: string;
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

  // Execution timer
  elapsedSeconds: number;
  activeTask: string;
  activeActivity: string;

  togglePermission(role: string): void;
  testConnection(): void;
  toggleTimeline(): void;

  handleInput(e: InputEvent): void;
  handleKeyDown(e: KeyboardEvent): void;
  sendChatMessage(): void;
  handleAttachFile(): void;
  removeAttachment(path: string): void;
  toggleAgentDropdown(): void;
  handleAgentChange(role: string): void;
}
