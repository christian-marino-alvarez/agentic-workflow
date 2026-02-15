const path = require('path');
const Mocha = require('mocha');
const fs = require('fs');

exports.run = async function () {
  console.log('[Test Runner CJS] Starting...');

  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 10000
  });

  const testsRoot = path.resolve(__dirname, '../../dist/test');
  console.log(`[Test Runner CJS] Tests root: ${testsRoot}`);

  return new Promise((resolve, reject) => {
    // Simple manual recursion to find .test.js files since glob v10 is ESM
    function findTests(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          findTests(fullPath);
        } else if (file.endsWith('.test.js')) {
          console.log(`[Test Runner CJS] Found test: ${fullPath}`);
          mocha.addFile(fullPath);
        }
      }
    }

    try {
      if (fs.existsSync(testsRoot)) {
        findTests(testsRoot);
      } else {
        console.error(`[Test Runner CJS] Tests root does not exist!`);
      }

      console.log('[Test Runner CJS] Running mocha...');
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
