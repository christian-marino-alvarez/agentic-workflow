import { z } from 'zod';

// ─── UI Component Schema ───────────────────────────────────────────

/**
 * A single interactive UI component the LLM wants to present.
 * Replaces the legacy <a2ui> HTML tag approach with typed JSON.
 */
export const UIComponentSchema = z.object({
  /** Component type */
  type: z.enum(['choice', 'confirm', 'multi', 'gate', 'artifact', 'input']),
  /** Unique identifier for this component */
  id: z.string(),
  /** User-facing label / question */
  label: z.string(),
  /** Selectable options (for choice/confirm/multi/gate) */
  options: z.array(z.string()).optional(),
  /** Index of pre-selected option (0-based) */
  preselected: z.number().optional(),
  /** Body content (for artifact type — markdown content) */
  content: z.string().optional(),
  /** File path (for artifact type — where to save) */
  path: z.string().optional(),
});

export type UIComponent = z.infer<typeof UIComponentSchema>;

// ─── Workflow State Schema ─────────────────────────────────────────

/**
 * Structured workflow state reported by the LLM.
 * Replaces the legacy ```json:WORKFLOW_STATE``` code block approach.
 */
export const WorkflowStateSchema = z.object({
  /** Current lifecycle phase */
  current_phase: z.string(),
  /** Next expected phase (null if final) */
  next_phase: z.string().nullable().optional(),
  /** Progress estimate 0–100 */
  progress: z.number().min(0).max(100),
  /** Whether this step requires user approval */
  requires_approval: z.boolean(),
  /** Actions the agent plans to take */
  intended_actions: z.array(z.string()).optional(),
  /** Tools the agent will invoke */
  tools_to_execute: z.array(z.string()).optional(),
  /** Artifacts this phase should produce */
  artifacts_expected: z.array(z.string()).optional(),
  /** Identified risks or blockers */
  risk_flags: z.array(z.string()).optional(),
});

export type WorkflowState = z.infer<typeof WorkflowStateSchema>;

// ─── Agent Response Schema ─────────────────────────────────────────

/**
 * Complete structured response from the LLM.
 * The LLM MUST respond with this JSON format.
 */
export const AgentResponseSchema = z.object({
  /** Markdown text response (what gets rendered to the user) */
  text: z.string(),
  /** Interactive UI components to render (optional) */
  ui_intent: z.array(UIComponentSchema).optional(),
  /** Workflow state report (optional) */
  workflow_state: WorkflowStateSchema.optional(),
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
  // Handles when the LLM runs out of tokens before closing the JSON
  if (raw.trimStart().startsWith('{')) {
    const textMatch = raw.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (textMatch) {
      const text = textMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');

      // Try to extract ui_intent components individually
      const uiIntent: UIComponent[] = [];
      const componentRegex = /\{\s*"type"\s*:\s*"([^"]+)"\s*,\s*"id"\s*:\s*"([^"]+)"\s*,\s*"label"\s*:\s*"([^"]+)"(?:\s*,\s*"options"\s*:\s*\[((?:[^\]])*)\])?(?:\s*,\s*"preselected"\s*:\s*(\d+))?[^}]*\}/g;
      let compMatch;
      while ((compMatch = componentRegex.exec(raw)) !== null) {
        const component: any = {
          type: compMatch[1],
          id: compMatch[2],
          label: compMatch[3],
        };
        if (compMatch[4]) {
          component.options = compMatch[4].match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || [];
        }
        if (compMatch[5]) {
          component.preselected = parseInt(compMatch[5], 10);
        }
        // Validate individual component
        const compResult = UIComponentSchema.safeParse(component);
        if (compResult.success) {
          uiIntent.push(compResult.data);
        }
      }

      return {
        text,
        ...(uiIntent.length > 0 ? { ui_intent: uiIntent } : {}),
      };
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
    ui_intent: {
      type: 'array',
      description: 'Interactive UI components to present to the user. Use instead of HTML tags.',
      items: {
        type: 'object',
        required: ['type', 'id', 'label'],
        properties: {
          type: {
            type: 'string',
            enum: ['choice', 'confirm', 'multi', 'gate', 'artifact', 'input'],
          },
          id: { type: 'string', description: 'Unique ID for the component' },
          label: { type: 'string', description: 'User-facing question or title' },
          options: {
            type: 'array',
            items: { type: 'string' },
            description: 'Selectable options (for choice/confirm/multi/gate)',
          },
          preselected: { type: 'number', description: '0-based index of preselected option' },
          content: { type: 'string', description: 'Markdown body (for artifact type)' },
          path: { type: 'string', description: 'File path (for artifact type)' },
        },
      },
    },
    workflow_state: {
      type: 'object',
      description: 'Report your current workflow state.',
      properties: {
        current_phase: { type: 'string' },
        next_phase: { type: ['string', 'null'] },
        progress: { type: 'number', minimum: 0, maximum: 100 },
        requires_approval: { type: 'boolean' },
        intended_actions: { type: 'array', items: { type: 'string' } },
        tools_to_execute: { type: 'array', items: { type: 'string' } },
        artifacts_expected: { type: 'array', items: { type: 'string' } },
        risk_flags: { type: 'array', items: { type: 'string' } },
      },
    },
  },
} as const;
