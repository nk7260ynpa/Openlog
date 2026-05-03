import { describe, it, expect } from 'vitest';
import { claudeAdapter } from '../../../../src/core/command-generation/adapters/claude.js';
import type { CommandContent } from '../../../../src/core/command-generation/types.js';

describe('claudeAdapter', () => {
  it('toolId is claude', () => {
    expect(claudeAdapter.toolId).toBe('claude');
  });

  describe('getFilePath', () => {
    it('generates .claude/commands/oplg/<id>.md path', () => {
      const result = claudeAdapter.getFilePath('apply');
      expect(result).toBe('.claude/commands/oplg/apply.md');
    });
  });

  describe('formatFile', () => {
    const content: CommandContent = {
      id: 'test',
      name: 'OPLG: Test',
      description: 'A test command',
      category: 'Workflow',
      tags: ['workflow', 'test'],
      body: 'Do the thing.',
    };

    it('includes YAML frontmatter and body', () => {
      const result = claudeAdapter.formatFile(content);
      expect(result).toContain('---');
      expect(result).toContain('name: "OPLG: Test"');
      expect(result).toContain('description: A test command');
      expect(result).toContain('category: Workflow');
      expect(result).toContain('tags: [workflow, test]');
      expect(result).toContain('Do the thing.');
    });

    it('YAML-escapes values with special characters', () => {
      const special: CommandContent = {
        ...content,
        name: 'Name: with colon',
        description: 'Has "quotes" and #hash',
      };
      const result = claudeAdapter.formatFile(special);
      expect(result).toContain('"Name: with colon"');
      expect(result).toContain('"Has \\"quotes\\" and #hash"');
    });
  });
});
