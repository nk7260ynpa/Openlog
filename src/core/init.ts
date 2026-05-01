/**
 * Openlog Init 指令
 *
 * 仿照 OpenSpec 的 InitCommand，於指定專案路徑建立：
 *   1. AI 工具骨架資料夾（.claude / .github 等）
 *   2. openlog/ 目錄與其下 specs/、changes/、changes/archive/
 *   3. openlog/project.md（專案介紹檔）
 */

import path from 'path';
import { promises as fs } from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { checkbox } from '@inquirer/prompts';

import { AI_TOOLS, OPENLOG_DIR_NAME, findToolByValue, type AIToolOption } from './config.js';

export interface InitCommandOptions {
  /**
   * 以逗號分隔的工具 value 列表（非互動模式使用）。
   * 例：'claude' 或 'claude,github-copilot' 或 'all'。
   */
  tools?: string;
  /**
   * 強制覆寫已存在的 openlog/ 結構。
   */
  force?: boolean;
}

export class InitCommand {
  private readonly toolsArg?: string;
  private readonly force: boolean;

  constructor(options: InitCommandOptions = {}) {
    this.toolsArg = options.tools;
    this.force = options.force ?? false;
  }

  async execute(targetPath: string): Promise<void> {
    const projectPath = path.resolve(targetPath);
    await this.ensureProjectDir(projectPath);

    const openlogPath = path.join(projectPath, OPENLOG_DIR_NAME);

    const selectedTools = await this.resolveSelectedTools();
    if (selectedTools.length === 0) {
      console.log(chalk.yellow('⚠ 未選擇任何 AI 工具，僅建立 openlog/ 目錄。'));
    }

    const structureSpinner = ora('建立 openlog/ 目錄結構…').start();
    try {
      await this.createOpenlogStructure(openlogPath);
      structureSpinner.succeed(chalk.green(`已建立 ${path.relative(projectPath, openlogPath) || OPENLOG_DIR_NAME}/ 結構`));
    } catch (error) {
      structureSpinner.fail('建立 openlog/ 目錄失敗');
      throw error;
    }

    const projectMdPath = path.join(openlogPath, 'project.md');
    const projectMdSpinner = ora('產生 openlog/project.md…').start();
    try {
      await this.createProjectMd(projectMdPath, projectPath);
      projectMdSpinner.succeed(chalk.green('已產生 openlog/project.md'));
    } catch (error) {
      projectMdSpinner.fail('產生 project.md 失敗');
      throw error;
    }

    for (const tool of selectedTools) {
      const toolDir = path.join(projectPath, tool.skillsDir);
      const spinner = ora(`建立 ${tool.skillsDir}/ (${tool.name})…`).start();
      try {
        await fs.mkdir(toolDir, { recursive: true });
        spinner.succeed(chalk.green(`已建立 ${tool.skillsDir}/ for ${tool.name}`));
      } catch (error) {
        spinner.fail(`建立 ${tool.skillsDir}/ 失敗`);
        throw error;
      }
    }

    this.printSummary(projectPath, openlogPath, selectedTools);
  }

