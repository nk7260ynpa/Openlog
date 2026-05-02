#!/usr/bin/env node

import { execFileSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const runTsc = (args = []) => {
  const tscPath = require.resolve('typescript/bin/tsc');
  execFileSync(process.execPath, [tscPath, ...args], { stdio: 'inherit' });
};

const isPrepare = process.env.npm_lifecycle_event === 'prepare';

if (isPrepare && existsSync('dist/cli/index.js')) {
  console.log('Skipping build: dist/ already present (prepare hook).');
  process.exit(0);
}

console.log('🔨 Building Openlog...\n');

if (existsSync('dist')) {
  console.log('Cleaning dist directory...');
  rmSync('dist', { recursive: true, force: true });
}

console.log('Compiling TypeScript...');
try {
  runTsc(['--version']);
  runTsc();
  console.log('\n✅ Build completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed!');
  console.error(error.stack || error.message || String(error));
  process.exit(1);
}
