import { TemplateResult } from 'lit';

export interface IChatView {
  history: Array<{ sender: string, text: string, role?: string, status?: string }>;
  inputText: string;
  models: Array<{ id: string, name: string, provider: string }>;
  selectedModelId: string;
  agentFilter: string;
  activeWorkflow: string;
  isLoading: boolean;
  appVersion: string;
  attachments: string[];
  agentPermissions: Record<string, 'sandbox' | 'full'>;

  togglePermission(role: string): void;

  handleInput(e: InputEvent): void;
  handleKeyDown(e: KeyboardEvent): void;
  sendChatMessage(): void;
  handleModelChange(e: Event): void;
  handleFilterChange(e: Event): void;
  handleAttachFile(): void;
  removeAttachment(path: string): void;
}
