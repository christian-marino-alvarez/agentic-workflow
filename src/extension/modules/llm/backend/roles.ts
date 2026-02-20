import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

export interface ParsedRole {
  name: string;
  instructions: string;
  modelId?: string;
}

/**
 * Parses a role markdown file from .agent/rules/roles/<role>.md
 * Extracts the instructions and the assigned model.
 */
export class RoleParser {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  private getRoleFilePath(roleAlias: string): string {
    return path.join(this.workspaceRoot, '.agent', 'rules', 'roles', `${roleAlias}.md`);
  }

  /**
   * Retrieves the role definition.
   */
  public getRole(roleAlias: string): ParsedRole {
    const filePath = this.getRoleFilePath(roleAlias);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Role file not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // By default, gray-matter only parses the *first* YAML block.
    // However, some of our roles have multiple frontmatter blocks (one for VSCode snippet, one for Agent).
    // We will extract the full content as instructions, but try to find 'model: <id>' throughout the file.

    // We can use a simple regex to find the model field in any YAML block
    const modelMatch = fileContent.match(/^model:\s*(.+)$/m);
    const modelId = modelMatch ? modelMatch[1].trim() : undefined;

    return {
      name: roleAlias,
      instructions: fileContent, // We pass the entire markdown as instructions
      modelId
    };
  }

  /**
   * Updates the model ID in the role's frontmatter.
   */
  public updateRoleModel(roleAlias: string, newModelId: string): void {
    const filePath = this.getRoleFilePath(roleAlias);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Role file not found: ${filePath}`);
    }

    let fileContent = fs.readFileSync(filePath, 'utf-8');

    // Check if `model: ...` already exists
    if (/^model:\s*(.+)$/m.test(fileContent)) {
      // Replace existing
      fileContent = fileContent.replace(/^model:\s*(.+)$/m, `model: ${newModelId}`);
    } else {
      // Inject into the first frontmatter block
      if (fileContent.startsWith('---')) {
        fileContent = fileContent.replace('---', `---\nmodel: ${newModelId}`);
      } else {
        // No frontmatter, create one
        fileContent = `---\nmodel: ${newModelId}\n---\n\n${fileContent}`;
      }
    }

    fs.writeFileSync(filePath, fileContent, 'utf-8');
  }
}
