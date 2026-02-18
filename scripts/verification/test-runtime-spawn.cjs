
const { spawn } = require('child_process');
const path = require('path');

const runtimePath = path.join(__dirname, '../../dist/extension/modules/runtime/backend/index.js');

console.log('Spawning Runtime Server at:', runtimePath);

const child = spawn('node', [runtimePath], {
  stdio: ['pipe', 'pipe', 'pipe'], // Using pipes for JSON-RPC
  env: { ...process.env, PORT: '3001' } // Force port if needed, though it uses 3001 by default
});

let started = false;

// Listen for stdout (JSON-RPC or logs)
child.stdout.on('data', (data) => {
  const msg = data.toString();
  console.log('RUNTIME STDOUT:', msg);
  if (msg.includes('JSON-RPC listener started')) {
    console.log('PASS: Runtime Server started JSON-RPC listener');
    started = true;
    child.kill(); // Test passed
  }
  // Also check for HTTP server log
  if (msg.includes('Server running at')) {
    console.log('PASS: Runtime Server started HTTP listener');
  }
});

child.stderr.on('data', (data) => {
  console.error('RUNTIME STDERR:', data.toString());
});

child.on('close', (code) => {
  console.log(`Runtime process exited with code ${code}`);
  if (!started) {
    console.error('FAIL: Runtime did not start correctly');
    process.exit(1);
  }
  process.exit(0);
});

// Timeout
setTimeout(() => {
  if (!started) {
    console.error('TIMEOUT: Runtime did not respond in 5s');
    child.kill();
    process.exit(1);
  }
}, 5000);
