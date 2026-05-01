/**
 * GitHub Copilot adapter: produces `.github/prompts/oplg-<id>.prompt.md`.
 *
 * Follows the GitHub Copilot prompt-files spec; only `description` is kept in
 * the frontmatter.
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
