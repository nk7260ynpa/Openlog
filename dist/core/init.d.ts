/**
 * Openlog Init command.
 *
 * Modeled after OpenSpec's InitCommand. Given a target project path it creates:
 *   1. AI-tool scaffolding folders (.claude / .github / ...)
 *   2. The openlog/ directory with specs/, changes/
 *   3. openlog/project.md (project overview file)
 */
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
export declare class InitCommand {
    private readonly toolsArg?;
    private readonly force;
    constructor(options?: InitCommandOptions);
    execute(targetPath: string): Promise<void>;
    private ensureProjectDir;
    private resolveSelectedTools;
    private parseToolsArg;
    private promptToolSelection;
    private createOpenlogStructure;
    private createProjectMd;
    private pathExists;
    /**
     * Write `content` to `target`, only touching disk when missing or different.
     *
     * Returns `'created'` when the file did not exist, `'updated'` when content
     * changed, and `'unchanged'` when the file is already byte-identical.
     */
    private writeIfChanged;
    /**
     * Generate skills and slash commands for a single AI tool.
     *
     * - Skill: written to `<skillsDir>/skills/<dirName>/SKILL.md`.
     * - Command: written to the relative path provided by the adapter
     *   (e.g. `.claude/commands/oplg/<id>.md`).
     */
    private generateSkillsAndCommands;
    private printSummary;
}
//# sourceMappingURL=init.d.ts.map