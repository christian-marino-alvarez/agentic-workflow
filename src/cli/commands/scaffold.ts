import { intro, outro, spinner, note } from '@clack/prompts';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  resolveCorePath,
  resolveInstalledCorePath
} from '../../infrastructure/mapping/resolver.js';

export async function scaffoldCommand(directory: string, options: { nonInteractive?: boolean } = {}) {
  intro(`Agentic Workflow Scaffolding to ${directory}`);

  const cwd = process.cwd();
  const agentDir = path.join(cwd, directory);

  const s = spinner();
  s.start(`Scaffolding ${directory} (core copied locally)...`);

  try {
    const corePath = (await resolveInstalledCorePath(cwd)) ?? await resolveCorePath();

    await fs.rm(agentDir, { recursive: true, force: true });
    await fs.mkdir(agentDir, { recursive: true });

    await scaffoldAgentWorkspace(corePath, agentDir, directory);
    await writeAgentsEntry(cwd, directory);

    s.stop('Configuration complete.');
    note(`Core copied from: ${corePath}\nLocal ${directory} created with full core files.`, 'Installed');
    outro(`Agentic System successfully scaffolded into ${directory}.`);

  } catch (error) {
    s.stop('Scaffolding failed.');
    console.error(error);
    process.exit(1);
  }
}

async function scaffoldAgentWorkspace(corePath: string, agentDir: string, agentFolderName: string) {
  const entries = ['rules', 'workflows', 'templates', 'artifacts'];
  await Promise.all(
    entries.map(async (entry) => {
      const srcPath = path.join(corePath, entry);
      const destPath = path.join(agentDir, entry);
      await fs.cp(srcPath, destPath, { recursive: true });
    })
  );
  
  const srcIndexPath = path.join(corePath, 'index.md');
  const destIndexPath = path.join(agentDir, 'index.md');
  
  let indexContent = await fs.readFile(srcIndexPath, 'utf-8');
  indexContent = indexContent.replace(/\.agent\//g, `${agentFolderName}/`);
  indexContent = indexContent.replace(/UNIFIED INDEX — \.agent/g, `UNIFIED INDEX — ${agentFolderName}`);
  await fs.writeFile(destIndexPath, indexContent);
  
  await fs.mkdir(path.join(agentDir, 'artifacts', 'candidate'), { recursive: true });
}

async function writeAgentsEntry(cwd: string, agentFolderName: string) {
  const agentsPath = path.join(cwd, 'AGENTS.md');
  const content = `# AGENTS

Este fichero es el punto de entrada para asistentes del IDE.
Solo define el arranque del sistema mediante el workflow \`init\`.

## Arranque (OBLIGATORIO)
1. Leer \`${agentFolderName}/index.md\` (root index local).
2. Cargar el indice de workflows en \`agent.domains.workflows.index\`.
3. Cargar \`workflows.init\`.
4. Ejecutar el workflow \`init\` y seguir sus Gates.
`;

  await fs.writeFile(agentsPath, content);
}
