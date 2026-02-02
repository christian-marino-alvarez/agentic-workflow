import type { ExtensionContext } from 'vscode';
import { Controller } from './controller.js';
import type { WorkflowDomain, WorkflowModule } from './types.d.ts';

export function createWorkflowDomain(context: ExtensionContext): WorkflowDomain {
  const view = new Controller(context);
  return { view };
}

export const Workflow: WorkflowModule = {
  register: createWorkflowDomain
};

export { Controller } from './controller.js';
export { default as template } from './templates/index.js';
export type { WorkflowDomain, TemplateParams } from './types.d.ts';
