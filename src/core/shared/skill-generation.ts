/**
 * Skill / command generation utilities.
 *
 * Provides:
 *   - `getSkillTemplates()`: all skill templates with their output directories.
 *   - `getCommandTemplates()` / `getCommandContents()`: all command templates.
 *   - `generateSkillContent()`: wrap a SkillTemplate into a SKILL.md with
 *     YAML frontmatter.
 */

import {
  getApplySkillTemplate,
  getOplgApplyCommandTemplate,
  getRecordSkillTemplate,
  getOplgRecordCommandTemplate,
  getExploreSkillTemplate,
  getOplgExploreCommandTemplate,
  type SkillTemplate,
  type CommandTemplate,
} from '../templates/index.js';
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

export function getSkillTemplates(): SkillTemplateEntry[] {
  return [
    {
      template: getApplySkillTemplate(),
      dirName: 'openlog-apply',
      workflowId: 'apply',
    },
    {
      template: getRecordSkillTemplate(),
      dirName: 'openlog-record',
      workflowId: 'record',
    },
    {
      template: getExploreSkillTemplate(),
      dirName: 'openlog-explore',
      workflowId: 'explore',
    },
  ];
}

export function getCommandTemplates(): CommandTemplateEntry[] {
  return [
    { template: getOplgApplyCommandTemplate(), id: 'apply' },
    { template: getOplgRecordCommandTemplate(), id: 'record' },
    { template: getOplgExploreCommandTemplate(), id: 'explore' },
  ];
}

export function getCommandContents(): CommandContent[] {
  return getCommandTemplates().map(({ template, id }) => ({
    id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    body: template.content,
  }));
}

/**
 * Convert a SkillTemplate into the full SKILL.md body (YAML frontmatter
 * included).
 *
 * @param template The skill template.
 * @param generatedByVersion Version string written to `metadata.generatedBy`
 *   (typically the Openlog CLI version).
 */
export function generateSkillContent(
  template: SkillTemplate,
  generatedByVersion: string,
): string {
  const license = template.license ?? 'MIT';
  const compatibility = template.compatibility ?? 'Requires openlog CLI.';
  const author = template.metadata?.author ?? 'openlog';
  const version = template.metadata?.version ?? '1.0';

  return `---
name: ${template.name}
description: ${template.description}
license: ${license}
compatibility: ${compatibility}
metadata:
  author: ${author}
  version: "${version}"
  generatedBy: "${generatedByVersion}"
---

${template.instructions}
`;
}
