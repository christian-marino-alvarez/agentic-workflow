import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { resolveWorkspaceRoot } from '../runtime/task-resolver.js';

type AliasMap = Record<string, unknown>;

type RootAliases = {
  agent?: {
    domains?: Record<string, { index?: string }>;
  };
};

type ResourceDescriptor = {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
};

export async function listAliasResources(): Promise<ResourceDescriptor[]> {
  const { aliases } = await loadRootAliases();
  const resources: ResourceDescriptor[] = [
    {
      uri: 'agentic://aliases/root',
      name: 'aliases.root',
      description: 'Aliases from .agent/index.md',
      mimeType: 'application/json'
    }
  ];

  const domains = aliases.agent?.domains ?? {};
  for (const [domain, info] of Object.entries(domains)) {
    resources.push({
      uri: `agentic://aliases/${domain}`,
      name: `aliases.${domain}`,
      description: info.index ? `Aliases from ${info.index}` : `Aliases for domain ${domain}`,
      mimeType: 'application/json'
    });
  }

  return resources;
}

export async function readAliasResource(uri: string): Promise<{ uri: string; mimeType: string; text: string }> {
  const { aliases } = await loadRootAliases();

  if (uri === 'agentic://aliases/root') {
    return { uri, mimeType: 'application/json', text: JSON.stringify(aliases, null, 2) };
  }

  if (uri.startsWith('agentic://aliases/')) {
    const domain = uri.replace('agentic://aliases/', '');
    const indexPath = aliases.agent?.domains?.[domain]?.index;
    if (!indexPath) {
      throw new Error(`Dominio no encontrado: ${domain}`);
    }
    const domainAliases = await loadAliasesFromIndex(resolveWorkspacePath(indexPath));
    return { uri, mimeType: 'application/json', text: JSON.stringify(domainAliases, null, 2) };
  }

  throw new Error(`Resource desconocido: ${uri}`);
}

export async function listDomainAliases(domain: string): Promise<AliasMap> {
  const { aliases } = await loadRootAliases();
  const indexPath = aliases.agent?.domains?.[domain]?.index;
  if (!indexPath) {
    throw new Error(`Dominio no encontrado: ${domain}`);
  }
  return loadAliasesFromIndex(resolveWorkspacePath(indexPath));
}

async function loadRootAliases(): Promise<{ aliases: RootAliases }> {
  const rootIndexPath = resolveWorkspacePath('.agent/index.md');
  const aliases = await loadAliasesFromIndex(rootIndexPath);
  return { aliases: aliases as RootAliases };
}

async function loadAliasesFromIndex(indexPath: string): Promise<AliasMap> {
  const raw = await fs.readFile(indexPath, 'utf-8');
  const match = raw.match(/```yaml\n([\s\S]*?)```/);
  if (!match) {
    return {};
  }
  const yaml = match[1];
  const data = matter(`---\n${yaml}\n---`).data as AliasMap;
  return data;
}

function resolveWorkspacePath(relativePath: string): string {
  const root = resolveWorkspaceRoot(process.env.AGENTIC_WORKSPACE);
  return path.resolve(root, relativePath);
}
