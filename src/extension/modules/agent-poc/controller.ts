import * as vscode from 'vscode';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';

export class PocController {
  private outputChannel: vscode.OutputChannel;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel("Agentic POC");
  }

  public async runPoc(): Promise<void> {
    this.outputChannel.show();
    this.log("Starting Agentic POC execution...");

    let apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.log("OPENAI_API_KEY not found in process.env. Requesting from user...");
      apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your OpenAI API Key for the POC',
        ignoreFocusOut: true,
        password: true
      });
    }

    if (!apiKey) {
      this.log("ERROR: API Key not provided.");
      vscode.window.showErrorMessage("OpenAI API Key is required to run the POC.");
      return;
    }

    try {
      this.log("Initializing Agent...");

      // Define sample tool
      const getTimeTool = tool({
        name: 'get_time',
        description: 'Get the current time',
        parameters: z.object({}),
        execute: async () => {
          const time = new Date().toISOString();
          this.log(`[Tool] get_time executed: ${time}`);
          return time;
        },
      });

      // Create Agent
      const agent = new Agent({
        name: 'PocAgent',
        model: 'gpt-4o-mini',
        instructions: 'You are a helpful assistant living inside VS Code. Answer the user request and use tools if needed.',
        tools: [getTimeTool],
      });

      // Manually inject API key since we're using raw Agent/run
      // The SDK might look for process.env automatically, but if we provide it manually?
      // Wait, Agent constructor doesn't take apiKey. It's usually in process.env.
      // But if we just set process.env locally for this execution context?
      process.env.OPENAI_API_KEY = apiKey;

      this.log("Agent initialized. Running prompt: 'What time is it?'");

      // Run Agent with streaming
      const result = await run(agent, 'What time is it?', { stream: true });

      // Handle streaming events
      for await (const event of result) {
        const eventType = (event as any).type;

        // Log raw event type for debug
        // this.log(`[Event] ${eventType}`);

        if (eventType === 'run_item_stream_event') {
          const item = (event as any).item;
          if (item && item.type === 'message' && item.role === 'assistant') {
            if (typeof item.content === 'string') {
              this.log(`[Assistant]: ${item.content}`);
            } else if (Array.isArray(item.content)) {
              item.content.forEach((c: any) => {
                if (c.type === 'text') {
                  this.log(`[Assistant]: ${c.text}`);
                }
              });
            }
          } else if (item && item.type === 'function_call') {
            this.log(`[Tool Call]: ${item.name}(${item.arguments})`);
          } else if (item && item.type === 'function_call_result') {
            this.log(`[Tool Result]: ${item.output}`);
          }
        }

        // Also try to capture raw deltas if available for smoother streaming
        if (eventType === 'raw_model_stream_event') {
          const delta = (event as any).data?.choices?.[0]?.delta?.content;
          if (delta) {
            // this.outputChannel.append(delta); // Optional: stream characters directly
          }
        }
      }

      this.log("Execution finished.");

    } catch (error: any) {
      this.log(`ERROR: ${error.message}`);
      console.error(error);
    }
  }

  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.outputChannel.appendLine(`[${timestamp}] ${message}`);
  }
}
