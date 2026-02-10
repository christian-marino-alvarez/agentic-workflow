import type { ExtensionContext } from 'vscode';
import { Controller } from './background/index.js';
import type { WorkflowDomain, WorkflowModule } from './types.d.ts';

export function createWorkflowDomain(context: ExtensionContext): WorkflowDomain {
  const view = new Controller(context);
  return { view };
}

export const Workflow: WorkflowModule = {
  register: createWorkflowDomain
};

export { Controller } from './background/index.js';
export type { WorkflowDomain, TemplateParams } from './types.d.ts';
