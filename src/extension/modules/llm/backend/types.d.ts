import { z } from 'zod';
import { FastifyRequest } from 'fastify';
import type { Tool } from '@openai/agents';

export interface RoleModelBinding {
  [role: string]: string; // role -> modelId
}

export interface AgentRequest {
  role: string;
  input: string;
  context?: Record<string, any>;
  binding: RoleModelBinding;
  apiKey?: string;
  provider?: string;
  instructions?: string;
}

export interface AgentResponse {
  output: string;
  stats?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export type ToolDefinition = Tool<any>;

export interface RunRequest extends FastifyRequest<{ Body: AgentRequest }> { }
