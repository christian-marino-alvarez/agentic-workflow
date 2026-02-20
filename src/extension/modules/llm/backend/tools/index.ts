import { tool } from '@openai/agents';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd();

function resolveSafePath(filePath: string, allowOutside: boolean): string {
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(workspaceRoot, filePath);
  if (!allowOutside && !resolved.startsWith(workspaceRoot)) {
    throw new Error(`Access denied: path "${filePath}" is outside the workspace.`);
  }
  return resolved;
}

export const readFileTool = tool({
  name: 'readFile',
  description: 'Read the contents of a file. Use relative paths for workspace files.',
  parameters: z.object({
    path: z.string().describe('File path (relative to workspace root or absolute)'),
  }),
  execute: async (input) => {
    const safePath = resolveSafePath(input.path, false);
    const content = await fs.readFile(safePath, 'utf-8');
    const MAX = 8000;
    return content.length > MAX
      ? content.substring(0, MAX) + `\n... (truncated, ${content.length} chars total)`
      : content;
  },
});

export const writeFileTool = tool({
  name: 'writeFile',
  description: 'Create or overwrite a file with the given content. Creates parent directories if needed.',
  parameters: z.object({
    path: z.string().describe('File path (relative to workspace root or absolute)'),
    content: z.string().describe('Content to write to the file'),
  }),
  needsApproval: true,
  execute: async (input) => {
    const safePath = resolveSafePath(input.path, false);
    await fs.mkdir(path.dirname(safePath), { recursive: true });
    await fs.writeFile(safePath, input.content, 'utf-8');
    return `File written: ${safePath} (${input.content.length} chars)`;
  },
});

export const runCommandTool = tool({
  name: 'runCommand',
  description: 'Execute a shell command and return stdout/stderr. Use for builds, tests, git, etc.',
  parameters: z.object({
    command: z.string().describe('The shell command to execute'),
    cwd: z.string().optional().describe('Working directory (defaults to workspace root)'),
  }),
  needsApproval: true,
  timeoutMs: 30000,
  execute: async (input) => {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    const execCwd = input.cwd ? resolveSafePath(input.cwd, false) : workspaceRoot;
    try {
      const { stdout, stderr } = await execAsync(input.command, {
        cwd: execCwd,
        timeout: 30000,
        maxBuffer: 1024 * 1024,
      });
      let result = '';
      if (stdout) { result += stdout; }
      if (stderr) { result += `\n[stderr]: ${stderr}`; }
      return result.trim() || '(no output)';
    } catch (error: any) {
      return `[error]: ${error.message}\n${error.stdout || ''}\n${error.stderr || ''}`.trim();
    }
  },
});

export const listDirTool = tool({
  name: 'listDirectory',
  description: 'List files and directories in a path. Returns names with type indicators (/ for dirs).',
  parameters: z.object({
    path: z.string().describe('Directory path (relative to workspace root or absolute)'),
  }),
  execute: async (input) => {
    const safePath = resolveSafePath(input.path, false);
    const entries = await fs.readdir(safePath, { withFileTypes: true });
    return entries
      .map(e => e.isDirectory() ? `${e.name}/` : e.name)
      .join('\n');
  },
});

export const searchFilesTool = tool({
  name: 'searchFiles',
  description: 'Search for text content inside files (like grep). Returns matching lines with file paths.',
  parameters: z.object({
    query: z.string().describe('Text or regex pattern to search for'),
    directory: z.string().optional().describe('Directory to search in (defaults to workspace root)'),
    filePattern: z.string().optional().describe('Glob pattern to filter files (e.g. "*.ts")'),
  }),
  execute: async (input) => {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    const searchDir = input.directory ? resolveSafePath(input.directory, false) : workspaceRoot;
    const includeFlag = input.filePattern ? `--include="${input.filePattern}"` : '';
    const cmd = `grep -rn ${includeFlag} --max-count=50 "${input.query.replace(/"/g, '\\"')}" "${searchDir}" 2>/dev/null | head -50`;
    try {
      const { stdout } = await execAsync(cmd, { timeout: 15000, maxBuffer: 1024 * 1024 });
      return stdout.trim() || 'No matches found.';
    } catch {
      return 'No matches found.';
    }
  },
});

/** All available tools for agents */
export const agentTools = [
  readFileTool,
  writeFileTool,
  runCommandTool,
  listDirTool,
  searchFilesTool,
];

export { createDelegateTaskTool } from './delegate.js';
