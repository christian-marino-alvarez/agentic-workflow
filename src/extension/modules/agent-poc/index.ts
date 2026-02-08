import { commands, type ExtensionContext, window } from 'vscode';
import type { AgentPocDomain, AgentPocModule } from './types.js';
import { PocController } from './controller.js';

export function createAgentPocDomain(context: ExtensionContext): AgentPocDomain {
  // Controller manages its own OutputChannel or we can pass one.
  // The new controller creates "Agentic POC" channel internally.
  const controller = new PocController();

  const disposable = commands.registerCommand('agentic-workflow.runPoc', async () => {
    await controller.runPoc();
  });

  context.subscriptions.push(disposable);
  return {};
}

export const AgentPoc: AgentPocModule = {
  register: createAgentPocDomain
};

export type { AgentPocModule, AgentPocDomain } from './types.js';
