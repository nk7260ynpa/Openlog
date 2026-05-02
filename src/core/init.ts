/**
 * Openlog Init command.
 *
 * Modeled after OpenSpec's InitCommand. Given a target project path it creates:
 *   1. AI-tool scaffolding folders (.claude / .github / ...)
 *   2. The openlog/ directory with specs/, changes/
 *   3. openlog/project.md (project overview file)
 */

import path from 'path';
import { promises as fs } from 'fs';
import { createRequire } from 'module';
import chalk from 'chalk';
import ora from 'ora';
import { checkbox } from '@inquirer/prompts';

import { AI_TOOLS, OPENLOG_DIR_NAME, findToolByValue, type AIToolOption } from './config.js';
import {
  getSkillTemplates,
  getCommandContents,
  generateSkillContent,
} from './shared/index.js';
import {
  generateCommands,
  CommandAdapterRegistry,
} from './command-generation/index.js';

const require = createRequire(import.meta.url);
const { version: OPENLOG_VERSION } = require('../../package.json') as { version: string };

export interface InitCommandOptions {
  /**
   * Comma-separated list of tool values (used in non-interactive mode).
   * Examples: 'claude', 'claude,github-copilot', 'all'.
   */
  tools?: string;
  /**
   * Force-overwrite an existing openlog/ structure.
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
    const openlogRel = path.relative(projectPath, openlogPath) || OPENLOG_DIR_NAME;

    const selectedTools = await this.resolveSelectedTools();
    if (selectedTools.length === 0) {
      console.log(chalk.yellow('⚠ No AI tools selected; only the openlog/ directory will be created.'));
    }

    const structureSpinner = ora(`Ensuring ${openlogRel}/ directory structure...`).start();
    let structureExisted = false;
    try {
      const result = await this.createOpenlogStructure(openlogPath);
      structureExisted = result.existed;
      const verb = structureExisted ? 'Verified' : 'Created';
      structureSpinner.succeed(chalk.green(`${verb} ${openlogRel}/ structure`));
    } catch (error) {
      structureSpinner.fail(`Failed to ensure ${openlogRel}/ directory`);
      throw error;
    }

    const projectMdPath = path.join(openlogPath, 'project.md');
    const projectMdRel = path.relative(projectPath, projectMdPath);
    const projectMdSpinner = ora(`Ensuring ${projectMdRel}...`).start();
    try {
      const projectMdStatus = await this.createProjectMd(projectMdPath, projectPath);
      const message =
        projectMdStatus === 'created'
          ? `Generated ${projectMdRel}`
          : projectMdStatus === 'updated'
            ? `Updated ${projectMdRel} (--force)`
            : `Kept existing ${projectMdRel}`;
      projectMdSpinner.succeed(chalk.green(message));
    } catch (error) {
      projectMdSpinner.fail(`Failed to ensure ${projectMdRel}`);
      throw error;
    }

    const generatedSummaries: ToolGenerationSummary[] = [];
    for (const tool of selectedTools) {
      const spinner = ora(`Syncing ${tool.name} (${tool.skillsDir}/)...`).start();
      try {
        const summary = await this.generateSkillsAndCommands(projectPath, tool);
        generatedSummaries.push(summary);
        const counts = countByStatus(summary.files);
        const detail = [
          counts.created ? `${counts.created} created` : null,
          counts.updated ? `${counts.updated} updated` : null,
          counts.unchanged ? `${counts.unchanged} unchanged` : null,
        ]
          .filter(Boolean)
          .join(', ') || 'nothing to write';
        spinner.succeed(chalk.green(`Synced ${tool.name}: ${detail}`));
      } catch (error) {
        spinner.fail(`Failed to configure ${tool.name}`);
        throw error;
      }
    }

    this.printSummary(projectPath, openlogPath, selectedTools, generatedSummaries, structureExisted);
  }

  private async ensureProjectDir(projectPath: string): Promise<void> {
    try {
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path "${projectPath}" is not a directory.`);
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
      throw new Error(`Unknown tools: ${unknown.join(', ')} (available: ${known}, all, none)`);
    }
    return selected;
  }

  private async promptToolSelection(): Promise<AIToolOption[]> {
    if (!process.stdout.isTTY) {
      throw new Error('Non-interactive environment: please specify tools with --tools (e.g. --tools claude).');
    }

    const choices = AI_TOOLS.filter((tool) => tool.available).map((tool) => ({
      name: `${tool.name} (${tool.skillsDir}/)`,
      value: tool.value,
      checked: tool.value === 'claude',
    }));

    const selectedValues = await checkbox<string>({
      message: 'Select the AI tools to configure with Openlog:',
      choices,
    });

    return selectedValues
      .map((value) => findToolByValue(value))
      .filter((tool): tool is AIToolOption => Boolean(tool));
  }

  private async createOpenlogStructure(openlogPath: string): Promise<{ existed: boolean }> {
    const existed = await this.pathExists(openlogPath);

    const directories = [
      openlogPath,
      path.join(openlogPath, 'specs'),
      path.join(openlogPath, 'changes'),
    ];
    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
    }

    return { existed };
  }

  private async createProjectMd(projectMdPath: string, projectPath: string): Promise<FileWriteStatus> {
    const exists = await this.pathExists(projectMdPath);
    if (exists && !this.force) {
      return 'unchanged';
    }

    const projectName = path.basename(projectPath);
    const content = `# ${projectName}

> Generated by \`openlog init\`. Please maintain this file as needed.

## Overview

Describe the project's goals, scope, and target users here.

## Layout

- **\`${OPENLOG_DIR_NAME}/specs/\`**: spec folder for stable requirements and specification documents.
- **\`${OPENLOG_DIR_NAME}/changes/\`**: change records authored by the workflow.
- **\`${OPENLOG_DIR_NAME}/project.md\`** (this file): project overview and entry point.

## Tech stack

- List the languages, frameworks, and tools used by this project.

## Development workflow

1. Manage specs and changes through the \`openlog\` CLI (coming in later versions).
2. New change records land in \`${OPENLOG_DIR_NAME}/changes/\` via \`/oplg:record\`.

## Next steps

- [ ] Fill in the project overview and tech stack
- [ ] Author the first spec under \`${OPENLOG_DIR_NAME}/specs/\`
- [ ] Plan the first change under \`${OPENLOG_DIR_NAME}/changes/\`
`;

    return this.writeIfChanged(projectMdPath, content);
  }

  private async pathExists(target: string): Promise<boolean> {
    try {
      await fs.access(target);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Write `content` to `target`, only touching disk when missing or different.
   *
   * Returns `'created'` when the file did not exist, `'updated'` when content
   * changed, and `'unchanged'` when the file is already byte-identical.
   */
  private async writeIfChanged(target: string, content: string): Promise<FileWriteStatus> {
    try {
      const existing = await fs.readFile(target, 'utf8');
      if (existing === content) {
        return 'unchanged';
      }
      await fs.writeFile(target, content, 'utf8');
      return 'updated';
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'ENOENT') {
        throw error;
      }
      await fs.writeFile(target, content, 'utf8');
      return 'created';
    }
  }

  /**
   * Generate skills and slash commands for a single AI tool.
   *
   * - Skill: written to `<skillsDir>/skills/<dirName>/SKILL.md`.
   * - Command: written to the relative path provided by the adapter
   *   (e.g. `.claude/commands/oplg/<id>.md`).
   */
  private async generateSkillsAndCommands(
    projectPath: string,
    tool: AIToolOption,
  ): Promise<ToolGenerationSummary> {
    let skillCount = 0;
    let commandCount = 0;
    const files: FileWriteResult[] = [];

    // Generate skills (only for tools that support the Agent Skills spec, e.g. Claude Code).
    if (tool.supportsSkills) {
      const skillsRoot = path.join(projectPath, tool.skillsDir, 'skills');
      const skillTemplates = getSkillTemplates();
      for (const { template, dirName } of skillTemplates) {
        const skillDir = path.join(skillsRoot, dirName);
        const skillFile = path.join(skillDir, 'SKILL.md');
        await fs.mkdir(skillDir, { recursive: true });
        const content = generateSkillContent(template, OPENLOG_VERSION);
        const status = await this.writeIfChanged(skillFile, content);
        skillCount += 1;
        files.push({ path: path.relative(projectPath, skillFile), status });
      }
    }

    // Generate slash commands (gated on whether the tool has a registered adapter).
    const adapter = CommandAdapterRegistry.get(tool.value);
    if (adapter) {
      const commands = generateCommands(getCommandContents(), adapter);
      for (const cmd of commands) {
        const target = path.isAbsolute(cmd.path)
          ? cmd.path
          : path.join(projectPath, cmd.path);
        await fs.mkdir(path.dirname(target), { recursive: true });
        const status = await this.writeIfChanged(target, cmd.fileContent);
        commandCount += 1;
        files.push({ path: path.relative(projectPath, target), status });
      }
    }

    return {
      tool,
      skillCount,
      commandCount,
      files,
      hasCommandAdapter: Boolean(adapter),
    };
  }

  private printSummary(
    projectPath: string,
    openlogPath: string,
    selectedTools: AIToolOption[],
    generatedSummaries: ToolGenerationSummary[],
    structureExisted: boolean,
  ): void {
    const rel = (target: string) => path.relative(projectPath, target) || '.';
    console.log();
    const headline = structureExisted
      ? 'Openlog re-sync complete 🎉'
      : 'Openlog initialization complete 🎉';
    console.log(chalk.bold(headline));
    console.log(`  • ${rel(openlogPath)}/specs/`);
    console.log(`  • ${rel(openlogPath)}/changes/`);
    console.log(`  • ${rel(path.join(openlogPath, 'project.md'))}`);
    if (selectedTools.length > 0) {
      console.log();
      console.log(chalk.bold('AI tool scaffolding:'));
      for (const summary of generatedSummaries) {
        const { tool, skillCount, commandCount, hasCommandAdapter } = summary;
        const parts: string[] = [];
        if (tool.supportsSkills) {
          parts.push(`${skillCount} skills`);
        }
        if (hasCommandAdapter) {
          parts.push(`${commandCount} commands`);
        }
        const note = parts.length > 0 ? parts.join(', ') : 'nothing to generate';
        console.log(`  • ${tool.skillsDir}/ — ${tool.name} (${note})`);
        for (const file of summary.files) {
          console.log(chalk.dim(`      ${formatFileStatus(file)}`));
        }
      }
      console.log();
      console.log(chalk.dim('Usage: run /oplg:apply <action> or /oplg:record inside your AI tool.'));
    }
  }
}

type FileWriteStatus = 'created' | 'updated' | 'unchanged';

interface FileWriteResult {
  path: string;
  status: FileWriteStatus;
}

interface ToolGenerationSummary {
  tool: AIToolOption;
  skillCount: number;
  commandCount: number;
  files: FileWriteResult[];
  hasCommandAdapter: boolean;
}

function countByStatus(files: FileWriteResult[]): Record<FileWriteStatus, number> {
  const counts: Record<FileWriteStatus, number> = { created: 0, updated: 0, unchanged: 0 };
  for (const file of files) {
    counts[file.status] += 1;
  }
  return counts;
}

function formatFileStatus(file: FileWriteResult): string {
  const tag =
    file.status === 'created'
      ? '[created]'
      : file.status === 'updated'
        ? '[updated]'
        : '[unchanged]';
  return `${tag.padEnd(11)} ${file.path}`;
}
