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
    .version(version, '-v, --version', '顯示 Openlog 目前版本');

  const toolValues = AI_TOOLS.filter((tool) => tool.available)
    .map((tool) => tool.value)
    .join(', ');
  const toolsOption = `非互動指定 AI 工具（可選 "all"、"none" 或以逗號分隔：${toolValues}）`;

  program
    .command('init [path]')
    .description('於指定專案建立 openlog/ 結構與 AI 工具骨架資料夾')
    .option('--tools <tools>', toolsOption)
    .option('--force', '即使 openlog/ 已存在仍重新初始化')
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
