import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  files: 'dist/test/**/*.test.js',
  extensionDevelopmentPath: '.',
  extensionTestsPath: 'dist/test/index.js'
});
