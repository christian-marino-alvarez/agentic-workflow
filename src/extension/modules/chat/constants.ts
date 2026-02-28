
export const NAME = 'chat';

// ─── User Actions (View → Background) ──────────────────────────────────────
export const USER_ACTIONS = {
  SEND: 'USER_SEND',                 // Texto libre → LLM
  SELECTED: 'USER_SELECTED',         // Respuesta A2UI (choice/select)
  ACCEPTED: 'USER_ACCEPTED',         // Gate aprobado
  DENIED: 'USER_DENIED',             // Gate rechazado
  SELECT_FILES: 'SELECT_FILES',      // Abrir diálogo de selección de archivos
  OPEN_FOLDER: 'OPEN_FOLDER',        // Abrir diálogo de carpeta
  OPEN_FILE: 'OPEN_FILE',            // Abrir archivo en editor
} as const;

// ─── Server Events (Background → View) ─────────────────────────────────────
export const SERVER_EVENTS = {
  RECEIVE_MESSAGE: 'RECEIVE_MESSAGE',             // Respuesta del LLM (streaming)
  AGENT_STATUS: 'AGENT_STATUS',                   // Estado del agente
  GATE_REQUEST: 'GATE_REQUEST',                   // Runtime solicita aprobación de gate
  WORKFLOW_STATE_UPDATE: 'WORKFLOW_STATE_UPDATE',  // Cambio de fase/estado
  WORKFLOW_START: 'WORKFLOW_START',                // Inicio de workflow
  USAGE_UPDATE: 'USAGE_UPDATE',                   // Contadores de tokens + coste
  DELEGATION_EVENT: 'DELEGATION_EVENT',            // Eventos de delegación entre agentes
  LOAD_INIT_RESPONSE: 'LOAD_INIT_RESPONSE',       // Contenido del Init Workflow
  SELECT_FILES_RESPONSE: 'SELECT_FILES_RESPONSE',
  LOAD_SESSION_RESPONSE: 'LOAD_SESSION_RESPONSE',
  LIST_SESSIONS_RESPONSE: 'LIST_SESSIONS_RESPONSE',
  LIFECYCLE_PHASES_RESPONSE: 'LIFECYCLE_PHASES_RESPONSE',
  PHASE_AUTO_START: 'PHASE_AUTO_START',            // Auto-kickoff nueva fase
  GATE_CONTINUE: 'GATE_CONTINUE',                 // Gate aprobado, enviar respuesta al LLM
} as const;

// ─── Session State (View → Background) ─────────────────────────────────────
export const SESSION_ACTIONS = {
  SAVE: 'SAVE_SESSION',
  LOAD: 'LOAD_SESSION',
  LIST: 'LIST_SESSIONS',
  DELETE: 'DELETE_SESSION',
  NEW: 'NEW_SESSION',
} as const;

// ─── Workflow State (View → Background) ─────────────────────────────────────
export const WORKFLOW_ACTIONS = {
  LOAD_INIT: 'LOAD_INIT',
  STATE_UPDATE: 'WORKFLOW_STATE_UPDATE',
  LIFECYCLE_PHASES_REQUEST: 'LIFECYCLE_PHASES_REQUEST',
} as const;

// ─── Backward Compat (deprecated — migrar gradualmente) ────────────────────
export const MESSAGES = {
  ...USER_ACTIONS,
  ...SERVER_EVENTS,
  ...SESSION_ACTIONS,
  ...WORKFLOW_ACTIONS,
  // Legacy aliases (deprecated)
  SEND_MESSAGE: 'USER_SEND',
  GATE_RESPONSE: 'USER_ACCEPTED',
  SAVE_SESSION: 'SAVE_SESSION',
  LOAD_SESSION: 'LOAD_SESSION',
  LIST_SESSIONS: 'LIST_SESSIONS',
  DELETE_SESSION: 'DELETE_SESSION',
  NEW_SESSION: 'NEW_SESSION',
  LOAD_INIT: 'LOAD_INIT',
  LIFECYCLE_PHASES_REQUEST: 'LIFECYCLE_PHASES_REQUEST',
} as const;

