/**
 * Claude Code adapter：產出 `.claude/commands/oplg/<id>.md`。
 *
 * Frontmatter 欄位：name / description / category / tags。
 */

import path from 'path';

import type { CommandContent, ToolCommandAdapter } from '../types.js';

/**
 * 將任意字串轉成 YAML 安全字面值；遇到特殊字元使用雙引號跳脫。
 */
function escapeYamlValue(value: string): string {
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

function formatTagsArray(tags: string[]): string {
  return `[${tags.map((tag) => escapeYamlValue(tag)).join(', ')}]`;
}

export const claudeAdapter: ToolCommandAdapter = {
  toolId: 'claude',

  getFilePath(commandId: string): string {
    return path.join('.claude', 'commands', 'oplg', `${commandId}.md`);
  },

  formatFile(content: CommandContent): string {
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
