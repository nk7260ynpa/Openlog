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

  program
    .command('update')
    .description('Update the globally-installed openlog CLI to the latest version')
    .option('--check', 'Only check for a newer version; do not install')
    .option('--force', 'Reinstall even if the local version already matches the latest')
    .option('--ref <ref>', 'Git ref (branch / tag / commit) to install from (default: main)')
    .option('--source <path>', 'Reinstall from an existing local clone instead of cloning')
    .option('--npm <bin>', 'npm-compatible binary to use for the global install (default: npm)')
    .option('--repo <url>', 'Override the git remote URL (default: the public Openlog repo)')
    .action(async (options: {
      check?: boolean;
      force?: boolean;
      ref?: string;
      source?: string;
      npm?: string;
      repo?: string;
    } = {}) => {
      try {
        const { UpdateCommand } = await import('../core/update.js');
        const updateCommand = new UpdateCommand({
          check: options.check,
          force: options.force,
          ref: options.ref,
          source: options.source,
          npm: options.npm,
          repo: options.repo,
        });
        await updateCommand.execute();
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
