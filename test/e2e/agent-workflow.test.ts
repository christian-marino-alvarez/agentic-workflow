import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkflowRuntimeService } from '../../src/extension/modules/chat/backend/agents/runtime.js';
import { AgentRegistryService } from '../../src/extension/modules/chat/backend/agents/registry.js';
import { FileSystemPersistence } from '../../src/extension/modules/chat/backend/agents/persistence.js';
import { Agent, tool, handoff, run } from '@openai/agents';
import path from 'path';
import fs from 'fs/promises';

vi.mock('@openai/agents', async () => {
  const actual = await vi.importActual('@openai/agents') as any;
  return {
    ...actual,
    run: vi.fn(),
    RunState: {
      fromString: vi.fn(),
    },
  };
});

describe('Agent Workflow E2E', () => {
  let runtime: WorkflowRuntimeService;
  let registry: AgentRegistryService;
  let persistence: FileSystemPersistence;
  const sessionDir = path.resolve(process.cwd(), '.agent/test-sessions-e2e');

  beforeEach(async () => {
    if (await fs.stat(sessionDir).catch(() => false)) {
      await fs.rm(sessionDir, { recursive: true });
    }
    await fs.mkdir(sessionDir, { recursive: true });

    persistence = new FileSystemPersistence(sessionDir);
    registry = new AgentRegistryService();
    runtime = new WorkflowRuntimeService(registry, persistence);
  });

  it('should complete a multi-agent flow with handoff and HIL interruption', async () => {
    // 1. Setup Agents
    const sensitiveTool = tool({
      name: 'sensitive_tool',
      description: 'A tool that requires approval',
      parameters: { type: 'object', properties: { data: { type: 'string' } } } as any,
      execute: (async ({ data }: any) => `Processed: ${data}`) as any,
      needsApproval: (async () => true) as any
    });

    const agentB = new Agent({
      name: 'AgentB',
      instructions: 'You use the sensitive_tool to process data.',
      tools: [sensitiveTool]
    });

    const agentA = new Agent({
      name: 'AgentA',
      instructions: 'You hand off the task to AgentB.',
      handoffs: [agentB]
    });

    registry.registerAgent('role.agent-a', agentA);
    registry.registerAgent('role.agent-b', agentB);
    registry.registerAgent('role.architect-agent', agentA); // Base for HIL re-hydration

    const sessionId = 'e2e-session-1';

    // 2. Initial Message -> Should trigger handoff and then interruption at Agent B
    // We mock the SDK 'run' behavior for this test to avoid real LLM calls 
    // while still testing our runtime logic

    // This is a bit tricky since we want to test the Runtime's coordination 
    // including its dependency on the SDK.

    // Let's mock 'run' to simulate the sequence
    // Turn 1: Hand-off to B + B calls sensitive_tool -> Interruption

    const { run: originalRun, RunState } = await import('@openai/agents');
    const runMock = vi.mocked(originalRun);
    const fromStringMock = vi.mocked(RunState.fromString);

    // Initial state mock for processMessage
    const mockState = {
      currentAgent: agentB,
      getInterruptions: () => [{ rawItem: { callId: 'call_1', name: 'sensitive_tool' } }],
      toString: () => JSON.stringify({ state: 'interrupted' }),
      approve: vi.fn(),
      reject: vi.fn()
    };

    // First run: Agent A hands off to B, and B stops at sensitive_tool
    runMock.mockResolvedValueOnce({
      state: mockState as any
    } as any);

    const result1 = await runtime.processMessage(sessionId, 'Execute task', 'role.agent-a');

    expect(result1.state.getInterruptions()).toHaveLength(1);
    expect(await persistence.loadSession(sessionId)).toBeDefined();

    // 3. User Approves via API

    // Mock fromString for handleDecision (used by approve/reject)
    fromStringMock.mockResolvedValue(mockState as any);

    // Second run (after approve): Agent B finishes
    runMock.mockResolvedValueOnce({
      state: {
        currentAgent: agentB,
        getInterruptions: () => [],
        toString: () => JSON.stringify({ state: 'completed' })
      } as any
    } as any);

    const result2 = await runtime.approve(sessionId, 'call_1');

    expect(result2.state.getInterruptions()).toHaveLength(0);
    expect(mockState.approve).toHaveBeenCalled();
  });
});
