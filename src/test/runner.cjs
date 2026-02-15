const path = require('path');
const Mocha = require('mocha');
const fs = require('fs');

exports.run = async function () {
  console.log('[Test Runner] Starting...');

  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 20000 // Increased timeout for E2E
  });

  const launchArgs = ['--disable-extensions'];
  // We need to pass launchArgs to runTests if we were using it directly, but here we are using mocha
  // wait, runTests from @vscode/test-electron is what launches vscode.
  // The current runner.cjs is just the test runner script passed TO vscode-test.
  // The actual launch happens in src/test/index.ts (which was deleted? No, wait)
  // Check package.json test script: "test": "vscode-test"
  // This runs the `vscode-test` CLI which by default looks for `src/test/runTest.ts` or similar?
  // Or it uses .vscode-test/vscode-... 
  // Wait, let's check `package.json` properly.

  const testsRoot = path.resolve(__dirname, '../../dist');
  console.log(`[Test Runner] Tests root: ${testsRoot}`);

  return new Promise((resolve, reject) => {
    // Recursive find for .test.js in dist
    function findTests(dir) {
      if (!fs.existsSync(dir)) {
        return;
      }
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          findTests(fullPath);
        } else if (file.endsWith('.test.js')) {
          console.log(`[Test Runner] Found test: ${fullPath}`);
          mocha.addFile(fullPath);
        }
      }
    }

    findTests(testsRoot); // Call findTests outside the try block

    try {
      console.log('[Test Runner] Running mocha...');
      process.env.VSCODE_TEST_MODE = 'true';
      mocha.run(failures => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
