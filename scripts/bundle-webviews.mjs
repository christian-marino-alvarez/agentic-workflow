import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const entries = [
  {
    entry: resolve('src/extension/modules/setup/web/setup-view.ts'),
    outfile: resolve('dist/extension/modules/setup/web/setup-view.js')
  },
  {
    entry: resolve('src/extension/modules/chat/web/chat-view.ts'),
    outfile: resolve('dist/extension/modules/chat/web/chat-view.js')
  },
  {
    entry: resolve('src/extension/modules/history/web/history-view.ts'),
    outfile: resolve('dist/extension/modules/history/web/history-view.js')
  },
  {
    entry: resolve('src/extension/modules/workflow/web/workflow-view.ts'),
    outfile: resolve('dist/extension/modules/workflow/web/workflow-view.js')
  }
];

for (const { entry, outfile } of entries) {
  mkdirSync(dirname(outfile), { recursive: true });
  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: ['es2022'],
    sourcemap: true,
    logLevel: 'info'
  });
}
