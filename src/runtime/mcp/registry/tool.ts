import { Logger } from '../../engine/logger.js';
import type { ServerResult } from '@modelcontextprotocol/sdk/types.js';
import type { McpToolDefinition } from '../schemas/common.js';

export function defineTool(definition: McpToolDefinition): McpToolDefinition {
  return definition;
}

export function wrapHandler<TParams>(name: string, handler: (params: TParams) => Promise<unknown> | unknown) {
  return async (params: TParams): Promise<ServerResult> => {
    Logger.info('MCPv2', formatMessage(name, 'inicio'), { params: summarizeParams(params) });
    try {
      const result = await handler(params);
      Logger.info('MCPv2', formatMessage(name, 'ok'));
      return normalizeResult(result);
    } catch (error) {
      Logger.error('MCPv2', formatMessage(name, 'error'), { error: formatError(error) });
      throw error;
    }
  };
}

function summarizeParams(params: unknown): Record<string, unknown> | null {
  if (!params || typeof params !== 'object') {
    return null;
  }
  const entries = Object.entries(params as Record<string, unknown>);
  return Object.fromEntries(
    entries.map(([key, value]) => [key, summarizeValue(value)])
  );
}

function summarizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.length > 120 ? `${value.slice(0, 117)}...` : value;
  }
  if (Array.isArray(value)) {
    return `array(${value.length})`;
  }
  if (value && typeof value === 'object') {
    return `object(${Object.keys(value as Record<string, unknown>).length})`;
  }
  return value;
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function formatMessage(name: string, state: 'inicio' | 'ok' | 'error'): string {
  const [domain, action] = splitDomainAction(name);
  return `MCPv2 | ${domain} | ${action} | ${state}`;
}

function splitDomainAction(name: string): [string, string] {
  const parts = name.split('.');
  if (parts.length === 1) {
    return ['general', parts[0]];
  }
  return [parts[0], parts.slice(1).join('.')];
}

function normalizeResult(result: unknown): ServerResult {
  return result as ServerResult;
}
