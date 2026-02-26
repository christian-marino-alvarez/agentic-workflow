
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
  OPEN_FOLDER: 'OPEN_FOLDER', // Chat -> Background (trigger native VS Code open folder dialog)
  // Workflow gate integration
  GATE_REQUEST: 'GATE_REQUEST', // Runtime -> Chat (gate needs approval)
  GATE_RESPONSE: 'GATE_RESPONSE', // Chat -> Runtime (user gate decision)
  // Workflow state feedback
  WORKFLOW_STATE_UPDATE: 'WORKFLOW_STATE_UPDATE', // Runtime -> Chat (phase/status change)
  WORKFLOW_START: 'WORKFLOW_START', // Chat -> Runtime (start workflow)
  // Token usage
  USAGE_UPDATE: 'USAGE_UPDATE', // Background -> Chat (token counts + cost)
  // Dynamic lifecycle phases
  LIFECYCLE_PHASES_REQUEST: 'LIFECYCLE_PHASES_REQUEST', // View -> Background (request phases for strategy)
  LIFECYCLE_PHASES_RESPONSE: 'LIFECYCLE_PHASES_RESPONSE', // Background -> View (phases from filesystem)
  // Phase auto-start (after workflow transition)
  PHASE_AUTO_START: 'PHASE_AUTO_START', // Background -> View (auto-kickoff new phase)
  // Gate continue (for internal gates without workflow transition)
  GATE_CONTINUE: 'GATE_CONTINUE', // Background -> View (gate approved, send answer to LLM)
} as const;

export type ChatCommand = typeof MESSAGES[keyof typeof MESSAGES];

export const STEP_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DONE: 'done',
} as const;

export type StepStatus = typeof STEP_STATUS[keyof typeof STEP_STATUS];

