export const AGENT_ROOT = '.agent';

export interface AgentPathResolver {
    resolveRule(alias: string): string;
    resolveWorkflow(alias: string): string;
    resolveTemplate(alias: string): string;
}
