import { Agent, ModelProvider, RunContext } from '@openai/agents';
import { OpenAIProvider } from '@openai/agents';
import { GeminiProvider } from './adapters/gemini-provider.js';
import { ClaudeProvider } from './adapters/claude-provider.js';
import { RoleModelBinding, ToolDefinition, AgenticContext } from './types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { z } from 'zod';

export const AgentResponseSchema = z.object({
  text: z.string().describe('The main text response to the user or system.'),
  code: z.string().optional().nullable()
    .describe('Optional code block to display alongside text.'),
  intents: z.array(z.object({
    type: z.string(),
    action: z.string(),
    component: z.string(),
  })).optional().nullable()
    .describe('Optional intent declarations (type/action/component).'),
});

import {
  BASE_SYSTEM_PROMPT,
  WORKFLOW_HEADER,
  WORKFLOW_FOOTER,
  GATE_INSTRUCTIONS,
  CONSTITUTIONS_HEADER,
  ROLE_FALLBACK,
  ROLE_HEADER,
  WF_OBJECTIVE,
  WF_INPUTS,
  WF_OUTPUTS,
  WF_STEPS,
  WF_GATE,
  WF_PASS,
  WF_FAIL,
  WF_PHASES,
} from './tools/prompts.js';

/**
 * Pass-through: model IDs now come from Settings dropdown (dynamic discovery).
 */
function resolveModelId(displayName: string, _provider: string): string {
  return displayName;
}

/**
 * Build the dynamic system prompt from AgenticContext.
 * Called per-turn by the SDK when instructions is a function.
 *
 * NOTE: This function only COMPOSES. All prompt text lives in prompts.ts.
 */
function buildDynamicInstructions(runContext: RunContext<AgenticContext>, agent: Agent<AgenticContext>): string {
  const ctx = runContext.context;
  const parts: string[] = [BASE_SYSTEM_PROMPT];

  // 1. Role persona
  parts.push(ctx.rolePersona ? ROLE_HEADER(ctx.rolePersona) : ROLE_FALLBACK(ctx.role));

  // 2. Workflow context
  if (ctx.workflow) {
    const wf = ctx.workflow;
    const sections: string[] = [WORKFLOW_HEADER];

    // Use ONLY parsed sections — rawContent is the entire markdown and duplicates everything
    if (wf.sections) {
      if (wf.sections.objective) { sections.push(WF_OBJECTIVE(wf.sections.objective)); }
      if (wf.sections.instructions) { sections.push(`\n## Instructions\n${wf.sections.instructions}\n`); }
      if (wf.sections.inputs?.length) { sections.push(WF_INPUTS(wf.sections.inputs)); }
      if (wf.sections.outputs?.length) { sections.push(WF_OUTPUTS(wf.sections.outputs)); }
    }

    if (wf.gate) {
      sections.push(WF_GATE(wf.gate.requirements));
      sections.push(GATE_INSTRUCTIONS);
    }

    if (wf.pass?.nextTarget) { sections.push(WF_PASS(wf.pass.nextTarget)); }
    if (wf.fail?.behavior) { sections.push(WF_FAIL(wf.fail.behavior)); }
    if (wf.phases?.length) { sections.push(WF_PHASES(wf.phases)); }

    sections.push(WORKFLOW_FOOTER);
    parts.push(sections.join('\n'));
  }

  // Interpreter rules
  if (ctx.workflow && (ctx.workflow as any).interpreterRules) {
    parts.push('\n\n---\n' + (ctx.workflow as any).interpreterRules);
  }

  // 3. Constitutions
  if (ctx.constitutions?.length) {
    parts.push(CONSTITUTIONS_HEADER);
    parts.push(ctx.constitutions.join('\n'));
    parts.push(WORKFLOW_FOOTER);
  }

  // 4. Skills
  if (ctx.skills?.length) {
    parts.push('\n\n## Available Skills\n');
    for (const skill of ctx.skills) {
      parts.push(`### ${skill.name}\n${skill.description}\n`);
      if (skill.instructions) { parts.push(skill.instructions); }
    }
  }

  // 5. JSON enforcement reminder (at the end to leverage recency bias)
  parts.push(`\n\n---\n⚠️ REMINDER: You MUST respond with a valid JSON object matching the requested schema. Do NOT use plain text, markdown, or your role prefix (🏛️). Raw JSON only.`);

  return parts.join('');
}

export class LLMFactory {
  private extensionUri: string;

  constructor(extensionUri: string) {
    this.extensionUri = extensionUri;
  }

