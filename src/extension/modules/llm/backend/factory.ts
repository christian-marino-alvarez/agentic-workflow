import { Agent, ModelProvider, RunContext } from '@openai/agents';
import { OpenAIProvider } from '@openai/agents';
import { GeminiProvider } from './adapters/gemini-provider.js';
import { ClaudeProvider } from './adapters/claude-provider.js';
import { RoleModelBinding, ToolDefinition, AgenticContext } from './types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

import { BASE_SYSTEM_PROMPT } from './prompts.js';

/**
 * Pass-through: model IDs now come from Settings dropdown (dynamic discovery).
 */
function resolveModelId(displayName: string, _provider: string): string {
  return displayName;
}

/**
 * Build the dynamic system prompt from AgenticContext.
 * Called per-turn by the SDK when instructions is a function.
 */
function buildDynamicInstructions(runContext: RunContext<AgenticContext>): string {
  const ctx = runContext.context;
  const parts: string[] = [BASE_SYSTEM_PROMPT];

  // 1. Role persona
  if (ctx.rolePersona) {
    parts.push(`\n\n## Your Role Definition\n${ctx.rolePersona}`);
  } else {
    parts.push(`\nYou are the ${ctx.role} agent — a specialist in your domain.`);
  }

  // 2. Workflow context
  if (ctx.workflow) {
    const wf = ctx.workflow;
    const sections: string[] = [`\n\n---\n## ACTIVE WORKFLOW (MANDATORY)\n`];

    if (wf.rawContent) {
      sections.push(wf.rawContent);
    }

    // Structured sections (lifecycle workflows)
    if (wf.sections) {
      if (wf.sections.objective) {
        sections.push(`**[USER-FACING] Objective**: ${wf.sections.objective}`);
      }
      if (wf.sections.inputs && wf.sections.inputs.length > 0) {
        sections.push(`**[SILENT] Inputs**:\n${wf.sections.inputs.map(i => `- ${i}`).join('\n')}`);
      }
      if (wf.sections.outputs && wf.sections.outputs.length > 0) {
        sections.push(`**[SILENT] Outputs**:\n${wf.sections.outputs.map(o => `- ${o}`).join('\n')}`);
      }
    }

    // Steps with status
    if (wf.steps && wf.steps.length > 0) {
      sections.push(`\n**[SILENT] Instructions**:\n${wf.steps.map(s => `${s.id}. ${s.label} [${s.status}]`).join('\n')}`);
    }

    // Gate requirements
    if (wf.gate) {
      sections.push(`\n**[USER-FACING] Gate Requirements** (ALL mandatory):\n${wf.gate.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}`);
      sections.push('\nWhen you believe ALL gate requirements are met:');
      sections.push('1. Create required artifacts via writeFile');
      sections.push('2. Present a <a2ui type="gate" id="gate-eval" label="Gate Evaluation"> with SI/NO options');
      sections.push('3. DO NOT advance past the gate without user confirmation');
    }

    // Pass/fail transitions
    if (wf.pass?.nextTarget) {
      sections.push(`\n**[SILENT] Pass** → ${wf.pass.nextTarget} (automatic transition on gate SI)`);
    }
    if (wf.fail?.behavior) {
      sections.push(`\n**[SILENT] Fail** → ${wf.fail.behavior}`);
    }

    // Phase list
    if (wf.phases && wf.phases.length > 0) {
      sections.push(`\nPhases: ${wf.phases.map(p => `${p.label} [${p.status}]`).join(' → ')}`);
    }

    sections.push('\n---\n');
    parts.push(sections.join('\n'));
  }

  // Interpreter rules (behavioral rules for workflow execution)
  if (ctx.workflow && (ctx.workflow as any).interpreterRules) {
    parts.push('\n\n---\n' + (ctx.workflow as any).interpreterRules);
  }

  // 3. Constitutions
  if (ctx.constitutions && ctx.constitutions.length > 0) {
    parts.push('\n\n---\n## LOADED CONSTITUTIONS (MANDATORY rules you must follow)\n');
    parts.push(ctx.constitutions.join('\n'));
    parts.push('\n---\n');
  }

  // 4. Skills
  if (ctx.skills && ctx.skills.length > 0) {
    parts.push('\n\n## Available Skills\n');
    for (const skill of ctx.skills) {
      parts.push(`### ${skill.name}\n${skill.description}\n`);
      if (skill.instructions) {
        parts.push(skill.instructions);
      }
    }
  }

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
    });

    return { agent, modelProvider };
  }

  /**
   * Legacy: create an Agent with static string instructions.
   * Used during migration — will be removed once all callers use createAgentWithContext.
   */
  async createAgent(role: string, binding: RoleModelBinding, tools: ToolDefinition[] = [], apiKey?: string, provider?: string, instructions?: string): Promise<Agent> {
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
