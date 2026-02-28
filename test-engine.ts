import { join } from 'node:path';
import { WorkflowEngine } from './src/extension/modules/runtime/backend/workflow-engine.js';
import { WorkflowPersistence } from './src/extension/modules/runtime/backend/persistence.js';

async function run() {
  const root = process.cwd();
  const engine = new WorkflowEngine(root, new WorkflowPersistence(root));
  await engine.initialize();
  await engine.loadAllWorkflows(join(root, '.agent/workflows'));
  await engine.start({ workflowId: 'tasklifecycle', taskId: 'test-123' });
  console.log(JSON.stringify(engine.getState(), null, 2));
}

run().catch(console.error);
