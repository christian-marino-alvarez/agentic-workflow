import { describe, it, expect, vi } from 'vitest';
import { handleToolCall } from '../src/mcp/handlers.js';

describe('mcp handlers update_init', () => {
  it('calls runtime.updateInit', async () => {
    const runtime = {
      updateInit: vi.fn().mockResolvedValue({ status: 'ok' })
    } as any;

    const result = await handleToolCall(runtime, 'runtime_update_init', { some: 'arg' });

    expect(runtime.updateInit).toHaveBeenCalledWith({ some: 'arg' });
    if (result.content[0].type === 'text') {
      expect(result.content[0].text).toBe(JSON.stringify({ status: 'ok' }));
    } else {
      throw new Error('Expected text content');
    }
  });
});
