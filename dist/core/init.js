/**
 * Openlog Init command.
 *
 * Modeled after OpenSpec's InitCommand. Given a target project path it creates:
 *   1. AI-tool scaffolding folders (.claude / .github / ...)
 *   2. The openlog/ directory with specs/, changes/, changes/archive/
 *   3. openlog/project.md (project overview file)
 */
import path from 'path';
import { promises as fs } from 'fs';
import { createRequire } from 'module';
import chalk from 'chalk';
import ora from 'ora';
import { checkbox } from '@inquirer/prompts';
import { AI_TOOLS, OPENLOG_DIR_NAME, findToolByValue } from './config.js';
import { getSkillTemplates, getCommandContents, generateSkillContent, } from './shared/index.js';
import { generateCommands, CommandAdapterRegistry, } from './command-generation/index.js';
const require = createRequire(import.meta.url);
const { version: OPENLOG_VERSION } = require('../../package.json');
export class InitCommand {
    toolsArg;
    force;
    constructor(options = {}) {
        this.toolsArg = options.tools;
        this.force = options.force ?? false;
    }
    async execute(targetPath) {
        const projectPath = path.resolve(targetPath);
        await this.ensureProjectDir(projectPath);
        const openlogPath = path.join(projectPath, OPENLOG_DIR_NAME);
        const selectedTools = await this.resolveSelectedTools();
        if (selectedTools.length === 0) {
            console.log(chalk.yellow('⚠ No AI tools selected; only the openlog/ directory will be created.'));
        }
        const structureSpinner = ora('Creating openlog/ directory structure...').start();
        try {
            await this.createOpenlogStructure(openlogPath);
            structureSpinner.succeed(chalk.green(`Created ${path.relative(projectPath, openlogPath) || OPENLOG_DIR_NAME}/ structure`));
        }
        catch (error) {
            structureSpinner.fail('Failed to create openlog/ directory');
            throw error;
        }
        const projectMdPath = path.join(openlogPath, 'project.md');
        const projectMdSpinner = ora('Generating openlog/project.md...').start();
        try {
            await this.createProjectMd(projectMdPath, projectPath);
            projectMdSpinner.succeed(chalk.green('Generated openlog/project.md'));
        }
        catch (error) {
            projectMdSpinner.fail('Failed to generate project.md');
            throw error;
        }
        const generatedSummaries = [];
        for (const tool of selectedTools) {
            const spinner = ora(`Configuring ${tool.name} (${tool.skillsDir}/)...`).start();
            try {
                const summary = await this.generateSkillsAndCommands(projectPath, tool);
                generatedSummaries.push(summary);
                spinner.succeed(chalk.green(`Configured ${tool.name}: ${summary.skillCount} skill(s), ${summary.commandCount} command(s)`));
            }
            catch (error) {
                spinner.fail(`Failed to configure ${tool.name}`);
                throw error;
            }
        }
        this.printSummary(projectPath, openlogPath, selectedTools, generatedSummaries);
    }
    async ensureProjectDir(projectPath) {
        try {
            const stats = await fs.stat(projectPath);
            if (!stats.isDirectory()) {
                throw new Error(`Path "${projectPath}" is not a directory.`);
            }
        }
        catch (error) {
            const err = error;
            if (err.code === 'ENOENT') {
                await fs.mkdir(projectPath, { recursive: true });
            }
            else {
                throw error;
            }
        }
    }
    async resolveSelectedTools() {
        if (this.toolsArg !== undefined) {
            return this.parseToolsArg(this.toolsArg);
        }
        return this.promptToolSelection();
    }
    parseToolsArg(raw) {
        const trimmed = raw.trim();
        if (trimmed === '' || trimmed.toLowerCase() === 'none') {
            return [];
        }
        if (trimmed.toLowerCase() === 'all') {
            return AI_TOOLS.filter((tool) => tool.available);
        }
        const tokens = trimmed.split(',').map((token) => token.trim()).filter(Boolean);
        const selected = [];
        const unknown = [];
        for (const token of tokens) {
            const tool = findToolByValue(token);
            if (tool && tool.available) {
                if (!selected.some((existing) => existing.value === tool.value)) {
                    selected.push(tool);
                }
            }
            else {
                unknown.push(token);
            }
        }
        if (unknown.length > 0) {
            const known = AI_TOOLS.map((tool) => tool.value).join(', ');
            throw new Error(`Unknown tools: ${unknown.join(', ')} (available: ${known}, all, none)`);
        }
        return selected;
    }
    async promptToolSelection() {
        if (!process.stdout.isTTY) {
            throw new Error('Non-interactive environment: please specify tools with --tools (e.g. --tools claude).');
        }
        const choices = AI_TOOLS.filter((tool) => tool.available).map((tool) => ({
            name: `${tool.name} (${tool.skillsDir}/)`,
            value: tool.value,
            checked: tool.value === 'claude',
        }));
        const selectedValues = await checkbox({
            message: 'Select the AI tools to configure with Openlog:',
            choices,
        });
        return selectedValues
            .map((value) => findToolByValue(value))
            .filter((tool) => Boolean(tool));
    }
    async createOpenlogStructure(openlogPath) {
        const exists = await this.pathExists(openlogPath);
        if (exists && !this.force) {
            const hasContent = (await fs.readdir(openlogPath)).length > 0;
            if (hasContent) {
                throw new Error(`${OPENLOG_DIR_NAME}/ already exists and is not empty. Use --force to re-initialize.`);
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
    async createProjectMd(projectMdPath, projectPath) {
        const exists = await this.pathExists(projectMdPath);
        if (exists && !this.force) {
            return;
        }
        const projectName = path.basename(projectPath);
        const content = `# ${projectName}

> Generated by \`openlog init\`. Please maintain this file as needed.

## Overview

Describe the project's goals, scope, and target users here.

## Layout

- **\`${OPENLOG_DIR_NAME}/specs/\`**: spec folder for stable requirements and specification documents.
- **\`${OPENLOG_DIR_NAME}/changes/\`**: in-flight change proposals.
- **\`${OPENLOG_DIR_NAME}/changes/archive/\`**: completed and archived changes.
- **\`${OPENLOG_DIR_NAME}/project.md\`** (this file): project overview and entry point.

## Tech stack

- List the languages, frameworks, and tools used by this project.

## Development workflow

1. Manage specs and changes through the \`openlog\` CLI (coming in later versions).
2. New changes start in \`${OPENLOG_DIR_NAME}/changes/\` and are moved to \`${OPENLOG_DIR_NAME}/changes/archive/\` once complete.

## Next steps

- [ ] Fill in the project overview and tech stack
- [ ] Author the first spec under \`${OPENLOG_DIR_NAME}/specs/\`
- [ ] Plan the first change under \`${OPENLOG_DIR_NAME}/changes/\`
`;
        await fs.writeFile(projectMdPath, content, 'utf8');
    }
    async pathExists(target) {
        try {
            await fs.access(target);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Generate skills and slash commands for a single AI tool.
     *
     * - Skill: written to `<skillsDir>/skills/<dirName>/SKILL.md`.
     * - Command: written to the relative path provided by the adapter
     *   (e.g. `.claude/commands/oplg/<id>.md`).
     */
    async generateSkillsAndCommands(projectPath, tool) {
        let skillCount = 0;
        let commandCount = 0;
        const writtenPaths = [];
        // Generate skills (only for tools that support the Agent Skills spec, e.g. Claude Code).
        if (tool.supportsSkills) {
            const skillsRoot = path.join(projectPath, tool.skillsDir, 'skills');
            const skillTemplates = getSkillTemplates();
            for (const { template, dirName } of skillTemplates) {
                const skillDir = path.join(skillsRoot, dirName);
                const skillFile = path.join(skillDir, 'SKILL.md');
                await fs.mkdir(skillDir, { recursive: true });
                const content = generateSkillContent(template, OPENLOG_VERSION);
                await fs.writeFile(skillFile, content, 'utf8');
                skillCount += 1;
                writtenPaths.push(path.relative(projectPath, skillFile));
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
                await fs.writeFile(target, cmd.fileContent, 'utf8');
                commandCount += 1;
                writtenPaths.push(path.relative(projectPath, target));
            }
        }
        return {
            tool,
            skillCount,
            commandCount,
            writtenPaths,
            hasCommandAdapter: Boolean(adapter),
        };
    }
    printSummary(projectPath, openlogPath, selectedTools, generatedSummaries) {
        const rel = (target) => path.relative(projectPath, target) || '.';
        console.log();
        console.log(chalk.bold('Openlog initialization complete 🎉'));
        console.log(`  • ${rel(openlogPath)}/specs/`);
        console.log(`  • ${rel(openlogPath)}/changes/`);
        console.log(`  • ${rel(openlogPath)}/changes/archive/`);
        console.log(`  • ${rel(path.join(openlogPath, 'project.md'))}`);
        if (selectedTools.length > 0) {
            console.log();
            console.log(chalk.bold('AI tool scaffolding created:'));
            for (const summary of generatedSummaries) {
                const { tool, skillCount, commandCount, hasCommandAdapter } = summary;
                const parts = [];
                if (tool.supportsSkills) {
                    parts.push(`${skillCount} skills`);
                }
                if (hasCommandAdapter) {
                    parts.push(`${commandCount} commands`);
                }
                const note = parts.length > 0 ? parts.join(', ') : 'nothing to generate';
                console.log(`  • ${tool.skillsDir}/ — ${tool.name} (${note})`);
                for (const p of summary.writtenPaths) {
                    console.log(chalk.dim(`      ${p}`));
                }
            }
            console.log();
            console.log(chalk.dim('Usage: run /oplg:apply <action> or /oplg:record inside your AI tool.'));
        }
    }
}
//# sourceMappingURL=init.js.map