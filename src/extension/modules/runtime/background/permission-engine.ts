
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

/**
 * Permission Engine.
 * Validates actions against Agent Skills defined in Markdown.
 */
export class PermissionEngine {
  private roleCache: Map<string, any> = new Map();

  constructor() { }

  /**
   * Check if the agent is allowed to perform the action.
   * @param agentRole The ID of the agent role (e.g. 'architect', 'backend')
   * @param action The action ID using dot notation (e.g. 'fs.readFile', 'terminal.runCommand')
   */
  public async checkPermission(agentRole: string, action: string): Promise<boolean> {
    const roleDef = await this.getRoleDefinition(agentRole);
    if (!roleDef) {
      console.warn(`[PermissionEngine] Role definition not found for: ${agentRole}`);
      return false;
    }

    // Parse capabilities/skills from the YAML frontmatter or content
    // Structure expected in .agent/rules/roles/*.md:
    // capabilities:
    //   files: [read, write]
    //   terminal: [run]

    // For now, simpler mapping:
    // Action 'fs.read' -> requires 'files' capability

    const requiredSkill = this.mapActionToSkill(action);
    if (!requiredSkill) {
      // Unknown action? Deny by default.
      return false;
    }

    // Check if role has the skill
    const capabilities = roleDef.capabilities || {};
    // Check 'tools' list as well since that's standard
    const tools = roleDef.capabilities?.tools || {};

    // Logic: 
    // If action is fs.*, check if 'fs' or 'files' is in capabilities/tools
    // Ideally we update the Role MD structure to be explicit.
    // For MVP/Task 3, we look for presence in `capabilities.skills` array or similar.

    // Let's assume current structure in role.md `capabilities: tools: ...`
    // We might need to add `skills` to the frontmatter.

    // Fallback for existing roles without explicit skills:
    // If it's 'backend' -> allow everything (Developer role)
    if (agentRole === 'backend' || agentRole === 'architect') { return true; }

    return false;
  }

  private mapActionToSkill(action: string): string | null {
    if (action.startsWith('fs.')) { return 'filesystem'; }
    if (action.startsWith('terminal.')) { return 'terminal'; }
    return null;
  }

  private async getRoleDefinition(role: string): Promise<any | null> {
    if (this.roleCache.has(role)) {
      return this.roleCache.get(role);
    }

    // Resolve path: .agent/rules/roles/<role>.md
    // We need workspace root. Since we are in Extension Host, we can use vscode.workspace
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) { return null; }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const rolePath = path.join(rootPath, '.agent', 'rules', 'roles', `${role}.md`); // Assuming filename matches role ID

    try {
      if (!fs.existsSync(rolePath)) { return null; }

      const content = await fs.promises.readFile(rolePath, 'utf8');
      const parsed = matter(content); // Use gray-matter to parse YAML frontmatter

      this.roleCache.set(role, parsed.data);
      return parsed.data;
    } catch (e) {
      console.error(`[PermissionEngine] Failed to load role ${role}`, e);
      return null;
    }
  }
}
