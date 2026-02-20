import { z } from 'zod';
import { FastifyRequest } from 'fastify';

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

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodSchema;
  execute: (args: any) => Promise<any>;
}

export interface RunRequest extends FastifyRequest<{ Body: AgentRequest }> { }
