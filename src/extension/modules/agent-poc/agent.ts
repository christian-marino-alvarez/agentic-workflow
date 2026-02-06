import { z } from 'zod';
import { Agent, Runner, tool } from '@openai/agents';
import { OpenAIProvider } from '@openai/agents-openai';
import * as vscode from 'vscode';
import { OPENAI_KEY_SECRET, LLM_PROVIDER_SECRET } from '../setup/constants.js';

export async function runAgentPoc(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
  try {
    const apiKey = await context.secrets.get(OPENAI_KEY_SECRET);

    if (!apiKey) {
      void vscode.window.showErrorMessage(`OpenAI API Key not found. Please configure it in the Setup view.`);
      return;
    }

    outputChannel.show(true);
    outputChannel.appendLine(`[AgentPOC] Starting execution (Provider: openai)...`);

    const timeTool = tool({
      name: 'get_current_time',
      description: 'Returns the current local time.',
      parameters: z.object({}),
      execute: async () => {
        const now = new Date().toLocaleString();
        outputChannel.appendLine(`[Tool] get_current_time called: ${now}`);
        return now;
      }
    });

    const modelName = 'gpt-4o-mini';
    const baseURL = undefined;

    const agent = new Agent({
      name: 'PocAgent',
      instructions: 'You are a technical assistant. Help the user with their queries. You have access to a tool to get the current time.',
      model: modelName,
      tools: [timeTool]
    });

    outputChannel.appendLine(`[AgentPOC] Running agent loop with model: ${modelName}...`);

    const modelProvider = new OpenAIProvider({
      apiKey,
      baseURL
    });
    const runner = new Runner({ modelProvider });
    const streamedResult = await runner.run(agent, 'Hello! What time is it now? Can you also tell me a short joke?', {
      stream: true
    });

    for await (const event of streamedResult) {
      if (event.type === 'raw_model_stream_event') {
        if (event.data.type === 'output_text_delta') {
          outputChannel.append(event.data.delta);
        }
      } else if (event.type === 'run_item_stream_event') {
        if (event.name === 'tool_called') {
          outputChannel.appendLine(`\n[Agent -> Tool] Calling tool...`);
        } else if (event.name === 'tool_output') {
          outputChannel.appendLine(`\n[Agent <- Tool] Result received`);
        }
      }
    }

    outputChannel.appendLine('\n[AgentPOC] Execution finished successfully.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    outputChannel.appendLine(`\n[AgentPOC] ERROR: ${message}`);
    void vscode.window.showErrorMessage(`Agent POC failed: ${message}`);
  }
}
