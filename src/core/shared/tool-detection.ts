/**
 * 工具偵測常數。
 *
 * 主要用於 init 期間判斷既有 skills/commands 是否需要清理／補齊。
 */

export const SKILL_NAMES = ['openlog-apply', 'openlog-record'] as const;
export type SkillName = (typeof SKILL_NAMES)[number];

export const COMMAND_IDS = ['apply', 'record'] as const;
export type CommandId = (typeof COMMAND_IDS)[number];
