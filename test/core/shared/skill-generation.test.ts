import { describe, it, expect } from 'vitest';
import {
  getSkillTemplates,
  getCommandTemplates,
  getCommandContents,
  generateSkillContent,
} from '../../../src/core/shared/skill-generation.js';

describe('getSkillTemplates', () => {
  it('returns all expected skill templates', () => {
    const templates = getSkillTemplates();
    const ids = templates.map((t) => t.workflowId);
    expect(ids).toEqual(['apply', 'record', 'explore', 'verify']);
  });

  it('each template has required fields', () => {
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
  it('returns all expected command templates', () => {
    const templates = getCommandTemplates();
    const ids = templates.map((t) => t.id);
    expect(ids).toEqual(['apply', 'record', 'explore', 'verify']);
  });

  it('each template has required fields', () => {
    for (const entry of getCommandTemplates()) {
      expect(entry.id).toBeTruthy();
      expect(entry.template.name).toBeTruthy();
      expect(entry.template.description).toBeTruthy();
      expect(entry.template.content).toBeTruthy();
    }
  });
});

describe('getCommandContents', () => {
  it('count matches getCommandTemplates', () => {
    expect(getCommandContents().length).toBe(getCommandTemplates().length);
  });

  it('each content has id, name, and body', () => {
    for (const content of getCommandContents()) {
      expect(content.id).toBeTruthy();
      expect(content.name).toBeTruthy();
      expect(content.body).toBeTruthy();
    }
  });
});

describe('generateSkillContent', () => {
  it('generates SKILL.md content with YAML frontmatter', () => {
    const template = getSkillTemplates()[0].template;
    const result = generateSkillContent(template, '0.5.4');

    expect(result).toContain('---');
    expect(result).toContain(`name: ${template.name}`);
    expect(result).toContain(`description: ${template.description}`);
    expect(result).toContain('generatedBy: "0.5.4"');
    expect(result).toContain(template.instructions);
  });

  it('fills missing metadata with defaults', () => {
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
