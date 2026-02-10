import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const entries = [
  {
    entry: 'src/extension/modules/chat/web/view.ts',
    outfile: 'dist/extension/modules/chat/web/view.js'
  },
  {
    entry: resolve('src/extension/modules/history/web/view.ts'),
    outfile: resolve('dist/extension/modules/history/web/view.js')
  },
  {
    entry: resolve('src/extension/modules/workflow/web/view.ts'),
    outfile: resolve('dist/extension/modules/workflow/web/view.js')
  },
  {
    entry: resolve('src/extension/modules/security/web/view.ts'),
    outfile: resolve('dist/extension/modules/security/web/view.js')
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
