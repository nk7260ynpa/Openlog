/**
 * Tool detection constants.
 *
 * Used during init to decide whether existing skills/commands need to be
 * cleaned up or filled in.
 */

export const SKILL_NAMES = ['openlog-apply', 'openlog-record'] as const;
export type SkillName = (typeof SKILL_NAMES)[number];

export const COMMAND_IDS = ['apply', 'record'] as const;
export type CommandId = (typeof COMMAND_IDS)[number];
