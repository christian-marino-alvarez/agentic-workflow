import { z } from 'zod';
import { FastifyRequest } from 'fastify';
import type { Tool, RunContext } from '@openai/agents';

// ─── Core bindings ───

export interface RoleModelBinding {
  [role: string]: string; // role -> modelId
}

// ─── AgenticContext: typed local context for RunContext<T> ───

/**
 * Workflow state snapshot passed per-turn.
 * Contains the active workflow definition, steps, gate requirements, and parsed sections.
 */
export interface WorkflowSnapshot {
  id: string;
  status: string;
  owner?: string;
  steps?: Array<{ id: string; label: string; status: string }>;
  gate?: {
    requirements: string[];
  };
  pass?: {
    nextTarget?: string;
    actions?: string[];
  };
  fail?: {
    behavior?: string;
  };
  rawContent?: string;
  sections?: {
    objective?: string;
    instructions?: string;
    inputs?: string[];
    outputs?: string[];
    pass?: string;
    fail?: string;
  };
  phases?: Array<{ label: string; status: string; owner?: string }>;
}

/**
 * Parsed skill definition from .agent/skills/<name>/SKILL.md.
 */
export interface SkillDefinition {
  /** Skill name (folder name, e.g. 'scaffolding') */
  name: string;
  /** Description from SKILL.md frontmatter */
  description: string;
  /** Full instructions content (markdown body) */
  instructions: string;
  /** Optional typed tool generated from the skill */
  tool?: Tool<AgenticContext>;
  /** Required capability for this skill (e.g. 'terminal') */
  requiredCapability?: string;
}

/**
 * Local context object passed to RunContext<AgenticContext>.
 * NOT sent to the LLM — accessible by tools, dynamic instructions, and hooks.
 */
export interface AgenticContext {
  /** Absolute path to the workspace root */
  workspacePath: string;
  /** Active agent role (e.g. 'architect', 'backend') */
  role: string;
  /** Conversation language */
  language: 'es' | 'en' | null;
  /** Active workflow state snapshot */
  workflow: WorkflowSnapshot | null;
  /** Loaded constitution contents (injected into dynamic instructions) */
  constitutions: string[];
  /** Role persona content (full .md file) */
  rolePersona: string;
  /** Available skills for this role */
  skills: SkillDefinition[];
  /** Security access level */
  accessLevel: 'sandbox' | 'full';
  /** API key for the current provider */
  apiKey?: string;
  /** LLM provider name */
  provider?: string;
}

/** Convenience type alias for RunContext with our context */
export type AgenticRunContext = RunContext<AgenticContext>;

// ─── Conversation history ───

/**
 * A single conversation turn, aligned with AgentInputItem from the SDK.
 * Used to build proper multi-turn input for Runner.run().
 */
export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ─── HTTP API types ───

export interface AgentRequest {
  role: string;
  /** @deprecated Use `messages` instead. String input for backward compatibility. */
  input?: string;
  /** Multi-turn conversation history (preferred over `input`) */
  messages?: ConversationTurn[];
  /** Agent context data for RunContext<AgenticContext> */
  agenticContext?: AgenticContext;
  context?: Record<string, any>;
  binding: RoleModelBinding;
  apiKey?: string;
  provider?: string;
  /** @deprecated Use dynamic instructions via agenticContext instead */
  instructions?: string;
  /** When true, agent is created without tools (avoids Gemini MALFORMED_FUNCTION_CALL) */
  disableTools?: boolean;
}

export interface AgentResponse {
  output: string;
  /** Conversation history after this turn (for persistence) */
  history?: ConversationTurn[];
  stats?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export type ToolDefinition = Tool<any>;

export interface RunRequest extends FastifyRequest<{ Body: AgentRequest }> { }
