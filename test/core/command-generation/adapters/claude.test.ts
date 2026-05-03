import { describe, it, expect } from 'vitest';
import { claudeAdapter } from '../../../../src/core/command-generation/adapters/claude.js';
import type { CommandContent } from '../../../../src/core/command-generation/types.js';

describe('claudeAdapter', () => {
  it('toolId 為 claude', () => {
    expect(claudeAdapter.toolId).toBe('claude');
  });

  describe('getFilePath', () => {
    it('產出 .claude/commands/oplg/<id>.md 路徑', () => {
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

    it('包含 YAML frontmatter 和 body', () => {
      const result = claudeAdapter.formatFile(content);
      expect(result).toContain('---');
      expect(result).toContain('name: "OPLG: Test"');
      expect(result).toContain('description: A test command');
      expect(result).toContain('category: Workflow');
      expect(result).toContain('tags: [workflow, test]');
      expect(result).toContain('Do the thing.');
    });

    it('YAML-escape 含特殊字元的值', () => {
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
