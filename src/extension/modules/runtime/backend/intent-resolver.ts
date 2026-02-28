/**
 * IntentResolver
 *
 * Resolves LLM-declared intents into concrete UI blocks and workflow actions.
 * Runs in the Runtime sidecar — no vscode API dependency.
 *
 * Ported from ChatBackground.resolveIntents() and related methods.
 */

import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { GateDef, ResolvedA2UIBlock } from '../types.js';

// ─── LLM Response Parser ───────────────────────────────────────────

export interface StructuredResponse {
  text: string;
  code?: string;
  intents?: Intent[];
}

/**
 * Try to parse LLM output as structured JSON { text, intents }.
 * Multiple extraction strategies for robustness.
 */
export function tryParseStructuredResponse(raw: string): StructuredResponse | null {
  const tryParse = (s: string): StructuredResponse | null => {
    try {
      const parsed = JSON.parse(s);
      if (typeof parsed?.text === 'string') { return parsed; }
    } catch { /* not valid */ }
    return null;
  };

  // Strategy 1: Direct parse
  const direct = tryParse(raw);
  if (direct) { return direct; }

  // Strategy 2: Strip markdown code fences
  const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    const fenced = tryParse(fenceMatch[1]);
    if (fenced) { return fenced; }
  }

  // Strategy 3: Find JSON boundaries
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const braced = tryParse(raw.slice(firstBrace, lastBrace + 1));
    if (braced) { return braced; }
  }

  // Strategy 4: Extract "text" field via regex (truncated JSON)
  if (raw.trimStart().startsWith('{')) {
    const textMatch = raw.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (textMatch) {
      const text = textMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      return { text };
    }
  }

  return null;
}

// ─── Intent Types (mirrored from response-schema for sidecar use) ──

export enum IntentType {
  A2UI = 'A2UI',
  WORKFLOW = 'WORKFLOW',
  AGENT = 'AGENT',
  SESSION = 'SESSION',
}

export enum IntentAction {
  SHOW = 'SHOW',
  REQUEST = 'REQUEST',
  UPDATE = 'UPDATE',
  START = 'START',
  COMPLETE = 'COMPLETE',
  DELEGATE = 'DELEGATE',
  REPORT = 'REPORT',
  SAVE = 'SAVE',
  LOAD = 'LOAD',
}

export enum IntentComponent {
  ARTIFACT = 'ARTIFACT',
  RESULTS = 'RESULTS',
  CHART = 'CHART',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  GATE = 'GATE',
  CHOICE = 'CHOICE',
  CONFIRM = 'CONFIRM',
  INPUT = 'INPUT',
  MULTI_SELECT = 'MULTI_SELECT',
  STATE = 'STATE',
  PHASE = 'PHASE',
  TASK = 'TASK',
  USAGE = 'USAGE',
  STATUS = 'STATUS',
  CURRENT = 'CURRENT',
  HISTORY = 'HISTORY',
}

export interface Intent {
  type: string;
  action: string;
  component: string;
  id?: string;
  label?: string;
  options?: string[];
}

export interface IntentResolution {
  a2ui: ResolvedA2UIBlock[];
  pendingActions: Array<{ type: string; data?: any }>;
}

// ─── Artifact Map ──────────────────────────────────────────────────

/** Maps clean phase names to artifact file + label */
const ARTIFACT_MAP: Record<string, { file: string; label: string }> = {
  init: { file: 'task.md', label: 'task.md' },
  analysis: { file: 'architect/analysis-v1.md', label: 'Analysis' },
  planning: { file: 'architect/planning-v1.md', label: 'Planning' },
  implementation: { file: 'architect/implementation.md', label: 'Implementation' },
  verification: { file: 'architect/verification-v1.md', label: 'Verification' },
  results: { file: 'architect/results-v1.md', label: 'Results' },
  review: { file: 'architect/results-v1.md', label: 'Results' },
};

// ─── IntentResolver Class ──────────────────────────────────────────

export class IntentResolver {
  constructor(private workspaceRoot: string) { }

  /**
   * Resolve all intents from the LLM response.
   */
  resolve(intents: Intent[], phaseId: string): IntentResolution {
    const resolution: IntentResolution = { a2ui: [], pendingActions: [] };

    for (const intent of intents) {
      switch (intent.type) {
        case IntentType.A2UI: {
          const block = this.resolveA2UI(intent, phaseId);
          if (block) { resolution.a2ui.push(block); }
          break;
        }
        case IntentType.WORKFLOW: {
          const actions = this.resolveWorkflow(intent);
          resolution.pendingActions.push(...actions);
          break;
        }
        default:
          // AGENT and SESSION intents are deferred
          break;
      }
    }

    return resolution;
  }

