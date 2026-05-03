import { describe, it, expect } from 'vitest';
import { generateCommand, generateCommands } from '../../../src/core/command-generation/generator.js';
import type { CommandContent, ToolCommandAdapter } from '../../../src/core/command-generation/types.js';

const fakeAdapter: ToolCommandAdapter = {
  toolId: 'fake',
  getFilePath(id: string) {
    return `.fake/commands/${id}.md`;
  },
  formatFile(content: CommandContent) {
    return `# ${content.name}\n\n${content.body}`;
  },
};

const sampleContent: CommandContent = {
  id: 'test',
  name: 'Test Command',
  description: 'A test command',
  category: 'Test',
  tags: ['test'],
  body: 'Hello world',
};

describe('generateCommand', () => {
  it('generates correct path and content using adapter', () => {
    const result = generateCommand(sampleContent, fakeAdapter);
    expect(result.path).toBe('.fake/commands/test.md');
    expect(result.fileContent).toBe('# Test Command\n\nHello world');
  });
});

describe('generateCommands', () => {
  it('generates multiple commands in batch', () => {
    const second: CommandContent = { ...sampleContent, id: 'second', name: 'Second' };
    const results = generateCommands([sampleContent, second], fakeAdapter);
    expect(results).toHaveLength(2);
    expect(results[0].path).toBe('.fake/commands/test.md');
    expect(results[1].path).toBe('.fake/commands/second.md');
  });

  it('returns empty array for empty input', () => {
    expect(generateCommands([], fakeAdapter)).toEqual([]);
  });
});