export type ChatCommand = typeof MESSAGES[keyof typeof MESSAGES];

// ─── Typed Payloads ─────────────────────────────────────────────────────────

export interface UserSendPayload {
  target: string;
  response: string;
  history?: Array<{ role: string; text: string }>;
  attachments?: Array<{ _title: string; _path: string }>;
}

export interface UserSelectedPayload {
  target: string;
  type: string;
  response: string;
  history?: Array<{ role: string; text: string }>;
}

export interface UserAcceptedPayload {
  target: string;
  type: string;
  response?: string;
}

export interface UserDeniedPayload {
  target: string;
  type: string;
  response: string;
}

export const LANGUAGE_MAP: Record<string, string> = {
  'español': 'es', 'spanish': 'es',
  'english': 'en', 'inglés': 'en',
};

export const STEP_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DONE: 'done',
} as const;

export type StepStatus = typeof STEP_STATUS[keyof typeof STEP_STATUS];

// ─── A2UI Resolved Blocks ───────────────────────────────────────────

/**
 * A resolved A2UI block — structured data, NOT HTML.
 * Background resolves intents into these; View renders them.
 */
export interface ResolvedA2UIBlock {
  /** Component type (maps to View renderer) */
  type: 'artifact' | 'results' | 'chart' | 'error' | 'warning' | 'info' | 'gate' | 'choice' | 'confirm' | 'input' | 'multi';
  /** Unique identifier */
  id: string;
  /** User-facing label (resolved by Background) */
  label: string;
  /** Selectable options — for gate/choice/multi */
  options?: string[];
  /** Pre-selected option index (0-based) */
  preselected?: number;
  /** File path — for artifact type */
  path?: string;
  /** Body content — for artifact preview, alert body */
  content?: string;
}

/**
 * Structured message payload from Background → View.
 * Replaces the old single-string approach.
 */
export interface ChatMessagePayload {
  /** Markdown text (what the user sees) */
  text: string;
  /** Optional code block */
  code?: string;
  /** Resolved A2UI components (structured data, no HTML) */
  a2ui?: ResolvedA2UIBlock[];
  /** Agent role that produced this message */
  agentRole: string;
  /** Whether the message is still streaming */
  isStreaming: boolean;
  /** Attached file paths (from file picker) */
  files?: string[];
  /** Side-effect messages for the View (workflow state updates, etc.) */
  messages?: Array<{ command: string; data: any }>;
  /** Tool events accumulated during streaming (tool_call / tool_result) */
  toolEvents?: Array<{ type: string; name?: string; arguments?: any; output?: any }>;
  /** Delegation events accumulated during streaming */
  delegations?: Array<{ type: string; agentRole: string; targetAgent?: string; taskDescription?: string; result?: string; status: string }>;
  /** Token usage data from the LLM call */
  usage?: { model?: string; inputTokens: number; outputTokens: number; totalTokens: number };
  /** Signal to create a new session before processing */
  newSession?: boolean;
  /** Workflow state snapshot (steps, phase, progress) */
  workflowState?: any;
  /** Gate data if the engine is waiting for approval */
  gate?: any;
  /** Phase auto-start data (next phase + owner) */
  phaseAutoStart?: { phaseId: string; owner: string; createdArtifacts?: string[] };
  /** Gate continue data (internal gate, no phase transition) */
  gateContinue?: { gateAnswerText: string };
  /** Error text to display (for workflow errors) */
  errorText?: string;
}

/**
 * Unified result from resolveIntents.
 * All intent types return data — no side-effects inside resolution.
 * The caller decides how to emit each piece.
 */
export interface IntentResolution {
  /** A2UI blocks to include in the chat message */
  a2ui: ResolvedA2UIBlock[];
  /** Messages to emit separately to the View (e.g. workflow state updates) */
  messages: Array<{ command: string; data: any }>;
}

/**
 * Unified result from processing an LLM response (success or error).
 * The caller uses this to build ChatMessagePayload and emit side-effects.
 */
export interface ProcessedResponse {
  displayText: string;
  code?: string;
  a2ui: ResolvedA2UIBlock[];
  messages: Array<{ command: string; data: any }>;
}
