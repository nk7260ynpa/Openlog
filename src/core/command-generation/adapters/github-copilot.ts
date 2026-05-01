/**
 * GitHub Copilot adapter：產出 `.github/prompts/oplg-<id>.prompt.md`。
 *
 * 使用 GitHub Copilot prompt files 規範，僅 frontmatter 中保留 `description`。
 */

import path from 'path';

import type { CommandContent, ToolCommandAdapter } from '../types.js';

export const githubCopilotAdapter: ToolCommandAdapter = {
  toolId: 'github-copilot',

  getFilePath(commandId: string): string {
    return path.join('.github', 'prompts', `oplg-${commandId}.prompt.md`);
  },

  formatFile(content: CommandContent): string {
    return `---
description: ${content.description}
---

${content.body}
`;
  },
};
