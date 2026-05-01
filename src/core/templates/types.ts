/**
 * Core types for skills and slash commands.
 *
 * - `SkillTemplate`: produces `.claude/skills/<dirName>/SKILL.md`
 * - `CommandTemplate`: produces a slash-command file for each AI tool
 *   (e.g. `.claude/commands/oplg/<id>.md`)
 */

export interface SkillTemplate {
  /**
   * Skill identifier (written to the frontmatter `name` field; kebab-case
   * recommended).
   */
  name: string;
  /**
   * One-line description of when the skill triggers and what it does.
   */
  description: string;
  /**
   * Skill body instructions (Markdown).
   */
  instructions: string;
  /**
   * License string; defaults to 'MIT'.
   */
  license?: string;
  /**
   * Compatibility note; defaults to 'Requires openlog CLI.'.
   */
  compatibility?: string;
  /**
   * Extra metadata, e.g. `author` and `version`.
   */
  metadata?: Record<string, string>;
}

export interface CommandTemplate {
  /**
   * Display name of the slash command shown in the tool (e.g. `OPLG: Apply`).
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
  content: string;
}
