import { z } from 'zod';

export interface RoleModelBinding {
  [role: string]: string; // role -> modelId
}

export interface AgentRequest {
  role: string;
  input: string;
  context?: Record<string, any>;
  binding: RoleModelBinding;
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
