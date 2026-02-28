/**
 * ContextLoader
 *
 * Loads all context files needed for a workflow turn:
 * - Agent role persona and context files
 * - Workflow constitution references
 * - Workflow context files (input/context from frontmatter)
 *
 * Runs in the Runtime sidecar process (Node.js, no vscode API).
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import matter from 'gray-matter';

export interface LoadedContext {
  /** Agent persona text (from role .md body) */
  agentPersona: string;
  /** Agent role config (from role .md frontmatter) */
  agentConfig: Record<string, any>;
  /** Loaded constitution contents */
  constitutions: string[];
  /** Loaded workflow context file contents */
  workflowContextFiles: string[];
}

export interface WorkflowVars {
  TS: string;
  TASK: string;
  taskId: string;
  titleShort: string;
  [key: string]: string | string[];
}

export class ContextLoader {
  constructor(private workspaceRoot: string) { }

  /**
   * Load all context for a turn: agent persona, constitutions, workflow context files.
   */
  async loadAll(
    agentId: string,
    constitutionRefs: string[],
    workflowContextRefs: string[],
  ): Promise<LoadedContext> {
    // Load agent first — its context refs feed into constitution loading
    const agentData = await this.loadAgentRole(agentId);
    const agentContextRefs: string[] = agentData.config?.context || [];

    const [constitutions, workflowContextFiles] = await Promise.all([
      this.loadConstitutions(constitutionRefs, agentContextRefs),
      this.loadWorkflowContextFiles(workflowContextRefs),
    ]);

    return {
      agentPersona: agentData.persona,
      agentConfig: agentData.config,
      constitutions,
      workflowContextFiles,
    };
  }

  /**
   * Load agent role file from .agent/rules/roles/<agent>.md.
   * Returns persona (body) and config (frontmatter).
   */
  async loadAgentRole(agentId: string): Promise<{ persona: string; config: Record<string, any> }> {
    // Normalize: "architect-agent" → "architect"
    const roleName = agentId.replace(/-agent$/, '');
    const rolePath = join(this.workspaceRoot, '.agent', 'rules', 'roles', `${roleName}.md`);

    try {
      const content = await readFile(rolePath, 'utf-8');
      const parsed = matter(content);
      return {
        persona: parsed.content.trim(),
        config: parsed.data || {},
      };
    } catch {
      console.log(`[ContextLoader] Agent role not found: ${rolePath}`);
      return { persona: '', config: {} };
    }
  }

  /**
   * Load constitution files from workflow refs + agent context refs.
   */
  async loadConstitutions(
    workflowRefs: string[],
    agentContextRefs: string[],
  ): Promise<string[]> {
    const contents: string[] = [];
    const loaded = new Set<string>();
    const baseDir = join(this.workspaceRoot, '.agent', 'rules', 'constitution');

    // Build alias map from constitution index
    const aliasMap = await this.buildConstitutionAliasMap(baseDir);

    // Load all refs (workflow constitutions + agent context)
    const allRefs = [...workflowRefs, ...agentContextRefs];
    for (const rawRef of allRefs) {
      if (loaded.has(rawRef)) { continue; }
      const content = await this.resolveConstitutionRef(rawRef, baseDir, aliasMap);
      if (content) {
        contents.push(`\n### ${rawRef}\n${content}`);
        loaded.add(rawRef);
      }
    }

    return contents;
  }

  /**
   * Load workflow context files (from frontmatter context: and input: arrays).
   * Resolves <TS>, <TASK> placeholders.
   */
  async loadWorkflowContextFiles(refs: string[]): Promise<string[]> {
    if (refs.length === 0) { return []; }

    const vars = await this.resolveWorkflowVars();
    const contents: string[] = [];

    for (const rawRef of refs) {
      const ref = this.resolvePlaceholders(rawRef, vars);
      const fullPath = ref.startsWith('/') ? ref : join(this.workspaceRoot, ref);
      try {
        const content = await readFile(fullPath, 'utf-8');
        contents.push(`\n### ${basename(fullPath)}\n${content}`);
      } catch {
        console.log(`[ContextLoader] Context file not found: ${fullPath}`);
      }
    }

    return contents;
  }