  /**
   * Create an Agent with dynamic instructions powered by AgenticContext.
   * When agenticContext is provided, instructions become a function that reads
   * workflow, constitutions, and skills from the context per-turn.
   */
  async createAgentWithContext(
    role: string,
    binding: RoleModelBinding,
    tools: ToolDefinition[] = [],
    apiKey?: string,
    provider?: string,
  ): Promise<{ agent: Agent<AgenticContext>; modelProvider: ModelProvider }> {
    const rawModelId = binding[role];
    if (!rawModelId) {
      throw new Error(`No model bound for role: ${role}`);
    }

    const modelId = resolveModelId(rawModelId, provider || rawModelId);
    console.log(`[llm::backend] Model resolution: "${rawModelId}" → "${modelId}" (provider: ${provider})`);

    const modelProvider = this.resolveProvider(provider || modelId, apiKey);

    const agent = new Agent<AgenticContext>({
      name: role,
      instructions: buildDynamicInstructions,
      model: await modelProvider.getModel(modelId),
      tools: tools.map(t => t as any),
      // NOTE: outputType intentionally omitted — the SDK throws "Invalid output type" when the
      // model returns plain text (e.g. after MALFORMED_FUNCTION_CALL recovery with Gemini).
      // Structured JSON is parsed by tryParseStructuredResponse in the background layer instead.
    });

    return { agent, modelProvider };
  }

  /**
   * Legacy: create an Agent with static string instructions.
   * Used during migration — will be removed once all callers use createAgentWithContext.
   */
  async createAgent(role: string, binding: RoleModelBinding, tools: ToolDefinition[] = [], apiKey?: string, provider?: string, instructions?: string): Promise<Agent<unknown>> {
    const rawModelId = binding[role];
    if (!rawModelId) {
      throw new Error(`No model bound for role: ${role}`);
    }

    // Resolve display name to valid API model ID
    const modelId = resolveModelId(rawModelId, provider || rawModelId);
    console.log(`[llm::backend] Model resolution: "${rawModelId}" → "${modelId}" (provider: ${provider})`);

    const modelProvider = this.resolveProvider(provider || modelId, apiKey);

    // Compose system prompt: base instructions + role persona
    const agentInstructions = instructions
      ? `${BASE_SYSTEM_PROMPT}\n\n## Your Role Definition\n${instructions}`
      : await this.buildChatPrompt(role);

    return new Agent({
      name: role,
      instructions: agentInstructions,
      model: await modelProvider.getModel(modelId),
      tools: tools.map(t => t as any),
      // NOTE: outputType intentionally omitted — see createAgentWithContext for rationale.
    });
  }

  /**
   * Resolve the model provider by name.
   */
  private resolveProvider(providerHint: string, apiKey?: string): ModelProvider {
    const providerLower = providerHint.toLowerCase();
    if (providerLower.includes('gemini') || providerLower.includes('google')) {
      return new GeminiProvider(apiKey || process.env.GEMINI_API_KEY || '');
    } else if (providerLower.includes('claude') || providerLower.includes('anthropic')) {
      return new ClaudeProvider(apiKey || process.env.ANTHROPIC_API_KEY || '');
    } else {
      return new OpenAIProvider({ apiKey: apiKey || process.env.OPENAI_API_KEY || '' });
    }
  }

  /**
   * Build a lightweight, conversational system prompt for the chat.
   * Composes: BASE_SYSTEM_PROMPT + role personality + role description.
   */
  private async buildChatPrompt(role: string): Promise<string> {
    const { personality, description } = await this.parseRoleFrontmatter(role);

    const parts = [BASE_SYSTEM_PROMPT];

    if (personality) {
      parts.push(`\n## Your personality\n${personality}`);
    }

    if (description) {
      parts.push(`\n## Your role\n${description}`);
    }

    // Fallback if no frontmatter found at all
    if (!personality && !description) {
      parts.push(`\nYou are the ${role} agent — a specialist in your domain.`);
    }

    return parts.join('\n');
  }

  /**
   * Parse YAML frontmatter from a role markdown file.
   * Extracts `personality` and `description` fields only (lightweight, no dep on gray-matter).
   */
  private async parseRoleFrontmatter(role: string): Promise<{ personality?: string; description?: string }> {
    try {
      const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd();
      const rolePath = path.join(workspaceRoot, '.agent', 'rules', 'roles', `${role}.md`);
      const content = await fs.readFile(rolePath, 'utf-8');

      // Extract all YAML frontmatter blocks (there may be multiple --- delimited blocks)
      const frontmatterBlocks = content.match(/^---\n([\s\S]*?)\n---/gm);
      if (!frontmatterBlocks) {
        return {};
      }

      let personality: string | undefined;
      let description: string | undefined;

      for (const block of frontmatterBlocks) {
        const yaml = block.replace(/^---\n/, '').replace(/\n---$/, '');

        // Extract personality (supports multi-line > or | blocks)
        if (!personality) {
          const pMatch = yaml.match(/^personality:\s*[>|]\s*\n((?:\s+.+\n?)*)/m);
          if (pMatch) {
            personality = pMatch[1].replace(/^\s+/gm, '').trim();
          }
          // Single-line value
          const pSingle = yaml.match(/^personality:\s*["']?(.+?)["']?\s*$/m);
          if (!personality && pSingle) {
            personality = pSingle[1].trim();
          }
        }

        // Extract description
        if (!description) {
          const dMatch = yaml.match(/^description:\s*["']?(.+?)["']?\s*$/m);
          if (dMatch) {
            description = dMatch[1].trim();
          }
        }
      }

      return { personality, description };
    } catch (error) {
      console.error(`[llm::backend] Failed to parse role frontmatter for ${role}`, error);
      return {};
    }
  }
}
