import { intro, outro, spinner, note } from '@clack/prompts';
import fs from 'node:fs/promises';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export async function forkCommand(targetDir: string) {
  intro(`Forking Agentic Workflow Framework to ${targetDir}`);

  const cwd = process.cwd();
  const absoluteTargetDir = path.resolve(cwd, targetDir);

  const s = spinner();
  s.start(`Cloning repository into ${targetDir}...`);

  try {
    // 1. Clone the repository
    await execAsync(`git clone https://github.com/christian-marino-alvarez/agentic-workflow.git "${absoluteTargetDir}"`);
    s.message('Removing Git history to detach the project...');

    // 2. Remove the .git folder to detach from the original repository
    const gitDir = path.join(absoluteTargetDir, '.git');
    await fs.rm(gitDir, { recursive: true, force: true });

    // 3. Optional: Reset package.json name to avoid direct publication conflicts
    s.message('Resetting package identity...');
    const packageJsonPath = path.join(absoluteTargetDir, 'package.json');
    try {
      const packageData = await fs.readFile(packageJsonPath, 'utf8');
      const parsedPackage = JSON.parse(packageData);
      
      parsedPackage.name = `custom-${path.basename(absoluteTargetDir)}`;
      parsedPackage.version = '0.1.0';
      parsedPackage.author = 'Your Name';
      parsedPackage.description = 'Custom fork of Agentic Workflow Framework';
      
      await fs.writeFile(packageJsonPath, JSON.stringify(parsedPackage, null, 2));
    } catch (e) {
      // Ignore package.json modification errors if they occur
    }

    s.stop('Cloning and detachment complete.');
    note(`Run the following to get started:\n\n1. cd ${targetDir}\n2. npm install\n3. npm run build`, 'Next Steps');
    outro(`Framework successfully forked into ${targetDir}!`);

  } catch (error) {
    s.stop('Forking failed.');
    console.error(error);
    process.exit(1);
  }
}
