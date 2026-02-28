import { z } from 'zod';

// ─── Intent Namespaces ─────────────────────────────────────────────

/** The 4 intent namespaces. */
export enum IntentType {
  A2UI = 'A2UI',
  WORKFLOW = 'WORKFLOW',
  AGENT = 'AGENT',
  SESSION = 'SESSION',
}

// ─── Intent Actions ────────────────────────────────────────────────

/** All intent actions across namespaces. */
export enum IntentAction {
  // A2UI
  SHOW = 'SHOW',
  REQUEST = 'REQUEST',
  // WORKFLOW
  UPDATE = 'UPDATE',
  START = 'START',
  COMPLETE = 'COMPLETE',
  // AGENT
  DELEGATE = 'DELEGATE',
  REPORT = 'REPORT',
  // SESSION
  SAVE = 'SAVE',
  LOAD = 'LOAD',
}

// ─── Intent Components ─────────────────────────────────────────────

/** All intent target components. */
export enum IntentComponent {
  // A2UI — SHOW
  ARTIFACT = 'ARTIFACT',
  RESULTS = 'RESULTS',
  CHART = 'CHART',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  // A2UI — REQUEST
  GATE = 'GATE',
  CHOICE = 'CHOICE',
  CONFIRM = 'CONFIRM',
  INPUT = 'INPUT',
  MULTI_SELECT = 'MULTI_SELECT',
  // WORKFLOW
  STATE = 'STATE',
  PHASE = 'PHASE',
  // AGENT
  TASK = 'TASK',
  USAGE = 'USAGE',
  STATUS = 'STATUS',
  // SESSION
  CURRENT = 'CURRENT',
  HISTORY = 'HISTORY',
}

// ─── Intent Schema ─────────────────────────────────────────────────

/**
 * A single intent declared by the LLM.
 * The LLM declares WHAT it wants; the Background resolves HOW.
 *
 * Example: { type: 'A2UI', action: 'SHOW', component: 'ARTIFACT' }
 */
export const IntentSchema = z.object({
  /** Intent namespace */
  type: z.nativeEnum(IntentType),
  /** Action verb */
  action: z.nativeEnum(IntentAction),
  /** Target component */
  component: z.nativeEnum(IntentComponent),
  /** Optional: unique identifier for the UI element */
  id: z.string().optional(),
  /** Optional: user-facing label */
  label: z.string().optional(),
  /** Optional: selectable options (for CHOICE, MULTI_SELECT, GATE) */
  options: z.array(z.string()).optional(),
});

export type Intent = z.infer<typeof IntentSchema>;

// ─── Agent Response Schema ─────────────────────────────────────────

/**
 * Complete structured response from the LLM.
 * Minimal schema: text + optional code + optional intents.
 * The LLM NEVER includes paths, labels, options, or layout data.
 */
export const AgentResponseSchema = z.object({
  /** Markdown text response (what gets rendered to the user) */
  text: z.string(),
  /** Code block to display (optional — for code-heavy responses) */
  code: z.string().optional(),
  /** Declared intents — what the LLM wants to happen (optional) */
  intents: z.array(IntentSchema).optional(),
});

export type AgentStructuredResponse = z.infer<typeof AgentResponseSchema>;

// ─── Helpers ───────────────────────────────────────────────────────

/**
 * Try to parse and validate an LLM response as structured JSON.
 * Returns the validated response or null if parsing/validation fails.
 */
export function tryParseStructuredResponse(raw: string): AgentStructuredResponse | null {
  // Strategy 1: Direct parse
  try {
    const parsed = JSON.parse(raw);
    const result = AgentResponseSchema.safeParse(parsed);
    if (result.success) { return result.data; }
  } catch { /* not valid JSON */ }

  // Strategy 2: Strip markdown code fences (```json ... ```)
  const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1]);
      const result = AgentResponseSchema.safeParse(parsed);
      if (result.success) { return result.data; }
    } catch { /* not valid JSON in fence */ }
  }

  // Strategy 3: Find JSON boundaries { ... }
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const parsed = JSON.parse(raw.slice(firstBrace, lastBrace + 1));
      const result = AgentResponseSchema.safeParse(parsed);
      if (result.success) { return result.data; }
    } catch { /* not valid JSON */ }
  }

  // Strategy 4: Truncated JSON — extract "text" field via regex
  if (raw.trimStart().startsWith('{')) {
    const textMatch = raw.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (textMatch) {
      const text = textMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      return { text };
    }
  }

  return null;
}

// ─── JSON Schema (for LLM prompt injection) ────────────────────────

/**
 * Plain JSON Schema representation for embedding in the system prompt.
 * This tells the LLM exactly what JSON structure to produce.
 */
export const RESPONSE_JSON_SCHEMA = {
  type: 'object',
  required: ['text'],
  properties: {
    text: {
      type: 'string',
      description: 'Your markdown response text. This is what the user sees.',
    },
    code: {
      type: 'string',
      description: 'Optional code block to display alongside the text.',
    },
    intents: {
      type: 'array',
      description: 'Declare your intents — what UI components to show or what actions to take. For interactive components (INPUT, CHOICE, MULTI_SELECT), include id and label. For CHOICE/GATE, include options array.',
      items: {
        type: 'object',
        required: ['type', 'action', 'component'],
        properties: {
          type: {
            type: 'string',
            enum: ['A2UI', 'WORKFLOW', 'AGENT', 'SESSION'],
            description: 'Intent namespace',
          },
          action: {
            type: 'string',
            description: 'Action verb: SHOW, REQUEST, UPDATE, START, COMPLETE, DELEGATE, REPORT, SAVE, LOAD',
          },
          component: {
            type: 'string',
            description: 'Target: ARTIFACT, RESULTS, CHART, ERROR, WARNING, INFO, GATE, CHOICE, CONFIRM, INPUT, MULTI_SELECT, STATE, PHASE, TASK, USAGE, STATUS, CURRENT, HISTORY',
          },
          id: {
            type: 'string',
            description: 'Unique identifier for the UI element (e.g. "language", "task-title")',
          },
          label: {
            type: 'string',
            description: 'User-facing label or question (e.g. "Select Language", "Task Title")',
          },
          options: {
            type: 'array',
            items: { type: 'string' },
            description: 'Selectable options for CHOICE, MULTI_SELECT, or GATE components',
          },
        },
      },
    },
  },
} as const;
