import { Command } from 'commander';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json') as { version: string };

export function createProgram(): Command {
  const program = new Command();

  program
    .name('openlog')
    .description('AI-native logging companion CLI')
    .version(version, '-v, --version', '顯示 Openlog 目前版本');

  return program;
}

const program = createProgram();
program.parse();
