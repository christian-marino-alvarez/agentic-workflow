import { suite, test, expect, beforeEach, afterEach } from 'vitest';
import { AbstractBackend } from '../abstract-server.js';
import fastify from 'fastify';

// Mock Implementation for testing
class TestBackend extends AbstractBackend {
  constructor() {
    super('test-module');
  }

  protected async handleCommand(command: string, data: any): Promise<any> {
    if (command === 'fail') {
      throw new Error('Command Failed');
    }
    return { executed: true, command, data };
  }
}

suite('AbstractBackend', () => {
  let backend: TestBackend;

  beforeEach(async () => {
    backend = new TestBackend();
    // Bypass protected property for testing
    (backend as any).port = 0;
    await backend.start();
    // Get assigned port
    const address = (backend as any).server.server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    (backend as any).port = port;
  });

  afterEach(async () => {
    await backend.stop();
  });

  test('should health check return status ok', async () => {
    const port = (backend as any).port;
    const response = await fetch(`http://127.0.0.1:${port}/health`);
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('module', 'test-module');
  });

  test('should handle valid commands', async () => {
    const port = (backend as any).port;
    const response = await fetch(`http://127.0.0.1:${port}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'test', data: { foo: 'bar' } })
    });

    const result = await response.json();

    expect(response.ok).toBe(true);
    expect(result).toEqual({
      success: true,
      result: { executed: true, command: 'test', data: { foo: 'bar' } }
    });
  });

  test('should handle command errors gracefully', async () => {
    const port = (backend as any).port;
    const response = await fetch(`http://127.0.0.1:${port}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'fail', data: {} })
    });

    const result = await response.json();

    expect(response.ok).toBe(true); // HTTP 200, application error handled in body
    expect(result).toEqual({
      success: false,
      error: 'Command Failed'
    });
  });
});