  private async ensureProjectDir(projectPath: string): Promise<void> {
    try {
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path "${projectPath}" 不是資料夾。`);
      }
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        await fs.mkdir(projectPath, { recursive: true });
      } else {
        throw error;
      }
    }
  }

  private async resolveSelectedTools(): Promise<AIToolOption[]> {
    if (this.toolsArg !== undefined) {
      return this.parseToolsArg(this.toolsArg);
    }
    return this.promptToolSelection();
  }

  private parseToolsArg(raw: string): AIToolOption[] {
    const trimmed = raw.trim();
    if (trimmed === '' || trimmed.toLowerCase() === 'none') {
      return [];
    }
    if (trimmed.toLowerCase() === 'all') {
      return AI_TOOLS.filter((tool) => tool.available);
    }

    const tokens = trimmed.split(',').map((token) => token.trim()).filter(Boolean);
    const selected: AIToolOption[] = [];
    const unknown: string[] = [];
    for (const token of tokens) {
      const tool = findToolByValue(token);
      if (tool && tool.available) {
        if (!selected.some((existing) => existing.value === tool.value)) {
          selected.push(tool);
        }
      } else {
        unknown.push(token);
      }
    }
    if (unknown.length > 0) {
      const known = AI_TOOLS.map((tool) => tool.value).join(', ');
      throw new Error(`未知的工具：${unknown.join(', ')}（可用：${known}、all、none）`);
    }
    return selected;
  }

  private async promptToolSelection(): Promise<AIToolOption[]> {
    if (!process.stdout.isTTY) {
      throw new Error('非互動環境，請以 --tools 指定要設定的工具（例如 --tools claude）。');
    }

    const choices = AI_TOOLS.filter((tool) => tool.available).map((tool) => ({
      name: `${tool.name} (${tool.skillsDir}/)`,
      value: tool.value,
      checked: tool.value === 'claude',
    }));

    const selectedValues = await checkbox<string>({
      message: '選擇要套用 Openlog 設定的 AI 工具：',
      choices,
    });

    return selectedValues
      .map((value) => findToolByValue(value))
      .filter((tool): tool is AIToolOption => Boolean(tool));
  }

  private async createOpenlogStructure(openlogPath: string): Promise<void> {
    const exists = await this.pathExists(openlogPath);
    if (exists && !this.force) {
      const hasContent = (await fs.readdir(openlogPath)).length > 0;
      if (hasContent) {
        throw new Error(
          `${OPENLOG_DIR_NAME}/ 已存在且非空。如需重新初始化請使用 --force。`,
        );
      }
    }

    const directories = [
      openlogPath,
      path.join(openlogPath, 'specs'),
      path.join(openlogPath, 'changes'),
      path.join(openlogPath, 'changes', 'archive'),
    ];
    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private async createProjectMd(projectMdPath: string, projectPath: string): Promise<void> {
    const exists = await this.pathExists(projectMdPath);
    if (exists && !this.force) {
      return;
    }

    const projectName = path.basename(projectPath);
    const content = `# ${projectName}

> 由 \`openlog init\` 產生。請依實際情況維護本檔。

## 專案概要

請在此說明本專案的目標、範圍與目標使用者。

## 主要內容

- **\`${OPENLOG_DIR_NAME}/specs/\`**：規格（spec）資料夾，存放穩定的需求／規格文件。
- **\`${OPENLOG_DIR_NAME}/changes/\`**：進行中的變更提案資料夾。
- **\`${OPENLOG_DIR_NAME}/changes/archive/\`**：已完成並歸檔的變更。
- **\`${OPENLOG_DIR_NAME}/project.md\`**（本檔）：專案總覽與導覽入口。

## 技術棧

- 在此列出本專案使用的程式語言、框架與工具。

## 開發流程

1. 透過 \`openlog\` CLI 管理規格與變更（後續版本提供）。
2. 變更從 \`${OPENLOG_DIR_NAME}/changes/\` 出發，完成後歸檔到 \`${OPENLOG_DIR_NAME}/changes/archive/\`。

## 後續工作

- [ ] 補上專案介紹與技術棧
- [ ] 撰寫第一份規格於 \`${OPENLOG_DIR_NAME}/specs/\`
- [ ] 規劃第一個變更於 \`${OPENLOG_DIR_NAME}/changes/\`
`;

    await fs.writeFile(projectMdPath, content, 'utf8');
  }

  private async pathExists(target: string): Promise<boolean> {
    try {
      await fs.access(target);
      return true;
    } catch {
      return false;
    }
  }

  private printSummary(
    projectPath: string,
    openlogPath: string,
    selectedTools: AIToolOption[],
  ): void {
    const rel = (target: string) => path.relative(projectPath, target) || '.';
    console.log();
    console.log(chalk.bold('Openlog 初始化完成 🎉'));
    console.log(`  • ${rel(openlogPath)}/specs/`);
    console.log(`  • ${rel(openlogPath)}/changes/`);
    console.log(`  • ${rel(openlogPath)}/changes/archive/`);
    console.log(`  • ${rel(path.join(openlogPath, 'project.md'))}`);
    if (selectedTools.length > 0) {
      console.log();
      console.log(chalk.bold('已建立的 AI 工具骨架：'));
      for (const tool of selectedTools) {
        console.log(`  • ${tool.skillsDir}/ — ${tool.name}`);
      }
      console.log();
      console.log(chalk.dim('（commands / skills 將於後續版本補上）'));
    }
  }
}
