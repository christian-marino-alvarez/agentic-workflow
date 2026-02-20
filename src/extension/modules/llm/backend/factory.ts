import { Agent, ModelProvider } from '@openai/agents';
import { OpenAIProvider } from '@openai/agents';
import { GeminiProvider } from './adapters/gemini-provider.js';
import { ClaudeProvider } from './adapters/claude-provider.js';
import { RoleModelBinding, ToolDefinition } from './types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Pass-through: model IDs now come from Settings dropdown (dynamic discovery).
 */
function resolveModelId(displayName: string, _provider: string): string {
  return displayName;
}

export class LLMFactory {
  private extensionUri: string;

  constructor(extensionUri: string) {
    this.extensionUri = extensionUri;
  }

  async createAgent(role: string, binding: RoleModelBinding, tools: ToolDefinition[] = [], apiKey?: string, provider?: string, instructions?: string): Promise<Agent> {
    const rawModelId = binding[role];
    if (!rawModelId) {
      throw new Error(`No model bound for role: ${role}`);
    }

    // Resolve display name to valid API model ID
    const modelId = resolveModelId(rawModelId, provider || rawModelId);
    console.log(`[llm::backend] Model resolution: "${rawModelId}" → "${modelId}" (provider: ${provider})`);

    let modelProvider: ModelProvider;
    const providerLower = (provider || modelId).toLowerCase();
    // Select provider based on explicit provider field, fallback to model name
    if (providerLower.includes('gemini') || providerLower.includes('google')) {
      modelProvider = new GeminiProvider(apiKey || process.env.GEMINI_API_KEY || '');
    } else if (providerLower.includes('claude') || providerLower.includes('anthropic')) {
      modelProvider = new ClaudeProvider(apiKey || process.env.ANTHROPIC_API_KEY || '');
    } else {
      modelProvider = new OpenAIProvider({ apiKey: apiKey || process.env.OPENAI_API_KEY || '' });
    }

    // Use pre-resolved instructions from Extension Host, fallback to file load
    const agentInstructions = instructions || await this.loadRoleInstructions(role);

    return new Agent({
      name: role,
      instructions: agentInstructions,
      model: await modelProvider.getModel(modelId),
      tools: tools.map(t => t as any),
    });
  }

  private async loadRoleInstructions(role: string): Promise<string> {
    try {
      // Use WORKSPACE_ROOT env var set by the Extension Host when spawning the sidecar
      const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd();
      const rolePath = path.join(workspaceRoot, '.agent', 'rules', 'roles', `${role}.md`);
      return await fs.readFile(rolePath, 'utf-8');
    } catch (error) {
      console.error(`[llm::backend] Failed to load role instructions for ${role}`, error);
      return `You are the ${role} agent.`; // Fallback
    }
  }
}
