import { describe, it, expect } from 'vitest';
import { AI_TOOLS, findToolByValue } from '../../src/core/config.js';

describe('AI_TOOLS', () => {
  it('includes claude and github-copilot', () => {
    const values = AI_TOOLS.map((t) => t.value);
    expect(values).toContain('claude');
    expect(values).toContain('github-copilot');
  });

  it('each tool has required fields', () => {
    for (const tool of AI_TOOLS) {
      expect(tool.name).toBeTruthy();
      expect(tool.value).toBeTruthy();
      expect(tool.skillsDir).toBeTruthy();
      expect(typeof tool.supportsSkills).toBe('boolean');
      expect(typeof tool.available).toBe('boolean');
    }
  });

  it('claude supports skills, github-copilot does not', () => {
    const claude = AI_TOOLS.find((t) => t.value === 'claude');
    const copilot = AI_TOOLS.find((t) => t.value === 'github-copilot');
    expect(claude?.supportsSkills).toBe(true);
    expect(copilot?.supportsSkills).toBe(false);
  });
});

describe('findToolByValue', () => {
  it('finds an existing tool', () => {
    const tool = findToolByValue('claude');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('Claude Code');
    expect(tool!.skillsDir).toBe('.claude');
  });

  it('returns undefined for non-existent tool', () => {
    expect(findToolByValue('nonexistent')).toBeUndefined();
    expect(findToolByValue('')).toBeUndefined();
  });
});
