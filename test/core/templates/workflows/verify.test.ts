import { describe, it, expect } from 'vitest';
import {
  getVerifySkillTemplate,
  getOplgVerifyCommandTemplate,
} from '../../../../src/core/templates/workflows/verify.js';

describe('getVerifySkillTemplate', () => {
  const skill = getVerifySkillTemplate();

  it('returns correct skill name', () => {
    expect(skill.name).toBe('openlog-verify');
  });

  it('description mentions /oplg:verify trigger', () => {
    expect(skill.description).toContain('/oplg:verify');
  });

  it('instructions include read-only guardrail', () => {
    expect(skill.instructions).toContain('Read-only');
  });

  it('instructions include verdict logic (PASS / NEEDS_FIXES)', () => {
    expect(skill.instructions).toContain('PASS');
    expect(skill.instructions).toContain('NEEDS_FIXES');
  });

  it('instructions cover all review aspects', () => {
    const aspects = [
      'correctness',
      'security',
      'code quality',
      'type safety',
      'error handling',
      'readme consistency',
    ];
    for (const aspect of aspects) {
      expect(skill.instructions.toLowerCase()).toContain(aspect);
    }
  });

  it('includes default metadata', () => {
    expect(skill.license).toBe('MIT');
    expect(skill.metadata?.author).toBe('openlog');
    expect(skill.metadata?.version).toBe('1.0');
  });
});

describe('getOplgVerifyCommandTemplate', () => {
  const cmd = getOplgVerifyCommandTemplate();

  it('returns correct command name', () => {
    expect(cmd.name).toBe('OPLG: Verify');
  });

  it('description includes usage instructions', () => {
    expect(cmd.description).toContain('/oplg:verify');
  });

  it('category is Workflow', () => {
    expect(cmd.category).toBe('Workflow');
  });

  it('tags include verify and openlog', () => {
    expect(cmd.tags).toContain('verify');
    expect(cmd.tags).toContain('openlog');
  });

  it('content shares the same SHARED_BODY with skill instructions', () => {
    const skill = getVerifySkillTemplate();
    expect(cmd.content).toBe(skill.instructions);
  });
});
