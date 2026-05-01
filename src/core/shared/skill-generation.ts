/**
 * Skill / command 產生工具。
 *
 * 提供：
 *   - `getSkillTemplates()`：所有 skill 模板與其輸出目錄。
 *   - `getCommandTemplates()` / `getCommandContents()`：所有 command 模板。
 *   - `generateSkillContent()`：把 SkillTemplate 包成帶 frontmatter 的 SKILL.md。
 */

import {
  getApplySkillTemplate,
  getOplgApplyCommandTemplate,
  getRecordSkillTemplate,
  getOplgRecordCommandTemplate,
  type SkillTemplate,
  type CommandTemplate,
} from '../templates/index.js';
import type { CommandContent } from '../command-generation/index.js';

/**
 * Skill 模板與其在 `<aiTool>/skills/` 下的目錄名。
 */
export interface SkillTemplateEntry {
  template: SkillTemplate;
  /**
   * Skill 目錄名（如 `openlog-apply`），對應 `.claude/skills/<dirName>/SKILL.md`。
   */
  dirName: string;
  /**
   * Workflow 識別碼（如 `apply`），與 command id 對齊。
   */
  workflowId: string;
}

/**
 * Command 模板與其識別碼。
 */
export interface CommandTemplateEntry {
  template: CommandTemplate;
  /**
   * Command id（如 `apply`），對應 `/oplg:<id>` 與 `.claude/commands/oplg/<id>.md`。
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
  ];
}

export function getCommandTemplates(): CommandTemplateEntry[] {
  return [
    { template: getOplgApplyCommandTemplate(), id: 'apply' },
    { template: getOplgRecordCommandTemplate(), id: 'record' },
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
 * 將 SkillTemplate 轉成完整 SKILL.md 內容（含 YAML frontmatter）。
 *
 * @param template Skill 模板。
 * @param generatedByVersion 寫入 `metadata.generatedBy` 的版本字串（通常是 Openlog CLI 版本）。
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
