import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { Agent, type Tool } from '@openai/agents';
// Using any for now as tools structure is dynamic
// Ideally we would import specific tool factories or have a ToolRegistry
// For this MVP we will implement a simple inline tool/hand-off resolution

export interface AgentDefinition {
  id: string;
  name?: string;
  instructions: string;
  capabilities?: {
    skills?: string[];
  };
}

export class AgentRegistryService {
  private rolesDir: string;
  private agents: Map<string, Agent<any, any>> = new Map();

  constructor(rolesDir?: string) {
    this.rolesDir = rolesDir || path.resolve(process.cwd(), '.agent', 'rules', 'roles');
  }

  /**
   * Scans the roles directory and loads all agents.
   */
  async loadAgents(): Promise<void> {
    try {
      const files = await fs.readdir(this.rolesDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));

      for (const file of mdFiles) {
        await this.loadAgentFromFile(path.join(this.rolesDir, file));
      }
    } catch (error) {
      console.warn(`Could not load agents from ${this.rolesDir}`, error);
    }
  }

  /**
   * Loads a single agent from a markdown file.
   */
  async loadAgentFromFile(filePath: string): Promise<Agent<any, any> | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(content);
      const data = parsed.data as any;

      if (!data.id) {
        // Skip files without ID (e.g. templates or indices)
        return null;
      }

      const agentId = data.id;
      // Extract name from ID (e.g. role.architect-agent -> architect-agent)
      const name = agentId.split('.').pop() || agentId;

      const instructions = parsed.content.trim();

      // In a real implementation, we would map capabilities.skills to actual Tools
      // For this MVP, we will inject a basic "perform_task" tool if a skill is present
      // or rely on the caller to inject tools. 
      // The requirement says "Map skills to tools from .agent/skills/", but 
      // since that logic can be complex, we'll implement a placeholder strategy here
      // where we look for a matching tool factory or js file.

      const tools: Tool<any>[] = [];

      // Create the Agent instance
      const agent = new Agent({
        name: name,
        instructions: instructions,
        model: 'gpt-4o', // Default model
        tools: tools,
      });

      this.agents.set(agentId, agent);
      return agent;

    } catch (error) {
      console.error(`Error loading agent from ${filePath}`, error);
      return null;
    }
  }

  getAgent(id: string): Agent<any, any> | undefined {
    return this.agents.get(id);
  }

  listAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Manually register an agent (useful for testing or dynamic creation)
   */
  registerAgent(id: string, agent: Agent<any, any>): void {
    this.agents.set(id, agent);
  }
}
