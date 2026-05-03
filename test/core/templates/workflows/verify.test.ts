import { describe, it, expect } from 'vitest';
import {
  getVerifySkillTemplate,
  getOplgVerifyCommandTemplate,
} from '../../../../src/core/templates/workflows/verify.js';

describe('getVerifySkillTemplate', () => {
  const skill = getVerifySkillTemplate();

  it('回傳正確的 skill 名稱', () => {
    expect(skill.name).toBe('openlog-verify');
  });

  it('description 包含 /oplg:verify 觸發描述', () => {
    expect(skill.description).toContain('/oplg:verify');
  });

  it('instructions 包含 read-only guardrail', () => {
    expect(skill.instructions).toContain('read-only');
  });

  it('instructions 包含 verdict 邏輯（PASS / NEEDS_FIXES）', () => {
    expect(skill.instructions).toContain('PASS');
    expect(skill.instructions).toContain('NEEDS_FIXES');
  });

  it('instructions 涵蓋所有 review 面向', () => {
    const aspects = [
      'Correctness',
      'Security',
      'Code quality',
      'Type safety',
      'Error handling',
      'Tests',
      'README consistency',
    ];
    for (const aspect of aspects) {
      expect(skill.instructions).toContain(aspect);
    }
  });

  it('包含預設 metadata', () => {
    expect(skill.license).toBe('MIT');
    expect(skill.metadata?.author).toBe('openlog');
    expect(skill.metadata?.version).toBe('1.0');
  });
});

describe('getOplgVerifyCommandTemplate', () => {
  const cmd = getOplgVerifyCommandTemplate();

  it('回傳正確的 command 名稱', () => {
    expect(cmd.name).toBe('OPLG: Verify');
  });

  it('description 包含使用說明', () => {
    expect(cmd.description).toContain('/oplg:verify');
  });

  it('category 為 Workflow', () => {
    expect(cmd.category).toBe('Workflow');
  });

  it('tags 包含 verify 與 openlog', () => {
    expect(cmd.tags).toContain('verify');
    expect(cmd.tags).toContain('openlog');
  });

  it('content 與 skill instructions 共用同一份 SHARED_BODY', () => {
    const skill = getVerifySkillTemplate();
    expect(cmd.content).toBe(skill.instructions);
  });
});