  /**
   * Resolve A2UI intents → UI blocks (artifact cards, gates, choices, etc.)
   */
  private resolveA2UI(intent: Intent, phaseId: string): ResolvedA2UIBlock | null {
    if (intent.action === IntentAction.SHOW) {
      switch (intent.component) {
        case IntentComponent.ARTIFACT:
        case IntentComponent.RESULTS: {
          const artifact = this.resolveCurrentArtifact(phaseId);
          if (artifact) {
            const type = intent.component === IntentComponent.ARTIFACT ? 'artifact' : 'results';
            return {
              type, id: `${type}-${artifact.id}`,
              label: artifact.label,
              path: artifact.path,
              content: artifact.content,
            };
          }
          return null;
        }
        case IntentComponent.ERROR:
        case IntentComponent.WARNING:
        case IntentComponent.INFO: {
          const type = intent.component.toLowerCase();
          return { type, id: `${type}-${Date.now()}`, label: type };
        }
        default:
          return null;
      }
    }

    if (intent.action === IntentAction.REQUEST) {
      const id = intent.id || `${intent.component.toLowerCase()}-${Date.now()}`;
      const label = intent.label || intent.component.charAt(0) + intent.component.slice(1).toLowerCase();
      switch (intent.component) {
        case IntentComponent.GATE:
          return { type: 'gate', id, label, options: intent.options || ['SI', 'NO'] };
        case IntentComponent.CHOICE:
          return { type: 'choice', id, label, options: intent.options || ['SI', 'NO'] };
        case IntentComponent.CONFIRM:
          return { type: 'confirm', id, label };
        case IntentComponent.INPUT:
          return { type: 'input', id, label };
        case IntentComponent.MULTI_SELECT:
          return { type: 'multi', id, label, options: intent.options || [] };
        default:
          return null;
      }
    }

    return null;
  }

  /**
   * Resolve WORKFLOW intents → pending actions.
   */
  private resolveWorkflow(intent: Intent): Array<{ type: string; data?: any }> {
    if (intent.action === IntentAction.UPDATE && intent.component === IntentComponent.STATE) {
      return [{ type: 'WORKFLOW_STATE_UPDATE' }];
    }
    if (intent.action === IntentAction.COMPLETE && intent.component === IntentComponent.PHASE) {
      return [{ type: 'PHASE_COMPLETE' }];
    }
    if (intent.action === IntentAction.START && intent.component === IntentComponent.PHASE) {
      return [{ type: 'PHASE_START' }];
    }
    return [];
  }

  /**
   * Resolve the current artifact from the phase ID.
   * Maps phase names to file paths in .agent/artifacts/<TASK>/.
   */
  private resolveCurrentArtifact(phaseId: string): { id: string; label: string; path: string; content?: string } | null {
    // Extract clean phase keyword from IDs like:
    //   "workflow.tasklifecycle.01-init" → "init"
    //   "tasklifecycle.02-analysis" → "analysis"
    const rawPhase = phaseId.replace(/^workflow\./, '') || 'init';
    const phase = rawPhase.replace(/^(?:tasklifecycle\.)?(?:\d{2}-)?/, '');

    const mapping = ARTIFACT_MAP[phase];
    const file = mapping?.file || `${phase}.md`;
    const label = mapping?.label || phase;

    const taskFolder = this.resolveTaskArtifactFolder();

    const artifactPath = (phase === 'init' && !taskFolder)
      ? `.agent/artifacts/${file}`
      : `.agent/artifacts/${taskFolder || 'task'}/${file}`;

    return { id: `${phase}-artifact`, label, path: artifactPath };
  }

  /**
   * Find the most recent task folder in .agent/artifacts/.
   * Returns the folder name or null if not found.
   */
  private resolveTaskArtifactFolder(): string | null {
    const artifactsRoot = join(this.workspaceRoot, '.agent', 'artifacts');
    if (!existsSync(artifactsRoot)) { return null; }

    try {
      const entries = readdirSync(artifactsRoot, { withFileTypes: true });
      const taskDirs = entries
        .filter(e => e.isDirectory() && /^\d{8}-/.test(e.name))
        .map(e => e.name)
        .sort()
        .reverse();

      return taskDirs.length > 0 ? taskDirs[0] : null;
    } catch {
      return null;
    }
  }
}
