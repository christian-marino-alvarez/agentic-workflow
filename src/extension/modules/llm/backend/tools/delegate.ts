import { tool } from '@openai/agents';
import { z } from 'zod';
import { LLMFactory } from '../factory.js';
import { Runner } from '@openai/agents';
import { agentTools } from './index.js';
import * as fs from 'fs/promises';
import * as path from 'path';

const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd();
const MAX_OUTPUT_CHARS = 8000;

/**
 * Load the full role markdown content for a given agent.
 * Returns undefined if no role file exists.
 */
async function loadRoleInstructions(roleName: string): Promise<string | undefined> {
  try {
    const rolePath = path.join(workspaceRoot, '.agent', 'rules', 'roles', `${roleName}.md`);
    return await fs.readFile(rolePath, 'utf-8');
  } catch {
    return undefined;
  }
}

/**
 * Load role capabilities from the frontmatter of the role file.
 * Returns a capabilities object or empty object.
 */
async function loadRoleCapabilities(roleName: string): Promise<Record<string, any>> {
  try {
    const content = await loadRoleInstructions(roleName);
    if (!content) { return {}; }

    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/m);
    if (!fmMatch) { return {}; }

    const yaml = fmMatch[1];
    const capMatch = yaml.match(/^capabilities:\s*\n((?:\s+.+\n?)*)/m);
    if (!capMatch) { return {}; }

    const capBlock = capMatch[1];
    const capabilities: Record<string, any> = {};

    for (const line of capBlock.split('\n')) {
      const kv = line.trim().match(/^(\w+):\s*(.+)$/);
      if (kv) {
        const val = kv[2].trim();
        capabilities[kv[1]] = val === 'true' ? true : val === 'false' ? false : val;
      }
    }

    return capabilities;
  } catch {
    return {};
  }
}

/**
 * Creates the delegateTask tool.
 * This tool is ONLY given to the architect-agent.
 * It invokes a sub-agent with the target agent's persona and capabilities.
 */
