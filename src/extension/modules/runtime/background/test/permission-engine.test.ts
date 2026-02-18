
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PermissionEngine } from '../permission-engine.js';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Mock vscode
vi.mock('vscode', () => ({
  workspace: {
    workspaceFolders: [{ uri: { fsPath: '/mock/workspace' } }]
  }
}));

// Mock fs
vi.mock('fs', async () => {
  return {
    ...(await vi.importActual<typeof fs>('fs')),
    existsSync: vi.fn(),
    promises: {
      readFile: vi.fn()
    }
  };
});

describe('PermissionEngine', () => {
  let permissionEngine: PermissionEngine;

  beforeEach(() => {
    permissionEngine = new PermissionEngine();
    vi.clearAllMocks();
  });

  it('should deny permission if role definition is not found', async () => {
    // Mock file not found
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const result = await permissionEngine.checkPermission('unknown-role', 'fs.read');
    expect(result).toBe(false);
  });

  it('should allow architect role by default (Super User fallback)', async () => {
    // Even if file load fails, we currently allow architect/backend in code
    // But ideally we should mock the file load to be robust
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.promises.readFile).mockResolvedValue(`
---
role: architect-agent
capabilities:
  tools:
    filesystem: [read, write]
---
`);

    const result = await permissionEngine.checkPermission('architect', 'fs.read');
    expect(result).toBe(true);
  });

  it('should deny action if skill is missing', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    // Mock role without filesystem
    vi.mocked(fs.promises.readFile).mockResolvedValue(`
---
role: limited-agent
capabilities:
  tools:
    terminal: [run]
---
`);

    const result = await permissionEngine.checkPermission('limited-agent', 'fs.read');
    expect(result).toBe(false);
  });
});
