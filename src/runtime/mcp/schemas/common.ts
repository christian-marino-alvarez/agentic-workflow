export type ToolInputSchema = {
  type: 'object';
  properties?: Record<string, object>;
  required?: string[];
  [key: string]: unknown;
};

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
}
