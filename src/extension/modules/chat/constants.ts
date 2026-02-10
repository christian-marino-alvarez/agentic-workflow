export const Tab = {
  Main: 'main'
} as const;

export const MessageType = {
  WebviewReady: 'webview-ready',
  StateUpdate: 'chat:state-update',
  SetTab: 'set-tab',
  ChatRequest: 'chat:request',
  SetModel: 'chat:set-model',
  ModelProposal: 'chat:model-proposal',
  ModelDecision: 'chat:model-decision'
} as const;

export const CHAT_API_URL = 'http://localhost:3000/api/chat/chatkit';
