/**
 * WorkflowParser
 *
 * Parses .md workflow files into structured WorkflowDef objects.
 * Uses gray-matter for YAML frontmatter extraction and custom
 * section parsing for the 7 mandatory sections.
 *
 * Aligned with normalized workflow structure (T025/T026).
 * Design: Pure code, no LLM involvement. Deterministic parsing.
 */

import matter from 'gray-matter';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import type {
  WorkflowDef,
  WorkflowStep,
  GateDef,
  PassDef,
  FailDef,
  Frontmatter,
  AgentRole,
} from '../types.js';

export class WorkflowParser {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Parse a single workflow .md file into a WorkflowDef.
   */
  async parse(filePath: string): Promise<WorkflowDef> {
    const rawContent = await readFile(filePath, 'utf-8');
    return this.parseContent(rawContent, filePath);
  }

  /**
   * Parse workflow content string into a WorkflowDef.
   * Expects normalized format: single frontmatter block, 7 mandatory sections.
   */
  parseContent(rawContent: string, source: string = 'unknown'): WorkflowDef {
    const frontmatter = this.extractFrontmatter(rawContent, source);
    const bodyContent = this.extractBody(rawContent);
    const steps = this.extractInstructions(bodyContent);
    const gate = this.extractGate(bodyContent);
    const bodyConstitutions = this.extractConstitutions(bodyContent);
    const pass = this.extractPassDef(bodyContent, frontmatter);
    const fail = this.extractFailDef(bodyContent);

    // Merge frontmatter context: with body-extracted constitutions (deduplicated)
    const frontmatterContext: string[] = frontmatter.context || [];
    const allConstitutions = [...frontmatterContext];
    for (const c of bodyConstitutions) {
      if (!allConstitutions.includes(c)) {
        allConstitutions.push(c);
      }
    }

    // Extract structured sections
    const inputs = this.extractListItems(bodyContent, 'Input');
    const outputs = this.extractListItems(bodyContent, 'Output');
    const objective = this.extractSection(bodyContent, 'Objective') || '';
    const instructions = this.extractSection(bodyContent, 'Instructions') || '';
    const passSection = this.extractSection(bodyContent, 'Pass') || '';
    const failSection = this.extractSection(bodyContent, 'Fail') || '';

    const def: WorkflowDef = {
      id: frontmatter.id,
      description: frontmatter.description,
      owner: frontmatter.owner,
      version: frontmatter.version,
      trigger: frontmatter.trigger,
      type: frontmatter.type,
      constitutions: allConstitutions,
      steps,
      gate,
      pass,
      fail,
      rawContent,
      sections: {
        inputs,
        outputs,
        objective,
        instructions,
        pass: passSection,
        fail: failSection,
      },
    };

    // Validate required fields
    this.validate(def, source);

    return def;
  }

  /**
   * Parse all workflow files in a directory recursively.
   */
  async parseDirectory(dirPath: string): Promise<Map<string, WorkflowDef>> {
    const start = performance.now();
    const workflows = new Map<string, WorkflowDef>();
    const files = await this.findMarkdownFiles(dirPath);

    for (const file of files) {
      try {
        const def = await this.parse(file);
        workflows.set(def.id, def);
      } catch (err) {
        console.error(`[WorkflowParser] Failed to parse ${file}:`, err);
      }
    }

    const end = performance.now();
    console.log(`[WorkflowParser] execution completed in ${((end - start) / 1000).toFixed(3)}s`);
    return workflows;
  }

  /**
   * Check if a workflow ID refers to a lifecycle directory (contains phase-*.md files).
   * This enables data-driven detection: any directory under `.agent/workflows/`
   * that contains `phase-*.md` files is treated as a lifecycle.
   */
  hasPhaseDirectory(workflowId: string): boolean {
    // Normalize: strip prefixes like "workflow." or "workflows."
    const dirName = workflowId.replace(/^workflows?\./, '');
    const candidatePath = join(this.workspaceRoot, '.agent', 'workflows', dirName);

    if (!existsSync(candidatePath)) { return false; }

    try {
      const entries = readdirSync(candidatePath);
      return entries.some((e: string) => e.includes('phase-') && e.endsWith('.md'));
    } catch {
      return false;
    }
  }

