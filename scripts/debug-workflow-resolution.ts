
import path from 'path';
import { resolvePhaseWorkflow } from '../src/runtime/engine/workflow-loader.js';
import { Logger } from '../src/runtime/engine/logger.js';

// Setup Mock Logger to print to console
class ConsoleLogger {
  log(level: string, context: string, message: string, data?: any) {
    console.log(`[${level.toUpperCase()}] ${context}: ${message}`, data ? JSON.stringify(data) : '');
  }
}
(Logger as any).instance = new ConsoleLogger();

async function main() {
  const projectRoot = process.cwd();
  const workflowsRoot = path.join(projectRoot, '.agent', 'workflows');

  console.log('Searching in:', workflowsRoot);

  try {
    const result = await resolvePhaseWorkflow(workflowsRoot, 'init');
    console.log('Result for "init":', result);
  } catch (err) {
    console.error('Error resolving:', err);
  }
}

main();
