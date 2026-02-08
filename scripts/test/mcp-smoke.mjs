import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const options = parseArgs(args);

const taskPath = options.taskPath ?? '.agent/artifacts/8-create-agentic-runtime-cli-first-as-the-single-execution-engine/task.md';
const statePath = options.statePath ?? '.agent/runtime/state.json';
const eventsPath = options.eventsPath ?? '.agent/runtime/events.jsonl';
const runCompile = options.compile ?? true;

async function main() {
  if (runCompile) {
    await runCommand('npm', ['run', 'compile']);
  }

  const requestList = [
    buildRequest(1, 'tools/list', undefined),
    buildRequest(2, 'tools/call', { name: 'runtime.list_workflows', arguments: {} }),
    buildRequest(3, 'tools/call', { name: 'runtime.run', arguments: { taskPath, agent: 'architect-agent', statePath, eventsPath } }),
    buildRequest(4, 'tools/call', { name: 'runtime.get_state', arguments: { statePath } }),
    buildRequest(5, 'tools/call', { name: 'runtime.resume', arguments: { taskPath, agent: 'architect-agent', statePath, eventsPath } }),
    buildRequest(6, 'tools/call', { name: 'runtime.next_step', arguments: { taskPath, agent: 'architect-agent', statePath, eventsPath } }),
    buildRequest(7, 'tools/call', { name: 'runtime.complete_step', arguments: {} })
  ];

  const responses = [];
  for (const request of requestList) {
    const result = await sendMcpRequest(request);
    responses.push(result);
  }

  await ensureEventsFile(eventsPath);
  const tail = await readTail(eventsPath, 10);

  console.log('\n== MCP responses ==');
  for (const response of responses) {
    console.log(JSON.stringify(response));
  }

  console.log('\n== Events tail ==');
  console.log(tail.trim());
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--task') {
      parsed.taskPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--state') {
      parsed.statePath = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--events') {
      parsed.eventsPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--no-compile') {
      parsed.compile = false;
      continue;
    }
  }
  return parsed;
}

function buildRequest(id, method, params) {
  return { jsonrpc: '2.0', id, method, params };
}

function sendMcpRequest(request) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['bin/cli.js', 'mcp'], { stdio: ['pipe', 'pipe', 'inherit'] });
    let output = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`MCP exited with code ${code}`));
        return;
      }
      const response = extractResponse(output);
      if (!response) {
        reject(new Error('No MCP response received.'));
        return;
      }
      resolve(response);
    });

    child.stdin.write(buildPayload(request));
    child.stdin.end();
  });
}

function buildPayload(request) {
  const json = JSON.stringify(request);
  return `Content-Length: ${Buffer.byteLength(json, 'utf-8')}\r\n\r\n${json}`;
}

function extractResponse(raw) {
  const headerIndex = raw.indexOf('\r\n\r\n');
  if (headerIndex === -1) {
    return null;
  }
  const header = raw.slice(0, headerIndex);
  const lengthMatch = header.match(/Content-Length: (\d+)/i);
  if (!lengthMatch) {
    return null;
  }
  const length = Number(lengthMatch[1]);
  const messageStart = headerIndex + 4;
  const payload = raw.slice(messageStart, messageStart + length);
  if (!payload) {
    return null;
  }
  return JSON.parse(payload);
}

async function runCommand(command, commandArgs) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${command} exited with code ${code}`));
        return;
      }
      resolve();
    });
  });
}

async function ensureEventsFile(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '');
  }
}

async function readTail(filePath, lines) {
  const content = await fs.readFile(filePath, 'utf8');
  const parts = content.trim().split('\n');
  return parts.slice(-lines).join('\n') + '\n';
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
