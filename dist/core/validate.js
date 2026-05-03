import path from 'path';
import { promises as fs } from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { OPENLOG_DIR_NAME } from './config.js';
const CHANGES_FILENAME_RE = /^\d{4}-\d{2}-\d{2}(_\d{2})?-[a-z0-9][a-z0-9.\-]*\.md$/;
export class ValidateCommand {
    targetPath;
    constructor(options = {}) {
        this.targetPath = path.resolve(options.path ?? '.');
    }
    async execute() {
        const spinner = ora('Validating openlog/ structure…').start();
        const openlogDir = path.join(this.targetPath, OPENLOG_DIR_NAME);
        const issues = [];
        const dirExists = await this.exists(openlogDir);
        if (!dirExists) {
            spinner.fail(`${chalk.red('openlog/')} directory not found at ${this.targetPath}`);
            console.log(`\n  Run ${chalk.cyan('openlog init')} to create the structure.\n`);
            process.exit(1);
        }
        spinner.text = 'Checking project.md…';
        await this.validateProjectMd(openlogDir, issues);
        spinner.text = 'Checking changes/…';
        await this.validateChanges(openlogDir, issues);
        spinner.text = 'Checking specs/…';
        await this.validateSpecs(openlogDir, issues);
        if (issues.length === 0) {
            spinner.succeed(chalk.green('All files under openlog/ pass validation.'));
        }
        else {
            spinner.fail(chalk.red(`Found ${issues.length} issue(s):`));
            console.log();
            for (const issue of issues) {
                console.log(`  ${chalk.yellow('⚠')}  ${chalk.dim(issue.file)}`);
                console.log(`     ${issue.message}`);
            }
            console.log();
            process.exit(1);
        }
    }
    async validateProjectMd(openlogDir, issues) {
        const projectMdPath = path.join(openlogDir, 'project.md');
        if (!(await this.exists(projectMdPath))) {
            issues.push({
                file: 'openlog/project.md',
                message: 'Missing. Run openlog init to generate it.',
            });
            return;
        }
        const content = await fs.readFile(projectMdPath, 'utf-8');
        if (!content.startsWith('# ')) {
            issues.push({
                file: 'openlog/project.md',
                message: 'Must start with a level-1 heading (# Title).',
            });
        }
    }
    async validateChanges(openlogDir, issues) {
        const changesDir = path.join(openlogDir, 'changes');
        if (!(await this.exists(changesDir))) {
            return;
        }
        const entries = await fs.readdir(changesDir);
        const mdFiles = entries.filter((f) => f.endsWith('.md'));
        for (const filename of mdFiles) {
            if (!CHANGES_FILENAME_RE.test(filename)) {
                issues.push({
                    file: `openlog/changes/${filename}`,
                    message: 'Filename does not match expected pattern: <YYYY-MM-DD>_<NN>-<slug>.md or <YYYY-MM-DD>-<slug>.md',
                });
            }
            const filePath = path.join(changesDir, filename);
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n');
            if (!lines[0]?.startsWith('# ')) {
                issues.push({
                    file: `openlog/changes/${filename}`,
                    message: 'Must start with a level-1 heading (# Title).',
                });
            }
            const header = lines.slice(0, 10).join('\n');
            if (!header.includes('**Date:**')) {
                issues.push({
                    file: `openlog/changes/${filename}`,
                    message: 'Missing required field: **Date:**',
                });
            }
            if (!header.includes('**Author:**')) {
                issues.push({
                    file: `openlog/changes/${filename}`,
                    message: 'Missing required field: **Author:**',
                });
            }
        }
    }
    async validateSpecs(openlogDir, issues) {
        const specsDir = path.join(openlogDir, 'specs');
        if (!(await this.exists(specsDir))) {
            return;
        }
        const entries = await fs.readdir(specsDir);
        const mdFiles = entries.filter((f) => f.endsWith('.md'));
        for (const filename of mdFiles) {
            const filePath = path.join(specsDir, filename);
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n');
            if (!lines[0]?.startsWith('# ')) {
                issues.push({
                    file: `openlog/specs/${filename}`,
                    message: 'Must start with a level-1 heading (# Title).',
                });
            }
            const header = lines.slice(0, 10).join('\n');
            if (!header.includes('**Status:**')) {
                issues.push({
                    file: `openlog/specs/${filename}`,
                    message: 'Missing required field: **Status:**',
                });
            }
        }
    }
    async exists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=validate.js.map