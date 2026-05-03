/**
 * Openlog Update command.
 *
 * Auto-updates the globally-installed `openlog` CLI to the latest version
 * published on GitHub.
 *
 * Strategy: because `npm i -g github:nk7260ynpa/Openlog` is unreliable on
 * npm 11 (see README "Known issue"), we follow the recommended install path:
 *
 *   1. `git clone <repo>` into a fresh temp directory (optionally `--ref` it).
 *   2. `npm i -g <tmp-clone>` so the global bin is rebuilt from the clone.
 *   3. Clean up the temp directory.
 *
 * Users can also pass `--source <local-path>` to skip the clone step and
 * reinstall from a local clone they already have on disk.
 */
import path from 'path';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import os from 'os';
import { createRequire } from 'module';
import chalk from 'chalk';
import ora from 'ora';
const require = createRequire(import.meta.url);
const { version: CURRENT_VERSION } = require('../../package.json');
const DEFAULT_REPO_URL = 'https://github.com/nk7260ynpa/Openlog.git';
const LATEST_PACKAGE_JSON_URL = 'https://raw.githubusercontent.com/nk7260ynpa/Openlog/main/package.json';
export class UpdateCommand {
    options;
    constructor(options = {}) {
        this.options = options;
    }
    async execute() {
        console.log(chalk.bold(`Openlog updater — current version: ${CURRENT_VERSION}`));
        const sourceDir = this.options.source
            ? path.resolve(this.options.source)
            : undefined;
        // Resolve the latest version. Prefer the source path's package.json when
        // provided; otherwise fetch the raw package.json from GitHub.
        const latest = await this.resolveLatestVersion(sourceDir);
        const upToDate = compareVersions(CURRENT_VERSION, latest.version) >= 0;
        if (latest.fetched) {
            console.log(`Latest version: ${latest.version}`);
        }
        else {
            console.log(chalk.yellow('Could not determine the latest version (network or GitHub error).'));
        }
        if (this.options.check) {
            if (upToDate) {
                console.log(chalk.green('✔ Already at the latest version.'));
            }
            else if (latest.fetched) {
                console.log(chalk.cyan(`↑ Update available: ${CURRENT_VERSION} → ${latest.version}`));
                console.log(chalk.dim('   Run `openlog update` to install.'));
            }
            return;
        }
        if (upToDate && !this.options.force) {
            console.log(chalk.green('✔ Already at the latest version. Use --force to reinstall.'));
            return;
        }
        let cloneDir;
        let cleanup = true;
        try {
            const installDir = sourceDir ?? (await this.cloneRepo());
            if (!sourceDir) {
                cloneDir = installDir;
            }
            else {
                // Don't delete a user-supplied source path.
                cleanup = false;
            }
            await this.runNpmInstallGlobal(installDir);
            console.log();
            console.log(chalk.green('✔ Openlog updated successfully.'));
            console.log(chalk.dim('   Run `openlog --version` to confirm.'));
        }
        finally {
            if (cloneDir && cleanup) {
                await fs.rm(cloneDir, { recursive: true, force: true }).catch(() => { });
            }
        }
    }
    async resolveLatestVersion(sourceDir) {
        if (sourceDir) {
            try {
                const pkg = JSON.parse(await fs.readFile(path.join(sourceDir, 'package.json'), 'utf8'));
                if (pkg.version) {
                    return { version: pkg.version, fetched: true };
                }
            }
            catch {
                // Fall through to "unknown".
            }
            return { version: CURRENT_VERSION, fetched: false };
        }
        try {
            const response = await fetch(LATEST_PACKAGE_JSON_URL, {
                headers: { 'cache-control': 'no-cache' },
            });
            if (!response.ok) {
                return { version: CURRENT_VERSION, fetched: false };
            }
            const data = (await response.json());
            if (typeof data.version === 'string' && data.version.length > 0) {
                return { version: data.version, fetched: true };
            }
        }
        catch {
            // Network or parse error — treat as unknown.
        }
        return { version: CURRENT_VERSION, fetched: false };
    }
    async cloneRepo() {
        const repo = this.options.repo ?? DEFAULT_REPO_URL;
        const ref = this.options.ref ?? 'main';
        const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'openlog-update-'));
        const cloneDir = path.join(tmpRoot, 'openlog');
        const spinner = ora(`Cloning ${repo} (${ref})...`).start();
        try {
            await runCommand('git', ['clone', '--depth', '1', '--branch', ref, repo, cloneDir], { quiet: true });
            spinner.succeed(`Cloned ${repo} (${ref})`);
        }
        catch (error) {
            spinner.fail('Failed to clone repository');
            await fs.rm(tmpRoot, { recursive: true, force: true }).catch(() => { });
            throw error;
        }
        return cloneDir;
    }
    async runNpmInstallGlobal(installDir) {
        const npmBin = this.options.npm ?? 'npm';
        const spinner = ora(`Running \`${npmBin} i -g ${installDir}\`...`).start();
        try {
            await runCommand(npmBin, ['i', '-g', installDir], { quiet: true });
            spinner.succeed(`${npmBin} install -g succeeded`);
        }
        catch (error) {
            spinner.fail(`${npmBin} install -g failed`);
            throw error;
        }
    }
}
function runCommand(cmd, args, options = {}) {
    return new Promise((resolve, reject) => {
        const stdio = options.quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit';
        const child = spawn(cmd, args, {
            stdio,
            cwd: options.cwd,
            env: process.env,
        });
        let stdout = '';
        let stderr = '';
        if (options.quiet) {
            child.stdout?.on('data', (chunk) => {
                stdout += chunk.toString();
            });
            child.stderr?.on('data', (chunk) => {
                stderr += chunk.toString();
            });
        }
        child.on('error', (err) => {
            reject(new Error(`Failed to spawn ${cmd}: ${err.message}`));
        });
        child.on('exit', (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            const tail = (stderr || stdout).trim().split('\n').slice(-10).join('\n');
            const detail = tail ? `\n${tail}` : '';
            reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}${detail}`));
        });
    });
}
/**
 * Compare two semver-like version strings.
 *
 * Returns a positive number when `a` > `b`, negative when `a` < `b`, and `0`
 * when they're equivalent. Pre-release suffixes (e.g. `1.0.0-rc.1`) are
 * intentionally ignored — they're rare in this project and not worth a full
 * semver dependency.
 */
export function compareVersions(a, b) {
    const parse = (raw) => raw.replace(/^v/, '').split('-')[0].split('.').map((part) => {
        const n = Number.parseInt(part, 10);
        return Number.isFinite(n) ? n : 0;
    });
    const av = parse(a);
    const bv = parse(b);
    const len = Math.max(av.length, bv.length);
    for (let i = 0; i < len; i += 1) {
        const diff = (av[i] ?? 0) - (bv[i] ?? 0);
        if (diff !== 0) {
            return diff;
        }
    }
    return 0;
}
//# sourceMappingURL=update.js.map