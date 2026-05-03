/**
 * Tool detection constants.
 *
 * Used during init to decide whether existing skills/commands need to be
 * cleaned up or filled in.
 */
export declare const SKILL_NAMES: readonly ["openlog-apply", "openlog-record", "openlog-explore"];
export type SkillName = (typeof SKILL_NAMES)[number];
export declare const COMMAND_IDS: readonly ["apply", "record", "explore"];
export type CommandId = (typeof COMMAND_IDS)[number];
//# sourceMappingURL=tool-detection.d.ts.map