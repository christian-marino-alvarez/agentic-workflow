import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';
import * as sinon from 'sinon';
import * as path from 'path';
import { SettingsBackground } from '../../background/index.js';

// Mock vscode module
vi.mock('vscode', () => {
  return {
    workspace: {
      workspaceFolders: [{ uri: { fsPath: '/mock/workspace' } }],
      getConfiguration: () => ({
        get: () => [],
        update: () => Promise.resolve()
      }),
      onDidChangeConfiguration: () => ({ dispose: () => { } })
    },
    ExtensionContext: {},
    Uri: { parse: (s: string) => s, file: (s: string) => ({ fsPath: s }) },
    ConfigurationTarget: { Global: 1 }
  };
});

// Mock fs/promises module
const mockReaddir = vi.fn();
const mockAccess = vi.fn();
const mockReadFile = vi.fn();

vi.mock('fs/promises', () => {
  return {
    readdir: (...args: any[]) => mockReaddir(...args),
    access: (...args: any[]) => mockAccess(...args),
    readFile: (...args: any[]) => mockReadFile(...args),
    constants: { F_OK: 0 }
  };
});

import * as vscode from 'vscode'; // Valid after mock

describe('SettingsBackground Role Discovery', () => {
  let background: SettingsBackground;
  let context: any;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    context = {
      extensionUri: { fsPath: '/mock/uri' },
      subscriptions: [],
      secrets: { get: () => Promise.resolve(), store: () => Promise.resolve(), delete: () => Promise.resolve() }
    };

    // Reset mocks
    mockReaddir.mockReset();
    mockAccess.mockReset();
    mockReadFile.mockReset();

    background = new SettingsBackground(context);
  });

  afterEach(() => {
    sandbox.restore();
    vi.restoreAllMocks();
  });

  it('should discover roles from .agent/rules/roles directory', async () => {
    // Setup mocks
    mockAccess.mockResolvedValue(undefined);
    mockReaddir.mockResolvedValue(['architect.md', 'devops.md', 'readme.txt']);

    mockReadFile.mockImplementation((filePath: string) => {
      if (filePath.endsWith('architect.md')) {
        return Promise.resolve(`---
icon: 🏛️
description: Architect role
---
# Architect`);
      }
      if (filePath.endsWith('devops.md')) {
        return Promise.resolve(`---
icon: ⚙️
---
# DevOps`);
      }
      return Promise.resolve('');
    });

    const result = await (background as any).handleGetRoles();

    expect(result.success).to.be.true;
    expect(result.roles).toHaveLength(2);

    const architect = result.roles.find((r: any) => r.name === 'architect');
    expect(architect).toBeDefined();
    expect(architect.icon).toBe('🏛️');
    expect(architect.description).toBe('Architect role');

    const devops = result.roles.find((r: any) => r.name === 'devops');
    expect(devops).toBeDefined();
    expect(devops.icon).toBe('⚙️');
  });

  it('should return empty list if .agent/rules/roles does not exist', async () => {
    mockAccess.mockRejectedValue(new Error('ENOENT'));

    const result = await (background as any).handleGetRoles();

    expect(result.success).to.be.true;
    expect(result.roles).toEqual([]);
  });
});
