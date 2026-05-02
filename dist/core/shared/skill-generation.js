/**
 * Skill / command generation utilities.
 *
 * Provides:
 *   - `getSkillTemplates()`: all skill templates with their output directories.
 *   - `getCommandTemplates()` / `getCommandContents()`: all command templates.
 *   - `generateSkillContent()`: wrap a SkillTemplate into a SKILL.md with
 *     YAML frontmatter.
 */
import { getApplySkillTemplate, getOplgApplyCommandTemplate, getRecordSkillTemplate, getOplgRecordCommandTemplate, } from '../templates/index.js';
export function getSkillTemplates() {
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
export function getCommandTemplates() {
    return [
        { template: getOplgApplyCommandTemplate(), id: 'apply' },
        { template: getOplgRecordCommandTemplate(), id: 'record' },
    ];
}
export function getCommandContents() {
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
export function generateSkillContent(template, generatedByVersion) {
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
//# sourceMappingURL=skill-generation.js.map