
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml'; // Assuming js-yaml is available or we use simple regex if not

/**
 * Parses .agent/index.md to resolve internal paths.
 */
export class IndexParser {
  private indexContent: string = '';
  private parsedPaths: Map<string, string> = new Map();

  constructor(private workspaceRoot: string) { }

  public async parse(): Promise<void> {
    const indexPath = path.join(this.workspaceRoot, '.agent', 'index.md');
    try {
      if (!fs.existsSync(indexPath)) {
        console.warn(`[IndexParser] Index file not found at ${indexPath}`);
        return;
      }

      this.indexContent = await fs.promises.readFile(indexPath, 'utf-8');
      this.extractAliases(this.indexContent);
      console.log(`[IndexParser] Loaded index from ${indexPath}. Found ${this.parsedPaths.size} aliases.`);
    } catch (error) {
      console.error(`[IndexParser] Failed to load index at ${indexPath}`, error);
    }
  }

  private extractAliases(content: string): void {
    // Basic YAML extraction from Markdown code block
    const yamlMatch = content.match(/```yaml([\s\S]*?)```/);
    if (yamlMatch && yamlMatch[1]) {
      try {
        // Use js-yaml for robust parsing
        const parsed = yaml.load(yamlMatch[1]) as any;

        // Navigate the object structure to flatten it or extract known keys
        // We want to find leaves that start with '.' (paths)
        this.traverseAndCollect(parsed, []);
      } catch (e) {
        console.error('[IndexParser] YAML parse error', e);
      }
    }
  }

  private traverseAndCollect(obj: any, prefix: string[]) {
    if (typeof obj === 'string') {
      // It's a path leaf?
      if (obj.startsWith('.')) {
        // Alias is the last key, or the full dotted path?
        // Let's use the last key as the primary alias for simplicity in this MVP
        // and also store the full dotted path for precision
        const key = prefix[prefix.length - 1];
        this.parsedPaths.set(key, obj);
        this.parsedPaths.set(prefix.join('.'), obj);
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key of Object.keys(obj)) {
        this.traverseAndCollect(obj[key], [...prefix, key]);
      }
    }
  }

  public getPath(alias: string): string | undefined {
    return this.parsedPaths.get(alias);
  }
}
