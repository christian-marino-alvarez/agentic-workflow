import { commands, type ExtensionContext, window } from 'vscode';
import type { AgentPocDomain, AgentPocModule } from './types.js';
import { runAgentPoc } from './agent.js';

export function createAgentPocDomain(context: ExtensionContext): AgentPocDomain {
  const outputChannel = window.createOutputChannel('Agent POC');

  const disposable = commands.registerCommand('agentic-workflow.runPoc', () => {
    return runAgentPoc(context, outputChannel);
  });

  context.subscriptions.push(outputChannel, disposable);
  return {};
}

export const AgentPoc: AgentPocModule = {
  register: createAgentPocDomain
};

export type { AgentPocModule, AgentPocDomain } from './types.js';
