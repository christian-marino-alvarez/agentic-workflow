export const Tab = {
  Main: 'main'
} as const;

export const MessageType = {
  WebviewReady: 'webview-ready',
  StateUpdate: 'state-update',
  SetTab: 'set-tab',
  ChatRequest: 'chat:request'
} as const;

export const CHAT_API_URL = 'http://localhost:3000/api/chat/chatkit';