  /**
   * Parse phase files from a lifecycle directory (e.g., tasklifecycle-long/).
   * Returns parsed phases sorted by phase number.
   * Only includes files matching phase-*.md or short-phase-*.md pattern.
   */
  async parsePhaseDirectory(lifecyclePath: string): Promise<WorkflowDef[]> {
    const files = await this.findMarkdownFiles(lifecyclePath);
    const phases: WorkflowDef[] = [];

    for (const file of files) {
      const filename = basename(file);
      // Only parse phase files, not index.md or other files
      if (!filename.includes('phase-') || !filename.endsWith('.md')) {
        continue;
      }
      try {
        const def = await this.parse(file);
        phases.push(def);
      } catch (err) {
        console.error(`[WorkflowParser] Failed to parse phase ${file}:`, err);
      }
    }

    // Sort by phase number extracted from filename
    phases.sort((a, b) => {
      const numA = parseInt(a.id.match(/phase-(\d+)/)?.[1] || '0', 10);
      const numB = parseInt(b.id.match(/phase-(\d+)/)?.[1] || '0', 10);
      return numA - numB;
    });

    console.log(`[WorkflowParser] Parsed ${phases.length} phases from ${lifecyclePath}`);
    return phases;
  }

  /**
   * Scan .agent/rules/roles/ to build a dynamic agent registry.
   */
  async discoverAgents(rolesDir?: string): Promise<AgentRole[]> {
    const dir = rolesDir ?? join(this.workspaceRoot, '.agent', 'rules', 'roles');
    const agents: AgentRole[] = [];

    try {
      const files = await readdir(dir);
      for (const file of files) {
        if (!file.endsWith('.md')) {
          continue;
        }
        const id = basename(file, '.md');
        agents.push({
          id: `${id}-agent`,
          name: id,
          filePath: join(dir, file),
        });
      }
    } catch (err) {
      console.error(`[WorkflowParser] Failed to read roles directory:`, err);
    }

    return agents;
  }

  // ─── Validation ───────────────────────────────────────────

  /**
   * Validate a WorkflowDef has all required fields.
   */
  private validate(def: WorkflowDef, source: string): void {
    const errors: string[] = [];

    if (!def.id) {
      errors.push('Missing required field: id');
    }
    if (!def.owner) {
      errors.push('Missing required field: owner');
    }

    if (errors.length > 0) {
      throw new Error(
        `[WorkflowParser] Validation failed for "${source}": ${errors.join(', ')}`
      );
    }
  }

  // ─── Private Parsing Methods ──────────────────────────────

  /**
   * Extract frontmatter from a single YAML block using gray-matter.
   */
  private extractFrontmatter(rawContent: string, source: string): Frontmatter {
    try {
      const parsed = matter(rawContent);
      if (parsed.data && parsed.data.id) {
        return this.castFrontmatter(parsed.data);
      }
    } catch {
      // gray-matter failed — try manual extraction
    }

    // Fallback: manual regex extraction
    const fmMatch = rawContent.match(/^---\n([\s\S]*?)\n---/m);
    if (!fmMatch) {
      throw new Error(`[WorkflowParser] No frontmatter found in "${source}"`);
    }

    const fmBlock = fmMatch[1];
    const getField = (key: string): string | undefined => {
      const match = fmBlock.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
      return match ? match[1].trim() : undefined;
    };

    const data: Record<string, any> = {
      id: getField('id'),
      description: getField('description'),
      owner: getField('owner'),
      version: getField('version'),
      type: getField('type'),
      trigger: getField('trigger'),
    };

    if (!data.id) {
      throw new Error(`[WorkflowParser] No valid frontmatter with 'id' found in "${source}"`);
    }

    return this.castFrontmatter(data);
  }

  /**
   * Cast raw gray-matter data to typed Frontmatter.
   */
  private castFrontmatter(data: Record<string, any>): Frontmatter {
    // Parse trigger: ensure it's always string[]
    let trigger: string[] = [];
    if (Array.isArray(data.trigger)) {
      trigger = data.trigger.map(String);
    } else if (typeof data.trigger === 'string') {
      trigger = [data.trigger];
    }

    return {
      id: data.id,
      description: data.description,
      owner: data.owner,
      version: data.version,
      trigger,
      type: (data.type === 'dynamic' ? 'dynamic' : 'static') as 'static' | 'dynamic',
      ...(data.pass ? { pass: data.pass } : {}),
    };
  }

