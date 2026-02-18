import { Agent, ModelProvider } from '@openai/agents';
import { OpenAIProvider } from '@openai/agents';
import { GeminiProvider } from './adapters/gemini-adapter.js';
import { ClaudeProvider } from './adapters/claude-adapter.js';
import { RoleModelBinding, ToolDefinition } from './types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export class LLMFactory {
  private extensionUri: string;

  constructor(extensionUri: string) {
    this.extensionUri = extensionUri;
  }

  async createAgent(role: string, binding: RoleModelBinding, tools: ToolDefinition[] = []): Promise<Agent> {
    const modelId = binding[role];
    if (!modelId) {
      throw new Error(`No model bound for role: ${role}`);
    }

    // TODO: In a real app, model configuration (API key) would come from secure storage 
    // passed via context or retrieved here if we have access to secrets (Background only).
    // For VirtualBackend (Sidecar), we expect keys to be passed in the request or env.
    // For this implementation, we'll assume keys are available in process.env for simplicity 
    // or passed in. *Critically*, the sidecar needs the keys. 
    // We will update the request flow to pass keys from Extension Host.

    let provider: ModelProvider;
    // Mock logic for provider selection based on ID convention or data
    if (modelId.includes('gemini')) {
      provider = new GeminiProvider(process.env.GEMINI_API_KEY || '');
    } else if (modelId.includes('claude')) {
      provider = new ClaudeProvider(process.env.ANTHROPIC_API_KEY || '');
    } else {
      provider = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY || '' });
    }

    const instructions = await this.loadRoleInstructions(role);

    return new Agent({
      name: role,
      instructions: instructions,
      model: await provider.getModel(modelId),
      tools: tools.map(t => t as any), // Cast to fit Agent SDK tool type
    });
  }

  private async loadRoleInstructions(role: string): Promise<string> {
    // Roles are in .agent/rules/roles/
    // We need to resolve the path relative to workspace root. 
    // Assuming extensionUri points to extension root, we need to go up to workspace.
    // This path resolution might need adjustment based on sidecar cwd.
    try {
      // Mock path for now - needs robust resolution in VirtualBackend
      const rolePath = path.join(this.extensionUri, '..', '..', '..', '.agent', 'rules', 'roles', `${role}.md`);
      return await fs.readFile(rolePath, 'utf-8');
    } catch (error) {
      console.error(`Failed to load role instructions for ${role}`, error);
      return `You are the ${role} agent.`; // Fallback
    }
  }
}
