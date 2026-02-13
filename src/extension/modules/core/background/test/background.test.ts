import { suite, test, expect, vi, beforeEach } from 'vitest';
import { Background } from '../index.js';
import * as vscode from 'vscode';
import { spawn } from 'child_process';

// Mock dependencies
vi.mock('vscode');
vi.mock('child_process');
vi.mock('../messaging/background.js');

class TestBackground extends Background {
  constructor() {
    super('test', vscode.Uri.file('/tmp'), 'test-view');
  }

  getHtmlForWebview() { return ''; }

  public triggerSpawn(path: string) {
    this.spawnSidecar(path);
  }
}

suite('Core Background', () => {
  let background: TestBackground;

  beforeEach(() => {
    vi.clearAllMocks();
    background = new TestBackground();
  });

  test('spawnSidecar should start a child process', () => {
    const mockSpawn = vi.mocked(spawn);
    mockSpawn.mockReturnValue({
      stdout: { on: vi.fn() },
      stderr: { on: vi.fn() },
      on: vi.fn(),
      kill: vi.fn()
    } as any);

    background.triggerSpawn('/path/to/server.js');

    expect(mockSpawn).toHaveBeenCalledWith('node', ['/path/to/server.js'], expect.objectContaining({
      env: expect.objectContaining({ PORT: '3000' })
    }));
  });
});
