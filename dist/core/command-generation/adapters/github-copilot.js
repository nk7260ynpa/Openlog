/**
 * GitHub Copilot adapter: produces `.github/prompts/oplg-<id>.prompt.md`.
 *
 * Follows the GitHub Copilot prompt-files spec; only `description` is kept in
 * the frontmatter.
 */
import path from 'path';
export const githubCopilotAdapter = {
    toolId: 'github-copilot',
    getFilePath(commandId) {
        return path.join('.github', 'prompts', `oplg-${commandId}.prompt.md`);
    },
    formatFile(content) {
        return `---
description: ${content.description}
---

${content.body}
`;
    },
};
//# sourceMappingURL=github-copilot.js.map