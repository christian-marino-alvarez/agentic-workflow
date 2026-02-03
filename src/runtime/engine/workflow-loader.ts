import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

export interface WorkflowMeta {
  id: string;
  path: string;
  description?: string;
  trigger?: {
    commands?: string[];
  };
}

async function collectMarkdownFiles(root: string): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectMarkdownFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(entryPath);
    }
  }
  return files;
}

export async function loadWorkflows(workflowsRoot: string): Promise<WorkflowMeta[]> {
  const files = await collectMarkdownFiles(workflowsRoot);
  const workflows: WorkflowMeta[] = [];
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf-8');
    const { data } = matter(raw);
    if (typeof data?.id === 'string') {
      workflows.push({
        id: data.id,
        path: file,
        description: typeof data.description === 'string' ? data.description : undefined,
        trigger: data.trigger ? { commands: Array.isArray(data.trigger.commands) ? data.trigger.commands : undefined } : undefined,
      });
    }
  }
  return workflows;
}

export interface PhaseMapping {
  phaseId: string;
  workflowPath: string;
}

export async function resolvePhaseWorkflow(workflowsRoot: string, phaseId: string): Promise<PhaseMapping | null> {
  const strategies = ['tasklifecycle-long', 'tasklifecycle-short'];

  for (const strategy of strategies) {
    try {
      const indexPath = path.join(workflowsRoot, strategy, 'index.md');
      const raw = await fs.readFile(indexPath, 'utf-8');
      const { data } = matter(raw);
      const phases = extractPhases(data, strategy) ?? extractPhases(extractYamlBlock(raw), strategy);

      if (phases && typeof phases === 'object') {
        for (const phaseKey of Object.keys(phases)) {
          const phase = phases[phaseKey];
          if (phase?.id === phaseId && typeof phase.workflow === 'string') {
            const workflowPath = resolveWorkflowPath(workflowsRoot, phase.workflow);
            return {
              phaseId,
              workflowPath
            };
          }
        }
      }
    } catch (error) {
      // Index for strategy might not exist or be unreadable, skip
      continue;
    }
  }
  return null;
}

function extractPhases(source: unknown, strategy: string): Record<string, any> | null {
  if (!source || typeof source !== 'object') {
    return null;
  }
  const aliases = (source as Record<string, any>).aliases;
  const phases = aliases?.[strategy]?.phases;
  return phases && typeof phases === 'object' ? phases : null;
}

function extractYamlBlock(markdown: string): unknown {
  const match = markdown.match(/```yaml\n([\s\S]*?)```/);
  if (!match) {
    return null;
  }
  return matter(`---\n${match[1]}\n---`).data;
}

function resolveWorkflowPath(workflowsRoot: string, workflow: string): string {
  if (path.isAbsolute(workflow)) {
    return workflow;
  }
  if (workflow.startsWith('.agent/workflows/')) {
    return path.join(workflowsRoot, workflow.replace(/^\.agent\/workflows\//, ''));
  }
  if (workflow.startsWith('.agent/')) {
    return path.join(workflowsRoot, workflow.replace(/^\.agent\//, ''));
  }
  return path.join(workflowsRoot, workflow);
}
