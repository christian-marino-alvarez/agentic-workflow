/**
 * Utility functions for SDK Custom Adapters
 */

/**
 * Extracts a plain string prompt from the @openai/agents-core ModelRequest input.
 * The input can be a string, an array of user inputs, or an array of messages.
 */
export function extractPromptText(input: any): string {
  if (typeof input === 'string') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(parseInputItem).join('\n');
  }

  return JSON.stringify(input);
}

function parseInputItem(i: any): string {
  if (i.type === 'input_text') {
    return i.text;
  }
  if (i.type === 'message' && typeof i.content === 'string') {
    return i.content;
  }
  if (i.type === 'message' && Array.isArray(i.content)) {
    return i.content.map((c: any) => c.text || JSON.stringify(c)).join('\n');
  }
  return JSON.stringify(i);
}
