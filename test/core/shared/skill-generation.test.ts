import { describe, it, expect } from 'vitest';
import {
  getSkillTemplates,
  getCommandTemplates,
  getCommandContents,
  generateSkillContent,
} from '../../../src/core/shared/skill-generation.js';

describe('getSkillTemplates', () => {
  it('回傳所有預期的 skill templates', () => {
    const templates = getSkillTemplates();
    const ids = templates.map((t) => t.workflowId);
    expect(ids).toEqual(['apply', 'record', 'explore', 'verify']);
  });

  it('每個 template 都有必要欄位', () => {
    for (const entry of getSkillTemplates()) {
      expect(entry.dirName).toBeTruthy();
      expect(entry.workflowId).toBeTruthy();
      expect(entry.template.name).toBeTruthy();
      expect(entry.template.description).toBeTruthy();
      expect(entry.template.instructions).toBeTruthy();
    }
  });
});

describe('getCommandTemplates', () => {
  it('回傳所有預期的 command templates', () => {
    const templates = getCommandTemplates();
    const ids = templates.map((t) => t.id);
    expect(ids).toEqual(['apply', 'record', 'explore', 'verify']);
  });

  it('每個 template 都有必要欄位', () => {
    for (const entry of getCommandTemplates()) {
      expect(entry.id).toBeTruthy();
      expect(entry.template.name).toBeTruthy();
      expect(entry.template.description).toBeTruthy();
      expect(entry.template.content).toBeTruthy();
    }
  });
});

describe('getCommandContents', () => {
  it('數量與 getCommandTemplates 一致', () => {
    expect(getCommandContents().length).toBe(getCommandTemplates().length);
  });

  it('每個 content 都有 id、name、body', () => {
    for (const content of getCommandContents()) {
      expect(content.id).toBeTruthy();
      expect(content.name).toBeTruthy();
      expect(content.body).toBeTruthy();
    }
  });
});

describe('generateSkillContent', () => {
  it('產出包含 YAML frontmatter 的 SKILL.md 內容', () => {
    const template = getSkillTemplates()[0].template;
    const result = generateSkillContent(template, '0.5.4');

    expect(result).toContain('---');
    expect(result).toContain(`name: ${template.name}`);
    expect(result).toContain(`description: ${template.description}`);
    expect(result).toContain('generatedBy: "0.5.4"');
    expect(result).toContain(template.instructions);
  });

  it('使用預設值填補缺少的 metadata', () => {
    const minimal = {
      name: 'test-skill',
      description: 'A test skill',
      instructions: 'Do something.',
    };
    const result = generateSkillContent(minimal, '1.0.0');

    expect(result).toContain('license: MIT');
    expect(result).toContain('author: openlog');
    expect(result).toContain('version: "1.0"');
  });
});
