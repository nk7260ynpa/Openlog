/**
 * Claude Code adapter: produces `.claude/commands/oplg/<id>.md`.
 *
 * Frontmatter fields: name / description / category / tags.
 */
import path from 'path';
/**
 * Convert an arbitrary string into a YAML-safe literal, double-quoting and
 * escaping when special characters are present.
 */
function escapeYamlValue(value) {
    const needsQuoting = /[:\n\r#{}[\],&*!|>'"%@`]|^\s|\s$/.test(value);
    if (!needsQuoting) {
        return value;
    }
    const escaped = value
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n');
    return `"${escaped}"`;
}
function formatTagsArray(tags) {
    return `[${tags.map((tag) => escapeYamlValue(tag)).join(', ')}]`;
}
export const claudeAdapter = {
    toolId: 'claude',
    getFilePath(commandId) {
        return path.join('.claude', 'commands', 'oplg', `${commandId}.md`);
    },
    formatFile(content) {
        return `---
name: ${escapeYamlValue(content.name)}
description: ${escapeYamlValue(content.description)}
category: ${escapeYamlValue(content.category)}
tags: ${formatTagsArray(content.tags)}
---

${content.body}
`;
    },
};
//# sourceMappingURL=claude.js.map