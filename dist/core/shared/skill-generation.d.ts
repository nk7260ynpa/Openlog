/**
 * Skill / command generation utilities.
 *
 * Provides:
 *   - `getSkillTemplates()`: all skill templates with their output directories.
 *   - `getCommandTemplates()` / `getCommandContents()`: all command templates.
 *   - `generateSkillContent()`: wrap a SkillTemplate into a SKILL.md with
 *     YAML frontmatter.
 */
import { type SkillTemplate, type CommandTemplate } from '../templates/index.js';
import type { CommandContent } from '../command-generation/index.js';
/**
 * A skill template plus its directory name under `<aiTool>/skills/`.
 */
export interface SkillTemplateEntry {
    template: SkillTemplate;
    /**
     * Skill directory name (e.g. `openlog-apply`), corresponds to
     * `.claude/skills/<dirName>/SKILL.md`.
     */
    dirName: string;
    /**
     * Workflow identifier (e.g. `apply`); aligned with the command id.
     */
    workflowId: string;
}
/**
 * A command template plus its identifier.
 */
export interface CommandTemplateEntry {
    template: CommandTemplate;
    /**
     * Command id (e.g. `apply`); maps to `/oplg:<id>` and
     * `.claude/commands/oplg/<id>.md`.
     */
    id: string;
}
export declare function getSkillTemplates(): SkillTemplateEntry[];
export declare function getCommandTemplates(): CommandTemplateEntry[];
export declare function getCommandContents(): CommandContent[];
/**
 * Convert a SkillTemplate into the full SKILL.md body (YAML frontmatter
 * included).
 *
 * @param template The skill template.
 * @param generatedByVersion Version string written to `metadata.generatedBy`
 *   (typically the Openlog CLI version).
 */
export declare function generateSkillContent(template: SkillTemplate, generatedByVersion: string): string;
//# sourceMappingURL=skill-generation.d.ts.map