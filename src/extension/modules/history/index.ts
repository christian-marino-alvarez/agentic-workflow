import type { ExtensionContext } from 'vscode';
import { Controller } from './background/index.js';
import type { HistoryDomain, HistoryModule } from './types.d.ts';

export function createHistoryDomain(context: ExtensionContext): HistoryDomain {
  const view = new Controller(context);
  return { view };
}

export const History: HistoryModule = {
  register: createHistoryDomain
};

export { Controller } from './background/index.js';
export type { HistoryDomain, TemplateParams } from './types.d.ts';
