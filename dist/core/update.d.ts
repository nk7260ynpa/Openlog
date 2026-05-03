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
export interface UpdateCommandOptions {
    /** Only check for a newer version; do not install. */
    check?: boolean;
    /** Reinstall even if the local version already matches the latest. */
    force?: boolean;
    /** Git ref (branch / tag / commit) to install from. Defaults to `main`. */
    ref?: string;
    /** Local path to a working clone; if set, skip cloning and reinstall from this path. */
    source?: string;
    /**
     * Override the npm executable used for the global install.
     * Defaults to `npm`. Useful for `pnpm` / `yarn` / `bun` installs.
     */
    npm?: string;
    /** Override the git remote URL. Defaults to the public Openlog repo. */
    repo?: string;
}
export declare class UpdateCommand {
    private readonly options;
    constructor(options?: UpdateCommandOptions);
    execute(): Promise<void>;
    private resolveLatestVersion;
    private cloneRepo;
    private runNpmInstallGlobal;
}
/**
 * Compare two semver-like version strings.
 *
 * Returns a positive number when `a` > `b`, negative when `a` < `b`, and `0`
 * when they're equivalent. Pre-release suffixes (e.g. `1.0.0-rc.1`) are
 * intentionally ignored — they're rare in this project and not worth a full
 * semver dependency.
 */
export declare function compareVersions(a: string, b: string): number;
//# sourceMappingURL=update.d.ts.map