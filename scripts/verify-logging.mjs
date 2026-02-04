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

  if (output.includes('"id":0')) {
    send({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
      params: {}
    });
    send({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: 'runtime.chat', arguments: { message: 'hello log verification' } },
      id: 1
    });
  }

  if (output.includes('"id":1')) {
    console.log('Chat response received. Requesting logs...');
    send({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: 'debug.read_logs', arguments: { limit: 10 } },
      id: 2
    });
  }

  if (output.includes('"id":2')) {
    console.log('Logs received. Verifying...');
    try {
      const response = extractResponse(buffer, 2);
      const logs = response?.result?.content?.[0]?.text ? JSON.parse(response.result.content[0].text).logs : null;

      if (Array.isArray(logs) && logs.length > 0) {
        const chatLog = logs.find((l) =>
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
    } catch (e) {
      console.error('Error parsing response:', e);
      process.exit(1);
    }
  }
});

child.stderr.on('data', (data) => {
  console.error('[MCP ERR]', data.toString());
});

const send = (request) => {
  const json = JSON.stringify(request);
  child.stdin.write(`${json}\n`);
};

const extractResponse = (raw, id) => {
  const lines = raw.split('\n').map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (parsed?.id === id) {
        return parsed;
      }
    } catch {
      continue;
    }
  }
  return null;
};

console.log('Sending chat request...');
send({
  jsonrpc: '2.0',
  method: 'initialize',
  params: {
    protocolVersion: '2025-11-25',
    capabilities: { tools: {}, resources: {} },
    clientInfo: { name: 'verify-logging', version: '1.0.0' }
  },
  id: 0
});

setTimeout(() => {
  console.error('Timeout waiting for responses.');
  child.kill();
  process.exit(1);
}, 5000);
