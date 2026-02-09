import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { listAliasResources, readAliasResource, listDomainAliases } from '../../resources.js';

async function createWorkspace(): Promise<string> {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-mcp-'));
  await fs.mkdir(path.join(base, '.agent'), { recursive: true });
  await fs.writeFile(
    path.join(base, '.agent', 'index.md'),
    [
      '---',
      'id: agent.index',
      '---',
      '',
      '```yaml',
      'agent:',
      '  domains:',
      '    rules:',
      '      index: .agent/rules/index.md',
      '```',
      ''
    ].join('\n')
  );
  await fs.mkdir(path.join(base, '.agent', 'rules'), { recursive: true });
  await fs.writeFile(
    path.join(base, '.agent', 'rules', 'index.md'),
    [
      '---',
      'id: rules.index',
      '---',
      '',
      '```yaml',
      'rules:',
      '  constitution:',
      '    index: .agent/rules/constitution/index.md',
      '```',
      ''
    ].join('\n')
  );
  return base;
}

describe('mcp resources', () => {
  let workspace: string;
  let originalCwd: string;
  let originalWorkspaceEnv: string | undefined;

  beforeEach(async () => {
    originalCwd = process.cwd();
    originalWorkspaceEnv = process.env.AGENTIC_WORKSPACE;
    workspace = await createWorkspace();
    process.chdir(workspace);
    process.env.AGENTIC_WORKSPACE = workspace;
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (originalWorkspaceEnv === undefined) {
      delete process.env.AGENTIC_WORKSPACE;
    } else {
      process.env.AGENTIC_WORKSPACE = originalWorkspaceEnv;
    }
  });

  it('lists alias resources including domains', async () => {
    const resources = await listAliasResources();
    expect(resources.some((resource) => resource.uri === 'agentic://aliases/root')).toBe(true);
    expect(resources.some((resource) => resource.uri === 'agentic://aliases/rules')).toBe(true);
  });

  it('lists domain resources without index path', async () => {
    const rootIndex = path.join(workspace, '.agent', 'index.md');
    await fs.writeFile(
      rootIndex,
      [
        '---',
        'id: agent.index',
        '---',
        '',
        '```yaml',
        'agent:',
        '  domains:',
        '    custom: {}',
        '```',
        ''
      ].join('\n')
    );
    const resources = await listAliasResources();
    const custom = resources.find((resource) => resource.uri === 'agentic://aliases/custom');
    expect(custom?.description).toContain('domain custom');
  });

  it('handles root index without agent domains', async () => {
    const rootIndex = path.join(workspace, '.agent', 'index.md');
    await fs.writeFile(
      rootIndex,
      [
        '---',
        'id: agent.index',
        '---',
        '',
        '```yaml',
        'other: value',
        '```',
        ''
      ].join('\n')
    );
    const resources = await listAliasResources();
    expect(resources.length).toBe(1);
    expect(resources[0].uri).toBe('agentic://aliases/root');
  });

  it('reads root alias resource', async () => {
    const result = await readAliasResource('agentic://aliases/root');
    expect(result.text).toContain('agent');
  });

  it('reads domain alias resource', async () => {
    const result = await readAliasResource('agentic://aliases/rules');
    expect(result.text).toContain('constitution');
  });

  it('throws on unknown domain', async () => {
    await expect(readAliasResource('agentic://aliases/unknown')).rejects.toThrow('Dominio no encontrado');
  });

  it('listDomainAliases returns alias map', async () => {
    const result = await listDomainAliases('rules');
    expect(result).toHaveProperty('rules');
  });

  it('throws on unknown resource scheme', async () => {
    await expect(readAliasResource('agentic://resource/unknown')).rejects.toThrow('Resource desconocido');
  });

  it('throws when domain alias has no index', async () => {
    const rootIndex = path.join(workspace, '.agent', 'index.md');
    await fs.writeFile(
      rootIndex,
      [
        '---',
        'id: agent.index',
        '---',
        '',
        '```yaml',
        'agent:',
        '  domains:',
        '    empty:',
        '      index:',
        '```',
        ''
      ].join('\n')
    );
    await expect(readAliasResource('agentic://aliases/empty')).rejects.toThrow('Dominio no encontrado');
  });

  it('returns empty aliases when index has no yaml block', async () => {
    const rootIndex = path.join(workspace, '.agent', 'index.md');
    await fs.writeFile(
      rootIndex,
      [
        '---',
        'id: agent.index',
        '---',
        '',
        '```yaml',
        'agent:',
        '  domains:',
        '    empty:',
        '      index: .agent/empty/index.md',
        '```',
        ''
      ].join('\n')
    );
    await fs.mkdir(path.join(workspace, '.agent', 'empty'), { recursive: true });
    await fs.writeFile(path.join(workspace, '.agent', 'empty', 'index.md'), '# no yaml block\\n');

    const result = await listDomainAliases('empty');
    expect(result).toEqual({});
  });

  it('throws when listDomainAliases cannot find domain', async () => {
    await expect(listDomainAliases('missing')).rejects.toThrow('Dominio no encontrado');
  });
});
