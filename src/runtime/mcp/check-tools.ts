
import { spawn } from 'child_process';
import path from 'path';

async function runCheck() {
  console.log('🤖 Starting MCP Tools Check...');

  const serverPath = path.resolve(process.cwd(), 'bin/cli.js');
  const server = spawn('node', [serverPath, 'mcp'], {
    stdio: ['pipe', 'pipe', 'inherit'], // stdin, stdout, stderr (inherit to see logs)
  });

  const send = (req: any) => {
    const json = JSON.stringify(req);
    server.stdin.write(json + '\n');
  };

  server.stdout.on('data', (data) => {
    const str = data.toString().trim();
    if (!str) return;
    try {
      const response = JSON.parse(str);
      console.log('📥 Received:', JSON.stringify(response, null, 2));

      if (response.id === '1' && response.result) {
        console.log('✅ get_state passed');
        // Now try next_step
        send({
          jsonrpc: '2.0',
          id: '2',
          method: 'runtime.next_step',
          params: {
            taskPath: process.env.TASK_PATH, // Need to set this env var or pass it
            agent: 'architect-agent'
          }
        });
      } else if (response.id === '2') {
        if (response.error) {
          console.log('❌ next_step failed (Expected for now if not implemented):', response.error);
        } else {
          console.log('✅ next_step passed');
        }
        server.kill();
        process.exit(0);
      }

    } catch (e) {
      console.error('Failed to parse:', str);
    }
  });

  // 1. Get State
  // We need a dummy task path. Ideally create one in a temp dir.
  // For now let's assume we run this manually with a valid TASK_PATH env var.
  if (!process.env.TASK_PATH) {
    console.error('Please provide TASK_PATH env var');
    server.kill();
    process.exit(1);
  }

  send({
    jsonrpc: '2.0',
    id: '1',
    method: 'runtime.get_state',
    params: {
      statePath: path.resolve(path.dirname(process.env.TASK_PATH), '.agent/runtime/state.json')
    }
  });
}

runCheck().catch(console.error);
