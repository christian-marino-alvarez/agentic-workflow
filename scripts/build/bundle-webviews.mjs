import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const entries = [
  {
    entry: resolve('src/extension/modules/app/view/index.ts'),
    outfile: resolve('dist/extension/modules/app/view/index.js')
  }
];

for (const { entry, outfile } of entries) {
  mkdirSync(dirname(outfile), { recursive: true });
  try {
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
  } catch (e) {
    console.error('Build failed:');
    if (e.errors) {
      console.error(e.errors);
    } else {
      console.error(e);
    }
    process.exit(1);
  }
}
