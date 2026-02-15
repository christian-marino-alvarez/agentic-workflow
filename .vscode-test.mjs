import { defineConfig } from '@vscode/test-cli';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  files: 'dist/**/*.test.js',
  extensionDevelopmentPath: '.',
  extensionTestsPath: 'src/test/runner.cjs',
  launchArgs: [
    '--disable-gpu',
    '--no-sandbox',
    '--disable-extensions',
    '--user-data-dir', path.join(__dirname, '.vscode-test', 'user-data-e2e')
  ],
  env: {
    VSCODE_TEST_MODE: 'true'
  }
});
