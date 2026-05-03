import { describe, it, expect } from 'vitest';
import { githubCopilotAdapter } from '../../../../src/core/command-generation/adapters/github-copilot.js';
import type { CommandContent } from '../../../../src/core/command-generation/types.js';

describe('githubCopilotAdapter', () => {
  it('toolId is github-copilot', () => {
    expect(githubCopilotAdapter.toolId).toBe('github-copilot');
  });

  describe('getFilePath', () => {
    it('generates .github/prompts/oplg-<id>.prompt.md path', () => {
      const result = githubCopilotAdapter.getFilePath('apply');
      expect(result).toBe('.github/prompts/oplg-apply.prompt.md');
    });
  });

  describe('formatFile', () => {
    const content: CommandContent = {
      id: 'record',
      name: 'OPLG: Record',
      description: 'Record a change',
      category: 'Workflow',
      tags: ['workflow', 'record'],
      body: 'Record the change.',
    };

    it('includes description frontmatter and body', () => {
      const result = githubCopilotAdapter.formatFile(content);
      expect(result).toContain('---');
      expect(result).toContain('description: Record a change');
      expect(result).toContain('Record the change.');
    });

    it('does not include name, category, or tags', () => {
      const result = githubCopilotAdapter.formatFile(content);
      expect(result).not.toContain('name:');
      expect(result).not.toContain('category:');
      expect(result).not.toContain('tags:');
    });
  });
});
