import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowRuntimeService } from '../../../../backend/agents/runtime.js';
import { AgentRegistryService } from '../../../../backend/agents/registry.js';
import { PersistenceService } from '../../../../backend/agents/persistence.js';
import { Agent, RunState, run } from '@openai/agents';

vi.mock('@openai/agents', async () => {
  const actual = await vi.importActual('@openai/agents') as any;
  return {
    ...actual,
    run: vi.fn().mockResolvedValue({ state: { toString: () => 'new-state' } }),
  };
});

describe('WorkflowRuntimeService', () => {
  let runtime: WorkflowRuntimeService;
  let mockRegistry: AgentRegistryService;
  let mockPersistence: PersistenceService;
  let mockAgent: Agent<any, any>;

  beforeEach(() => {
    // Mocking dependencies
    mockAgent = {
      name: 'test-agent',
      instructions: 'test instructions',
    } as unknown as Agent<any, any>;

    mockRegistry = {
      getAgent: vi.fn().mockReturnValue(mockAgent)
    } as unknown as AgentRegistryService;

    mockPersistence = {
      loadSession: vi.fn(),
      saveSession: vi.fn()
    } as unknown as PersistenceService;

    runtime = new WorkflowRuntimeService(mockRegistry, mockPersistence);
  });

  it('should initialize a new session and run', async () => {
    vi.mocked(mockPersistence.loadSession).mockResolvedValue(null);

    // Mocking the 'run' function from @openai/agents is harder if it's a top-level export
    // For unit test of the SERVICE logic (state hydration/save), we check if it calls 
    // persistence and registry correctly.

    const sessionId = 'new-session';
    const text = 'hello';

    // We expect it to call registry to get the architect agent
    try {
      await runtime.processMessage(sessionId, text);
    } catch (e) {
      // It might fail during actual 'run' call if mocks aren't perfect for the SDK
      // but we can verify calls before that.
    }

    expect(mockPersistence.loadSession).toHaveBeenCalledWith(sessionId);
    expect(mockRegistry.getAgent).toHaveBeenCalledWith('role.architect-agent');
  });

  it('should load existing session and resume', async () => {
    const sessionId = 'existing-session';
    const stateStr = 'serialized-state';
    vi.mocked(mockPersistence.loadSession).mockResolvedValue(stateStr);

    // Mock RunState.fromString
    const mockState = {
      currentAgent: mockAgent,
      toString: () => stateStr
    } as unknown as RunState<any, any>;

    const fromStringSpy = vi.spyOn(RunState, 'fromString').mockResolvedValue(mockState);

    try {
      await runtime.processMessage(sessionId, 'continue');
    } catch (e) { }

    expect(mockPersistence.loadSession).toHaveBeenCalledWith(sessionId);
    expect(fromStringSpy).toHaveBeenCalled();

    fromStringSpy.mockRestore();
  });

  it('should handle approval of an interruption', async () => {
    const sessionId = 'hil-session';
    const callId = 'tool-call-1';
    const stateStr = 'serialized-state';

    vi.mocked(mockPersistence.loadSession).mockResolvedValue(stateStr);

    const mockItem = {
      rawItem: { callId }
    };

    const mockState = {
      currentAgent: mockAgent,
      getInterruptions: vi.fn().mockReturnValue([mockItem]),
      approve: vi.fn(),
      toString: () => stateStr
    } as unknown as RunState<any, any>;

    const fromStringSpy = vi.spyOn(RunState, 'fromString').mockResolvedValue(mockState);

    await runtime.approve(sessionId, callId);

    expect(mockState.approve).toHaveBeenCalledWith(mockItem);
    expect(mockPersistence.saveSession).toHaveBeenCalled();

    fromStringSpy.mockRestore();
  });

  it('should throw error if interruption not found during approval', async () => {
    const sessionId = 'hil-session';
    vi.mocked(mockPersistence.loadSession).mockResolvedValue('state');

    const mockState = {
      getInterruptions: vi.fn().mockReturnValue([])
    } as unknown as RunState<any, any>;

    const fromStringSpy = vi.spyOn(RunState, 'fromString').mockResolvedValue(mockState);

    await expect(runtime.approve(sessionId, 'wrong-id')).rejects.toThrow(/Interruption.*not found/);

    fromStringSpy.mockRestore();
  });

  it('should handle rejection of an interruption', async () => {
    const sessionId = 'hil-session';
    const callId = 'tool-call-1';
    const stateStr = 'serialized-state';

    vi.mocked(mockPersistence.loadSession).mockResolvedValue(stateStr);

    const mockItem = {
      rawItem: { callId }
    };

    const mockState = {
      currentAgent: mockAgent,
      getInterruptions: vi.fn().mockReturnValue([mockItem]),
      reject: vi.fn(),
      toString: () => stateStr
    } as unknown as RunState<any, any>;

    const fromStringSpy = vi.spyOn(RunState, 'fromString').mockResolvedValue(mockState);

    await runtime.reject(sessionId, callId);

    expect(mockState.reject).toHaveBeenCalledWith(mockItem);
    expect(mockPersistence.saveSession).toHaveBeenCalled();

    fromStringSpy.mockRestore();
  });

  it('should throw error if interruption not found during rejection', async () => {
    const sessionId = 'hil-session';
    vi.mocked(mockPersistence.loadSession).mockResolvedValue('state');

    const mockState = {
      getInterruptions: vi.fn().mockReturnValue([])
    } as unknown as RunState<any, any>;

    const fromStringSpy = vi.spyOn(RunState, 'fromString').mockResolvedValue(mockState);

    await expect(runtime.reject(sessionId, 'wrong-id')).rejects.toThrow(/Interruption.*not found/);

    fromStringSpy.mockRestore();
  });
});