export function createDelegateTaskTool(factory: LLMFactory, apiKey?: string, provider?: string, binding?: Record<string, string>) {
  return tool({
    name: 'delegateTask',
    description: `Delegate a sub-task to a specialized agent. Use this when a task requires expertise from another agent (qa, backend, view, researcher, etc.). The sub-agent will execute the task using its own persona, model, and capabilities, then return a report. IMPORTANT: This requires developer confirmation before execution.`,
    parameters: z.object({
      agent: z.string().describe('Name of the target agent to delegate to (e.g. "qa", "researcher", "backend", "view")'),
      task: z.string().describe('Detailed description of the sub-task for the agent to execute'),
      customInstructions: z.string().optional().describe('Optional: custom instructions for a temporary/virtual agent (used when no existing agent fits)')
    }),
    execute: async (input) => {
      const startTime = Date.now();
      const targetAgent = input.agent;
      const taskDescription = input.task;

      console.log(`[delegateTask] Delegation requested: agent="${targetAgent}", task="${taskDescription.substring(0, 80)}..."`);

      // 1. Load role instructions (or use custom instructions for temporary agents)
      let instructions = input.customInstructions;
      if (!instructions) {
        instructions = await loadRoleInstructions(targetAgent);
        if (!instructions) {
          return `[DELEGATION FAILED] No se encontró archivo de rol para el agente "${targetAgent}". Opciones: (1) usar un agente existente, (2) proporcionar customInstructions para crear un agente temporal.`;
        }
      }

      // 2. Validate capabilities
      const capabilities = await loadRoleCapabilities(targetAgent);
      console.log(`[delegateTask] Agent "${targetAgent}" capabilities:`, JSON.stringify(capabilities));

      // Check if agent has tooling capability
      const canUseTool = capabilities.tooling !== false;
      if (!canUseTool) {
        return `[DELEGATION LIMITED] El agente "${targetAgent}" no tiene capability "tooling" habilitada. Solo puede generar respuestas textuales, no ejecutar tools. Resultado basado solo en instrucciones.`;
      }

      // 3. Determine model for the sub-agent
      const modelId = binding?.[targetAgent] || binding?.['architect'] || 'gemini-2.5-pro';

      // 4. Create sub-agent WITHOUT delegateTask tool (prevents recursion - AC-8)
      const subAgentTools = agentTools.filter((t: any) => t.name !== 'delegateTask');

      try {
        const agent = await factory.createAgent(
          targetAgent,
          { [targetAgent]: modelId },
          subAgentTools,
          apiKey,
          provider,
          instructions
        );

        console.log(`[delegateTask] Sub-agent "${targetAgent}" created, executing task...`);

        // 5. Build the delegation prompt with context
        const delegationPrompt = [
          `[DELEGATED TASK from architect-agent]`,
          `You have been delegated the following task. Analyze it carefully.`,
          `If you have doubts or need clarification, clearly state your questions — the developer will see your response.`,
          `Provide a structured analysis with your findings, recommendations, and any open questions.`,
          ``,
          `TASK:`,
          taskDescription,
        ].join('\n');

        // 6. Execute the sub-agent with streaming to capture tool activity
        const runner = new Runner({ tracingDisabled: true });
        const streamResult = await runner.run(agent, delegationPrompt, { stream: true });

        // 7. Collect tool activity and final output
        const toolActivity: Array<{ name: string, type: string, detail?: string }> = [];
        let finalOutput = '';

        for await (const chunk of streamResult as AsyncIterable<any>) {
          if (chunk.type === 'run_item_stream_event') {
            const item = chunk.item as any;
            if (item.type === 'tool_call_item') {
              const toolName = item.name || item.rawItem?.name || 'unknown';
              const args = item.rawItem?.arguments || '';
              toolActivity.push({ name: toolName, type: 'call', detail: args });
              console.log(`[delegateTask] ${targetAgent} → tool: ${toolName}`);
            } else if (item.type === 'tool_call_output_item') {
              const toolName = item.rawItem?.name || 'unknown';
              toolActivity.push({ name: toolName, type: 'result' });
            }
          }
        }

        // Get final output from the completed result
        const completedResult = streamResult as any;
        finalOutput = completedResult.finalOutput
          ? (typeof completedResult.finalOutput === 'string' ? completedResult.finalOutput : JSON.stringify(completedResult.finalOutput))
          : '(sin output)';

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        // 8. Truncate if too long
        const truncatedOutput = finalOutput.length > MAX_OUTPUT_CHARS
          ? finalOutput.substring(0, MAX_OUTPUT_CHARS) + `\n\n... (truncado, ${finalOutput.length} chars total)`
          : finalOutput;

        // 9. Build activity log
        const activityLog = toolActivity.length > 0
          ? toolActivity
            .filter(a => a.type === 'call')
            .map(a => {
              const shortArgs = a.detail ? (() => { try { const p = JSON.parse(a.detail); return p.path || p.command || p.query || ''; } catch { return ''; } })() : '';
              return `- ⚡ \`${a.name}\`${shortArgs ? ` → ${shortArgs}` : ''}`;
            })
            .join('\n')
          : '- (sin actividad de tools)';

        // 10. Build delegation report
        const lastResponse = completedResult.rawResponses?.[completedResult.rawResponses.length - 1];
        const tokens = {
          input: lastResponse?.usage?.inputTokens || 0,
          output: lastResponse?.usage?.outputTokens || 0
        };

        const report = [
          `## 📋 Informe de Delegación — ${targetAgent}`,
          `**Tarea**: ${taskDescription}`,
          `**Duración**: ${elapsed}s | **Tokens**: ${tokens.input} in / ${tokens.output} out`,
          ``,
          `### 🔧 Actividad`,
          activityLog,
          ``,
          `### Resultado`,
          truncatedOutput
        ].join('\n');

        console.log(`[delegateTask] Sub-agent "${targetAgent}" completed in ${elapsed}s (${toolActivity.length} tool events, ${tokens.input}+${tokens.output} tokens)`);

        return report;
      } catch (error: any) {
        const errorMsg = error.message || 'Error desconocido';
        console.error(`[delegateTask] Sub-agent "${targetAgent}" failed:`, errorMsg);

        return `[DELEGATION ERROR] El agente "${targetAgent}" falló: ${errorMsg}. Alternativas: (1) intentar con otro agente, (2) crear un agente temporal con customInstructions.`;
      }
    }
  });
}
