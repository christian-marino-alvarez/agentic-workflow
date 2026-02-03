import path from 'node:path';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { collectWorkspaceCandidates, findWorkspaceRoot } from '../adapters/runtimeAdapter.js';

export async function listResources(): Promise<Array<{ uri: string; name: string; title?: string; _meta?: Record<string, unknown> }>> {
  const workspaceRoot = await findWorkspaceRoot(collectWorkspaceCandidates());
  if (!workspaceRoot) {
    throw new Error('No pude listar resources: no se encontró ".agent/" desde el cwd actual.');
  }

  const resourcesRoot = path.join(workspaceRoot, 'src', 'agentic-system-structure');
  const entries = await fs.readdir(resourcesRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.name !== '.' && entry.name !== '..')
    .map((entry) => ({
      uri: `agentic://resource/${entry.name}`,
      name: entry.name,
      title: entry.name,
      _meta: {
        path: path.join('src', 'agentic-system-structure', entry.name),
        absolutePath: path.join(resourcesRoot, entry.name),
        type: entry.isDirectory() ? 'directory' : 'file'
      }
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listTemplateResourceTemplates(): Promise<Array<{ uriTemplate: string; name: string; title?: string; _meta?: Record<string, unknown> }>> {
  const workspaceRoot = await findWorkspaceRoot(collectWorkspaceCandidates());
  if (!workspaceRoot) {
    throw new Error('No pude listar templates: no se encontró ".agent/" desde el cwd actual.');
  }

  const indexPath = path.join(workspaceRoot, '.agent', 'templates', 'index.md');
  const raw = await fs.readFile(indexPath, 'utf-8');
  const match = raw.match(/```yaml\n([\s\S]*?)```/);
  if (!match) {
    throw new Error('No pude listar templates: index.md corrupto o sin bloque YAML.');
  }
  const yaml = match[1];
  const data = matter(`---\n${yaml}\n---`).data as Record<string, any>;
  const templates = data.templates as Record<string, string> | undefined;
  if (!templates || typeof templates !== 'object') {
    throw new Error('No pude listar templates: bloque YAML sin "templates".');
  }

  return Object.entries(templates).map(([alias, templatePath]) => ({
    uriTemplate: `agentic-template://${alias}`,
    name: alias,
    title: alias,
    _meta: {
      path: templatePath,
      absolutePath: path.resolve(workspaceRoot, templatePath)
    }
  }));
}

export async function handleReadResource(uri: string) {
  if (uri.startsWith('agentic://resource/')) {
    const name = uri.replace('agentic://resource/', '');
    const workspaceRoot = await findWorkspaceRoot(collectWorkspaceCandidates());
    if (!workspaceRoot) {
      throw new Error('No se encontró workspace para leer resource.');
    }
    const resourcePath = path.join(workspaceRoot, 'src', 'agentic-system-structure', name);
    const stat = await fs.stat(resourcePath);
    if (stat.isDirectory()) {
      throw new Error('Resource es un directorio; no se puede leer como archivo.');
    }
    const content = await fs.readFile(resourcePath, 'utf-8');
    return {
      contents: [
        {
          uri,
          text: content
        }
      ]
    };
  }

  if (uri.startsWith('agentic-template://')) {
    const alias = uri.replace('agentic-template://', '');
    const workspaceRoot = await findWorkspaceRoot(collectWorkspaceCandidates());
    if (!workspaceRoot) {
      throw new Error('No se encontró workspace para leer template.');
    }
    const indexPath = path.join(workspaceRoot, '.agent', 'templates', 'index.md');
    const raw = await fs.readFile(indexPath, 'utf-8');
    const match = raw.match(/```yaml\n([\s\S]*?)```/);
    if (!match) {
      throw new Error('No pude leer template: index.md corrupto o sin bloque YAML.');
    }
    const yaml = match[1];
    const data = matter(`---\n${yaml}\n---`).data as Record<string, any>;
    const templates = data.templates as Record<string, string> | undefined;
    const templatePath = templates?.[alias];
    if (!templatePath) {
      throw new Error(`Template no encontrado para alias: ${alias}`);
    }
    const absolutePath = path.resolve(workspaceRoot, templatePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    return {
      contents: [
        {
          uri,
          text: content
        }
      ]
    };
  }

  throw new Error(`Unsupported resource URI: ${uri}`);
}
