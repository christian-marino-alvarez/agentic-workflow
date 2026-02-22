/**
 * WorkflowParser
 *
 * Parses .md workflow files into structured WorkflowDef objects.
 * Uses gray-matter for YAML frontmatter extraction and custom
 * section parsing for steps, gates, and PASS/FAIL references.
 *
 * Design: Pure code, no LLM involvement. Deterministic parsing.
 */

import matter from 'gray-matter';
import { readFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { FAIL_BEHAVIOR } from '../constants.js';
import type {
  WorkflowDef,
  WorkflowStep,
  GateDef,
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
   * Handles edge cases like double frontmatter (e.g., init.md).
   */
  parseContent(rawContent: string, source: string = 'unknown'): WorkflowDef {
    const frontmatter = this.extractFrontmatter(rawContent, source);
    const bodyContent = this.extractBody(rawContent);
    const steps = this.extractSteps(bodyContent);
    const gate = this.extractGate(bodyContent);
    const constitutions = this.extractConstitutions(bodyContent);
    const passTarget = this.extractPassTarget(bodyContent);
    const failBehavior = this.extractFailBehavior(bodyContent);

    const def: WorkflowDef = {
      id: frontmatter.id,
      description: frontmatter.description,
      owner: frontmatter.owner,
      version: frontmatter.version,
      severity: frontmatter.severity,
      trigger: frontmatter.trigger,
      blocking: frontmatter.blocking ?? true,
      constitutions,
      steps,
      gate,
      passTarget,
      failBehavior,
      rawContent,
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
   * Returns structured { error, code } per constitution.backend.
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
   * Cast raw gray-matter data to typed Frontmatter.
   */
  private castFrontmatter(data: Record<string, any>): Frontmatter {
    return {
      id: data.id,
      description: data.description,
      owner: data.owner,
      version: data.version,
      severity: data.severity,
      trigger: data.trigger,
      blocking: data.blocking ?? true,
    };
  }

  /**
   * Extract frontmatter, handling double-frontmatter files.
   * Some files (e.g., init.md) have two --- blocks:
   * one for the Gemini workflow description, one for the actual data.
   */
  private extractFrontmatter(rawContent: string, source: string): Frontmatter {
    // Try parsing with gray-matter first (gets the FIRST frontmatter block)
    try {
      const parsed = matter(rawContent);

      // If the first frontmatter has an 'id' field, use it directly
      if (parsed.data && parsed.data.id) {
        return this.castFrontmatter(parsed.data);
      }

      // Otherwise, look for a second frontmatter block (double-frontmatter pattern)
      const secondMatch = parsed.content.match(/^---\n([\s\S]*?)\n---/m);
      if (secondMatch) {
        try {
          const secondParsed = matter(`---\n${secondMatch[1]}\n---`);
          if (secondParsed.data && secondParsed.data.id) {
            return this.castFrontmatter(secondParsed.data);
          }
        } catch { /* fall through to manual */ }
      }
    } catch {
      // gray-matter failed (likely YAML with unquoted colons) — try manual extraction
    }

    // Fallback: manual regex extraction of frontmatter fields
    return this.extractFrontmatterManual(rawContent, source);
  }

  /**
   * Manual fallback for frontmatter extraction when gray-matter fails
   * (e.g., YAML values with unquoted colons in description).
   */
  private extractFrontmatterManual(rawContent: string, source: string): Frontmatter {
    const fmMatch = rawContent.match(/^---\n([\s\S]*?)\n---/m);
    if (!fmMatch) {
      throw new Error(`[WorkflowParser] No frontmatter found in "${source}"`);
    }

    const fmBlock = fmMatch[1];
    const getField = (key: string): string | undefined => {
      const match = fmBlock.match(new RegExp(`^${key}:\s*(.+)$`, 'm'));
      return match ? match[1].trim() : undefined;
    };

    const data: Record<string, any> = {
      id: getField('id'),
      description: getField('description'),
      owner: getField('owner'),
      version: getField('version'),
      severity: getField('severity'),
      trigger: getField('trigger'),
      blocking: getField('blocking'),
    };

    // Try second frontmatter block if first had no id
    if (!data.id) {
      const rest = rawContent.slice(fmMatch.index! + fmMatch[0].length);
      const secondMatch = rest.match(/^---\n([\s\S]*?)\n---/m);
      if (secondMatch) {
        const fm2 = secondMatch[1];
        const getField2 = (key: string): string | undefined => {
          const m = fm2.match(new RegExp(`^${key}:\s*(.+)$`, 'm'));
          return m ? m[1].trim() : undefined;
        };
        data.id = getField2('id') || data.id;
        data.owner = getField2('owner') || data.owner;
        data.description = getField2('description') || data.description;
        data.version = getField2('version') || data.version;
      }
    }

    if (!data.id) {
      throw new Error(`[WorkflowParser] No valid frontmatter with 'id' found in "${source}"`);
    }

    return this.castFrontmatter(data);
  }

  /**
   * Extract the markdown body (everything after frontmatter blocks).
   */
  private extractBody(rawContent: string): string {
    // Remove all frontmatter blocks
    let content = rawContent;
    // Remove first frontmatter
    content = content.replace(/^---\n[\s\S]*?\n---\n*/m, '');
    // Remove second frontmatter if present
    content = content.replace(/^---\n[\s\S]*?\n---\n*/m, '');
    return content.trim();
  }

  /**
   * Extract numbered steps from the ## Mandatory Steps section.
   */
  private extractSteps(body: string): WorkflowStep[] {
    const steps: WorkflowStep[] = [];

    // Find the "Mandatory Steps" section
    const stepsSection = this.extractSection(body, 'Mandatory Steps');
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

    // Extract numbered requirements
    const reqPattern = /^\s*\d+\.\s+(.+)/gm;
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
   * Extract required constitutions from > [!IMPORTANT] blocks.
   */
  private extractConstitutions(body: string): string[] {
    const constitutions: string[] = [];
    const constPattern = /`(constitution\.\w+)`/g;
    let match: RegExpExecArray | null;

    while ((match = constPattern.exec(body)) !== null) {
      if (!constitutions.includes(match[1])) {
        constitutions.push(match[1]);
      }
    }

    return constitutions;
  }

  /**
   * Extract PASS target (next workflow/phase).
   */
  private extractPassTarget(body: string): string | null {
    // Look for PASS section referencing next phase
    const passSection = this.extractSection(body, 'PASS');
    if (!passSection) {
      // Try inline: "task.phase.current = aliases.tasklifecycle-long.phases.phase_X.id"
      const aliasMatch = body.match(
        /task\.phase\.current\s*=\s*aliases\.tasklifecycle-long\.phases\.(\w+)\.id/
      );
      return aliasMatch ? aliasMatch[1].replace(/_/g, '-') : null;
    }

    // Check for phase reference in PASS section
    const aliasMatch = passSection.match(
      /task\.phase\.current\s*=\s*aliases\.tasklifecycle-long\.phases\.(\w+)\.id/
    );
    return aliasMatch ? aliasMatch[1].replace(/_/g, '-') : null;
  }

  /**
   * Extract fail behavior from FAIL section.
   */
  private extractFailBehavior(body: string): typeof FAIL_BEHAVIOR[keyof typeof FAIL_BEHAVIOR] {
    const failSection = this.extractSection(body, 'FAIL');
    if (!failSection) {
      return 'block';
    }

    // If the FAIL section mentions iteration or retry, return 'retry'
    if (/iterate|retry|resubmit/i.test(failSection)) {
      return 'retry';
    }

    return 'block';
  }

  // ─── Utility Methods ──────────────────────────────────────

  /**
   * Extract a section by heading name (## SectionName).
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
        if (headingText.startsWith(sectionName)) {
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
