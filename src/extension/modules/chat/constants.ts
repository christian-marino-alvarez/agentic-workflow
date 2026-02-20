
export const NAME = 'chat';

export const MESSAGES = {
  SEND_MESSAGE: 'SEND_MESSAGE', // Chat -> Runtime (Action Request)
  RECEIVE_MESSAGE: 'RECEIVE_MESSAGE', // Runtime -> Chat (Response)
  LOAD_INIT: 'LOAD_INIT', // Chat -> Background (Request Init Workflow)
  LOAD_INIT_RESPONSE: 'LOAD_INIT_RESPONSE', // Background -> Chat (Init Workflow Content)
  SELECT_FILES: 'SELECT_FILES',
  SELECT_FILES_RESPONSE: 'SELECT_FILES_RESPONSE',
  AGENT_STATUS: 'AGENT_STATUS',
  // History persistence
  SAVE_SESSION: 'SAVE_SESSION', // Chat -> Background (persist current session)
  LOAD_SESSION: 'LOAD_SESSION', // Chat -> Background (load a session by id)
  LOAD_SESSION_RESPONSE: 'LOAD_SESSION_RESPONSE', // Background -> Chat (session data)
  LIST_SESSIONS: 'LIST_SESSIONS', // Chat -> Background (get all sessions)
  LIST_SESSIONS_RESPONSE: 'LIST_SESSIONS_RESPONSE', // Background -> Chat (session list)
  DELETE_SESSION: 'DELETE_SESSION', // Chat -> Background (delete a session)
  NEW_SESSION: 'NEW_SESSION', // Chat -> Background (start fresh)
  // Delegation
  DELEGATION_EVENT: 'DELEGATION_EVENT', // Background -> Chat (delegation status updates)
} as const;

export type ChatCommand = typeof MESSAGES[keyof typeof MESSAGES];
