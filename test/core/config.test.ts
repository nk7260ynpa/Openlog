import { describe, it, expect } from 'vitest';
import { AI_TOOLS, findToolByValue } from '../../src/core/config.js';

describe('AI_TOOLS', () => {
  it('包含 claude 和 github-copilot', () => {
    const values = AI_TOOLS.map((t) => t.value);
    expect(values).toContain('claude');
    expect(values).toContain('github-copilot');
  });

  it('每個 tool 都有必要欄位', () => {
    for (const tool of AI_TOOLS) {
      expect(tool.name).toBeTruthy();
      expect(tool.value).toBeTruthy();
      expect(tool.skillsDir).toBeTruthy();
      expect(typeof tool.supportsSkills).toBe('boolean');
      expect(typeof tool.available).toBe('boolean');
    }
  });

  it('claude 支援 skills，github-copilot 不支援', () => {
    const claude = AI_TOOLS.find((t) => t.value === 'claude');
    const copilot = AI_TOOLS.find((t) => t.value === 'github-copilot');
    expect(claude?.supportsSkills).toBe(true);
    expect(copilot?.supportsSkills).toBe(false);
  });
});

describe('findToolByValue', () => {
  it('找到已存在的 tool', () => {
    const tool = findToolByValue('claude');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('Claude Code');
    expect(tool!.skillsDir).toBe('.claude');
  });

  it('找不到不存在的 tool 時回傳 undefined', () => {
    expect(findToolByValue('nonexistent')).toBeUndefined();
    expect(findToolByValue('')).toBeUndefined();
  });
});