  /**
   * Resolve workflow variables from candidate/task artifacts.
   */
  async resolveWorkflowVars(): Promise<WorkflowVars> {
    const vars: WorkflowVars = {
      TS: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      TASK: '',
      taskId: '',
      titleShort: 'task',
    };

    // Read most recent candidate
    const candidateDir = join(this.workspaceRoot, '.agent', 'artifacts', 'candidate');
    try {
      const files = await readdir(candidateDir);
      const candidates = files
        .filter((f: string) => f.endsWith('-candidate.md'))
        .sort()
        .reverse();

      if (candidates.length > 0) {
        const tsMatch = candidates[0].match(/^(\d{8})/);
        if (tsMatch) { vars.TS = tsMatch[1]; }

        const slugMatch = candidates[0].match(/^\d{8}-(.+)-candidate\.md$/);
        if (slugMatch) { vars.titleShort = slugMatch[1]; }
      }
    } catch { /* candidate dir may not exist */ }

    vars.taskId = `${vars.TS}-${vars.titleShort}`;
    vars.TASK = vars.taskId;

    // Try to find active task folder
    const artifactsDir = join(this.workspaceRoot, '.agent', 'artifacts');
    try {
      const entries = await readdir(artifactsDir);
      const taskFolders = entries
        .filter((e: string) => /^\d{8}-.+/.test(e))
        .sort()
        .reverse();

      if (taskFolders.length > 0) {
        const taskMdPath = join(artifactsDir, taskFolders[0], 'task.md');
        try {
          await stat(taskMdPath);
          vars.TASK = taskFolders[0];
          vars.taskId = taskFolders[0];
        } catch { /* task.md doesn't exist yet */ }
      }
    } catch { /* artifacts dir may not exist */ }

    return vars;
  }

  // ─── Private Helpers ──────────────────────────────────────

  private resolvePlaceholders(ref: string, vars: WorkflowVars): string {
    return ref
      .replace(/<TS>/g, vars.TS)
      .replace(/<TASK>/g, vars.TASK)
      .replace(/<title-short>/g, vars.titleShort);
  }

  private async buildConstitutionAliasMap(baseDir: string): Promise<Record<string, string>> {
    const aliasMap: Record<string, string> = {};
    try {
      const indexContent = await readFile(join(baseDir, 'index.md'), 'utf-8');
      const aliasRegex = /^\s+(\w+):\s+(.+\.md)\s*$/gm;
      let match;
      while ((match = aliasRegex.exec(indexContent)) !== null) {
        aliasMap[match[1]] = match[2];
      }
    } catch { /* no index file */ }
    return aliasMap;
  }

  private async resolveConstitutionRef(
    ref: string,
    baseDir: string,
    aliasMap: Record<string, string>,
  ): Promise<string | null> {
    // Case 1: Direct file path
    if (ref.startsWith('.agent/') || ref.startsWith('/')) {
      const directPath = ref.startsWith('/') ? ref : join(this.workspaceRoot, ref);
      try { return await readFile(directPath, 'utf-8'); } catch { /* not found */ }
    }

    // Case 2: Alias via index
    const aliasName = ref.replace(/^constitution\./, '');
    if (aliasMap[aliasName]) {
      try { return await readFile(join(this.workspaceRoot, aliasMap[aliasName]), 'utf-8'); } catch { /* not found */ }
    }

    // Case 3: Fallback candidate paths
    const candidates = [
      aliasName.replace(/_/g, '-') + '.md',
      aliasName.replace(/_/g, '.') + '.md',
      aliasName.replace(/_/g, '-') + '/index.md',
      aliasName + '.md',
    ];
    for (const candidate of candidates) {
      try { return await readFile(join(baseDir, candidate), 'utf-8'); } catch { /* try next */ }
    }

    return null;
  }
}
