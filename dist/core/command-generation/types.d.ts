/**
 * Tool-neutral slash-command structure and the adapter interface that converts
 * it into per-tool output.
 *
 * Design borrowed from OpenSpec:
 *   - `CommandContent` describes "what to produce" (tool-agnostic).
 *   - `ToolCommandAdapter` describes "where it lives and how the frontmatter
 *     looks for a specific tool".
 */
export interface CommandContent {
    /**
     * Command identifier (e.g. `apply`, `record`).
     */
    id: string;
    /**
     * Display name (e.g. `OPLG: Apply`).
     */
    name: string;
    /**
     * One-line description.
     */
    description: string;
    /**
     * Category (e.g. `Workflow`).
     */
    category: string;
    /**
     * Tag array.
     */
    tags: string[];
    /**
     * Body content of the slash command.
     */
    body: string;
}
export interface ToolCommandAdapter {
    /**
     * Matches `AIToolOption.value` (e.g. `claude`, `github-copilot`).
     */
    toolId: string;
    /**
     * Returns the project-root-relative path of this command for the tool.
     *
     * Example: claude → `.claude/commands/oplg/<id>.md`.
     */
    getFilePath(commandId: string): string;
    /**
     * Format tool-neutral content into the final tool-specific file body
     * (frontmatter included).
     */
    formatFile(content: CommandContent): string;
}
export interface GeneratedCommand {
    /**
     * Relative path from the project root (or absolute, depending on the adapter).
     */
    path: string;
    /**
     * Complete file content.
     */
    fileContent: string;
}
//# sourceMappingURL=types.d.ts.map