  /**
   * Extract the markdown body (everything after frontmatter block).
   */
  private extractBody(rawContent: string): string {
    let content = rawContent;
    // Remove single frontmatter block
    content = content.replace(/^---\n[\s\S]*?\n---\n*/m, '');
    return content.trim();
  }

  /**
   * Extract numbered steps from the ## Instructions section.
   */
  private extractInstructions(body: string): WorkflowStep[] {
    const steps: WorkflowStep[] = [];

    const stepsSection = this.extractSection(body, 'Instructions');
    if (!stepsSection) {
      return steps;
    }

    // Match numbered steps: "N. Title" or "### N. Title" or "#### N.N Title"
    const stepPattern = /(?:^|\n)(?:#{2,4}\s+)?(\d+)\.?\s+(.+?)(?=\n(?:#{2,4}\s+)?\d+\.?\s|\n## |\n---|\n*$)/gs;
    let match: RegExpExecArray | null;

    while ((match = stepPattern.exec(stepsSection)) !== null) {
      const stepNumber = parseInt(match[1], 10);
      const titleAndContent = match[2].trim();
      const lines = titleAndContent.split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();

      steps.push({
        number: stepNumber,
        title,
        content,
        isGate: this.isGateStep(title, content),
      });
    }

    // Fallback: simple line-by-line parsing if regex didn't catch steps
    if (steps.length === 0) {
      const lines = stepsSection.split('\n');
      let currentStep: Partial<WorkflowStep> | null = null;
      let contentLines: string[] = [];

      for (const line of lines) {
        const lineMatch = line.match(/^\s*(?:#{2,4}\s+)?(\d+)\.?\s+(.+)/);
        if (lineMatch) {
          // Save previous step
          if (currentStep && currentStep.number !== undefined) {
            currentStep.content = contentLines.join('\n').trim();
            currentStep.isGate = this.isGateStep(
              currentStep.title ?? '',
              currentStep.content
            );
            steps.push(currentStep as WorkflowStep);
          }
          currentStep = {
            number: parseInt(lineMatch[1], 10),
            title: lineMatch[2].trim(),
          };
          contentLines = [];
        } else if (currentStep) {
          contentLines.push(line);
        }
      }

      // Don't forget the last step
      if (currentStep && currentStep.number !== undefined) {
        currentStep.content = contentLines.join('\n').trim();
        currentStep.isGate = this.isGateStep(
          currentStep.title ?? '',
          currentStep.content
        );
        steps.push(currentStep as WorkflowStep);
      }
    }

    return steps;
  }

  /**
   * Extract gate definition from ## Gate section.
   */
  private extractGate(body: string): GateDef | null {
    const gateSection = this.extractSection(body, 'Gate');
    if (!gateSection) {
      return null;
    }

    const requirements: string[] = [];

    // Extract numbered requirements (supports both "1." and "1)" formats)
    const reqPattern = /^\s*\d+[.)]\s+(.+)/gm;
    let match: RegExpExecArray | null;
    while ((match = reqPattern.exec(gateSection)) !== null) {
      requirements.push(match[1].trim());
    }

    // Extract fail step reference
    const failMatch = gateSection.match(/Step\s+(\d+)\s*\(FAIL\)/i);
    const failStep = failMatch ? parseInt(failMatch[1], 10) : null;

    return requirements.length > 0 ? { requirements, failStep } : null;
  }

  /**
   * Extract structured PassDef from ## Pass section.
   * nextTarget is read from frontmatter YAML (source of truth).
   */
  private extractPassDef(body: string, frontmatter: Frontmatter): PassDef | null {
    const section = this.extractSection(body, 'Pass');
    if (!section) {
      return null;
    }

    // Read nextTarget from frontmatter YAML — deterministic, no regex
    let nextTarget: string | null = null;
    if (frontmatter.pass?.nextTarget) {
      const nt = frontmatter.pass.nextTarget;
      if (typeof nt === 'string') {
        // Simple string: "tasklifecycle-long"
        nextTarget = nt;
      } else if (typeof nt === 'object') {
        // Conditional map: { long: "tasklifecycle-long", short: "tasklifecycle-short" }
        const values = Object.entries(nt)
          .map(([key, val]) => `${key}:${val}`);
        nextTarget = values.join(' | ');
      }
    }

    const actions = this.extractActionItems(section);
    return { nextTarget, actions, rawContent: section };
  }

  /**
   * Extract structured FailDef from ## Fail section.
   */
  private extractFailDef(body: string): FailDef | null {
    const section = this.extractSection(body, 'Fail');
    if (!section) {
      return null;
    }

    const behavior: 'block' | 'retry' = /iterate|retry|resubmit/i.test(section)
      ? 'retry'
      : 'block';
    const cases = this.extractActionItems(section);

    return { behavior, cases, rawContent: section };
  }

  /**
   * Extract required constitutions from `constitution.X` patterns and direct file paths.
   */
  private extractConstitutions(body: string): string[] {
    const constitutions: string[] = [];

    // Pattern 1: `constitution.X` aliases
    const constPattern = /`(constitution\.\w+)`/g;
    let match: RegExpExecArray | null;
    while ((match = constPattern.exec(body)) !== null) {
      if (!constitutions.includes(match[1])) {
        constitutions.push(match[1]);
      }
    }

    // Pattern 2: Direct file paths under `.agent/rules/` (constitutions only, not artifacts/templates)
    const pathPattern = /`(\.agent\/rules\/[^\s`]+\.md)`/g;
    while ((match = pathPattern.exec(body)) !== null) {
      if (!constitutions.includes(match[1])) {
        constitutions.push(match[1]);
      }
    }

    return constitutions;
  }

  // ─── Utility Methods ──────────────────────────────────────

  /**
   * Extract a section by heading name (## SectionName).
   * Matches exactly on the section name.
   */
  private extractSection(body: string, sectionName: string): string | null {
    const lines = body.split('\n');
    let capturing = false;
    const contentLines: string[] = [];

    for (const line of lines) {
      // Check if this is a ## heading
      const headingMatch = line.match(/^##\s+(?:\d+\.\s+)?(.+)/);

      if (headingMatch) {
        if (capturing) {
          break; // Hit next section, stop
        }
        const headingText = headingMatch[1].trim();
        if (headingText === sectionName || headingText.startsWith(sectionName)) {
          capturing = true;
          continue;
        }
      } else if (line.startsWith('---') && capturing) {
        break; // Hit separator, stop
      }

      if (capturing) {
        contentLines.push(line);
      }
    }

    const content = contentLines.join('\n').trim();
    return content.length > 0 ? content : null;
  }

  /**
   * Extract list items (lines starting with -) from a named section.
   */
  private extractListItems(body: string, sectionName: string): string[] {
    const section = this.extractSection(body, sectionName);
    if (!section) { return []; }

    return section
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  /**
   * Extract action items (lines starting with - or numbered) from section content.
   */
  private extractActionItems(content: string): string[] {
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || /^\d+\./.test(line))
      .map(line => line.replace(/^[-\d.]+\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  /**
   * Determine if a step is a gate (requires developer approval).
   */
  private isGateStep(title: string, content: string): boolean {
    const combined = `${title} ${content}`.toLowerCase();
    return (
      combined.includes('gate') ||
      combined.includes('approval') ||
      combined.includes('si / no') ||
      combined.includes('si/no') ||
      combined.includes('developer approval')
    );
  }

  /**
   * Recursively find all .md files in a directory.
   */
  private async findMarkdownFiles(dirPath: string): Promise<string[]> {
    const results: string[] = [];

    try {
      const entries = await readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        if (entry.isDirectory()) {
          const nested = await this.findMarkdownFiles(fullPath);
          results.push(...nested);
        } else if (entry.name.endsWith('.md')) {
          results.push(fullPath);
        }
      }
    } catch (err) {
      console.error(`[WorkflowParser] Failed to read directory ${dirPath}:`, err);
    }

    return results;
  }
}
