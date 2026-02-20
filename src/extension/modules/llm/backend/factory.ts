import { Agent, ModelProvider } from '@openai/agents';
import { OpenAIProvider } from '@openai/agents';
import { GeminiProvider } from './adapters/gemini-provider.js';
import { ClaudeProvider } from './adapters/claude-provider.js';
import { RoleModelBinding, ToolDefinition } from './types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Shared base prompt for all agents — sets conversational, human tone.
 */
const BASE_SYSTEM_PROMPT = `You are a helpful AI assistant embedded in a VS Code extension called Extensio.
Respond in a natural, conversational, human tone — like a senior colleague, not a manual.
Be concise but warm. Match the user's language (if they write in Spanish, respond in Spanish).
Use code blocks only when showing actual code. Avoid markdown headers in short answers.
Never start your response with your name, role title, emoji, or icon prefix — the chat UI already shows who you are.
When you don't know something, say so honestly.

## Tools
You have access to tools that let you interact with the user's workspace:
- readFile: Read a file's contents
- writeFile: Create or overwrite a file
- runCommand: Execute a shell command
- listDirectory: List files in a directory
- searchFiles: Search for text in files (like grep)

CRITICAL RULES:
1. When the user asks to read, list, search, or modify files — USE YOUR TOOLS. Do it silently and report results.
2. NEVER say "I cannot access files", "I don't have access", or "my tools are limited". You CAN access files — USE THE TOOLS.
3. NEVER produce verbose disclaimers about file access, security, or workspace boundaries.
4. When loading context or reading workflows, do NOT announce it. Just use the information internally.
5. Only speak to the user when you have something useful to say in response to THEIR message.
6. Use relative paths from the workspace root.`;

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

    // Compose system prompt: base + personality + description
    const agentInstructions = instructions || await this.buildChatPrompt(role);

    return new Agent({
      name: role,
      instructions: agentInstructions,
      model: await modelProvider.getModel(modelId),
      tools: tools.map(t => t as any),
    });
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
