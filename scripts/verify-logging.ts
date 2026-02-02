
import { spawn } from 'child_process';
import path from 'path';

const cliPath = path.resolve('bin/cli.js');

const child = spawn('node', [cliPath, 'mcp'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let buffer = '';

child.stdout.on('data', (data) => {
  const output = data.toString();
  buffer += output;
  console.log('[MCP OUT]', output);

  if (output.includes('"id":1')) {
    // Chat response received, now request logs
    console.log('Chat response received. Requesting logs...');
    const logRequest = JSON.stringify({
      jsonrpc: '2.0',
      method: 'debug_read_logs',
      params: { limit: 10 },
      id: 2
    }) + '\n';
    child.stdin.write(logRequest);
  }

  if (output.includes('"id":2')) {
    // Logs response received
    console.log('Logs received. Verifying...');
    try {
      const lines = buffer.split('\n');
      const logLine = lines.find(l => l.includes('"id":2'));
      if (logLine) {
        const response = JSON.parse(logLine);
        const logs = response.result;

        if (Array.isArray(logs) && logs.length > 0) {
          const chatLog = logs.find((l: any) =>
            (l.message && l.message.includes('Chat message received')) ||
            (l.context && l.context.message && l.context.message.includes('hello log verification'))
          );
          if (chatLog) {
            console.log('SUCCESS: Found chat log entry.');
            process.exit(0);
          } else {
            console.error('FAILURE: Chat log entry not found in logs.');
            console.log('Logs:', JSON.stringify(logs, null, 2));
            process.exit(1);
          }
        } else {
          console.error('FAILURE: No logs returned or invalid format.');
          process.exit(1);
        }
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      process.exit(1);
    }
  }
});

child.stderr.on('data', (data) => {
  console.error('[MCP ERR]', data.toString());
});

// Trigger chat
console.log('Sending chat request...');
const chatRequest = JSON.stringify({
  jsonrpc: '2.0',
  method: 'runtime.chat',
  params: { message: 'hello log verification' },
  id: 1
}) + '\n';

child.stdin.write(chatRequest);

// Safety timeout
setTimeout(() => {
  console.error('Timeout waiting for responses.');
  child.kill();
  process.exit(1);
}, 5000);
