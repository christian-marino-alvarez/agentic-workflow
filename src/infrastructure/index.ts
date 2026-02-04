export const AGENT_ROOT = '.agent';

export interface AgentPathResolver {
    resolveRule(alias: string): string;
    resolveWorkflow(alias: string): string;
    resolveTemplate(alias: string): string;
}

export * from './logger/index.js';
export * from './mapping/index.js';
export * from './context/index.js';
export * from './utils/index.js';
export * from './migration/index.js';
