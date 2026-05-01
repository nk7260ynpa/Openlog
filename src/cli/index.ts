import { Command } from 'commander';
import { createRequire } from 'module';
import path from 'path';
import ora from 'ora';

import { AI_TOOLS } from '../core/config.js';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json') as { version: string };

export function createProgram(): Command {
  const program = new Command();

  program
    .name('openlog')
    .description('AI-native logging companion CLI')
    .version(version, '-v, --version', 'Show the current Openlog version');

  const toolValues = AI_TOOLS.filter((tool) => tool.available)
    .map((tool) => tool.value)
    .join(', ');
  const toolsOption = `Non-interactively select AI tools (use "all", "none", or a comma-separated list: ${toolValues})`;

  program
    .command('init [path]')
    .description('Create the openlog/ structure and AI-tool scaffolding folders in the target project')
    .option('--tools <tools>', toolsOption)
    .option('--force', 'Re-initialize even if openlog/ already exists')
    .action(async (
      targetPath: string | undefined,
      options: { tools?: string; force?: boolean } = {},
    ) => {
      try {
        const { InitCommand } = await import('../core/init.js');
        const initCommand = new InitCommand({
          tools: options.tools,
          force: options.force,
        });
        await initCommand.execute(path.resolve(targetPath ?? '.'));
      } catch (error) {
        console.log();
        ora().fail(`Error: ${(error as Error).message}`);
        process.exit(1);
      }
    });

  return program;
}

const program = createProgram();
program.parse();
