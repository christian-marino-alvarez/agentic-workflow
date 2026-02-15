import * as esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';

const isWatch = process.argv.includes('--watch');

const buildContext = await esbuild.context({
  entryPoints: ['src/extension/modules/app/view/index.ts'],
  bundle: true,
  outfile: 'dist/extension/modules/app/view/index.js',
  platform: 'browser',
  format: 'esm',
  target: 'es2020',
  sourcemap: true,
  loader: { '.ts': 'ts' },
  // external: ['vscode'], // No external, we bundle everything for browser
  plugins: [],
});

if (isWatch) {
  await buildContext.watch();
  console.log('[esbuild] Watching for changes...');
} else {
  await buildContext.rebuild();
  console.log('[esbuild] Build complete.');
  await buildContext.dispose();
}
