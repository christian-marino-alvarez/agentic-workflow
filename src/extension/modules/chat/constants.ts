
export const NAME = 'chat';

export const MESSAGES = {
  SEND_MESSAGE: 'SEND_MESSAGE', // Chat -> Runtime (Action Request)
  RECEIVE_MESSAGE: 'RECEIVE_MESSAGE', // Runtime -> Chat (Response)
  LOAD_INIT: 'LOAD_INIT', // Chat -> Background (Request Init Workflow)
  LOAD_INIT_RESPONSE: 'LOAD_INIT_RESPONSE', // Background -> Chat (Init Workflow Content)
} as const;

export type ChatCommand = typeof MESSAGES[keyof typeof MESSAGES];
