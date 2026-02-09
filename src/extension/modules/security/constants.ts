export const OPENAI_KEY_SECRET = 'agenticWorkflow.openaiApiKey';
export const LLM_PROVIDER_SECRET = 'agenticWorkflow.llmProvider';
export const CONTEXT_HAS_KEY = 'agenticWorkflow.hasKey';

export const Tab = {
  List: 'list',
  New: 'new',
  Edit: 'edit'
} as const;

export const ApiKeyStatus = {
  Missing: 'missing',
  Present: 'present'
} as const;

export const ViewMode = {
  New: 'new',
  Edit: 'edit'
} as const;

export const MessageType = {
  StateUpdate: 'state-update',
  WebviewReady: 'webview-ready',
  SetTab: 'set-tab',
  ChangeProvider: 'change-provider',
  ChangeEditProvider: 'change-edit-provider',
  EditModel: 'edit-model',
  SetActive: 'set-active',
  DeleteModel: 'delete-model',
  CreateModel: 'create-model',
  UpdateModel: 'update-model',
  GoChat: 'go-chat',
  ChangeEnvironment: 'change-environment',
} as const;
